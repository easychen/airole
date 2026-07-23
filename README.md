# AIRole - Effortless AI Character Card Creator

✨ Create character cards from a single image with just a few clicks!

An incredibly simple and user-friendly open-source AI character card generator. Upload a character image, let AI automatically analyze and generate detailed character attributes, perfect for role-playing games, storytelling, and AI chatbots ( [using character-card-spec-v2](https://github.com/malfoyslastname/character-card-spec-v2) ). Built with Next.js and modern web technologies.

**🚀 Super simple workflow: Upload Image → AI Analysis & Generation → Fine-tune → Export & Use**



https://github.com/user-attachments/assets/8e8af9d5-be66-4933-9dc8-ca2fbf3bc23e


## Deploy with Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/git/external?repository-url=https://github.com/easychen/airole)

## ✨ Features

- **🖼️ AI Image Analysis** - Upload character images and let AI generate character descriptions
- **🤖 AI-Powered Generation** - Generate character attributes using OpenAI-compatible AI models
- **💬 AI Assistant Chat** - Get suggestions and improvements for your character attributes
- **📱 Responsive Design** - Works seamlessly on desktop and mobile devices
- **🎨 Modern UI** - Clean, intuitive interface with dark/light theme support
- **📝 Character Book Support** - Advanced character memory system
- **🔄 Version History** - Track and manage character development
- **📤 Multiple Export Formats** - Export as JSON or PNG character cards
- **☁️ Cloud Storage** - Optional Google Drive integration for character backup
- **🎯 Tavern Card Compatible** - Standard format for character cards

## 🚀 Quick Start

### Deploy to Vercel

The easiest way to get started is to deploy directly to Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/git/external?repository-url=https://github.com/easychen/airole)

After deployment, you can configure the environment variables in your Vercel dashboard to enable additional features.

### Manual Deployment

1. **Clone the repository**
   ```bash
   git clone https://github.com/easychen/airole.git
   cd airole
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables** (optional)
   ```bash
   cp .env.example .env.local
   ```
   See [Configuration](#configuration) for details.

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## ⚙️ Configuration

All features work without configuration, but you can enhance functionality by setting up environment variables:

### Basic Configuration

Create a `.env.local` file in your project root:

```env
# NextAuth.js (optional - required for Google features)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-here

# Google OAuth (optional - enables Google Drive integration)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Google OAuth Setup (Optional)

To enable Google Drive integration:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Drive API
4. Create OAuth 2.0 credentials
5. Add your domain to authorized origins
6. Add the callback URL: `https://yourdomain.com/api/auth/callback/google`

### AI Model Configuration

The application supports OpenAI-compatible AI models. Users can configure their preferred models and API keys through the settings interface:

- **Supported Models**: Any model that follows OpenAI API specifications
- **Popular Providers**: OpenAI, Google AI Studio, Anthropic, SiliconFlow, DeepSeek, etc.
- **Custom Endpoints**: Configure custom API base URLs for different providers

## 🏗️ Project Structure

```
├── app/                  # Next.js app directory
│   ├── api/             # API routes
│   ├── globals.css      # Global styles
│   └── page.tsx         # Main application page
├── components/          # React components
│   ├── ui/             # UI components
│   └── ...             # Feature components
├── lib/                # Utility functions
├── public/             # Static assets
├── styles/             # Additional styles
└── types/              # TypeScript definitions
```

## 🔧 Development

### Prerequisites

- Node.js 18+ 
- npm/yarn/pnpm

### Local Development

1. Clone and install dependencies (see Quick Start)
2. Configure environment variables (optional)
3. Run `npm run dev`
4. Open [http://localhost:3000](http://localhost:3000)

### Building for Production

```bash
npm run build
npm run start
```

## 📱 Usage

1. **Upload Character Image** (optional)
   - Upload an image of your character
   - AI will analyze and generate initial character attributes

2. **Fill Character Details**
   - Edit generated or create new character information
   - Use the tabbed interface for organized editing

3. **Get AI Assistance**
   - Switch to the chat tab to get suggestions for character improvements
   - Use adjustment presets for quick character refinements
   - AI assistant helps you polish character attributes

4. **Export Your Character**
   - Export as JSON for data interchange
   - Export as PNG for character card sharing

5. **Cloud Backup** (if configured)
   - Save characters to Google Drive
   - Access your characters from any device

## 🎨 Customization

### Themes

The application supports multiple themes:
- Light mode
- Dark mode  
- System preference

### Languages

Currently supported languages:
- English
- Chinese (Simplified)

### Models

Configurable OpenAI-compatible models for different purposes:
- Image analysis models
- Character generation models
- AI assistant models

## 🔒 Privacy & Security

- **Local First**: All data is stored locally by default
- **Optional Cloud**: Google Drive integration is completely optional
- **No Tracking**: We don't track user behavior or collect analytics
- **Open Source**: Full transparency - inspect the code yourself

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Reporting Issues

Found a bug or have a feature request? Please [open an issue](https://github.com/easychen/airole/issues).

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)
- Authentication via [NextAuth.js](https://next-auth.js.org/)

## 📞 Support

- **Documentation**: Check the [User Guide](USER_GUIDE.md)
- **Issues**: [GitHub Issues](https://github.com/easychen/airole/issues)
- **Discussions**: [GitHub Discussions](https://github.com/easychen/airole/discussions)

---

<div align="center">
  <p>Made with ❤️ by the AIRole.net team</p>
  <p>
    <a href="https://github.com/easychen/airole">⭐ Star us on GitHub</a> •
    <a href="https://vercel.com/new/git/external?repository-url=https://github.com/easychen/airole">🚀 Deploy to Vercel</a>
  </p>
</div> 
