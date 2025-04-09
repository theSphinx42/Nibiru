import StaticPageLayout from '../components/StaticPageLayout';

const PrivacyPage = () => {
  return (
    <StaticPageLayout
      title="Privacy & Data"
      description="Learn about how we protect your privacy and handle your data"
      glyph="aegis"
    >
      <p className="text-lg mb-6">
        At Nibiru, we take your privacy seriously. Our platform is built on the principles of
        quantum-grade security and transparent data handling.
      </p>

      <h2 className="text-2xl font-semibold mb-4 text-blue-400">Data Collection</h2>
      <p className="mb-6">
        We collect only the essential information needed to provide our services:
      </p>
      <ul className="list-disc pl-6 mb-6 space-y-2">
        <li>Account information (email, username)</li>
        <li>Transaction data</li>
        <li>Platform usage statistics</li>
        <li>Spirit Glyph generation data</li>
      </ul>

      <h2 className="text-2xl font-semibold mb-4 text-blue-400">Data Protection</h2>
      <p className="mb-6">
        Your data is protected by multiple layers of security:
      </p>
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700/50">
          <h3 className="text-xl font-semibold mb-3 text-purple-400">Quantum Encryption</h3>
          <p>
            All sensitive data is encrypted using quantum-resistant algorithms,
            ensuring protection against both current and future threats.
          </p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700/50">
          <h3 className="text-xl font-semibold mb-3 text-purple-400">Secure Storage</h3>
          <p>
            Your data is stored in secure, distributed systems with
            multiple redundancy layers and regular security audits.
          </p>
        </div>
      </div>

      <h2 className="text-2xl font-semibold mb-4 text-blue-400">Your Rights</h2>
      <p className="mb-6">
        You have full control over your data. You can:
      </p>
      <ul className="list-disc pl-6 mb-6 space-y-2">
        <li>Access your personal data</li>
        <li>Request data modification</li>
        <li>Export your data</li>
        <li>Delete your account and associated data</li>
      </ul>

      <div className="bg-blue-900/20 border border-blue-800/50 rounded-lg p-6 mt-8">
        <h2 className="text-xl font-semibold mb-3 text-blue-400">Questions About Privacy?</h2>
        <p className="mb-4">
          If you have any questions about our privacy practices or how we handle your data,
          please don't hesitate to contact our privacy team.
        </p>
        <a
          href="mailto:privacy@nibiru.com"
          className="inline-block bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 px-4 py-2 rounded-lg transition-colors"
        >
          privacy@nibiru.com
        </a>
      </div>
    </StaticPageLayout>
  );
};

export default PrivacyPage; 