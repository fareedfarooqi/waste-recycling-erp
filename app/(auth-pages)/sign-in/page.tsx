import React from 'react';
import Background from '@/components/Sign-in/Background';
import SigninCard from '@/components/Sign-in/SigninCard';
import { signInAction } from '@/app/actions';
import { FormMessage, Message } from '@/components/form-message';
import { SubmitButton } from '@/components/submit-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

/**
 * We define a normal (server) page component
 * — no "use client" at the top and no async function returning JSX.
 */
interface PageProps {
    searchParams?: {
        success?: string;
        error?: string;
        message?: string;
    };
}

export default function Page({ searchParams }: PageProps) {
    const { success, error, message } = searchParams || {};

    return (
        <Background>
            <SigninCard></SigninCard>
        </Background>
    );
}
