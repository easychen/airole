# Environment Variables Example

Copy this content to `.env.local` in your project root and configure your values:

```env
# AIRole.net Environment Variables
# Copy this file to .env.local and configure your values

# NextAuth.js Configuration
# Required for authentication features
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-here

# Google OAuth Configuration
# Optional - Enables Google Drive integration
# Leave empty to disable Google features
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
```

## Configuration Notes

- **NEXTAUTH_URL**: Set this to your domain (e.g., `https://yourapp.vercel.app`)
- **NEXTAUTH_SECRET**: Generate a random string for security
- **Google OAuth**: Only required if you want Google Drive integration
- **AI Models**: All AI model configurations are done in the application settings UI

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create/select a project
3. Enable Google Drive API
4. Create OAuth 2.0 credentials
5. Add your callback URL: `https://yourdomain.com/api/auth/callback/google` 