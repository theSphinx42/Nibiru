import StaticPageLayout from '../components/StaticPageLayout';

const ContactPage = () => {
  return (
    <StaticPageLayout
      title="Contact Us"
      description="Get in touch with the Nibiru team"
      glyph="sigil-of-creation"
    >
      <p className="text-lg mb-6">
        Have questions about Nibiru? We're here to help! Choose the best way to reach us below.
      </p>

      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700/50">
          <h2 className="text-xl font-semibold mb-3 text-blue-400">General Inquiries</h2>
          <p className="mb-4">
            For general questions about Nibiru, our platform, or partnership opportunities.
          </p>
          <a
            href="mailto:contact@nibiru.com"
            className="inline-block bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 px-4 py-2 rounded-lg transition-colors"
          >
            contact@nibiru.com
          </a>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700/50">
          <h2 className="text-xl font-semibold mb-3 text-purple-400">Technical Support</h2>
          <p className="mb-4">
            Need help with your account, transactions, or technical issues?
          </p>
          <a
            href="mailto:support@nibiru.com"
            className="inline-block bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 px-4 py-2 rounded-lg transition-colors"
          >
            support@nibiru.com
          </a>
        </div>
      </div>

      <h2 className="text-2xl font-semibold mb-4 text-blue-400">Office Location</h2>
      <p className="mb-6">
        While we operate primarily in the digital realm, our physical presence is anchored in:
      </p>
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700/50">
        <p className="mb-2">Nibiru Quantum Labs</p>
        <p className="mb-2">123 Digital Avenue</p>
        <p className="mb-2">Cyberspace District</p>
        <p>Quantum Valley, QV 12345</p>
      </div>
    </StaticPageLayout>
  );
};

export default ContactPage; 