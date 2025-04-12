import { GetServerSideProps } from 'next';

// Remove client-side redirection in favor of server-side redirect
export default function Home() {
  // Empty component as we're redirecting at the server level
  return null;
}

// Use getServerSideProps to redirect server-side
export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      destination: '/marketplace',
      permanent: false,
    },
  };
}; 