import React, { useEffect, useState } from 'react';
import { supabase } from '@/config/supabaseClient';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import SignaturePad from 'react-signature-canvas';
import { Pickup } from './PickupList';
// import { Session } from '@supabase/supabase-js';

interface PickupFormProps {
    pickup: Pickup;
    onComplete: () => Promise<void>;
}

// interface Pickup {
//   id: string;
//   products_collected: { quantity: number; product_name: string }[] | null;
//   empty_bins_delivered: number;
//   filled_bins_collected: number;
// }

interface ProductCollection {
    quantity: number;
    product_name: string;
}

export default function PickupForm({ pickup, onComplete }: PickupFormProps) {
    const [formData, setFormData] = useState({
        products_collected: Array.isArray(pickup.products_collected)
            ? pickup.products_collected[0] || {
                  quantity: 0,
                  product_name: 'Organic Waste',
              }
            : { quantity: 0, product_name: 'Organic Waste' },
        empty_bins_delivered: pickup.empty_bins_delivered || 0,
        filled_bins_collected: pickup.filled_bins_collected || 0,
    });

    const [signaturePad, setSignaturePad] = useState<SignaturePad | null>(null);
    const [loading, setLoading] = useState(false);

    // Function to upload signature to Supabase Storage
    const uploadSignatureToBucket = async (signatureBlob: Blob) => {
        try {
            const timestamp = new Date().getTime();
            const fileName = `signature-${timestamp}.png`; // Simplified file name

            // Upload the file
            const { data, error } = await supabase.storage
                .from('signatures')
                .upload(fileName, signatureBlob, {
                    contentType: 'image/png',
                    cacheControl: '3600',
                    upsert: true,
                });

            if (error) {
                console.error('Storage upload error details:', {
                    message: error.message,
                    name: error.name,
                });
                throw new Error(`Failed to upload signature: ${error.message}`);
            }

            // Get the public URL
            const { data: publicUrlData } = supabase.storage
                .from('signatures')
                .getPublicUrl(fileName);

            if (!publicUrlData.publicUrl) {
                throw new Error(
                    'Failed to get public URL for uploaded signature'
                );
            }

            return publicUrlData.publicUrl;
        } catch (err) {
            console.error('Signature upload error details:', err);
            throw new Error(
                err instanceof Error
                    ? err.message
                    : 'Failed to upload signature'
            );
        }
    };

    useEffect(() => {
        const fetchProductName = async () => {
            try {
                const { data, error } = await supabase
                    .from('pickups')
                    .select('products_collected')
                    .eq('id', pickup.id)
                    .single();

                if (error) throw error;

                if (data && data.products_collected) {
                    setFormData((prev) => ({
                        ...prev,
                        products_collected: {
                            ...prev.products_collected,
                            product_name:
                                data.products_collected[0]?.product_name ||
                                'Unknown',
                        },
                    }));
                }
            } catch (err) {
                console.error('Error fetching product name:', err);
            }
        };

        fetchProductName();
    }, [pickup.id]);

    // Modified handleSubmit function
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!signaturePad || signaturePad.isEmpty()) {
            alert('Please provide a signature.');
            return;
        }

        setLoading(true);

        try {
            const signatureDataUrl = signaturePad.toDataURL('image/png');
            const response = await fetch(signatureDataUrl);
            const signatureBlob = await response.blob();

            // Upload signature and get URL
            const signatureUrl = await uploadSignatureToBucket(signatureBlob);

            const productsCollectedArray = [
                {
                    quantity: formData.products_collected.quantity,
                    product_name: formData.products_collected.product_name,
                },
            ];

            const { error: updateError } = await supabase
                .from('pickups')
                .update({
                    products_collected: productsCollectedArray,
                    empty_bins_delivered: formData.empty_bins_delivered,
                    filled_bins_collected: formData.filled_bins_collected,
                    signature: signatureUrl,
                    status: 'completed',
                })
                .eq('id', pickup.id);

            if (updateError) {
                throw new Error(
                    `Failed to update pickup: ${updateError.message}`
                );
            }

            alert('Pickup successfully completed!');
            await onComplete();
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : 'Unknown error occurred';
            console.error('Error submitting pickup:', errorMessage);
            alert(`Failed to submit pickup: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };
    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-4 bg-white p-4 rounded-lg shadow"
        >
            <h2 className="text-xl font-semibold mb-4">
                {pickup.customers?.company_name || 'Unknown Customer'}
            </h2>

            <div className="space-y-4">
                <div>
                    <Label htmlFor="product_name">Product Name</Label>
                    <Input
                        id="product_name"
                        type="text"
                        value={formData.products_collected.product_name}
                    />
                    {/* <Label htmlFor="product_name">Product Name</Label> */}
                    {/* <select */}
                    {/* id="product_name"
            className="w-full p-2 border rounded-md"
            value={formData.products_collected.product_name}
            onChange={(e) => {
              setFormData((prev) => ({
                ...prev,
                products_collected: {
                  ...prev.products_collected,
                  product_name: e.target.value
                }
              }));
            }}
          > */}
                    {/* </select> */}
                    {/* <option value="Organic Waste">Organic Waste</option> */}
                    {/* <option value="Food Waste">Food Waste</option>
            <option value="Green Waste">Green Waste</option> */}
                </div>

                <div>
                    <Label htmlFor="quantity">Quantity (kg)</Label>
                    <Input
                        id="quantity"
                        type="number"
                        step="0.1"
                        value={formData.products_collected.quantity}
                        onChange={(e) => {
                            const value = parseFloat(e.target.value);
                            if (value >= 0 || isNaN(value)) {
                                setFormData((prev) => ({
                                    ...prev,
                                    products_collected: {
                                        ...prev.products_collected,
                                        quantity: value || 0,
                                    },
                                }));
                            }
                        }}
                        required
                    />
                </div>
            </div>

            <div>
                <Label htmlFor="emptyBins">
                    Number of Empty Bins Delivered
                </Label>
                <Input
                    id="emptyBins"
                    type="number"
                    value={formData.empty_bins_delivered.toString()}
                    onChange={(e) =>
                        setFormData((prev) => ({
                            ...prev,
                            empty_bins_delivered:
                                parseInt(e.target.value, 10) || 0,
                        }))
                    }
                    required
                />
            </div>

            <div>
                <Label htmlFor="filledBins">Filled Bins Collected</Label>
                <Input
                    id="filledBins"
                    type="number"
                    value={formData.filled_bins_collected.toString()}
                    onChange={(e) => {
                        const value = parseInt(e.target.value, 10);
                        if (value >= 0 || isNaN(value)) {
                            setFormData((prev) => ({
                                ...prev,
                                filled_bins_collected: value || 0,
                            }));
                        }
                    }}
                    required
                />
            </div>

            <div>
                <Label>Customer Signature</Label>
                <div className="border rounded-lg p-2">
                    <SignaturePad
                        ref={(ref) => setSignaturePad(ref)}
                        canvasProps={{ className: 'w-full h-40' }}
                    />
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => signaturePad?.clear()}
                        className="mt-2"
                    >
                        Clear Signature
                    </Button>
                </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Submitting...' : 'Save and Submit'}
            </Button>
        </form>
    );
}
