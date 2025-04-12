import React from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import dynamic from 'next/dynamic';

// Dynamically import the FactCheckPage with ChakraProvider to avoid SSR issues
const FactCheckPageWithChakra = dynamic(
  () => import('../tools/SphinxFactCheck/src/components/FactCheckPage'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-pulse text-center">
          <div className="text-2xl font-semibold mb-2">Loading SphinxFactCheck</div>
          <div className="text-gray-400">Preparing fact-checking system...</div>
        </div>
      </div>
    )
  }
);

export default function FactCheckRoute() {
  return (
    <Layout>
      <Head>
        <title>SphinxFactCheck | Nibiru</title>
        <meta name="description" content="AI-Powered Video Integrity Scoring" />
      </Head>
      
      <div className="container mx-auto max-w-6xl pt-8 pb-16">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">
            SphinxFactCheck
          </h1>
          <p className="text-xl max-w-3xl mx-auto text-gray-300">
            AI-Powered Video Integrity Scoring
          </p>
        </div>
        
        <FactCheckPageWithChakra />
      </div>
    </Layout>
  );
} 