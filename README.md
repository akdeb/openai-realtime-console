# Elato - ESP32 AI Toy Platform

An open-source platform that brings toys to life with conversational AI using ESP32 hardware and OpenAI's APIs.

![Elato Platform](https://placeholder-for-demo-image.com)

## 🌟 Overview

Elato is a complete solution for creating interactive AI toys. The platform consists of:

1. **ESP32 Firmware** - Connects physical toys to the cloud
2. **Web Frontend** - For configuring devices and creating AI personalities
3. **Server Backend** - Manages real-time communication with OpenAI's API

With Elato, any plushie or toy can become an interactive AI companion with unique personalities, voice responses, and conversational capabilities.

## ✨ Features

### Hardware
- **ESP32-based devices** - Compact, powerful, and affordable
- **Audio input/output** - High-quality microphone and speaker integration
- **Touch/button controls** - Simple user interactions
- **LED status indicators** - Visual feedback for device state
- **Long battery life** - Power-efficient design

### Software
- **Multiple AI personalities** - Create and customize characters
- **Secure WebSocket communication** - End-to-end encrypted audio streaming
- **Over-the-Air updates** - Remotely upgrade device firmware
- **WiFi manager** - Easy network configuration
- **Factory reset capability** - Simple device maintenance
- **Voice Activity Detection** - Natural conversation flow

### Web Platform
- **User accounts** - Personalized experience
- **Device management** - Register and control multiple toys
- **Character customization** - Create unique AI personalities
- **Subscription management** - Handle billing and device activation

## 🛠️ Components

### ESP32 Firmware
The heart of the physical device that:
- Captures audio via I2S MEMS microphone
- Streams audio to server using WebSockets
- Receives responses from OpenAI's Realtime API
- Plays responses through I2S amplified speaker
- Manages device state and user interactions

[Learn more about the ESP32 implementation](./esp32/README.md)

### Frontend Web Application
A Next.js application that provides:
- User authentication and account management
- Device registration and configuration
- AI personality creation and customization
- Subscription and billing management
- Device OTA updates and maintenance

[Learn more about the Frontend implementation](./frontend/README.md)

## 🚀 Getting Started

### Prerequisites
- Node.js and npm for the frontend
- PlatformIO for ESP32 firmware development
- ESP32-S3 development board (recommended)
- I2S MEMS microphone (like INMP441)
- I2S amplifier and speaker (like MAX98357A)

### Quick Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/esp32-openai.git
   cd esp32-openai
   ```

2. **Set up the Frontend**
   ```bash
   cd frontend
   npm install
   # Configure environment variables
   cp .env.local.example .env.local
   # Edit .env.local with your Supabase credentials
   npm run dev
   ```

3. **Build and Flash the ESP32 Firmware**
   ```bash
   cd ../esp32
   # Open in PlatformIO and build
   # Flash to your ESP32 device
   ```

4. **Connect your ESP32 device to WiFi**
   - Power on the device
   - Connect to the "ELATO-DEVICE" WiFi access point
   - Enter your WiFi credentials
   - The device will connect to your network

5. **Register your device in the web app**
   - Log in to the web app
   - Navigate to device settings
   - Add your device using its MAC address
   - Generate and apply an authentication token

## 📝 Documentation

For more detailed information, check the README files in each component directory:

- [ESP32 Firmware Documentation](./esp32/README.md)
- [Frontend Documentation](./frontend/README.md)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgements

- [OpenAI](https://openai.com) for their Realtime API
- [Espressif](https://espressif.com) for the ESP32 platform
- [Next.js](https://nextjs.org) and [Supabase](https://supabase.io) for the web platform
- All the open-source libraries used in this project

## 📞 Contact

For questions or support, please open an issue on this repository.