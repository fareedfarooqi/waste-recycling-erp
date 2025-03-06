'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

export function FeatureRequestForm() {
    const [message, setMessage] = useState('');
    const [type, setType] = useState('Feature Request');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Send email directly via your backend endpoint
            const response = await fetch('/api/send-feedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    type: type,
                    message: message,
                    to: 'test.waste.erp@gmail.com',
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to send feedback');
            }

            setMessage('');
            alert('Feedback sent successfully!');
        } catch (error: unknown) {
            if (error instanceof Error) {
                console.error('Error details:', error);
                alert(error.message);
            } else {
                console.error('Unexpected error:', error);
                alert('Failed to send feedback. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full p-3 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200 ease-in-out"
            >
                <option value="Feature Request">Feature Request</option>
                <option value="Bug Report">Bug Report</option>
            </select>

            <textarea
                placeholder="Describe the feature you want or the bug you found..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full min-h-[150px] p-3 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200 ease-in-out"
                required
            />

            <Button
                type="submit"
                disabled={isLoading || !message.trim()}
                className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg transition duration-200 ease-in-out"
            >
                {isLoading ? 'Sending...' : 'Send Feedback'}
            </Button>
        </form>
    );
}
