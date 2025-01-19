import React from 'react';
export interface Message {
    success?: string;
    error?: string;
    message?: string;
}

export function FormMessage({ message }: { message?: Message }) {
    if (!message) return null;

    const { success, error, message: info } = message;

    // If no fields are set, hide the component
    if (!success && !error && !info) return null;

    return (
        <div className="flex flex-col gap-2 w-full max-w-md text-sm">
            {success && (
                <div className="text-foreground border-l-2 border-foreground px-4">
                    {success}
                </div>
            )}
            {error && (
                <div className="text-destructive-foreground border-l-2 border-destructive-foreground px-4">
                    {error}
                </div>
            )}
            {info && (
                <div className="text-foreground border-l-2 px-4">{info}</div>
            )}
        </div>
    );
}
