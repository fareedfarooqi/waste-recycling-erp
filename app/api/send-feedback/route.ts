// import { NextResponse } from 'next/server';
// import nodemailer from 'nodemailer';

// export async function POST(req: Request) {
//     try {
//         // Parse the request body
//         const { type, message } = await req.json();

//         // Validate input
//         if (!type || !message) {
//             return NextResponse.json(
//                 { error: 'Missing type or message.' },
//                 { status: 400 }
//             );
//         }

//         // Create a Nodemailer transporter using Gmail SMTP
//         const transporter = nodemailer.createTransport({
//             service: 'gmail',
//             auth: {
//                 user: process.env.EMAIL_USER,
//                 pass: process.env.EMAIL_PASS
//             }
//         });

//         // Email options
//         const mailOptions = {
//             from: process.env.EMAIL_USER,
//             to: 'test.waste.erp@gmail.com',
//             subject: `${type} - Feedback/Bug Report`,
//             html: `
//             <html>
//                 <body>
//                     <h2>New Feedback Submission</h2>
//                     <p><strong>Feedback Type:</strong> ${type}</p>
//                     <p><strong>Message:</strong></p>
//                     <p>${message}</p>
//                 </body>
//             </html>
//             `
//         };

//         // Send email
//         await transporter.sendMail(mailOptions);

//         return NextResponse.json({ success: true, message: 'Feedback sent successfully' });
//     } catch (err) {
//         console.error('Error in send-feedback route:', err);
//         return NextResponse.json(
//             { error: 'Failed to send feedback.', details: err instanceof Error ? err.message : 'Unknown error' },
//             { status: 500 }
//         );
//     }
// }

// import { NextResponse } from 'next/server';
// import nodemailer from 'nodemailer';

// export async function POST(req: Request) {
//     // Enable CORS
//     const corsHeaders = {
//         'Access-Control-Allow-Origin': '*',
//         'Access-Control-Allow-Methods': 'POST, OPTIONS',
//         'Access-Control-Allow-Headers': 'Content-Type',
//     };

//     // Handle OPTIONS request for CORS preflight
//     if (req.method === 'OPTIONS') {
//         return new NextResponse(null, {
//             status: 200,
//             headers: corsHeaders
//         });
//     }

//     try {
//         // Log incoming request details
//         console.log('Received request body:', await req.clone().json());

//         // Parse the request body
//         const { type, message } = await req.json();

//         // Validate input
//         if (!type || !message) {
//             return NextResponse.json(
//                 { error: 'Missing type or message.' },
//                 {
//                     status: 400,
//                     headers: corsHeaders
//                 }
//             );
//         }

//         // Create a Nodemailer transporter using Gmail SMTP
//         const transporter = nodemailer.createTransport({
//             service: 'gmail',
//             auth: {
//                 user: process.env.EMAIL_USER,
//                 pass: process.env.EMAIL_PASS
//             }
//         });

//         // Log email sending attempt
//         console.log('Attempting to send email');

//         // Email options
//         const mailOptions = {
//             from: process.env.EMAIL_USER,
//             to: 'test.waste.erp@gmail.com',
//             subject: `${type} - Feedback/Bug Report`,
//             html: `
//             <html>
//                 <body>
//                     <h2>New Feedback Submission</h2>
//                     <p><strong>Feedback Type:</strong> ${type}</p>
//                     <p><strong>Message:</strong></p>
//                     <p>${message}</p>
//                 </body>
//             </html>
//             `
//         };

//         // Send email
//         await transporter.sendMail(mailOptions);

//         console.log('Email sent successfully');

//         return NextResponse.json(
//             { success: true, message: 'Feedback sent successfully' },
//             {
//                 status: 200,
//                 headers: corsHeaders
//             }
//         );
//     } catch (err) {
//         // Log full error details
//         console.error('Detailed error in send-feedback route:', err);

//         return NextResponse.json(
//             {
//                 error: 'Failed to send feedback.',
//                 details: err instanceof Error ? err.message : 'Unknown error'
//             },
//             {
//                 status: 500,
//                 headers: corsHeaders
//             }
//         );
//     }
// }

// // Explicitly allow POST method
// export const config = {
//     api: {
//         bodyParser: true,
//     },
// };

// import { NextResponse } from 'next/server';
// import nodemailer from 'nodemailer';

// export async function POST(req: Request) {
//   try {
//     const { type, message } = await req.json();

//     // Validate input
//     if (!type || !message) {
//       return NextResponse.json(
//         { error: 'Type and message are required.' },
//         { status: 400 }
//       );
//     }

//     // Configure Gmail
//     const transporter = nodemailer.createTransport({
//       service: 'gmail',
//       auth: {
//         user: process.env.EMAIL_USER, // test.waste.erp@gmail.com
//         pass: process.env.EMAIL_PASS, // Your Gmail App Password
//       },
//     });

//     // Send email
//     await transporter.sendMail({
//       from: process.env.EMAIL_USER,
//       to: 'test.waste.erp@gmail.com', // Send to this email
//       subject: `${type} Submission`,
//       html: `
//         <h3>New Feedback/Bug Report</h3>
//         <p><strong>Type:</strong> ${type}</p>
//         <p><strong>Message:</strong> ${message}</p>
//       `,
//     });

//     return NextResponse.json({ success: true });
//   } catch (err) {
//     console.error(err);
//     return NextResponse.json(
//       { error: 'Failed to send feedback. Check server logs.' },
//       { status: 500 }
//     );
//   }
// }

// // DRAFT CODE
// import { NextResponse } from "next/server";
// import nodemailer from "nodemailer";

// export async function POST(req: Request) {
//     try {
//         const body = await req.json();
//         console.log("Received request body:", body);

//         const { name, email, message } = body;

//         // if (!name || !email || !message) {
//         //     console.error("Missing fields:", { name, email, message });
//         //     return NextResponse.json(
//         //         { error: "All fields are required." },
//         //         { status: 400 }
//         //     );
//         // }

//         console.log("All fields are present. Sending email...");

//         // Your email sending logic
//         const transporter = nodemailer.createTransport({
//             service: "gmail",
//             auth: {
//                 user: process.env.EMAIL_USER,
//                 pass: process.env.EMAIL_PASS,
//             },
//         });

//         await transporter.sendMail({
//             from: email,
//             to: process.env.EMAIL_RECEIVER,
//             subject: `Feedback from ${name}`,
//             text: message,
//         });

//         console.log("Email sent successfully");
//         return NextResponse.json({ success: "Feedback sent successfully!" }, { status: 200 });
//     } catch (err) {
//         console.error("Error processing request:", err);
//         return NextResponse.json(
//             { error: "Internal server error." },
//             { status: 500 }
//         );
//     }
// }

// import { NextResponse } from "next/server";
// import nodemailer from "nodemailer";

// export async function POST(req: Request) {
//     try {
//         const body = await req.json();
//         console.log("Received request body:", body);

//         // Changed to match frontend fields
//         const { type, message } = body;

//         if (!type || !message) {
//             console.error("Missing fields:", { type, message });
//             return NextResponse.json(
//                 { error: "Type and message are required." }, // Updated error message
//                 { status: 400 }
//             );
//         }

//         // Configure email transporter
//         const transporter = nodemailer.createTransport({
//             host: 'smtp.gmail.com',
//             port: 465, // Use SSL
//             secure: true, // SSL required
//             auth: {
//                 user: process.env.EMAIL_USER,
//                 pass: process.env.EMAIL_PASS,
//             },
//         });

//         // Send email
//         await transporter.sendMail({
//             from: process.env.EMAIL_USER,
//             to: 'test.waste.erp@gmail.com',
//             subject: `${type} Submission`,
//             html: `
//                 <h3>New ${type}</h3>
//                 <p><strong>Type:</strong> ${type}</p>
//                 <p><strong>Message:</strong></p>
//                 <p>${message}</p>
//             `
//         });

//         return NextResponse.json({ success: true });

//     } catch (err) {
//         console.error("Error:", err);
//         return NextResponse.json(
//             { error: "Failed to send feedback" },
//             { status: 500 }
//         );
//     }
// }

// import { NextResponse } from "next/server";
// import nodemailer from "nodemailer";

// export async function POST(req: Request) {
//     try {
//         const body = await req.json();
//         console.log("Received request body:", body);

//         // Changed to match frontend fields
//         const { type, message } = body;

//         if (!type || !message) {
//             console.error("Missing fields:", { type, message });
//             return NextResponse.json(
//                 { error: "Type and message are required." },
//                 { status: 400 }
//             );
//         }

//         // Configure email transporter with different port and settings
//         const transporter = nodemailer.createTransport({
//             service: 'gmail',
//             host: 'smtp.gmail.com',
//             port: 587, // Using TLS port instead of SSL
//             secure: false, // Using TLS instead of SSL
//             auth: {
//                 user: process.env.EMAIL_USER,
//                 pass: process.env.EMAIL_APP_PASSWORD, // Updated to use app password
//             },
//             tls: {
//                 rejectUnauthorized: false,
//             },
//         });

//         // Debugging: Log email configuration without sensitive data
//         console.log("Email configuration:", {
//             service: 'gmail',
//             host: 'smtp.gmail.com',
//             port: 587,
//             secure: false,
//             auth: {
//                 user: process.env.EMAIL_USER ? "Set" : "Not set",
//                 pass: process.env.EMAIL_APP_PASSWORD ? "Set" : "Not set"
//             }
//         });

//         try {
//             // Send email
//             const info = await transporter.sendMail({
//                 from: process.env.EMAIL_USER,
//                 to: 'test.waste.erp@gmail.com',
//                 subject: `${type} Submission`,
//                 html: `
//                     <h3>New ${type}</h3>
//                     <p><strong>Type:</strong> ${type}</p>
//                     <p><strong>Message:</strong></p>
//                     <p>${message}</p>
//                 `
//             });

//             console.log("Email sent successfully:", info.messageId);
//             return NextResponse.json({ success: true, messageId: info.messageId });
//         } catch (emailError) {
//             console.error("Email sending error:", emailError);
//             return NextResponse.json(
//                 { error: `Email sending failed: ${emailError.message}` },
//                 { status: 500 }
//             );
//         }
//     } catch (err) {
//         console.error("General error:", err);
//         return NextResponse.json(
//             { error: "Failed to send feedback" },
//             { status: 500 }
//         );
//     }
// }
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

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

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('Server Error:', err);
        return NextResponse.json(
            { error: 'Failed to send feedback. Please try again later.' },
            { status: 500 }
        );
    }
}
