'use server';
import React from 'react';
import ConfirmToken from './ConfirmToken';
interface Props {
  searchParams: { token: string; action: string; email: string };
}
const SignIn = ({ searchParams }: Props) => {
  return (
    <div data-theme="dark">
      <ConfirmToken searchParams={searchParams} />
    </div>
  );
};

export default SignIn;
