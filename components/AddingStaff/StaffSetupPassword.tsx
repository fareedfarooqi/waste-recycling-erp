'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { IoMdClose } from 'react-icons/io';

export default function StaffSetupPassword(): JSX.Element {
    const supabase = createClientComponentClient();
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams?.get('token');

    const [isLoading, setIsLoading] = useState(false);
    const [tokenError, setTokenError] = useState<string | null>(null);
    const [formError, setFormError] = useState<string | null>(null);
    const [email, setEmail] = useState<string>('');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [pwLength, setPwLength] = useState(false);
    const [pwLetter, setPwLetter] = useState(false);
    const [pwNumber, setPwNumber] = useState(false);
    const [pwSymbol, setPwSymbol] = useState(false);
    const [pwMatch, setPwMatch] = useState(false);

    useEffect(() => {
        if (!token) {
            setTokenError('No token found. Please check your invite link.');
            return;
        }

        (async () => {
            setIsLoading(true);
            try {
                const { data, error } = await supabase
                    .from('invitation_tokens')
                    .select('email, role, company_id, expires_at')
                    .eq('token', token)
                    .single();

                if (error || !data) {
                    setTokenError('Invalid or expired token.');
                    return;
                }

                const now = new Date();
                const expiry = new Date(data.expires_at);
                if (expiry.getTime() < now.getTime()) {
                    setTokenError('Your invitation link has expired.');
                } else {
                    setEmail(data.email);
                    localStorage.setItem('staff_role', data.role);
                    localStorage.setItem('invitation_token', token);
                    localStorage.setItem('company_id', data.company_id);
                }
            } catch (err) {
                setTokenError('Something went wrong. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        })();
    }, [token]);

    const handlePasswordChange = (value: string) => {
        setPassword(value);

        setPwLength(value.length >= 8);
        setPwLetter(/[A-Za-z]/.test(value));
        setPwNumber(/\d/.test(value));
        setPwSymbol(/[^A-Za-z0-9]/.test(value));
        setPwMatch(value === confirmPassword);
    };

    const handleConfirmChange = (value: string) => {
        setConfirmPassword(value);
        setPwMatch(password === value);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setFormError(null);

        if (!pwLength || !pwLetter || !pwNumber || !pwSymbol) {
            setFormError(
                'Your password does not meet all the requirements above.'
            );
            return;
        }
        if (!pwMatch) {
            setFormError('Passwords do not match.');
            return;
        }

        setIsLoading(true);
        try {
            const { error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: 'http://localhost:3000/sign-in',
                },
            });

            if (signUpError) {
                setFormError(signUpError.message);
                setIsLoading(false);
                return;
            }

            router.push('/staff/complete-user-profile');
        } catch (err) {
            setFormError('An unexpected error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const RequirementItem = ({
        label,
        isValid,
    }: {
        label: string;
        isValid: boolean;
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

    return (
        <div className="mx-auto w-full max-w-md rounded-xl border border-gray-100 bg-white p-6 shadow-2xl md:p-8">
            <h2 className="mb-6 text-center text-3xl font-bold text-green-700">
                Set Your Password
            </h2>

            {isLoading && (
                <p className="mb-4 text-center text-sm text-gray-500">
                    Validating your invitation link...
                </p>
            )}

            {tokenError && (
                <div className="mb-4 rounded-md bg-red-100 p-3 text-red-700">
                    {tokenError}
                </div>
            )}

            {!tokenError && !isLoading && email && (
                <form onSubmit={handleSubmit} className="mt-4 space-y-5">
                    <div>
                        <label
                            htmlFor="email"
                            className="mb-1 block text-sm font-semibold text-gray-700"
                        >
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            disabled
                            className="w-full cursor-not-allowed rounded-md border border-gray-300 bg-gray-100 p-3 text-gray-700 shadow-sm focus:outline-none"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            This is the email your admin used to invite you.
                        </p>
                    </div>

                    <div>
                        <label
                            htmlFor="password"
                            className="mb-1 block text-sm font-semibold text-gray-700"
                        >
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) =>
                                handlePasswordChange(e.target.value)
                            }
                            required
                            className="w-full rounded-md border border-gray-300 p-3 text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
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
                            className="mb-1 block text-sm font-semibold text-gray-700"
                        >
                            Confirm Password
                        </label>
                        <input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) =>
                                handleConfirmChange(e.target.value)
                            }
                            required
                            className={`w-full rounded-md border p-3 text-gray-900 shadow-sm focus:outline-none focus:ring-2 ${
                                pwMatch || confirmPassword.length === 0
                                    ? 'border-gray-300 focus:ring-green-500'
                                    : 'border-red-300 focus:ring-red-500'
                            }`}
                        />
                        {!pwMatch && confirmPassword.length > 0 && (
                            <p className="mt-1 text-sm text-red-600">
                                Passwords do not match.
                            </p>
                        )}
                    </div>

                    {formError && (
                        <div className="relative mt-2 flex items-center rounded-md bg-red-100 p-3 text-red-700">
                            <button
                                type="button"
                                onClick={() => setFormError(null)}
                                className="absolute right-3 flex items-center text-red-700 hover:text-red-900 focus:outline-none"
                                style={{
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                }}
                            >
                                <IoMdClose className="h-5 w-5" />
                            </button>
                            <span className="pr-10">{formError}</span>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="mt-4 w-full rounded-md bg-green-600 px-4 py-3 font-semibold text-white shadow hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-300 disabled:opacity-50"
                    >
                        {isLoading ? 'Setting Password...' : 'Set Password'}
                    </button>
                </form>
            )}
        </div>
    );
}
