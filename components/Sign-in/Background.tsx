import React from 'react';

interface BackgroundProps {
    children: React.ReactNode;
}

export default function Background({ children }: BackgroundProps) {
    return (
        <div
            className="relative h-screen w-screen flex items-center justify-center overflow-hidden"
            style={{
                background: `
          radial-gradient(
            circle at 20% 30%,
            rgba(134, 239, 172, 0.7) 0%,
            transparent 50%
          ),
          radial-gradient(
            circle at 70% 40%,
            rgba(110, 231, 183, 0.7) 0%,
            transparent 50%
          ),
          linear-gradient(
            135deg,
            #f0fdf4 40%,
            #bbf7d0 100%
          )
        `,
            }}
        >
            {children}
        </div>
    );
}
