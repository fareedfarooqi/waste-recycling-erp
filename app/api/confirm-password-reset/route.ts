import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    try {
        const { token, newPassword } = await req.json();

        if (!token || !newPassword) {
            return NextResponse.json(
                { error: 'Missing token or newPassword.' },
                { status: 400 }
            );
        }

        const { data: row, error } = await supabaseAdmin
            .from('password_reset_tokens')
            .select('id, email, used, expires_at')
            .eq('token', token)
            .maybeSingle();

        if (error) {
            console.error('Error finding token row:', error);
            return NextResponse.json(
                { error: 'Cannot find reset token. Try again.' },
                { status: 500 }
            );
        }
        if (!row) {
            return NextResponse.json(
                { error: 'Invalid reset token.' },
                { status: 400 }
            );
        }
        if (row.used) {
            return NextResponse.json(
                { error: 'Token already used.' },
                { status: 400 }
            );
        }
        const now = new Date();
        if (new Date(row.expires_at).getTime() < now.getTime()) {
            return NextResponse.json(
                { error: 'Token expired.' },
                { status: 400 }
            );
        }

        const { data: userRecord, error: userError } = await supabaseAdmin
            .from('auth_users')
            .select('id')
            .eq('email', row.email)
            .maybeSingle();

        if (userError || !userRecord) {
            console.error('Cannot find user by email:', userError);
            return NextResponse.json(
                { error: 'No matching user record found for this email.' },
                { status: 400 }
            );
        }

        const { error: updateError } =
            await supabaseAdmin.auth.admin.updateUserById(userRecord.id, {
                password: newPassword,
            });

        if (updateError) {
            console.error('Error updating user password:', updateError);
            return NextResponse.json(
                { error: 'Failed to update user password. Try again.' },
                { status: 500 }
            );
        }

        const { error: usedError } = await supabaseAdmin
            .from('password_reset_tokens')
            .update({ used: true })
            .eq('id', row.id);

        if (usedError) {
            console.error('Error marking token used:', usedError);
            return NextResponse.json(
                {
                    error: 'Password updated but token not marked used. Please try again.',
                },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('Error in confirm-password-reset route:', err);
        return NextResponse.json(
            { error: 'Unexpected error occurred.' },
            { status: 500 }
        );
    }
}
