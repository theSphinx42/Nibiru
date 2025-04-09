import { motion } from 'framer-motion';
import { useState } from 'react';

interface ServiceDetailProps {
  service: {
    id: string;
    name: string;
  }
} 