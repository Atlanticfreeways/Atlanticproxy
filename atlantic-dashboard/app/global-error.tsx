'use client';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html>
            <body className="bg-black text-white flex items-center justify-center min-h-screen">
                <div className="text-center p-8 max-w-md">
                    <h2 className="text-3xl font-bold mb-4">Critical Error</h2>
                    <p className="text-zinc-500 mb-8">
                        The application encountered a critical error and unable to load.
                    </p>
                    <button
                        onClick={() => reset()}
                        className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors w-full"
                    >
                        Reload Application
                    </button>
                </div>
            </body>
        </html>
    );
}
