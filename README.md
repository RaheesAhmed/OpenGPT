# 🚀 OpenGPT

**The Open Source ChatGPT Alternative - Bring Your Own API Key**

[![Next.js](https://img.shields.io/badge/Next.js-15+-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3+-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

> 🎯 **Mission**: Make AI accessible to everyone by providing a free, open-source ChatGPT interface where users control their own API keys and data.

## 📸 Preview

![OpenGPT Screenshot](public/opengpt-screenshot.png)

_OpenGPT's clean and intuitive interface - bringing the power of ChatGPT with complete privacy and control_

## ✨ Features

### 🔥 **Core Features**

- 💬 **ChatGPT-like Interface** - Familiar and intuitive chat experience
- 🔑 **Bring Your Own API Key** - No subscriptions, use your OpenAI credits directly
- 🧠 **Intelligent Memory System** - Advanced conversation context with 4-layer memory architecture
- 📱 **Fully Responsive** - Perfect experience on desktop, tablet, and mobile
- ⚡ **Real-time Streaming** - See responses as they're generated, just like ChatGPT
- 💾 **Persistent Chat History** - All conversations saved locally with full control
- 🗂️ **Smart Chat Management** - Organize with search, rename, delete, and auto-titles

### 🧠 **Advanced Memory System**

- 🎯 **4-Layer Architecture** - Immediate, recent, historical, and important context layers
- 📊 **Token Optimization** - 85-90% token reduction for long conversations
- 🔄 **Automatic Summarization** - Intelligent compression of conversation history
- 💡 **Context Preservation** - Never lose important details from past messages
- ⚡ **Infinite Scalability** - Handle 500+ message conversations efficiently

### 🛡️ **Security & Privacy**

- 🔐 **Encrypted Local Storage** - Your API keys are encrypted and stored locally
- 🚫 **Zero Data Collection** - We don't see, store, or analyze your conversations
- 🏠 **Completely Local** - All processing happens in your browser
- 🛡️ **XSS Protection** - Built-in security against common web vulnerabilities
- 🔒 **No Server Logging** - Your conversations never touch our servers

### 🎨 **User Experience**

- 🌙 **Beautiful Dark Theme** - Sleek, modern design that's easy on the eyes
- 🎭 **Smooth Animations** - Polished micro-interactions throughout
- ⌨️ **Keyboard Shortcuts** - Power user friendly with Enter to send
- 📄 **Markdown Support** - Rich text rendering with code highlighting
- 📎 **File Upload** - Support for text, code, and document files
- 🎛️ **Model Selection** - Choose from GPT-4, GPT-3.5-turbo, and more

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **OpenAI API Key** - [Get yours here](https://platform.openai.com/api-keys)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/RaheesAhmed/OpenGPT.git
cd OpenGPT
```

2. **Install dependencies**

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. **Run the development server**

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

5. **Add your API key**

   Click the settings icon and securely add your OpenAI API key

That's it! Start chatting with AI while maintaining complete control over your data.

## 📖 How It Works

### 🔑 API Key Security

```typescript
// Your API key workflow:
1. Enter API key in settings →
2. Encrypted with AES-256 →
3. Stored locally in browser →
4. Never sent to our servers →
5. Used directly with OpenAI API
```

### 🧠 Memory Architecture

```typescript
// 4-Layer Memory System:
Layer 1: Immediate Context (5-8 messages)    // 800-1200 tokens
Layer 2: Recent Chunks (summarized)          // 600-900 tokens
Layer 3: Historical Summary (compressed)     // 400-600 tokens
Layer 4: Important Messages (preserved)      // 200-400 tokens

Total: ~3k tokens (regardless of conversation length)
```

### 💾 Data Storage

```typescript
// Local Browser Storage:
├── Encrypted API Keys
├── Chat Messages (by conversation ID)
├── Memory Context (intelligent summaries)
├── User Preferences
└── No server-side data (100% local)
```

## 🏗️ Architecture

### Tech Stack

- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: React Hooks + Local Storage
- **Memory System**: Custom intelligent context management
- **Security**: AES-256 encryption for API keys
- **Deployment**: Vercel-ready with Docker support

### Project Structure

```
├── app/                    # Next.js App Router
│   ├── api/               # API routes (chat, models)
│   ├── globals.css        # Global styles
│   └── page.tsx          # Main chat interface
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── chat-sidebar.tsx  # Chat management
│   ├── sidebar.tsx       # Expanded sidebar
│   ├── mini-sidebar.tsx  # Collapsed sidebar
│   └── model-selector.tsx # AI model selection
├── lib/                  # Utility functions
│   ├── chat-memory.ts    # Memory system
│   └── utils.ts         # Helper functions
└── public/              # Static assets
```

## 🔧 Configuration

### Supported Models

All models from OpenAI are supported

### Default Settings

```typescript
const DEFAULT_CONFIG = {
  model: "gpt-4o-mini",
  temperature: 0.7,
  streaming: true,
  memoryEnabled: true,
  autoTitle: true,
};
```

## 🚀 Deployment

### Vercel (One-Click Deploy)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/RaheesAhmed/OpenGPT)

1. Click the button above
2. Fork the repository
3. Deploy automatically
4. Start using immediately!

### Manual Deployment

```bash
# Build for production
npm run build

# Start production server
npm start
```

### Docker

```dockerfile
# Build the image
docker build -t opengpt .

# Run the container
docker run -p 3000:3000 opengpt
```

### Self-Hosting

Perfect for complete privacy! Deploy on your own server:

```bash
# Clone and build
git clone https://github.com/RaheesAhmed/OpenGPT.git
cd OpenGPT
npm install
npm run build

# Run with PM2 (recommended)
pm2 start npm --name "opengpt" -- start
```

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### 🐛 Bug Reports

Found a bug? Please create an issue with:

- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable

### 💡 Feature Requests

Have an idea? We'd love to hear it! Please include:

- Clear description of the feature
- Use case and benefits
- Any implementation ideas

### 🔧 Pull Requests

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Make** your changes
4. **Test** thoroughly
5. **Commit** with clear messages: `git commit -m 'Add amazing feature'`
6. **Push** to your branch: `git push origin feature/amazing-feature`
7. **Open** a Pull Request

### Code Guidelines

- Use TypeScript for all new code
- Follow existing code style and patterns
- Add comments for complex logic
- Test your changes thoroughly
- Update documentation if needed

## 🛟 Support

### Get Help

- 💬 **GitHub Discussions**: [Ask questions & share ideas](https://github.com/RaheesAhmed/OpenGPT/discussions)
- 🐛 **Issues**: [Report bugs](https://github.com/RaheesAhmed/OpenGPT/issues)
- 📧 **Email**: [raheesahmed256@gmail.com](mailto:raheesahmed256@gmail.com)

### FAQ

**❓ Is my API key safe?**
✅ Yes! Your API key is encrypted and stored only in your browser. We never see it.

**❓ Do you collect my conversations?**
✅ No! All conversations stay on your device. Zero data collection.

**❓ Can I use this offline?**
❌ You need internet for API calls to OpenAI, but your data stays local.

**❓ Which models are supported?**
✅ All OpenAI models: GPT-4, GPT-4 Turbo, GPT-4o, GPT-3.5 Turbo, and more.

**❓ Can I export my chats?**
✅ Yes! Your chats are saved locally and can be backed up from browser storage.

**❓ Is this really free?**
✅ Completely free! You only pay OpenAI for your API usage.

## 📊 Why OpenGPT?

| Feature             | OpenGPT          | ChatGPT Plus   | Other Alternatives |
| ------------------- | ---------------- | -------------- | ------------------ |
| **Cost**            | Free + Your API  | $20/month      | Varies             |
| **Privacy**         | 100% Local       | Data collected | Usually collected  |
| **API Key Control** | You own it       | N/A            | Rarely             |
| **Customization**   | Full control     | Limited        | Limited            |
| **Open Source**     | ✅ MIT License   | ❌ Closed      | Rarely             |
| **Memory System**   | Advanced 4-layer | Basic          | Basic              |
| **Self-Hosting**    | ✅ Yes           | ❌ No          | Rarely             |

## 🗺️ Roadmap

- [ ] **Multi-Provider Support** (Anthropic, Google, Cohere)
- [ ] **Voice Input/Output** with speech recognition
- [ ] **Plugin System** for custom extensions
- [ ] **Team Collaboration** features
- [ ] **Advanced Prompt Library** with templates
- [ ] **Data Export/Import** (JSON, Markdown, CSV)
- [ ] **Mobile App** (React Native)
- [ ] **Offline Mode** with local models

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

### What this means:

- ✅ **Free to use** for any purpose
- ✅ **Free to modify** and distribute
- ✅ **Free for commercial use**
- ✅ **No restrictions** on usage

## 🙏 Acknowledgments

- **OpenAI** - For the incredible GPT models
- **Vercel** - For Next.js and amazing deployment platform
- **shadcn** - For beautiful UI components
- **The Open Source Community** - For inspiration and contributions

## 📈 Stats

![GitHub stars](https://img.shields.io/github/stars/RaheesAhmed/OpenGPT?style=social)
![GitHub forks](https://img.shields.io/github/forks/RaheesAhmed/OpenGPT?style=social)
![GitHub issues](https://img.shields.io/github/issues/RaheesAhmed/OpenGPT)
![GitHub last commit](https://img.shields.io/github/last-commit/RaheesAhmed/OpenGPT)
![GitHub repo size](https://img.shields.io/github/repo-size/RaheesAhmed/OpenGPT)

---

<div align="center">

**Made with ❤️ by [Rahees Ahmed](https://github.com/RaheesAhmed)**

**⭐ Star us on GitHub if you find this project useful!**

**🔗 [Live Demo](https://opengpt-rahees.vercel.app) | [Documentation](https://github.com/RaheesAhmed/OpenGPT/wiki) | [Contributing](https://github.com/RaheesAhmed/OpenGPT/blob/main/CONTRIBUTING.md)**

</div>

---

_"AI should be accessible to everyone, with complete privacy and control."_ - **OpenGPT Mission**

_Last updated: January 2025_
