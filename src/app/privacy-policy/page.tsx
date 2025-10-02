import Footer from '@/components/Footer';
import SimpleHeader from '@/components/SimpleHeader';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <SimpleHeader />

      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="prose prose-lg max-w-none">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
          
          <p className="text-sm text-gray-600 mb-8">
            <strong>Last updated:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
            <p className="text-gray-700 mb-4">
              Swiss Aerospace Ventures GmbH (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) operates the Space Readiness platform 
              (the &ldquo;Service&rdquo;). This Privacy Policy informs you about our policies regarding the collection, 
              use, and disclosure of personal information when you use our Service.
            </p>
            <p className="text-gray-700">
              We are committed to protecting your privacy and ensuring the security of your personal information 
              in accordance with Swiss Federal Data Protection Act (FADP) and the General Data Protection 
              Regulation (GDPR) where applicable.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>
            
            <h3 className="text-xl font-medium text-gray-900 mb-3">2.1 Personal Information</h3>
            <p className="text-gray-700 mb-4">
              When you use our Service, we may collect the following personal information:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Name and email address (when you create an account)</li>
              <li>Company information and venture details</li>
              <li>Documents and files you upload to the platform</li>
              <li>Communication data when you contact us</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-900 mb-3">2.2 Usage Information</h3>
            <p className="text-gray-700 mb-4">
              We automatically collect certain information about your use of the Service:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>IP address and device information</li>
              <li>Browser type and version</li>
              <li>Pages visited and time spent on our Service</li>
              <li>Referral source and navigation patterns</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
            <p className="text-gray-700 mb-4">
              We use the collected information for the following purposes:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>To provide and maintain our Service</li>
              <li>To process and analyze your venture documents using AI technology</li>
              <li>To generate readiness assessments and recommendations</li>
              <li>To communicate with you about the Service</li>
              <li>To improve our Service and develop new features</li>
              <li>To ensure the security and integrity of our platform</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Legal Basis for Processing</h2>
            <p className="text-gray-700 mb-4">
              We process your personal information based on the following legal grounds:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li><strong>Contract Performance:</strong> To provide the services you have requested</li>
              <li><strong>Legitimate Interests:</strong> To improve our Service and ensure security</li>
              <li><strong>Consent:</strong> When you explicitly consent to specific processing activities</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Data Sharing and Disclosure</h2>
            <p className="text-gray-700 mb-4">
              We do not sell, trade, or otherwise transfer your personal information to third parties, 
              except in the following circumstances:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>With your explicit consent</li>
              <li>To comply with legal obligations or court orders</li>
              <li>To protect our rights, property, or safety</li>
              <li>With trusted service providers who assist in operating our Service (under strict confidentiality agreements)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Data Security</h2>
            <p className="text-gray-700 mb-4">
              We implement appropriate technical and organizational security measures to protect your 
              personal information against unauthorized access, alteration, disclosure, or destruction. 
              These measures include:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Encryption of data in transit and at rest</li>
              <li>Regular security assessments and updates</li>
              <li>Access controls and authentication mechanisms</li>
              <li>Employee training on data protection practices</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Data Retention</h2>
            <p className="text-gray-700">
              We retain your personal information only for as long as necessary to fulfill the purposes 
              outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. 
              When you delete your account, we will delete your personal information within 30 days, 
              except where we are required to retain it for legal or regulatory purposes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Your Rights</h2>
            <p className="text-gray-700 mb-4">
              Under applicable data protection laws, you have the following rights regarding your personal information:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li><strong>Access:</strong> Request access to your personal information</li>
              <li><strong>Rectification:</strong> Request correction of inaccurate information</li>
              <li><strong>Erasure:</strong> Request deletion of your personal information</li>
              <li><strong>Portability:</strong> Request transfer of your data to another service</li>
              <li><strong>Objection:</strong> Object to processing based on legitimate interests</li>
              <li><strong>Restriction:</strong> Request restriction of processing in certain circumstances</li>
            </ul>
            <p className="text-gray-700">
              To exercise these rights, please contact us using the information provided in the &ldquo;Contact Us&rdquo; section below.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Cookies and Tracking Technologies</h2>
            <p className="text-gray-700 mb-4">
              We use cookies and similar tracking technologies to enhance your experience on our Service. 
              You can control cookie settings through your browser preferences.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. International Data Transfers</h2>
            <p className="text-gray-700">
              Your information may be transferred to and processed in countries other than Switzerland. 
              We ensure that such transfers comply with applicable data protection laws and implement 
              appropriate safeguards to protect your information.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Changes to This Privacy Policy</h2>
            <p className="text-gray-700">
              We may update this Privacy Policy from time to time. We will notify you of any changes 
              by posting the new Privacy Policy on this page and updating the &ldquo;Last updated&rdquo; date. 
              We encourage you to review this Privacy Policy periodically for any changes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Contact Us</h2>
            <p className="text-gray-700 mb-4">
              If you have any questions about this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-gray-700 mb-2">
                <strong>Swiss Aerospace Ventures GmbH</strong>
              </p>
              <p className="text-gray-700 mb-2">
                Switzerland
              </p>
              <p className="text-gray-700">
                Email: hello@swissaerospace.ventures
              </p>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
