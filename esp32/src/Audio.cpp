#include "OTA.h"
#include "Print.h"
#include "Config.h"
#include "AudioTools.h"
#include "AudioTools/Concurrency/RTOS.h"
#include "AudioTools/AudioCodecs/CodecOpus.h"
#include <WebSocketsClient.h>
#include "Audio.h"

// WEBSOCKET
SemaphoreHandle_t wsMutex;
WebSocketsClient webSocket;

// TASK HANDLES
TaskHandle_t speakerTaskHandle = NULL;
TaskHandle_t micTaskHandle = NULL;
TaskHandle_t networkTaskHandle = NULL;

// TIMING REGISTERS
bool scheduleListeningRestart = false;
unsigned long scheduledTime = 0;
unsigned long speakingStartTime = 0;

// AUDIO SETTINGS
int currentVolume = 70;
const int CHANNELS = 1;         // Mono
const int BITS_PER_SAMPLE = 16; // 16-bit audio

// AUDIO OUTPUT
class BufferPrint : public Print {
public:
  BufferPrint(BufferRTOS<uint8_t>& buf) : _buffer(buf) {}

  // Write a single byte to the buffer.
  virtual size_t write(uint8_t data) override {
    if (webSocket.isConnected() && deviceState == SPEAKING) {
        return _buffer.writeArray(&data, 1);
    }
    return 0;
  }

  // Write an array of bytes to the buffer.
  virtual size_t write(const uint8_t *buffer, size_t size) override {
    if (webSocket.isConnected() && deviceState == SPEAKING) {
        return _buffer.writeArray(buffer, size);
    }
    return 0;
  }

private:
  BufferRTOS<uint8_t>& _buffer;
};

BufferPrint bufferPrint(audioBuffer);
OpusAudioDecoder opusDecoder;
BufferRTOS<uint8_t> audioBuffer(AUDIO_BUFFER_SIZE, AUDIO_CHUNK_SIZE);
I2SStream i2s; 
VolumeStream volume(i2s);
QueueStream<uint8_t> queue(audioBuffer);
StreamCopy copier(volume, queue);
AudioInfo info(SAMPLE_RATE, CHANNELS, BITS_PER_SAMPLE);

unsigned long getSpeakingDuration() {
    if (deviceState == SPEAKING && speakingStartTime > 0) {
        return millis() - speakingStartTime;
    }
    return 0;
}

// Add this function for transitioning to speaking mode
void transitionToSpeaking() {    
    // Give time for any in-flight WebSocket operations to complete
    vTaskDelay(50);
    
    // Flush all input streams to clear any pending audio data
    i2sInput.flush();
    
    // Now safely transition to speaking mode
    if (xSemaphoreTake(wsMutex, pdMS_TO_TICKS(100)) == pdTRUE) {
        deviceState = SPEAKING;
        digitalWrite(10, HIGH);
        speakingStartTime = millis();

         // Resume the speaker task if it was suspended
        if (speakerTaskHandle != NULL) {
            Serial.println("Resuming speaker task");
            vTaskResume(speakerTaskHandle);
        }
        
        // Enable heartbeat after state change is complete
        webSocket.enableHeartbeat(25000, 15000, 3);
        
        xSemaphoreGive(wsMutex);
    }
    
    Serial.println("Transitioned to speaking mode");
}

// Add this function for centralized state management
void transitionToListening() {
    scheduleListeningRestart = false;
    Serial.println("Transitioning to listening mode");

 // These stream operations don't directly interact with the WebSocket
    i2s.flush();
    volume.flush();
    queue.flush();
    i2sInput.flush(); // Also flush the input stream
    audioBuffer.reset();    

    // Suspend the speaker task to save CPU resources
    if (speakerTaskHandle != NULL) {
        Serial.println("Suspending speaker task before transition to listening");
        vTaskSuspend(speakerTaskHandle);
    }

    Serial.println("Transitioned to listening mode");
    deviceState = LISTENING;
    digitalWrite(10, LOW);

    // Only the WebSocket operations need mutex protection
    if (xSemaphoreTake(wsMutex, pdMS_TO_TICKS(100)) == pdTRUE) {
        // This directly accesses the WebSocket and needs protection
        webSocket.disableHeartbeat();
        xSemaphoreGive(wsMutex);
    }
}

void audioStreamTask(void *parameter) {
    Serial.println("Starting I2S stream pipeline...");
    
    pinMode(10, OUTPUT);

    OpusSettings cfg;
    cfg.sample_rate = SAMPLE_RATE;
    cfg.channels = CHANNELS;
    cfg.bits_per_sample = BITS_PER_SAMPLE;
    cfg.max_buffer_size = 6144;
    opusDecoder.setOutput(bufferPrint);
    
    // Initialize the Opus decoder with the audio configuration.
    // (Check your library’s documentation for the exact initialization call.)
    opusDecoder.begin(cfg);
    
    // Start the queue stream (this will initialize its internal structures)
    queue.begin();

    // Set up your I2S configuration.
    // The I2SStream class here uses a default configuration which you can override.
    auto config = i2s.defaultConfig(TX_MODE);
    config.bits_per_sample = BITS_PER_SAMPLE;
    config.sample_rate = SAMPLE_RATE;
    config.channels = CHANNELS;
    config.pin_bck = I2S_BCK_OUT;
    config.pin_ws = I2S_WS_OUT;
    config.pin_data = I2S_DATA_OUT;
    config.port_no = I2S_PORT_OUT;

    config.copyFrom(info);  // Copy your audio settings into the I2S configuration.
    i2s.begin(config);      // Begin I2S output with your configuration.

    // Setup VolumeStream using the same configuration as I2S.
    auto vcfg = volume.defaultConfig();
    vcfg.copyFrom(config);
    vcfg.allow_boost = true;
    volume.begin(vcfg);     // Begin the volume stream with the provided configuration.

        // Initially suspend if not in speaking mode
    if (deviceState != SPEAKING) {
        Serial.println("Suspending speaker task");
        vTaskSuspend(NULL); // Suspend itself - will be resumed when needed
    }

while (1) {
    if (webSocket.isConnected() && deviceState == SPEAKING) {
        copier.copy();  
    }
            vTaskDelay(1); // Small delay to yield CPU
             // Depending on your data rate, you might add a small delay or yield here.
         }
}

// AUDIO INPUT SETTINGS
// Modify the WebsocketStream class to safely handle disconnections
class WebsocketStream : public Print {
public:
    virtual size_t write(uint8_t b) override {
        // First check if we're transitioning states or if the connection is invalid
        if (scheduleListeningRestart || !webSocket.isConnected() || deviceState != LISTENING) {
            return 0; // Skip sending data during transitions or if not connected
        }
        
        // Only try to send if we can get the mutex
        if (xSemaphoreTake(wsMutex, pdMS_TO_TICKS(10)) == pdTRUE) {
            bool isStillConnected = webSocket.isConnected();
            if (isStillConnected) {
                webSocket.sendBIN(&b, 1);
            }
            xSemaphoreGive(wsMutex);
            return isStillConnected ? 1 : 0;
        }
        return 0;
    }
    
    virtual size_t write(const uint8_t *buffer, size_t size) override {
        if (size == 0) {
            return 0;
        }
        
        // First check if we're transitioning states or if the connection is invalid
        if (scheduleListeningRestart || !webSocket.isConnected() || deviceState != LISTENING) {
            return 0; // Skip sending data during transitions or if not connected
        }
        
        // Only try to send if we can get the mutex
        if (xSemaphoreTake(wsMutex, pdMS_TO_TICKS(10)) == pdTRUE) {
            bool isStillConnected = webSocket.isConnected();
            if (isStillConnected) {
                webSocket.sendBIN(buffer, size);
            }
            xSemaphoreGive(wsMutex);
            return isStillConnected ? size : 0;
        }
        return 0;
    }
};

WebsocketStream wsStream;
I2SStream i2sInput;
StreamCopy micToWsCopier(wsStream, i2sInput);

void micTask(void *parameter) {
    // Configure and start I2S input stream.
    auto i2sConfig = i2sInput.defaultConfig(RX_MODE);
    i2sConfig.bits_per_sample = BITS_PER_SAMPLE;
    i2sConfig.sample_rate = SAMPLE_RATE;
    i2sConfig.channels = CHANNELS;
    i2sConfig.i2s_format = I2S_LEFT_JUSTIFIED_FORMAT;
    i2sConfig.channel_format = I2S_CHANNEL_FMT_ONLY_LEFT;
    // Configure your I2S input pins appropriately here:
    i2sConfig.pin_bck = I2S_SCK;
    i2sConfig.pin_ws  = I2S_WS;
    i2sConfig.pin_data = I2S_SD;
    i2sConfig.port_no = I2S_PORT_IN;
    i2sInput.begin(i2sConfig);

    // If you are using Opus, you could insert an Opus encoder in the chain.
    // For raw PCM, simply use the stream copy.

    while (1) {
        if (scheduleListeningRestart && millis() >= scheduledTime) {
            transitionToListening();
        }

        if (deviceState == LISTENING && webSocket.isConnected()) {
            // The copier takes care of reading from I2S stream and writing to the WebSocket.
            micToWsCopier.copy();
        }
        vTaskDelay(10);
    }
}

// WEBSOCKET EVENTS
void webSocketEvent(WStype_t type, uint8_t *payload, size_t length)
{
    switch (type)
    {
    case WStype_DISCONNECTED:
        Serial.printf("[WSc] Disconnected!\n");
        deviceState = IDLE;
        break;
    case WStype_CONNECTED:
        Serial.printf("[WSc] Connected to url: %s\n", payload);
        deviceState = PROCESSING;
        break;
    case WStype_TEXT:
    {
        Serial.printf("[WSc] get text: %s\n", payload);

        JsonDocument doc;
        DeserializationError error = deserializeJson(doc, (char *)payload);

        if (error)
        {
            Serial.println("Error deserializing JSON");
            deviceState = IDLE;
            return;
        }

        String type = doc["type"];

        // auth messages
        if (strcmp((char*)type.c_str(), "auth") == 0) {
            currentVolume = doc["volume_control"].as<int>();
            bool is_ota = doc["is_ota"].as<bool>();
            bool is_reset = doc["is_reset"].as<bool>();
            volume.setVolume(currentVolume / 100.0f);  // Set initial volume (e.g., 70/100 = 0.7)

            if (is_ota) {
                Serial.println("OTA update received");
                setOTAStatusInNVS(OTA_IN_PROGRESS);
                ESP.restart();
            }

            if (is_reset) {
                Serial.println("Factory reset received");
                // setFactoryResetStatusInNVS(true);
                ESP.restart();
            }
        }

        // oai messages
        if (strcmp((char*)type.c_str(), "server") == 0) {
            String msg = doc["msg"];
            Serial.println(msg);

            // receive response.audio.done or response.done, then start listening again
            if (strcmp((char*)msg.c_str(), "RESPONSE.COMPLETE") == 0 || strcmp((char*)msg.c_str(), "RESPONSE.ERROR") == 0) {
                Serial.println("Received RESPONSE.COMPLETE or RESPONSE.ERROR, starting listening again");
                scheduleListeningRestart = true;
                scheduledTime = millis() + 1000; // 1 second delay
            } else if (strcmp((char*)msg.c_str(), "AUDIO.COMMITTED") == 0) {
                deviceState = PROCESSING; // Intermediate state
            } else if (strcmp((char*)msg.c_str(), "RESPONSE.CREATED") == 0) {
                Serial.println("Received RESPONSE.CREATED, transitioning to speaking");
                transitionToSpeaking();
            } 
        }
    }
        break;
    case WStype_BIN:
    {
        // If we're no longer in SPEAKING mode or if a transition has been requested,
        // just ignore any incoming audio data.
        if (scheduleListeningRestart || deviceState != SPEAKING) {
            Serial.println("Skipping audio data due to touch interrupt.");
            break;
        }

        // Otherwise process the audio data normally
        size_t processed = opusDecoder.write(payload, length);
        if (processed != length) {
            Serial.printf("Warning: Only processed %d/%d bytes\n", processed, length);
        }
        break;
      }
    case WStype_ERROR:
        Serial.printf("[WSc] Error: %s\n", payload);    
        break;
    case WStype_FRAGMENT_TEXT_START:
    case WStype_FRAGMENT_BIN_START:
    case WStype_FRAGMENT:
    case WStype_PONG:
    case WStype_PING:
    case WStype_FRAGMENT_FIN:
        break;
    }
}

void websocketSetup(String server_domain, int port, String path)
{
    String headers = "Authorization: Bearer " + String(authTokenGlobal);
    webSocket.setExtraHeaders(headers.c_str());
    webSocket.onEvent(webSocketEvent);
    webSocket.setReconnectInterval(1000);

    #ifdef DEV_MODE
    webSocket.begin(server_domain.c_str(), port, path.c_str());
    #else
    webSocket.beginSslWithCA(server_domain.c_str(), port, path.c_str(), CA_cert);
    #endif
}

 void networkTask(void *parameter) {
         while (1) {
             webSocket.loop();   // Handle WebSocket events continuously
             vTaskDelay(1);      // Small delay to yield CPU to higher priority tasks
         }
     }


