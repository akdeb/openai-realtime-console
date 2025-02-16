

#include <Arduino.h>
#include "OTA.h"
#include "I2SHandler.h"
#include <driver/rtc_io.h>
#include <driver/touch_sensor.h>
#include "LEDHandler.h"
#include "Config.h"
// #include "WifiSetup.h"
#include "WifiManager.h"
#include "WebsocketHandler.h"

// #define WEBSOCKETS_DEBUG_LEVEL WEBSOCKETS_LEVEL_ALL
#define TOUCH_THRESHOLD 60000
#define LONG_PRESS_MS 1000
#define REQUIRED_RELEASE_CHECKS 100     // how many consecutive times we need "below threshold" to confirm release

String authMessage;

AsyncWebServer webServer(80);
WIFIMANAGER WifiManager;

esp_err_t getErr = ESP_OK;

DeviceState deviceState = IDLE;

TaskHandle_t micTaskHandle;
TaskHandle_t audioPlaybackTaskHandle;
TaskHandle_t touchTaskHandle = NULL;

volatile bool goToSleep = false;

void getAuthTokenFromNVS()
{
    preferences.begin("auth", false);
    authTokenGlobal = preferences.getString("auth_token", "");
    preferences.end();
    Serial.println(authTokenGlobal);
}

void enterSleep()
{
    Serial.println("Going to sleep...");

    // Prevent any new data processing
    deviceState = IDLE;

    // Stop mic and speaker tasks
    // if (micTaskHandle) {
    //     vTaskDelete(micTaskHandle);
    //     micTaskHandle = NULL;
    // }
    // if (audioPlaybackTaskHandle) {
    //     vTaskDelete(audioPlaybackTaskHandle);
    //     audioPlaybackTaskHandle = NULL;
    // }

    // Clear any remaining audio data
    audioBuffer.reset();

    // Disconnect WebSocket if it's connected
    if (webSocket.isConnected()) {
        webSocket.disconnect();
        delay(100);  // Give time for the disconnect to complete
    }

    // Flush serial output
    Serial.flush();

    touch_pad_intr_disable(TOUCH_PAD_INTR_MASK_ALL);

  // Wait until the touch pad reading shows "release"
  // (Assuming that a reading above TOUCH_THRESHOLD means a touch.)
  while (touchRead(TOUCH_PAD_NUM2) > TOUCH_THRESHOLD) {
    delay(50);
  }
  // Extra delay to allow any residual contact or noise to settle
  delay(500);

  // Enable touchpad wakeup using the Arduino API.
  // This configures the ESP32 so that a new touch on channel 2 will wake it.
  touchSleepWakeUpEnable(TOUCH_PAD_NUM2, TOUCH_THRESHOLD);

  Serial.println("Entering deep sleep now.");
  esp_deep_sleep_start();
}

void micTask(void *parameter)
{
    i2s_install_mic();
    i2s_setpin_mic();
    i2s_start(I2S_PORT_IN);

    const int i2s_read_len = 2048;
    size_t bytes_read;
    char *i2s_read_buff = (char *)calloc(i2s_read_len, 1);
    char *flash_write_buff = (char *)calloc(i2s_read_len, 1);

    while (1) {
        // Check for VAD timeout
        if (connectionStartTime && deviceState == LISTENING && 
            millis() - connectionStartTime >= 10000) {
            webSocket.sendTXT("{\"type\": \"instruction\", \"msg\": \"end_of_speech\"}");
            connectionStartTime = 0;
            deviceState = PROCESSING;
            Serial.println("Sent VAD detection request");
        }

        // Read audio data
        if (deviceState == LISTENING && webSocket.isConnected())
        {
            if (i2s_read(I2S_PORT_IN, (void *)i2s_read_buff, i2s_read_len,
                     &bytes_read, portMAX_DELAY) == ESP_OK)
            {
                // Scale or convert if needed
                i2s_adc_data_scale((uint8_t*)flash_write_buff,
                                   (uint8_t*)i2s_read_buff,
                                   bytes_read);

                // Allocate a temporary buffer for sending
                uint8_t* safeSend = (uint8_t*) malloc(bytes_read);
                memcpy(safeSend, flash_write_buff, bytes_read);

                // Now send
                webSocket.sendBIN(safeSend, bytes_read);

                // Free the temp buffer
                free(safeSend);
            }
        }
        vTaskDelay(10);
    }

    free(i2s_read_buff);
    free(flash_write_buff);
    vTaskDelete(NULL);
}

void audioPlaybackTask(void *param)
{

    // Initialize I2S
    i2s_install_speaker();
    i2s_setpin_speaker();
    i2s_start(I2S_PORT_OUT);

    // setup I2S shutdown pin
    pinMode(I2S_SD_OUT, OUTPUT);
    digitalWrite(I2S_SD_OUT, HIGH);

    // Allocate a local buffer to temporarily hold the audio data to be written to I2S.
    uint8_t* localBuffer = (uint8_t*)malloc(AUDIO_CHUNK_SIZE);

    if (!localBuffer) {
        Serial.println("Failed to allocate local I2S buffer");
        vTaskDelete(NULL);
        return;
    }

    bool playbackStarted = false;
    const size_t preBufferThreshold = audioBuffer.size() * 25 / 100;  // 25% fill level


    while (1) {
        // Check how many bytes are available in the BufferRTOS.
        size_t available = audioBuffer.available();

        size_t total = audioBuffer.size();
        float utilization = (float)available / total * 100.0;

        // Log buffer stats every second
        static unsigned long lastPrint = 0;
        if (millis() - lastPrint > 1000) {
            Serial.printf("Buffer Usage: %d/%d bytes (%.1f%%)\n", 
                         available, total, utilization);
            lastPrint = millis();
        }

        // Pre-buffer phase: Wait until the buffer has enough data before starting playback.
        if (!playbackStarted) {
            if (available < preBufferThreshold) {
                // Not enough data to start playback yet; wait briefly.
                vTaskDelay(pdMS_TO_TICKS(5));
                continue; // Skip the rest of the loop iteration.
            } else {
                playbackStarted = true;
                Serial.println("Pre-buffer filled. Starting playback...");
            }
        }

        if (available >= AUDIO_CHUNK_SIZE && deviceState == SPEAKING) {
            // Read a chunk from the buffer.
            size_t bytesRead = audioBuffer.readArray(localBuffer, AUDIO_CHUNK_SIZE);
            
            // Now write that chunk to I2S.
            size_t bytesWritten = 0;
            // i2s_write writes the data to the I2S peripheral.
            // Adjust I2S_PORT_OUT if your configuration differs.
            esp_err_t err = i2s_write(I2S_PORT_OUT, (const char*)localBuffer, AUDIO_CHUNK_SIZE, &bytesWritten, portMAX_DELAY);
            if (err != ESP_OK) {
                Serial.printf("I2S write error: %d\n", err);
            }
        } else {
            // Not enough data available: yield a bit to allow more data to accumulate.
            vTaskDelay(pdMS_TO_TICKS(5));
        }
    }

    // Clean up (this point will never be reached in this endless loop).
    free(localBuffer);
    vTaskDelete(NULL);
}

void touchTask(void* parameter) {
  touch_pad_init();
  touch_pad_config(TOUCH_PAD_NUM2);

  bool touched = false;
  unsigned long pressStartTime = 0;

  while (true) {
    // Read the touch sensor
    uint32_t touchValue = touchRead(TOUCH_PAD_NUM2);
    // Serial.printf("Touch Pad Value: %u\n", touchValue);

    // On the ESP32-S3, a reading above TOUCH_THRESHOLD indicates a touch.
    bool isTouched = (touchValue > TOUCH_THRESHOLD);

    // Detect transition from "not touched" to "touched"
    if (isTouched && !touched) {
      touched = true;
      pressStartTime = millis();
      Serial.println("Touch detected - press started.");
      goToSleep = true;
    }

    // Detect transition from "touched" to "released"
    // if (!isTouched && touched) {
    //   touched = false;
    //   unsigned long pressDuration = millis() - pressStartTime;
    //   if (pressDuration >= LONG_PRESS_MS) {
    //     Serial.print("Long press detected (");
    //     Serial.print(pressDuration);
    //     Serial.println(" ms) - going to sleep.");
    //     // Call enterSleep() which will wait for a stable release, enable wake, and sleep.
    //     goToSleep = true;
    //     // (The device will reset on wake, so code execution won't continue here.)
    //   } else {
    //     Serial.print("Short press detected (");
    //     Serial.print(pressDuration);
    //     Serial.println(" ms) - ignoring.");
    //   }
    // }

    delay(50);  // Small delay to avoid spamming readings
  }
  // (This point is never reached.)
  vTaskDelete(NULL);
}

void print_wakeup_reason() {
  esp_sleep_wakeup_cause_t wakeup_reason;

  wakeup_reason = esp_sleep_get_wakeup_cause();

  switch (wakeup_reason) {
    case ESP_SLEEP_WAKEUP_EXT0:     Serial.println("Wakeup caused by external signal using RTC_IO"); break;
    case ESP_SLEEP_WAKEUP_EXT1:     Serial.println("Wakeup caused by external signal using RTC_CNTL"); break;
    case ESP_SLEEP_WAKEUP_TIMER:    Serial.println("Wakeup caused by timer"); break;
    case ESP_SLEEP_WAKEUP_TOUCHPAD: Serial.println("Wakeup caused by touchpad"); break;
    case ESP_SLEEP_WAKEUP_ULP:      Serial.println("Wakeup caused by ULP program"); break;
    default:                        Serial.printf("Wakeup was not caused by deep sleep: %d\n", wakeup_reason); break;
  }
}

// void connectToNewWifiNetwork() {
//     connectToNewNetwork = true;
// }

// void connectToWifiAndWebSocket()
// {
//     if (!authTokenGlobal.isEmpty() && wifiConnect() == 1) // Successfully connected and has auth token
//     {
//         Serial.println("WiFi connected with existing network!");
//         ota_status ? performOTAUpdate() : (factory_reset_status ? setResetComplete() : websocketSetup(ws_server, ws_port, ws_path));
//         return; // Connection successful
//     }

//     // if no existing network, connect to new network
//     connectToNewWifiNetwork();
// }

void connectWithPassword()
{
    IPAddress dns1(8, 8, 8, 8);        // Google DNS
    IPAddress dns2(1, 1, 1, 1);        // Cloudflare DNS
    WiFi.config(INADDR_NONE, INADDR_NONE, INADDR_NONE, dns1, dns2);

    // WiFi.begin("EE-P8CX8N", "xd6UrFLd4kf9x4");
    // WiFi.begin("akaPhone", "akashclarkkent1");
    WiFi.begin("S_HOUSE_RESIDENTS_NW", "Somerset_Residents!");
    // WiFi.begin("NOWBQPME", "JYHx4Svzwv5S");
    // WiFi.begin("EE-PPA1GZ", "9JkyRJHXTDTKb3");

    while (WiFi.status() != WL_CONNECTED)
    {
        delay(500);
        Serial.print("|");
    }
    Serial.println("");
    Serial.println("WiFi connected");

    WiFi.setSleep(false);
    // esp_wifi_set_ps(WIFI_PS_NONE);  // Disable power saving completely
    // playStartupSound();
    websocketSetup(ws_server, ws_port, ws_path);
}

void setup()
{
    Serial.begin(115200);
    delay(500);

     while (!Serial)
        ;

     // Check the wakeup cause and print a message
      esp_sleep_wakeup_cause_t wakeupCause = esp_sleep_get_wakeup_cause();
      if (wakeupCause == ESP_SLEEP_WAKEUP_TOUCHPAD) {
        Serial.println("Woke up from touchpad deep sleep.");
      } else {
        Serial.println("Normal startup.");
      }
  
    // Print a welcome message to the Serial port.
    Serial.println("\n\nCaptive Test, V0.5.0 compiled " __DATE__ " " __TIME__ " by CD_FER"); //__DATE__ is provided by the platformio ide
    Serial.printf("%s-%d\n\r", ESP.getChipModel(), ESP.getChipRevision());

    // AUTH & OTA
    getAuthTokenFromNVS();
    getOTAStatusFromNVS();
    // getFactoryResetStatusFromNVS();

    deviceState = IDLE;
    if (ota_status) {
        deviceState = OTA;
    }
    if (factory_reset_status) {
        deviceState = FACTORY_RESET;
    }

    // TOUCH
    xTaskCreate(touchTask, "TouchTask", 4096, NULL, 1, &touchTaskHandle);
        
    // LED
    xTaskCreate(ledTask, "LED Task", 4096, NULL, 5, NULL);

    // RTOS -- MICROPHONE & SPEAKER
    xTaskCreate(audioPlaybackTask, "Audio Playback", 4096, NULL, 2, &audioPlaybackTaskHandle);
    xTaskCreate(micTask, "Microphone Task", 4096, NULL, 4, &micTaskHandle);

    // WIFI
    connectWithPassword();
    // connectToWifiAndWebSocket();
    // WifiManager.startBackgroundTask("ELATO-DEVICE");        // Run the background task to take care of our Wifi
    // WifiManager.fallbackToSoftAp(true);       // Run a SoftAP if no known AP can be reached
    // WifiManager.attachWebServer(&webServer);  // Attach our API to the Webserver 
    // WifiManager.attachUI();                   // Attach the UI to the Webserver
  
    // // Run the Webserver and add your webpages to it
    // webServer.on("/", HTTP_GET, [](AsyncWebServerRequest *request){
    //   request->send(200, "text/plain", "Hello World");
    // });
    // webServer.onNotFound([&](AsyncWebServerRequest *request) {
    //   request->send(404, "text/plain", "Not found");
    // });
    // webServer.begin();
}

void loop()
{
      // Add heap monitoring at start of loop
    static unsigned long lastHeapPrint = 0;
    if (millis() - lastHeapPrint > 1000) {  // Print every second
        Serial.printf("Current free heap: %d\n", ESP.getFreeHeap());
        lastHeapPrint = millis();
    }

  if (goToSleep) {
        goToSleep = false;
        enterSleep();  // calls webSocket.disconnect(), etc.
    }
    if (ota_status)
    {
        loopOTA();
    }
    webSocket.loop();
    delay(10); 
}
