'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { supabase } from '@/config/supabaseClient';

interface CustomerSignatureProps {
    signature: string | null;
}

export default function CustomerSignature({
    signature,
}: CustomerSignatureProps) {
    const [signedUrl, setSignedUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const getSignatureUrl = async () => {
            if (!signature) {
                setIsLoading(false);
                return;
            }

            try {
                // Extract the file name from the full path
                const filePath = signature.split('/signatures/')[1];

                if (!filePath) {
                    throw new Error('Invalid signature path');
                }

                // Get a signed URL using the Supabase client
                const { data, error: urlError } = await supabase.storage
                    .from('signatures')
                    .createSignedUrl(filePath, 3600); // 1 hour expiry

                if (urlError) {
                    console.error('Error getting signed URL:', urlError);
                    setError('Failed to load signature');
                    return;
                }

                if (data && data.signedUrl) {
                    console.log('Successfully got signed URL');
                    setSignedUrl(data.signedUrl);
                    setError(null);
                }
            } catch (err) {
                console.error('Error processing signature:', err);
                setError('Failed to process signature');
            } finally {
                setIsLoading(false);
            }
        };

        getSignatureUrl();
    }, [signature]);

    return (
        <Card className="mb-4">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    Customer Signature
                    {error && <AlertCircle className="h-5 w-5 text-red-500" />}
                </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center min-h-[200px]">
                {isLoading ? (
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900" />
                ) : signedUrl ? (
                    <div className="w-full max-w-md flex flex-col items-center gap-2">
                        <div className="w-full h-48 flex items-center justify-center">
                            <img
                                src={signedUrl}
                                alt="Customer Signature"
                                className="max-w-full max-h-full object-contain"
                                onError={() => {
                                    console.error('Image failed to load');
                                    setError(
                                        'Failed to display signature image'
                                    );
                                }}
                                onLoad={() => {
                                    console.log('Image loaded successfully');
                                    setError(null);
                                }}
                            />
                        </div>
                        {error && (
                            <p className="text-red-500 text-sm mt-2">{error}</p>
                        )}
                    </div>
                ) : (
                    <p className="text-gray-500">No signature available</p>
                )}
            </CardContent>
        </Card>
    );
}
