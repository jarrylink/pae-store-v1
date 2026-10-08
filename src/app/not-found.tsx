import { Suspense } from 'react';

function NotFoundContent() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold text-[#1a2a8a]">404</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mt-4">Page Not Found</h2>
        <p className="text-gray-600 mt-2">The page you are looking for does not exist.</p>
        <a
          href="/"
          className="inline-block mt-6 px-6 py-3 bg-[#1a2a8a] text-white rounded-lg hover:bg-[#152070] transition-colors"
        >
          Go Home
        </a>
      </div>
    </div>
  );
}

export default function NotFound() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <NotFoundContent />
    </Suspense>
  );
}
