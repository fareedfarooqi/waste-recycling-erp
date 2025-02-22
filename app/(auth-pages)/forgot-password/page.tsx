import React from 'react';
import Background from '@/components/Sign-in/Background';
import ForgotPasswordCard from '@/components/ForgotPassword/ForgotPasswordCard';

export default async function ForgotPassword() {
    return (
        <Background>
            <ForgotPasswordCard />
        </Background>
    );
}
