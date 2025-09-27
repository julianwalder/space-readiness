import Link from 'next/link';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Link href="/" className="flex-shrink-0">
                <span className="text-xl font-bold text-gray-900">Space Readiness</span>
              </Link>
            </div>
            <div className="flex items-center">
              <Link 
                href="/signup" 
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="prose prose-lg max-w-none">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>
          
          <p className="text-sm text-gray-600 mb-8">
            <strong>Last updated:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 mb-4">
              These Terms of Service (&ldquo;Terms&rdquo;) constitute a legally binding agreement between you 
              (&ldquo;User&rdquo; or &ldquo;you&rdquo;) and Swiss Aerospace Ventures GmbH (&ldquo;Company,&rdquo; &ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) 
              regarding your use of the Space Readiness platform (the &ldquo;Service&rdquo;).
            </p>
            <p className="text-gray-700">
              By accessing or using our Service, you agree to be bound by these Terms. If you do not 
              agree to these Terms, you may not access or use the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
            <p className="text-gray-700 mb-4">
              Space Readiness is a platform that provides multidimensional de-risking analysis for 
              space ventures through AI-powered assessment of readiness dimensions. The Service includes:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>AI-powered analysis of venture documents and evidence</li>
              <li>Scoring of 8 readiness dimensions on a 1-9 scale</li>
              <li>Generation of actionable recommendations and roadmaps</li>
              <li>What-if simulations and milestone planning</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Accounts and Registration</h2>
            <p className="text-gray-700 mb-4">
              To access certain features of the Service, you must create an account. You agree to:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Provide accurate, current, and complete information during registration</li>
              <li>Maintain and update your account information</li>
              <li>Keep your login credentials secure and confidential</li>
              <li>Notify us immediately of any unauthorized use of your account</li>
              <li>Accept responsibility for all activities under your account</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Acceptable Use</h2>
            
            <h3 className="text-xl font-medium text-gray-900 mb-3">4.1 Permitted Use</h3>
            <p className="text-gray-700 mb-4">
              You may use the Service only for lawful purposes and in accordance with these Terms. 
              You agree to use the Service to:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Analyze legitimate space venture projects</li>
              <li>Generate readiness assessments for your own ventures</li>
              <li>Access and review your analysis results and recommendations</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-900 mb-3">4.2 Prohibited Use</h3>
            <p className="text-gray-700 mb-4">
              You agree not to use the Service:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
              <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
              <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
              <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
              <li>To submit false or misleading information</li>
              <li>To upload or transmit viruses or any other type of malicious code</li>
              <li>To spam, phish, pharm, pretext, spider, crawl, or scrape</li>
              <li>For any obscene or immoral purpose</li>
              <li>To interfere with or circumvent the security features of the Service</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Intellectual Property Rights</h2>
            
            <h3 className="text-xl font-medium text-gray-900 mb-3">5.1 Our Intellectual Property</h3>
            <p className="text-gray-700 mb-4">
              The Service and its original content, features, and functionality are and will remain 
              the exclusive property of Swiss Aerospace Ventures GmbH and its licensors. The Service 
              is protected by copyright, trademark, and other laws.
            </p>

            <h3 className="text-xl font-medium text-gray-900 mb-3">5.2 Your Content</h3>
            <p className="text-gray-700 mb-4">
              You retain ownership of all content you upload to the Service (&ldquo;User Content&rdquo;). By 
              uploading User Content, you grant us a non-exclusive, worldwide, royalty-free license 
              to use, modify, and process your User Content solely for the purpose of providing the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Privacy and Data Protection</h2>
            <p className="text-gray-700">
              Your privacy is important to us. Please review our Privacy Policy, which also governs 
              your use of the Service, to understand our practices regarding the collection, use, 
              and disclosure of your personal information.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Service Availability and Modifications</h2>
            <p className="text-gray-700 mb-4">
              We reserve the right to:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Modify or discontinue the Service (or any part thereof) temporarily or permanently</li>
              <li>Refuse any and all current and future use of the Service</li>
              <li>Update the Service from time to time</li>
            </ul>
            <p className="text-gray-700">
              We shall not be liable to you or any third party for any modification, price change, 
              suspension, or discontinuance of the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Disclaimers and Limitations of Liability</h2>
            
            <h3 className="text-xl font-medium text-gray-900 mb-3">8.1 Service Disclaimer</h3>
            <p className="text-gray-700 mb-4">
              The Service is provided on an &ldquo;AS IS&rdquo; and &ldquo;AS AVAILABLE&rdquo; basis. We make no warranties, 
              expressed or implied, and hereby disclaim all other warranties including, without limitation, 
              implied warranties or conditions of merchantability, fitness for a particular purpose, 
              or non-infringement of intellectual property or other violation of rights.
            </p>

            <h3 className="text-xl font-medium text-gray-900 mb-3">8.2 Analysis Results</h3>
            <p className="text-gray-700 mb-4">
              The readiness assessments, scores, and recommendations generated by the Service are 
              for informational purposes only and should not be considered as professional advice, 
              investment advice, or guarantees of success. You should consult with qualified 
              professionals before making any business decisions based on the Service results.
            </p>

            <h3 className="text-xl font-medium text-gray-900 mb-3">8.3 Limitation of Liability</h3>
            <p className="text-gray-700">
              In no event shall Swiss Aerospace Ventures GmbH, its directors, employees, partners, 
              agents, suppliers, or affiliates be liable for any indirect, incidental, special, 
              consequential, or punitive damages, including without limitation, loss of profits, 
              data, use, goodwill, or other intangible losses, resulting from your use of the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Indemnification</h2>
            <p className="text-gray-700">
              You agree to defend, indemnify, and hold harmless Swiss Aerospace Ventures GmbH and 
              its licensee and licensors, and their employees, contractors, agents, officers and 
              directors, from and against any and all claims, damages, obligations, losses, liabilities, 
              costs or debt, and expenses (including but not limited to attorney&apos;s fees).
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Termination</h2>
            <p className="text-gray-700 mb-4">
              We may terminate or suspend your account and bar access to the Service immediately, 
              without prior notice or liability, under our sole discretion, for any reason whatsoever 
              and without limitation, including but not limited to a breach of the Terms.
            </p>
            <p className="text-gray-700">
              If you wish to terminate your account, you may simply discontinue using the Service 
              and delete your account through the account settings.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Governing Law and Jurisdiction</h2>
            <p className="text-gray-700">
              These Terms shall be interpreted and governed by the laws of Switzerland, without 
              regard to its conflict of law provisions. Our failure to enforce any right or 
              provision of these Terms will not be considered a waiver of those rights. Any 
              disputes arising from these Terms shall be subject to the exclusive jurisdiction 
              of the courts of Switzerland.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Changes to Terms</h2>
            <p className="text-gray-700">
              We reserve the right, at our sole discretion, to modify or replace these Terms at 
              any time. If a revision is material, we will provide at least 30 days notice prior 
              to any new terms taking effect. What constitutes a material change will be determined 
              at our sole discretion.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Severability</h2>
            <p className="text-gray-700">
              If any provision of these Terms is held to be unenforceable or invalid, such provision 
              will be changed and interpreted to accomplish the objectives of such provision to the 
              greatest extent possible under applicable law and the remaining provisions will continue 
              in full force and effect.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. Contact Information</h2>
            <p className="text-gray-700 mb-4">
              If you have any questions about these Terms of Service, please contact us:
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
      <footer className="bg-gray-50 border-t">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-center md:text-left">
              <span className="text-xl font-bold text-gray-900">Space Readiness</span>
              <p className="mt-2 text-sm text-gray-600">
                Built on KTH Innovation Readiness Level + System Integration Readiness
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-6">
              <Link href="/privacy-policy" className="text-sm text-gray-600 hover:text-gray-900">
                Privacy Policy
              </Link>
              <Link href="/terms-of-service" className="text-sm text-gray-600 hover:text-gray-900">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
