import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

/**
 * Sends an invitation email with optional first/last names.
 * @param recipient - The recipient's email address.
 * @param invitationLink - The invite link for the user to create an account.
 * @param companyName - The company inviting the user (e.g., "Recycle Corp").
 * @param firstName - Optional first name.
 * @param lastName - Optional last name.
 */
export async function sendInviteEmail(
    recipient: string,
    invitationLink: string,
    companyName: string,
    firstName?: string,
    lastName?: string
) {
    let greeting = 'Hello,';
    if (firstName && lastName) {
        greeting = `Hello ${firstName} ${lastName},`;
    } else if (firstName) {
        greeting = `Hello ${firstName},`;
    } else if (lastName) {
        greeting = `Hello ${lastName},`;
    }

    const currentYear = new Date().getFullYear();

    // Use a fancier gradient, a playful emoji, bigger headings, and a sharper CTA.
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>You're Invited!</title>
        <style>
            /* Import a clean, modern font (Poppins, fallback to sans-serif) */
            @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');

            body, html {
                margin: 0;
                padding: 0;
                background-color: #f4f9f5; /* Soft background */
                font-family: 'Poppins', Arial, sans-serif;
                color: #333333;
            }

            .container {
                max-width: 600px;
                margin: 40px auto;
                background-color: #ffffff;
                border-radius: 10px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                overflow: hidden;
            }

            /* Header with a bolder gradient */
            .header {
                background: linear-gradient(120deg, #0e9f6e 0%, #0a8262 100%);
                padding: 50px 30px;
                text-align: center;
            }
            .header h1 {
                font-size: 36px;
                font-weight: 700;
                margin: 0;
                color: #ffffff;
            }

            /* Body Content */
            .content {
                padding: 40px 30px;
                text-align: center;
                background-color: #f8fafc;
            }
            .content p {
                margin: 16px 0;
                font-size: 16px;
                line-height: 1.6;
                color: #555555;
            }
            .content p strong {
                color: #0e9f6e;
            }

            .content .greeting {
                font-weight: 600;
                font-size: 18px;
                color: #333333;
            }

            /* CTA Button */
            .btn-container {
                margin: 35px 0 25px;
            }
            .btn {
                display: inline-block;
                padding: 16px 40px;
                background-color: #0e9f6e;
                border-radius: 8px;
                color: #ffffff !important;
                text-decoration: none;
                font-size: 18px;
                font-weight: 600;
                transition: background 0.3s ease;
            }
            .btn:hover {
                background-color: #0a7c58;
            }
            .btn:visited, .btn:link {
                color: #ffffff !important;
                text-decoration: none;
            }

            /* Footer */
            .footer {
                background-color: #e4e4e4;
                padding: 20px;
                text-align: center;
                font-size: 14px;
                color: #666666;
            }

            /* Responsive for smaller screens */
            @media (max-width: 600px) {
                .header h1 {
                    font-size: 28px;
                }
                .content {
                    padding: 30px 20px;
                }
                .btn {
                    font-size: 16px;
                    padding: 14px 30px;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <!-- Header -->
            <div class="header">
                <h1>You're Invited! ♻️</h1>
            </div>

            <!-- Main Content -->
            <div class="content">
                <p class="greeting">${greeting}</p>
                <p>
                    You've been invited by <strong>${companyName}</strong> to join our
                    Waste ERP Management platform. Use the button below to
                    create your account and embark on a more efficient, eco-friendly
                    workflow.
                </p>

                <div class="btn-container">
                    <a class="btn" href="${invitationLink}">
                        Create Your Account
                    </a>
                </div>

                <p>
                    If you did not request this invitation, you can safely ignore
                    this email. We look forward to helping you streamline waste 
                    management soon!
                </p>
            </div>

            <!-- Footer -->
            <div class="footer">
                &copy; ${currentYear} ${companyName}. All Rights Reserved.
            </div>
        </div>
    </body>
    </html>
    `;

    const mailOptions = {
        from: '"Waste ERP Management" <test.waste.erp@gmail.com>',
        to: recipient,
        subject: 'Invitation to Join Our Platform',
        html: htmlContent,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        return info;
    } catch (error) {
        console.error('Error sending invitation email:', error);
        throw error;
    }
}

/**
 * Sends a password reset email.
 * @param recipient - The recipient's email address.
 * @param resetLink - The password reset link.
 */
export async function sendPasswordResetEmail(
    recipient: string,
    resetLink: string
) {
    const currentYear = new Date().getFullYear();

    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Reset Your Password</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap');
            body, html {
                margin: 0;
                padding: 0;
                background-color: #f4f9f5;
                font-family: 'Poppins', Arial, sans-serif;
                color: #333333;
            }
            .container {
                max-width: 600px;
                margin: 40px auto;
                background-color: #ffffff;
                border-radius: 10px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                overflow: hidden;
            }
            .header {
                background: linear-gradient(120deg, #0e9f6e 0%, #0a8262 100%);
                padding: 40px 30px;
                text-align: center;
            }
            .header h1 {
                font-size: 28px;
                font-weight: 700;
                color: #ffffff;
            }
            .content {
                padding: 30px 20px;
                text-align: center;
            }
            .content p {
                margin: 16px 0;
                font-size: 16px;
                line-height: 1.6;
                color: #555555;
            }
            .btn-container {
                margin: 35px 0;
            }
            .btn {
            display: inline-block;
            padding: 16px 40px;
            background-color: #0e9f6e;
            border-radius: 8px;
            color: #ffffff !important; /* ensure it's forced white */
            text-decoration: none;
            font-size: 16px;
            font-weight: 600;
            transition: background 0.3s ease;
            }

            /* Force visited link color to stay white */
            .btn:visited,
            .btn:link {
            color: #ffffff !important;
            text-decoration: none;
            }

            .btn:hover {
                background-color: #0a7c58;
            }
            .footer {
                background-color: #e4e4e4;
                padding: 20px;
                text-align: center;
                font-size: 14px;
                color: #666666;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Reset Your Password</h1>
            </div>
            <div class="content">
                <p>You requested to reset your password. Click the button below to reset it:</p>
                <div class="btn-container">
                    <a class="btn" href="${resetLink}">
                        Reset Password
                    </a>
                </div>
                <p>
                    This link will expire in 1 hour. If you did not request this, please ignore this email.
                </p>
            </div>
            <div class="footer">
                &copy; ${currentYear} Waste ERP. All Rights Reserved.
            </div>
        </div>
    </body>
    </html>
    `;

    const mailOptions = {
        from: '"Waste ERP" <test.waste.erp@gmail.com>',
        to: recipient,
        subject: 'Reset Your Password',
        html: htmlContent,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        return info;
    } catch (error) {
        console.error('Error sending password reset email:', error);
        throw error;
    }
}
