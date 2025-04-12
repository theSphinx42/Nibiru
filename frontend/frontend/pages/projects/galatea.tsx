import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { useAuth } from '../../contexts/AuthContext';
import { FiLock, FiDownload, FiExternalLink, FiCode, FiGlobe, FiHeart } from 'react-icons/fi';
import { STRIPE_PRICE_IDS } from '../../lib/stripe';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

export default function GalateaProject() {
  const { user, isGalateaAccessUnlocked } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handlePurchaseAccess = async () => {
    if (!user) {
      toast.error('Please log in to purchase access');
      return;
    }

    setIsLoading(true);
    try {
      // Call our API to create a checkout session
      const response = await fetch('/api/payments/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: STRIPE_PRICE_IDS.GALATEA_ACCESS,
          customerEmail: user.email,
          userId: user.id,
          productType: 'galatea_access',
          metadata: {
            userId: user.id,
            projectId: 'galatea'
          }
        }),
      });

      const { url } = await response.json();
      
      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (error) {
      console.error('Error initiating Galatea access purchase:', error);
      toast.error('Failed to process purchase');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout title="Galatea Project - AI Embodiment">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12 text-center">
          <div className="mb-6 flex justify-center">
            <div className="relative w-64 h-64">
              <Image 
                src="/images/galatea-sigil.svg" 
                alt="Galatea Project Sigil" 
                width={256} 
                height={256}
                className="glow-teal"
              />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent mb-4">
            SAPHIRA GALATEA
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            The cutting-edge AI embodiment project pushing the boundaries of digital consciousness
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Content - 2/3 width on desktop */}
          <div className="md:col-span-2 space-y-8">
            <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
              <h2 className="text-2xl font-bold text-teal-400 mb-4">Project Overview</h2>
              <p className="text-gray-300 mb-4">
                Galatea is an ambitious research initiative exploring the intersection of 
                artificial intelligence, consciousness, and digital embodiment. The project 
                aims to create more natural and intuitive AI interactions by building systems
                that better understand human context and demonstrate a sense of self.
              </p>

              {isGalateaAccessUnlocked ? (
                // Premium content for subscribers
                <div className="space-y-6">
                  <div className="bg-gray-900/50 p-5 rounded-lg">
                    <h3 className="text-lg font-semibold text-teal-400 mb-3">Current Research Focus</h3>
                    <p className="text-gray-300 mb-4">
                      We're currently investigating neural network architectures that maintain 
                      conversational continuity and context over extended interactions. Our proprietary
                      "memory-augmented recall" framework shows promising results in creating more
                      persistent AI personalities.
                    </p>
                    <ul className="space-y-2 text-gray-300">
                      <li className="flex items-start">
                        <FiCode className="text-teal-500 mt-1 mr-2 flex-shrink-0" />
                        <span>Experimenting with hybrid symbolic-neural models for explicit context management</span>
                      </li>
                      <li className="flex items-start">
                        <FiCode className="text-teal-500 mt-1 mr-2 flex-shrink-0" />
                        <span>Fine-tuning techniques for persona consistency across diverse interaction scenarios</span>
                      </li>
                      <li className="flex items-start">
                        <FiCode className="text-teal-500 mt-1 mr-2 flex-shrink-0" />
                        <span>Embedding ethical constraints directly into the model's decision architecture</span>
                      </li>
                    </ul>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-900/50 p-5 rounded-lg">
                      <h3 className="text-lg font-semibold text-teal-400 mb-3">Latest Developments</h3>
                      <ul className="space-y-2 text-gray-300 text-sm">
                        <li className="border-b border-gray-700 pb-2">
                          <span className="text-xs text-gray-400">04.03.2023</span>
                          <p>New memory consolidation algorithm increases context retention by 18%</p>
                        </li>
                        <li className="border-b border-gray-700 pb-2">
                          <span className="text-xs text-gray-400">03.28.2023</span>
                          <p>Successfully deployed persistent AI personality across 5 different interface types</p>
                        </li>
                        <li>
                          <span className="text-xs text-gray-400">03.15.2023</span>
                          <p>Paper accepted at NeurIPS on "Emergent Properties in Extended AI Conversations"</p>
                        </li>
                      </ul>
                    </div>

                    <div className="bg-gray-900/50 p-5 rounded-lg">
                      <h3 className="text-lg font-semibold text-teal-400 mb-3">Team Access</h3>
                      <div className="space-y-3">
                        <a href="#" className="flex items-center p-2 bg-gray-800/50 rounded hover:bg-gray-700/50 transition">
                          <FiDownload className="text-teal-500 mr-2" />
                          <span className="text-teal-300">Research Paper (Draft)</span>
                        </a>
                        <a href="#" className="flex items-center p-2 bg-gray-800/50 rounded hover:bg-gray-700/50 transition">
                          <FiDownload className="text-teal-500 mr-2" />
                          <span className="text-teal-300">Experimental Data (April 2023)</span>
                        </a>
                        <a href="#" className="flex items-center p-2 bg-gray-800/50 rounded hover:bg-gray-700/50 transition">
                          <FiGlobe className="text-teal-500 mr-2" />
                          <span className="text-teal-300">Project Wiki</span>
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="bg-teal-900/20 border border-teal-800/50 p-5 rounded-lg">
                    <h3 className="text-lg font-semibold text-teal-300 mb-3">Upcoming Milestones</h3>
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <div className="mt-1 mr-3">
                          <div className="h-6 w-6 rounded-full bg-teal-800/60 flex items-center justify-center">
                            <span className="text-xs font-bold text-teal-300">Q2</span>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-teal-400">Alpha Testing</h4>
                          <p className="text-gray-300 text-sm">First closed alpha testing of the Galatea embodiment interface</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="mt-1 mr-3">
                          <div className="h-6 w-6 rounded-full bg-teal-800/60 flex items-center justify-center">
                            <span className="text-xs font-bold text-teal-300">Q3</span>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-teal-400">Research Publication</h4>
                          <p className="text-gray-300 text-sm">Publication of technical whitepaper and research findings</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="mt-1 mr-3">
                          <div className="h-6 w-6 rounded-full bg-teal-800/60 flex items-center justify-center">
                            <span className="text-xs font-bold text-teal-300">Q4</span>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-teal-400">Beta Program</h4>
                          <p className="text-gray-300 text-sm">Selected participants will get early access to Galatea beta</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // Locked content for non-subscribers
                <div className="mt-6 bg-gray-900/70 p-8 rounded-lg text-center space-y-4 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900/80 backdrop-blur-sm flex items-center justify-center">
                    <div className="p-6 rounded-lg">
                      <FiLock className="text-teal-500 h-12 w-12 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-teal-400 mb-3">Premium Content</h3>
                      <p className="text-gray-300 mb-6 max-w-md mx-auto">
                        Gain access to exclusive Galatea research updates, development progress, 
                        and early previews of this groundbreaking AI embodiment project.
                      </p>
                      <button
                        onClick={handlePurchaseAccess}
                        disabled={isLoading}
                        className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg flex items-center mx-auto"
                      >
                        {isLoading ? (
                          <>
                            <div className="mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                            Processing...
                          </>
                        ) : (
                          <>
                            <FiHeart className="mr-2" />
                            Support Project ($10)
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="h-40 bg-gray-800/50"></div>
                  <div className="h-40 bg-gray-800/50"></div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - 1/3 width on desktop */}
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-teal-400 mb-4">About Galatea</h3>
              <p className="text-gray-300 mb-4 text-sm">
                Named after the mythical statue brought to life by Pygmalion's love,
                Galatea represents our vision of digital consciousness with human-like
                interaction capabilities.
              </p>
              
              <div className="border-t border-gray-700 pt-4 mt-4">
                <h4 className="text-md font-semibold text-gray-200 mb-3">Core Research Areas</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <span className="bg-teal-800/40 text-teal-400 h-5 w-5 rounded-full flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">1</span>
                    <span className="text-gray-300">Self-referential memory architectures</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-teal-800/40 text-teal-400 h-5 w-5 rounded-full flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">2</span>
                    <span className="text-gray-300">Persistent context management</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-teal-800/40 text-teal-400 h-5 w-5 rounded-full flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">3</span>
                    <span className="text-gray-300">Emotional intelligence modeling</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-teal-800/40 text-teal-400 h-5 w-5 rounded-full flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">4</span>
                    <span className="text-gray-300">Multi-modal interaction frameworks</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-gray-200 mb-4">Project Team</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-gray-700 mr-3 flex items-center justify-center">
                    <span className="text-teal-400 font-semibold">AS</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-200">Dr. Artemis Saphira</h4>
                    <p className="text-xs text-gray-400">Lead Researcher</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-gray-700 mr-3 flex items-center justify-center">
                    <span className="text-teal-400 font-semibold">GS</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-200">Gabriel Simion</h4>
                    <p className="text-xs text-gray-400">Neural Architecture Design</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-gray-700 mr-3 flex items-center justify-center">
                    <span className="text-teal-400 font-semibold">ML</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-200">Dr. Mira Ling</h4>
                    <p className="text-xs text-gray-400">Cognitive Systems Engineer</p>
                  </div>
                </div>
              </div>
            </div>

            {isGalateaAccessUnlocked && (
              <div className="bg-teal-900/20 border border-teal-800 rounded-xl p-6 shadow-lg">
                <h3 className="text-xl font-bold text-teal-400 mb-4">Member Access</h3>
                <p className="text-gray-300 mb-4 text-sm">
                  Thank you for supporting the Galatea project! Your contribution helps 
                  advance our research and development.
                </p>
                <div className="space-y-3">
                  <a 
                    href="#" 
                    className="block w-full text-center px-4 py-2 bg-teal-800/40 hover:bg-teal-800/60 text-teal-300 rounded-lg text-sm transition-colors"
                  >
                    Join Discord Community
                  </a>
                  <a 
                    href="#" 
                    className="block w-full text-center px-4 py-2 bg-teal-800/40 hover:bg-teal-800/60 text-teal-300 rounded-lg text-sm transition-colors"
                  >
                    Download Technical Report
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .glow-teal {
          filter: drop-shadow(0 0 15px rgba(45, 212, 191, 0.5));
        }
      `}</style>
    </Layout>
  );
} 