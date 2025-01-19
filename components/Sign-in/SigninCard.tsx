'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/config/supabaseClient';

export default function SigninCard() {
    const router = useRouter();

    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleEmailClick = () => {
        navigator.clipboard.writeText('info@wasteerp.com');
    };

    const handleSubmissionSuccess = async (authUserId: string) => {
        const { data, error } = await supabase
            .from('company_users')
            .select('id')
            .eq('user_id', authUserId);

        if (!data || data.length === 0) {
            router.push('/setup-company');
        } else {
            router.push('/customers');
        }
    };

    const handleSignin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            console.log({ data, error });

            if (error) {
                switch (error.code) {
                    case 'invalid_credentials':
                        setError('Invalid email or password.');
                        break;
                    case 'email_not_confirmed':
                        setError(
                            'Please confirm your email before logging in.'
                        );
                        break;
                    case 'over_request_rate_limit':
                        setError(
                            'Too many login attempts. Please try again in a few minutes.'
                        );
                        break;
                    case 'user_not_found':
                        setError('No account found with this email.');
                        break;
                    default:
                        setError(
                            'An unexpected error occurred. Please try again.'
                        );
                }
                return;
            }

            handleSubmissionSuccess(data?.user?.id);
        } catch (err) {
            setError(
                'Failed to connect to the server. Please try again later.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative z-10 w-full max-w-md bg-white shadow-lg rounded-lg p-8 md:p-12">
            <h1 className="text-center text-4xl font-bold text-gray-900 mb-6">
                Welcome Back
            </h1>

            <p className="text-center text-sm text-gray-700 mb-8">
                Interested in partnering with us or utilising our platform?{' '}
                <button
                    onClick={handleEmailClick}
                    className="text-green-600 hover:text-green-500 underline font-medium"
                >
                    info@wasteerp.com
                </button>
            </p>

            <form className="space-y-6" onSubmit={handleSignin}>
                <div>
                    <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-600"
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

                <div>
                    <label
                        htmlFor="password"
                        className="block text-sm font-medium text-gray-600"
                    >
                        Password
                    </label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="mt-2 block w-full px-4 py-3 text-gray-900 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-green-400 focus:outline-none"
                        required
                    />
                </div>

                {error && (
                    <div
                        className="mb-4 text-sm text-red-700 bg-red-100 border border-red-400 rounded px-4 py-3 flex justify-between items-center"
                        role="alert"
                        aria-live="polite"
                    >
                        <span>
                            <strong className="font-bold">Error:</strong>{' '}
                            {error}
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

                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-3 text-white font-semibold rounded-md shadow-md ${
                        loading
                            ? 'bg-green-600 cursor-not-allowed opacity-70'
                            : 'bg-green-600 hover:bg-green-700 focus:ring-4 focus:ring-green-300 focus:outline-none'
                    }`}
                >
                    {loading ? 'Signing In...' : 'Sign in'}
                </button>
            </form>

            <div className="my-6 border-t border-gray-200" />

            <p className="text-center text-sm text-gray-500">
                Get in touch to learn how we can help your business streamline
                waste management and operations.
            </p>
        </div>
    );
}
