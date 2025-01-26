import React from 'react';
import { X } from 'lucide-react';

interface ImageModalProps {
    imageUrl: string;
    alt: string;
    onClose: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ imageUrl, alt, onClose }) => {
    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p- overflow-y-auto"
            onClick={onClose}
        >
            <div
                className="relative max-w-4xl w-full my-10"
                onClick={(e) => e.stopPropagation()}
            >
                <img
                    src={imageUrl || '/placeholder.svg'}
                    alt={alt}
                    className="w-full h-auto object-contain rounded-lg"
                />

                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-white bg-black bg-opacity-50 rounded-full p-2"
                >
                    <X size={24} />
                </button>
            </div>
        </div>
    );
};

export default ImageModal;
