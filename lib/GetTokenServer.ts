import { auth } from "@/auth";

const getToken = async () => {
  const session = await auth();
  if (!session) return null;
  return session?.user.accessToken;
};
export const getSession = async () => {
  const session = await auth();
  if (!session) return null;
  return session;
};

export default getToken;
