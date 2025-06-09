import NextAuth from 'next-auth';
import authConfig from '@/auth.config';
export const { handlers, auth, signIn, signOut } = NextAuth({
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.image = user.image;
        token.firstName = user.firstName;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.image = token.image as string;
        session.user.accessToken = token.accessToken as string;
        session.user.firstName = token.firstName as string;
        session.user.role = token.role as string;
      }
      return session;
    }
  },
  session: { strategy: 'jwt' },
  ...authConfig
});
