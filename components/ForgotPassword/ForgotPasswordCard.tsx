'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ForgotPasswordCard() {
    const router = useRouter();
    const [email, setEmail] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleForgotPassword = async (
        e: React.FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            const res = await fetch('/api/request-password-reset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            if (!res.ok) {
                const data = await res.json();
                setError(data.error || 'An error occurred. Please try again.');
                return;
            }

            setMessage(
                'A password reset link has been sent to your email address.'
            );
        } catch {
            setError(
                'Failed to connect to the server. Please try again later.'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleEmailClick = () => {
        navigator.clipboard.writeText('info@wasteerp.com');
    };

    return (
        <div className="relative z-10 w-full max-w-[30rem] bg-white shadow-lg rounded-lg p-8 md:p-12">
            <h1 className="text-center text-4xl font-bold text-gray-900 mb-6">
                Forgot Password
            </h1>

            <p className="text-sm text-gray-700 -mt-1 mb-8 text-center">
                Need help or want to get in touch?{' '}
                <button
                    onClick={handleEmailClick}
                    className="text-green-600 hover:text-green-500 underline font-medium"
                >
                    info@wasteerp.com
                </button>
            </p>

            {message && (
                <div
                    className="mb-4 text-sm text-green-700 bg-green-100 border border-green-400 rounded px-4 py-3 flex justify-between items-center"
                    role="alert"
                    aria-live="polite"
                >
                    <span>{message}</span>
                    <button
                        type="button"
                        onClick={() => setMessage(null)}
                        className="text-green-500 hover:text-green-700 focus:outline-none"
                        aria-label="Dismiss success message"
                    >
                        &times;
                    </button>
                </div>
            )}

            {error && (
                <div
                    className="mb-4 text-sm text-red-700 bg-red-100 border border-red-400 rounded px-4 py-3 flex justify-between items-center"
                    role="alert"
                    aria-live="polite"
                >
                    <span>
                        <strong className="font-bold">Error:</strong> {error}
                    </span>
                    <button
                        type="button"
                        onClick={() => setError(null)}
                        className="text-red-500 hover:text-red-700 focus:outline-none"
                        aria-label="Dismiss error"
                    >
                        &times;
                    </button>
                </div>
            )}

            <form className="space-y-6" onSubmit={handleForgotPassword}>
                <div>
                    <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-600 -mt-1"
                    >
                        Email Address
                    </label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="mt-2 block w-full px-4 py-3 text-gray-900 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-green-400 focus:outline-none"
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading || !email}
                    className={`w-full py-3 text-white font-semibold rounded-md shadow-md ${
                        loading
                            ? 'bg-green-600 cursor-not-allowed opacity-70'
                            : 'bg-green-600 hover:bg-green-700 focus:ring-4 focus:ring-green-300 focus:outline-none'
                    }`}
                >
                    {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
            </form>

            <div className="mt-8 text-center">
                <p className="text-sm text-gray-700">
                    Remembered your password?{' '}
                    <button
                        onClick={() => router.push('/sign-in')}
                        className="text-green-600 hover:text-green-500 underline font-medium"
                    >
                        Sign in here
                    </button>
                </p>
            </div>
        </div>
    );
}
