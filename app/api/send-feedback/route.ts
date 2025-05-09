import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { sendFeedbackEmail } from '@/lib/feedbackSender';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { type, message } = body;

        // Validate input
        if (!type || !message) {
            return NextResponse.json(
                { error: 'Type and message are required.' },
                { status: 400 }
            );
        }

        // Configure transporter (Gmail SMTP)
        const transporter = nodemailer.createTransport({
            service: 'gmail', // Use service name
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        // Send email
        await transporter.sendMail({
            from: '"Waste ERP" <test.waste.erp@gmail.com>',
            // from: process.env.EMAIL_USER,
            to: 'test.waste.erp@gmail.com',
            subject: `${type} Submission`,
            html: `
                <h3>New ${type}</h3>
                <p><strong>Type:</strong> ${type}</p>
                <p><strong>Message:</strong> ${message}</p>
            `,
        });

        await sendFeedbackEmail('test.waste.erp@gmail.com', type, message);
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('Server Error:', err);
        return NextResponse.json(
            { error: 'Failed to send feedback. Please try again later.' },
            { status: 500 }
        );
    }
}
