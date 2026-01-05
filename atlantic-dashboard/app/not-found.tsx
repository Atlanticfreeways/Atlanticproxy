import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 text-center">
            <h1 className="text-9xl font-bold text-white tracking-tighter mb-4 opacity-10">404</h1>
            <div className="absolute">
                <h2 className="text-2xl font-bold text-white mb-2">Page Not Found</h2>
                <p className="text-zinc-500 mb-8 max-w-sm mx-auto">
                    The page you are looking for does not exist or has been moved.
                </p>
                <Link
                    href="/dashboard"
                    className="inline-flex items-center px-6 py-3 bg-white text-black font-semibold rounded-lg hover:bg-zinc-200 transition-colors"
                >
                    Return to Dashboard
                </Link>
            </div>
        </div>
    );
}
