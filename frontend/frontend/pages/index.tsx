import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Starfield from '../components/Starfield';
import ServiceCard from '../components/ServiceCard';
import AdvertiserLogo from '../components/AdvertiserLogo';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/marketplace');
  }, [router]);

  return null;
} 