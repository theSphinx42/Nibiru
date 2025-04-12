import StaticPageLayout from '../components/StaticPageLayout';

const AboutPage = () => {
  return (
    <StaticPageLayout
      title="About Nibiru"
      description="Learn about the Nibiru platform and our mission"
      glyph="quantum-seal"
    >
      <p className="text-lg mb-6">
        Welcome to Nibiru, where quantum-secured digital artifacts meet the future of online marketplaces.
        Our platform represents a revolutionary approach to digital asset creation, preservation, and trading.
      </p>

      <h2 className="text-2xl font-semibold mb-4 text-blue-400">Our Vision</h2>
      <p className="mb-6">
        We envision a future where digital creations are not just traded, but preserved with quantum-grade
        security for generations to come. Each artifact on our platform is authenticated and protected
        using cutting-edge quantum cryptography.
      </p>

      <h2 className="text-2xl font-semibold mb-4 text-blue-400">The Nibiru Difference</h2>
      <p className="mb-6">
        What sets us apart is our unique blend of:
      </p>
      <ul className="list-disc pl-6 mb-6 space-y-2">
        <li>Quantum-secured authentication</li>
        <li>Spirit Glyph technology for unique digital signatures</li>
        <li>A community-driven marketplace</li>
        <li>Long-term digital preservation</li>
      </ul>

      <h2 className="text-2xl font-semibold mb-4 text-blue-400">Join Our Journey</h2>
      <p>
        Whether you're a creator, collector, or enthusiast, Nibiru offers you a space to explore,
        create, and preserve digital artifacts in ways never before possible. Join us as we shape
        the future of digital preservation and commerce.
      </p>
    </StaticPageLayout>
  );
};

export default AboutPage; 