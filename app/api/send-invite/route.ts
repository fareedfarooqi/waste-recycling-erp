import { NextResponse } from 'next/server';
import { sendInviteEmail } from '@/lib/emailSender';
import { generateSecureToken } from '@/utils/tokenHelper';
import { supabase } from '@/config/supabaseClient';

export async function POST(req: Request) {
    try {
        const { invites, companyName, companyId } = await req.json();

        if (!companyId) {
            return NextResponse.json(
                { error: 'Company ID is required' },
                { status: 400 }
            );
        }

        if (!invites || invites.length === 0) {
            return NextResponse.json(
                { error: 'At least one invite is required' },
                { status: 400 }
            );
        }

        const baseUrl =
            process.env.NEXT_PUBLIC_APP_URL ||
            'http://localhost:3000/staff/welcome';

        for (const invite of invites) {
            const token = generateSecureToken();

            const invitationLink = `${baseUrl}/invite?token=${token}`;

            const { error: supabaseError } = await supabase
                .from('invitation_tokens')
                .insert({
                    email: invite.email,
                    token,
                    role: invite.role,
                    company_id: companyId,
                    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                })
                .single();

            if (supabaseError) {
                console.error(
                    'Error storing token in Supabase:',
                    supabaseError.message
                );
                return NextResponse.json(
                    { error: 'Failed to store token in the database' },
                    { status: 500 }
                );
            }

            await sendInviteEmail(
                invite.email,
                invitationLink,
                companyName,
                invite.firstName,
                invite.lastName
            );
        }

        return NextResponse.json({ message: 'Invitations sent successfully' });
    } catch (error) {
        console.error('Error in API route:', error);
        return NextResponse.json(
            { error: 'Failed to send invitation emails' },
            { status: 500 }
        );
    }
}
