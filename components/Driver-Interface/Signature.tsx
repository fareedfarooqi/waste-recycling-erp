// FINAL CODE - 2
'use client';
import { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/config/supabaseClient';

interface DigitalSignatureProps {
    value: string;
    onChange: (value: string) => void;
    pickupId: string;
}

export function DigitalSignature({
    value,
    onChange,
    pickupId,
}: DigitalSignatureProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const isDrawing = useRef(false);
    const [signatureUrl, setSignatureUrl] = useState<string>('');

    const uploadSignature = async (dataUrl: string) => {
        if (!dataUrl) {
            onChange('');
            setSignatureUrl('');
            return;
        }

        try {
            // Convert base64 to blob
            const response = await fetch(dataUrl);
            const blob = await response.blob();

            // Generate unique filename
            const filename = `pickup_signatures/${pickupId}_signature.png`;

            // Upload to Supabase storage
            const { data, error } = await supabase.storage
                .from('signatures')
                .upload(filename, blob, {
                    cacheControl: '3600',
                    upsert: true,
                });

            if (error) throw error;

            // Get public URL
            const { data: publicUrlData } = supabase.storage
                .from('signatures')
                .getPublicUrl(filename);

            // Update state with public URL
            onChange(publicUrlData.publicUrl);
            setSignatureUrl(publicUrlData.publicUrl);
        } catch (error) {
            console.error('Error uploading signature:', error);
        }
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#000';

        const startDrawing = (e: MouseEvent | TouchEvent) => {
            isDrawing.current = true;
            const { offsetX, offsetY } = getOffset(e);
            ctx.beginPath();
            ctx.moveTo(offsetX, offsetY);
        };

        const draw = (e: MouseEvent | TouchEvent) => {
            if (!isDrawing.current) return;
            const { offsetX, offsetY } = getOffset(e);
            ctx.lineTo(offsetX, offsetY);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(offsetX, offsetY);
        };

        const stopDrawing = () => {
            if (!isDrawing.current) return;
            isDrawing.current = false;
            ctx.beginPath();
            if (canvas) {
                uploadSignature(canvas.toDataURL());
            }
        };

        const getOffset = (e: MouseEvent | TouchEvent) => {
            const canvas = canvasRef.current!;
            if ('touches' in e) {
                const rect = canvas.getBoundingClientRect();
                return {
                    offsetX: e.touches[0].clientX - rect.left,
                    offsetY: e.touches[0].clientY - rect.top,
                };
            } else {
                return {
                    offsetX: e.offsetX,
                    offsetY: e.offsetY,
                };
            }
        };

        // Add event listeners
        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('mouseleave', stopDrawing);
        canvas.addEventListener('touchstart', startDrawing);
        canvas.addEventListener('touchmove', draw);
        canvas.addEventListener('touchend', stopDrawing);

        return () => {
            // Cleanup event listeners
            canvas.removeEventListener('mousedown', startDrawing);
            canvas.removeEventListener('mousemove', draw);
            canvas.removeEventListener('mouseup', stopDrawing);
            canvas.removeEventListener('mouseleave', stopDrawing);
            canvas.removeEventListener('touchstart', startDrawing);
            canvas.removeEventListener('touchmove', draw);
            canvas.removeEventListener('touchend', stopDrawing);
        };
    }, []);

    const handleClear = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        uploadSignature(''); // Clear the signature
    };

    return (
        <div className="border rounded p-2">
            <canvas
                ref={canvasRef}
                width={300}
                height={150}
                className="border rounded mb-2 w-full h-auto"
            />
            <Button onClick={handleClear} variant="outline" size="sm">
                Clear Signature
            </Button>
            {signatureUrl && (
                <div className="mt-2">
                    <img
                        src={signatureUrl}
                        alt="Signature"
                        className="max-w-full h-auto"
                    />
                </div>
            )}
        </div>
    );
}
