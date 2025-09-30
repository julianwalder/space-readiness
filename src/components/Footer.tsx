import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-center md:text-left">
            <span className="text-xl font-bold text-gray-900">Space Readiness</span>
            <p className="mt-2 text-sm text-gray-600">
              Built on KTH Innovation Readiness Level + System Integration Readiness
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-6">
            <Link href="/faq" className="text-sm text-gray-600 hover:text-gray-900">
              FAQ
            </Link>
            <Link href="/media" className="text-sm text-gray-600 hover:text-gray-900">
              Media
            </Link>
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
  );
}
