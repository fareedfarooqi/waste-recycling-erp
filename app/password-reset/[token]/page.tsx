import React from 'react';
import Background from '@/components/Sign-in/Background';
import ResetPasswordCard from '@/components/ForgotPassword/ResetPasswordCard';

export default async function ResetPassword() {
    return (
        <Background>
            <ResetPasswordCard />
        </Background>
    );
}
