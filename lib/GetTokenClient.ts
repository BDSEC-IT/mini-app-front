'use client';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

type UseTokenReturn = string | null;

const GetTokenClient = (): UseTokenReturn => {
  const { data: session, status } = useSession();
  const [token, setToken] = useState<UseTokenReturn>(null);

  useEffect(() => {
    if (status === 'authenticated') {
      setToken(session?.user.accessToken || null);
    } else {
      setToken(null);
    }
  }, [status, session]);

  return token;
};
export const GetSession = () => {
  const { data: session, status } = useSession();
  const dataaa = useSession();
  const [token, setToken] = useState<UseTokenReturn>(null);

  useEffect(() => {
    if (status === 'authenticated') {
      setToken(session?.user.accessToken || null);
    } else {
      setToken(null);
    }
  }, [status, session]);
  useEffect(() => {
    if (dataaa.status === 'authenticated') {
      // setToken(session?.user.accessToken || null);
    } else {
      setToken(null);
    }
  }, [dataaa]);
  return session;
};

export default GetTokenClient;
