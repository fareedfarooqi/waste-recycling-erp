'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FiCheckCircle, FiXCircle } from 'react-icons/fi';

interface RequirementItemProps {
    label: string;
    isValid: boolean;
}

const RequirementItem: React.FC<RequirementItemProps> = ({
    label,
    isValid,
}) => (
    <li className="flex items-center space-x-2">
        {isValid ? (
            <FiCheckCircle className="text-green-600" />
        ) : (
            <FiXCircle className="text-red-500" />
        )}
        <span className="text-sm text-gray-700">{label}</span>
    </li>
);

export default function ResetPasswordCard(): JSX.Element {
    const router = useRouter();
    const { token } = useParams() || {};

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const [pwLength, setPwLength] = useState(false);
    const [pwLetter, setPwLetter] = useState(false);
    const [pwNumber, setPwNumber] = useState(false);
    const [pwSymbol, setPwSymbol] = useState(false);
    const [pwMatch, setPwMatch] = useState(false);

    useEffect(() => {
        setPwLength(newPassword.length >= 8);
        setPwLetter(/[A-Za-z]/.test(newPassword));
        setPwNumber(/\d/.test(newPassword));
        setPwSymbol(/[^A-Za-z0-9]/.test(newPassword));
        setPwMatch(newPassword === confirmPassword);
    }, [newPassword, confirmPassword]);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        setMessage(null);

        if (!token) {
            setError('No reset token found in URL.');
            return;
        }

        if (!pwLength || !pwLetter || !pwNumber || !pwSymbol) {
            setError('Your password does not meet all the requirements below.');
            return;
        }
        if (!pwMatch) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/confirm-password-reset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword }),
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || 'Failed to reset password.');
            }

            setMessage('Your password has been updated successfully!');
            router.push('/sign-in');
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message || 'An unexpected error occurred.');
            } else {
                setError('An unexpected error occurred.');
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="relative z-10 w-full max-w-[30rem] bg-white shadow-lg rounded-lg p-8 md:p-12">
            <h1 className="text-center text-4xl font-bold text-gray-900 mb-6">
                Reset Password
            </h1>

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

            <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                    <label
                        htmlFor="newPassword"
                        className="block text-sm font-medium text-gray-600 -mt-1"
                    >
                        New Password
                    </label>
                    <input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter your new password"
                        className="mt-2 block w-full px-4 py-3 text-gray-900 bg-gray-50 border border-gray-300 rounded-md shadow-sm 
                       focus:ring-2 focus:ring-green-400 focus:outline-none"
                        required
                    />

                    <div className="mt-2 rounded-md border border-gray-200 bg-gray-50 p-3">
                        <ul className="space-y-1">
                            <RequirementItem
                                label="8+ characters"
                                isValid={pwLength}
                            />
                            <RequirementItem
                                label="At least one letter"
                                isValid={pwLetter}
                            />
                            <RequirementItem
                                label="At least one number"
                                isValid={pwNumber}
                            />
                            <RequirementItem
                                label="At least one symbol"
                                isValid={pwSymbol}
                            />
                        </ul>
                    </div>
                </div>

                <div>
                    <label
                        htmlFor="confirmPassword"
                        className="block text-sm font-medium text-gray-600 -mt-1"
                    >
                        Confirm Password
                    </label>
                    <input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter your new password"
                        className="mt-2 block w-full px-4 py-3 text-gray-900 bg-gray-50 border border-gray-300 rounded-md shadow-sm 
                       focus:ring-2 focus:ring-green-400 focus:outline-none"
                        required
                    />
                    {!pwMatch && confirmPassword.length > 0 && (
                        <p className="mt-1 text-sm text-red-600">
                            Passwords do not match.
                        </p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-3 text-white font-semibold rounded-md shadow-md ${
                        loading
                            ? 'bg-green-600 cursor-not-allowed opacity-70'
                            : 'bg-green-600 hover:bg-green-700 focus:ring-4 focus:ring-green-300 focus:outline-none'
                    }`}
                >
                    {loading ? 'Updating...' : 'Update Password'}
                </button>
            </form>

            <div className="mt-8 text-center">
                <p className="text-sm text-gray-700">
                    Or{' '}
                    <button
                        onClick={() => router.push('/sign-in')}
                        className="text-green-600 hover:text-green-500 underline font-medium"
                    >
                        Sign in
                    </button>
                </p>
            </div>
        </div>
    );
}
