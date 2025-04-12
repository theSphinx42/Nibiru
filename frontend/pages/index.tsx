import React from 'react';
import Link from 'next/link';
import { GetServerSideProps } from 'next';

export default function Home() {
  return null;
}

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      destination: '/marketplace',
      permanent: false,
    },
  };
}; 