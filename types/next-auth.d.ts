import NextAuth, { type DefaultSession } from 'next-auth';
export type ExtendedUser = DefaultSession['user'] & {
  user: {};
};
declare module 'next-auth' {
  interface Session {
    // user: {
    //   /** The user's postal address. */
    //   address: string;
    //   role: string;
    //   firstName: string;
    //   lastName: string;
    //   emailVerified: string;
    //   accessToken: string;
    //   username: string;
    // } & DefaultSession["user"];
    user: User & DefaultSession['user'];
  }
  interface User {
    role: string | null;
    firstName: string | null;
    lastName: string | null;
    email_verified: string | null;
    accessToken: string | null;
    username: string | null;
  }
  // interface Session {
  //   user: ExtendedUser;
  // }
}
// import { JWT } from "@auth/core/jwt";
// declare;
// module "@auth/core/jwt" {
//   interface JWT {
//     role?: string;
//     firstName?: string;
//     lastName?: string;
//     emailVerified?: string;
//     accessToken?: string;
//     username?: string;
//   }
// }
