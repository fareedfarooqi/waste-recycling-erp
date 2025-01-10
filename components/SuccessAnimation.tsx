import React from 'react';

const SuccessAnimation: React.FC = () => {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-full p-4">
                <svg
                    className="w-16 h-16 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                    >
                        <animate
                            attributeName="stroke-dasharray"
                            from="0 100"
                            to="100 100"
                            dur="0.6s"
                            fill="freeze"
                        />
                    </path>
                </svg>
            </div>
        </div>
    );
};

export default SuccessAnimation;
