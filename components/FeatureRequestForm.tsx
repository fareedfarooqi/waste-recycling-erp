// 'use client';
// import React, { useState } from 'react';
// import { Button } from '@/components/ui/button';
// // import { Textarea } from "@/components/ui/textarea"
// // import { toast } from "@/components/ui/use-toast"

// export function FeatureRequestForm() {
//     const [message, setMessage] = useState('');

//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();
//         // This is a placeholder function. In a real application, you'd send this to your backend.
//         await new Promise((resolve) => setTimeout(resolve, 1000));
//         // toast({
//         //   title: "Request Sent",
//         //   description: "Thank you for your feedback!",
//         // })
//         setMessage('');
//     };

//     return (
//         <form onSubmit={handleSubmit} className="space-y-4">
//             <textarea
//                 placeholder="Describe the feature you want or the bug you found..."
//                 value={message}
//                 onChange={(e) => setMessage(e.target.value)}
//                 className="w-full min-h-[100px] p-2 border rounded"
//             />
//             <Button type="submit">Send Feedback</Button>
//         </form>
//     );
// }

// DRAFT CODE
// 'use client';
// import React, { useState } from 'react';
// import { Button } from '@/components/ui/button';

// export function FeatureRequestForm() {
//     const [message, setMessage] = useState('');
//     const [type, setType] = useState('Feature Request');
//     const [isLoading, setIsLoading] = useState(false);

//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();
//         setIsLoading(true);

//         try {
//             // Send email directly via your backend endpoint
//             const response = await fetch('/api/send-feedback', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify({
//                     type: type,
//                     message: message,
//                     to: 'test.waste.erp@gmail.com'
//                 }),
//             });

//             if (!response.ok) {
//                 const error = await response.json();
//                 throw new Error(error.message || 'Failed to send feedback');
//             }

//             setMessage('');
//             alert('Feedback sent successfully!');

//         } catch (error: any) {
//             console.error('Error details:', error);
//             alert(error.message || 'Failed to send feedback. Please try again.');
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     return (
//         <form onSubmit={handleSubmit} className="space-y-4">
//             <select
//                 value={type}
//                 onChange={(e) => setType(e.target.value)}
//                 className="w-full p-2 border rounded"
//             >
//                 <option value="Feature Request">Feature Request</option>
//                 <option value="Bug Report">Bug Report</option>
//             </select>

//             <textarea
//                 placeholder="Describe the feature you want or the bug you found..."
//                 value={message}
//                 onChange={(e) => setMessage(e.target.value)}
//                 className="w-full min-h-[100px] p-2 border rounded"
//                 required
//             />

//             <Button
//                 type="submit"
//                 disabled={isLoading || !message.trim()}
//             >
//                 {isLoading ? 'Sending...' : 'Send Feedback'}
//             </Button>
//         </form>
//     );
// }
