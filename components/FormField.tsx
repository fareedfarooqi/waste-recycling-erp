'use client';

import React from 'react';
import Select from 'react-select';

interface FormFieldProps {
    label: string;
    type?: string;
    placeholder?: string;
    required?: boolean;
    value?: string | number;
    onChange?: (
        value:
            | string
            | number
            | React.ChangeEvent<
                  HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
              >
    ) => void;
    rows?: number;
    checked?: boolean;
    options?: { value: string | number; label: string }[];
    children?: React.ReactNode;
}
export default function FormField({
    label,
    type = 'text',
    placeholder,
    required = false,
    value,
    onChange,
    rows,
    checked,
    options,
    children,
}: FormFieldProps) {
    return (
        <div className="mb-8">
            <label className="block text-lg font-medium text-gray-700">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            {children ? (
                // Render custom component (like Select)
                <div className="mt-2">{children}</div>
            ) : type === 'textarea' ? (
                <textarea
                    className="w-full p-4 mt-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                    rows={rows}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    required={required}
                />
            ) : type === 'checkbox' ? (
                <input
                    type="checkbox"
                    className="mt-2"
                    checked={checked} // Ensure checked is passed correctly
                    onChange={(e) => onChange?.(e)} // Pass the event object directly
                    required={required}
                />
            ) : type === 'dropdown' && options ? (
                <Select
                    options={options}
                    value={options.find((option) => option.value === value)}
                    onChange={
                        (selectedOption) =>
                            onChange?.(selectedOption?.value ?? '') // Ensure proper handling of undefined
                    }
                    placeholder={placeholder}
                    isSearchable
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
