#include "WebsocketHandler.h"

WebSocketsClient webSocket;

int currentVolume = 70;
unsigned long connectionStartTime = 0;

BufferRTOS<uint8_t> audioBuffer(AUDIO_BUFFER_SIZE, AUDIO_CHUNK_SIZE);

void scaleAudioVolume(uint8_t *input, uint8_t *output, size_t length, int volume)
{
    // Convert volume from 0-100 range to 0.0-1.0 range
    float volumeScale = volume / 100.0f;

    // Process 16-bit samples (2 bytes per sample)
    for (size_t i = 0; i < length; i += 2)
    {
        // Convert two bytes to a 16-bit signed integer
        int16_t sample = (input[i + 1] << 8) | input[i];

        // Scale the sample
        float scaledSample = sample * volumeScale;

        // Clamp the value to prevent overflow
        if (scaledSample > 32767)
            scaledSample = 32767;
        if (scaledSample < -32768)
            scaledSample = -32768;

        // Convert back to bytes
        int16_t finalSample = (int16_t)scaledSample;
        output[i] = finalSample & 0xFF;
        output[i + 1] = (finalSample >> 8) & 0xFF;
    }
}

void webSocketEvent(WStype_t type, uint8_t *payload, size_t length)
{
    switch (type)
    {
    case WStype_DISCONNECTED:
        Serial.printf("[WSc] Disconnected!\n");
        connectionStartTime = 0;  // Reset timer
        // audioBuffer.clear();
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

            if (is_ota) {
                Serial.println("OTA update received");
                setOTAStatusInNVS(true);
                ESP.restart();
            }

            if (is_reset) {
                Serial.println("Factory reset received");
                // setFactoryResetStatusInNVS(true);
                ESP.restart();
            }
        }

        // oai messages
        if (strcmp((char*)type.c_str(), "oai") == 0) {
            String msg = doc["msg"];

            // receive response.audio.done or response.done, then start listening again
            if (strcmp((char*)msg.c_str(), "response.done") == 0) {
                Serial.println("Received response.done, starting listening again");
                
                // TODO(akdeb): differs with wifi speeds
                delay(2000);

                // Start listening again
                connectionStartTime = millis();  // Start timer
                deviceState = LISTENING;
            } else if (strcmp((char*)msg.c_str(), "response.created") == 0) {
                Serial.println("Received response.created, stopping listening");
                connectionStartTime = 0;
                deviceState = SPEAKING;
            }
        }
    }
        break;
    case WStype_BIN:
    {
        size_t chunkSize = length;
        Serial.printf("foobar: %d\n", chunkSize);

            // Allocate a temporary buffer for volume scaling.
            uint8_t *scaledAudio = (uint8_t *)malloc(chunkSize);
            if (!scaledAudio) {
                Serial.println("Failed to allocate scaled audio buffer");
                break;
            }

            // Scale the audio as you do currently.
            scaleAudioVolume(payload, scaledAudio, chunkSize, currentVolume);
            
            // Attempt to write to the BufferRTOS.
            size_t written = audioBuffer.writeArray(scaledAudio, chunkSize);
            if (written < chunkSize) {
                Serial.printf("BufferRTOS overflow: only wrote %d/%d bytes, dropping some audio data\n", written, chunkSize);
            }
            
            free(scaledAudio);
    }
    break;

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
int rssi = WiFi.RSSI();
    String headers = "Authorization: Bearer " + String(authTokenGlobal) + "\r\n" +
                    "X-WiFi-RSSI: " + String(rssi);    webSocket.setExtraHeaders(headers.c_str());
    webSocket.onEvent(webSocketEvent);
    webSocket.setReconnectInterval(1000);
    // webSocket.enableHeartbeat(15000, 30000, 5);

    #ifdef DEV_MODE
    webSocket.begin(server_domain.c_str(), port, path.c_str());
    #else
    webSocket.beginSslWithCA(server_domain.c_str(), port, path.c_str(), CA_cert);
    #endif
}