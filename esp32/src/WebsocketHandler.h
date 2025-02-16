#include <Config.h>
#include "OTA.h"
#include <WebSocketsClient.h>
// #include <FactoryReset.h>
#include "AudioTools.h"
#include "AudioTools/Concurrency/RTOS.h"

extern WebSocketsClient webSocket;

extern int currentVolume;
extern unsigned long connectionStartTime;

// Create a high‑throughput buffer for raw audio data.
// Adjust the overall size and chunk size according to your needs.
constexpr size_t AUDIO_BUFFER_SIZE = 1024 * 32; // total bytes in the buffer
constexpr size_t AUDIO_CHUNK_SIZE  = 8192;         // ideal read/write chunk size

extern BufferRTOS<uint8_t> audioBuffer;

void scaleAudioVolume(uint8_t *input, uint8_t *output, size_t length, int volume);
void webSocketEvent(WStype_t type, uint8_t *payload, size_t length);
void websocketSetup(String server_domain, int port, String path);