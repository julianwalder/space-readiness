import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface BackHeaderProps {
  backTo?: string;
  backLabel?: string;
}

export default function BackHeader({ backTo, backLabel }: BackHeaderProps) {
  const router = useRouter();
  
  const handleBack = () => {
    if (backTo) {
      router.push(backTo);
    } else {
      router.back();
    }
  };

  return (
    <div className="sticky top-0 z-50 bg-white/80 border-b border-gray-200" style={{WebkitBackdropFilter: 'blur(8px)', backdropFilter: 'blur(8px)'}}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/dashboard" className="text-xl font-bold text-gray-900">
              Space Readiness
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBack}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              ← {backLabel || 'Back'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
