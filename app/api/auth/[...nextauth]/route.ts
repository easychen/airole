import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

// Only configure Google provider if environment variables are available
const providers = []

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          scope: 'openid email profile https://www.googleapis.com/auth/drive.file',
        },
      },
    })
  )
}

const handler = NextAuth({
  providers,
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Simply allow sign in without database operations
      return true
    },
    async jwt({ token, account, user }) {
      if (account) {
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
      }
      // Add user info to token
      if (user?.email) {
        token.email = user.email
        token.name = user.name || undefined
        token.picture = user.image || undefined
      }
      return token
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string
      session.refreshToken = token.refreshToken as string
      
      // Use token data directly without database lookup
      if (token.email) {
        session.user = {
          ...session.user,
          email: token.email as string,
          name: token.name as string || '',
          image: token.picture as string || '',
        }
      }
      
      return session
    },
  },
})

export { handler as GET, handler as POST } 