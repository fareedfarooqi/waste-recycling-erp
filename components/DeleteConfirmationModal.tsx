import React from 'react';

type ButtonProps = {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
};

type DeleteConfirmationModalProps = {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    content: React.ReactNode;
    buttons: ButtonProps[];
};

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
    isOpen,
    onClose,
    content,
    buttons,
}) => {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-gray-700 bg-opacity-50 z-50 flex justify-center items-center"
            onClick={onClose}
        >
            <div
                className="bg-white w-[92%] max-w-lg rounded-lg p-10 shadow-lg relative"
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className="text-3xl font-bold text-center mb-6">
                    Confirm Deletion
                </h3>
                <div className="mb-6">{content}</div>
                <div className="flex justify-between space-x-4">
                    {buttons.map((button, index) => (
                        <button
                            key={index}
                            onClick={button.onClick}
                            className={`p-4 rounded-lg text-center w-36 transform transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 ${button.variant === 'primary' ? 'bg-red-500 text-white px-8 py-3 rounded-lg text-base font-bold hover:bg-red-600 focus:ring-red-300' : 'bg-gray-300 text-gray-800 px-8 py-3 rounded-lg text-base font-bold hover:bg-gray-400 focus:ring-gray-300'}`}
                        >
                            {button.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmationModal;
