import { NextResponse } from 'next/server';
import { generateSecureToken } from '@/utils/tokenHelper';
import { sendPasswordResetEmail } from '@/lib/emailSender';
import { createClient } from '@supabase/supabase-js';

const RESET_TOKEN_EXP_MS = 60 * 60 * 1000;

export async function POST(req: Request) {
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    try {
        const { email } = await req.json();
        if (!email) {
            return NextResponse.json(
                { error: 'Email is required.' },
                { status: 400 }
            );
        }

        const normalizedEmail = email.trim().toLowerCase();

        const { data: user, error: userError } = await supabaseAdmin
            .from('auth_users')
            .select('id, email')
            .eq('email', normalizedEmail)
            .maybeSingle();

        if (userError) {
            console.error('Error querying auth.users:', userError);
            return NextResponse.json(
                { error: 'Cannot look up user right now. Please try again.' },
                { status: 500 }
            );
        }

        if (!user) {
            return NextResponse.json(
                { error: 'User with this email does not exist.' },
                { status: 404 }
            );
        }

        const token = generateSecureToken();
        const expiresAt = new Date(Date.now() + RESET_TOKEN_EXP_MS);

        const { error: tokenError } = await supabaseAdmin
            .from('password_reset_tokens')
            .insert({
                email: user.email,
                token,
                used: false,
                expires_at: expiresAt.toISOString(),
            });

        if (tokenError) {
            console.error('Error saving reset token:', tokenError.message);
            return NextResponse.json(
                { error: 'Error saving reset token. Please try again.' },
                { status: 500 }
            );
        }

        const resetLink = `${process.env.NEXT_PUBLIC_APP_URL_RESET_PASSWORD}/password-reset/${token}`;
        console.log(`URL is: ${resetLink}`);
        await sendPasswordResetEmail(user.email, resetLink);

        return NextResponse.json({ message: 'Password reset email sent.' });
    } catch (err) {
        console.error('Error in password reset API:', err);
        return NextResponse.json(
            { error: 'An unexpected error occurred.' },
            { status: 500 }
        );
    }
}
