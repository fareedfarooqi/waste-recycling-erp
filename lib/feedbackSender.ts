import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

/**
 * Sends a feedback email.
 * @param recipient - The recipient's email address.
 * @param type - The type/category of feedback (e.g. "Bug Report", "Feature Request").
 * @param message - The body of the feedback.
 */
export async function sendFeedbackEmail(
    recipient: string,
    type: string,
    message: string
) {
    const currentYear = new Date().getFullYear();

    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>New Feedback Received</title>
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
                margin: 0;
            }
            .content {
                padding: 30px 20px;
                line-height: 1.6;
                color: #555555;
            }
            .content p {
                margin: 16px 0;
                font-size: 16px;
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
                <h1>New Feedback Received</h1>
            </div>
            <div class="content">
                <p><strong>Type:</strong> ${type}</p>
                <p><strong>Message:</strong></p>
                <p>${message
                    .split('\n')
                    .map((line) => `<span>${line}</span><br/>`)
                    .join('')}</p>
            </div>
            <div class="footer">
                &copy; ${currentYear} Waste ERP. All Rights Reserved.
            </div>
        </div>
    </body>
    </html>
    `;

    const mailOptions = {
        // from: '"Waste ERP" <test.waste.erp@gmail.com>',
        // to: recipient,

        from: recipient,
        to: '"Waste ERP" <test.waste.erp@gmail.com>',
        subject: `${type} Submission`,
        html: htmlContent,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        return info;
    } catch (error) {
        console.error('Error sending feedback email:', error);
        throw error;
    }
}
