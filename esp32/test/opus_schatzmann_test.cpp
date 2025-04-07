/**
 * @file test-codec-opus.ino
 * @author Phil Schatzmann
 * @brief generate sine wave -> encoder -> decoder -> audiokit (i2s)
 * @version 0.1
 * @date 2022-04-30
 * 
 * @copyright Copyright (c) 2022
 * 
 */
#include "AudioTools.h"
#include "AudioTools/AudioCodecs/CodecOpus.h"

AudioInfo infoOut(24000, 1, 16);
SineWaveGenerator<int16_t> sineWave( 32000);  // subclass of SoundGenerator with max amplitude of 32000
GeneratedSoundStream<int16_t> sound( sineWave); // Stream generated from sine wave
I2SStream i2sOut; 
OpusAudioDecoder dec;
OpusAudioEncoder enc;
EncodedAudioStream decoder(&i2sOut, &dec); // encode and write 
EncodedAudioStream encoder(&decoder, &enc); // encode and write 
StreamCopy copierOut(encoder, sound);     

const int I2S_WS_OUT = 5;
const int I2S_BCK_OUT = 6;
const int I2S_DATA_OUT = 7;
const int I2S_SD_OUT = 10;
// const i2s_port_t I2S_PORT_OUT = I2S_NUM_0;


void setup() {
  Serial.begin(115200);
  AudioToolsLogger.begin(Serial, AudioToolsLogLevel::Warning);

  pinMode(I2S_SD_OUT, OUTPUT);
  digitalWrite(I2S_SD_OUT, HIGH);

  // start I2S
  Serial.println("starting I2S...");
  auto config = i2sOut.defaultConfig(TX_MODE);
  config.pin_bck = I2S_BCK_OUT;
  config.pin_ws = I2S_WS_OUT;
  config.pin_data = I2S_DATA_OUT;
//   config.port_no = I2S_PORT_OUT;
  config.copyFrom(infoOut);
  i2sOut.begin(config);

  // Setup sine wave
  sineWave.begin(infoOut, N_B4);

  // Opus encoder and decoder need to know the audio infoOut
  decoder.begin(infoOut);
  encoder.begin(infoOut);

  // configure additinal parameters
  // auto &enc_cfg = enc.config()
  // enc_cfg.application = OPUS_APPLICATION_RESTRICTED_LOWDELAY;
  // enc_cfg.frame_sizes_ms_x2 = OPUS_FRAMESIZE_20_MS;
  // enc_cfg.complexity = 5;

  Serial.println("Test started...");
}


void loop() { 
  copierOut.copy();
}