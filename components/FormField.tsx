'use client';

import React from 'react';

interface FormFieldProps {
    label: string;
    type?: string;
    placeholder: string;
    required?: boolean;
    value?: string | number;
    onChange?: (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => void;
    rows?: number;
}

export default function FormField({
    label,
    type = 'text',
    placeholder,
    required = false,
    value,
    onChange,
    rows,
}: FormFieldProps) {
    return (
        <div className="mb-8">
            <label className="block text-lg font-medium text-gray-700">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            {type === 'textarea' ? (
                <textarea
                    className="w-full p-4 mt-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                    rows={rows}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    required={required}
                />
            ) : (
                <input
                    type={type}
                    className="w-full p-4 mt-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    required={required}
                />
            )}
        </div>
    );
}
