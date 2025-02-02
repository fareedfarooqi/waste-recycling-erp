import React from 'react';
import Background from '@/components/Sign-in/Background';
import SigninCard from '@/components/Sign-in/SigninCard';
/**
 * We define a normal (server) page component
 * — no "use client" at the top and no async function returning JSX.
 */

export default function Page() {
    return (
        <Background>
            <SigninCard></SigninCard>
        </Background>
    );
}
