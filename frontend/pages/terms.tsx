import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import Link from 'next/link';
import Image from 'next/image';

const TermsPage = () => {
  return (
    <Layout title="Terms of Service">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-10">
          <motion.div
            className="inline-block"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <Image
              src="/images/nibiru-logo.png"
              alt="Nibiru"
              width={320}
              height={320}
              className="mb-8"
            />
          </motion.div>
          <h1 className="text-4xl font-bold text-gray-100 mb-4">Terms of Service</h1>
          <p className="text-xl text-gray-400">
            These terms govern your use of Nibiru and its services
          </p>
        </div>

        <div className="prose prose-lg prose-invert max-w-none">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-gray-100 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-300 mb-4">
                By accessing or using the Nibiru platform ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use the Service.
              </p>
              <p className="text-gray-300">
                The Service is owned and operated by Nibiru Technologies. These Terms affect your legal rights and obligations, so please read them carefully.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-gray-100 mb-4">2. User Accounts</h2>
              <p className="text-gray-300 mb-4">
                To access certain features of the Service, you may be required to create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
              </p>
              <p className="text-gray-300">
                You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-gray-100 mb-4">3. Content and Conduct</h2>
              <p className="text-gray-300 mb-4">
                You are solely responsible for your conduct and any content that you submit, post, or display on the Service. You agree not to use the Service for any illegal purposes or in violation of any laws.
              </p>
              <p className="text-gray-300">
                Nibiru reserves the right, but is not obligated, to remove any content that violates these Terms or that Nibiru considers objectionable.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-gray-100 mb-4">4. Intellectual Property</h2>
              <p className="text-gray-300 mb-4">
                The Service and its original content, features, and functionality are owned by Nibiru and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
              </p>
              <p className="text-gray-300">
                By submitting content to the Service, you grant Nibiru a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, adapt, publish, translate, and distribute your content.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-gray-100 mb-4">5. Termination</h2>
              <p className="text-gray-300 mb-4">
                Nibiru may terminate or suspend your account and access to the Service immediately, without prior notice or liability, for any reason, including without limitation if you breach these Terms.
              </p>
              <p className="text-gray-300">
                Upon termination, your right to use the Service will immediately cease. All provisions of these Terms which by their nature should survive termination shall survive termination.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-gray-100 mb-4">6. Limitation of Liability</h2>
              <p className="text-gray-300">
                In no event shall Nibiru, its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-gray-100 mb-4">7. Changes to Terms</h2>
              <p className="text-gray-300">
                Nibiru reserves the right, at our sole discretion, to modify or replace these Terms at any time. We will provide notice of changes by posting the updated Terms on this page. Your continued use of the Service after any such changes constitutes your acceptance of the new Terms.
              </p>
            </section>

            <div className="mt-12 text-center">
              <p className="text-gray-400">
                Last updated: April 7, 2025
              </p>
              <div className="mt-6">
                <Link
                  href="/"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Return to Home
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default TermsPage; 