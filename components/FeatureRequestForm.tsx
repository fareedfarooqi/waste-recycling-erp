'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
// import { Textarea } from "@/components/ui/textarea"
// import { toast } from "@/components/ui/use-toast"

export function FeatureRequestForm() {
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // This is a placeholder function. In a real application, you'd send this to your backend.
        await new Promise((resolve) => setTimeout(resolve, 1000));
        // toast({
        //   title: "Request Sent",
        //   description: "Thank you for your feedback!",
        // })
        setMessage('');
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <textarea
                placeholder="Describe the feature you want or the bug you found..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full min-h-[100px] p-2 border rounded"
            />
            <Button type="submit">Send Feedback</Button>
        </form>
    );
}
