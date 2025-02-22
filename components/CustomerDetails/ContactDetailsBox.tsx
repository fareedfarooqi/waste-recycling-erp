'use client';

import React from 'react';
import { FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

type ContactDetails = {
    email: string;
    phone: string;
    address: string;
};

interface Props {
    contactDetails: ContactDetails;
}

const ContactDetailsBox: React.FC<Props> = ({ contactDetails }) => {
    return (
        <div className="bg-gray-50 p-8 rounded-xl shadow-lg mb-8 text-center">
            <h2 className="text-3xl font-semibold text-green-600 mb-6">
                Contact Details
            </h2>
            <div className="flex flex-wrap justify-center gap-8">
                <div className="flex items-center gap-3">
                    <FaEnvelope className="text-green-600 text-3xl" />
                    <p className="text-lg text-gray-800">
                        <strong>Email:</strong> {contactDetails.email}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <FaPhone className="text-green-600 text-3xl" />
                    <p className="text-lg text-gray-800">
                        <strong>Phone:</strong> {contactDetails.phone}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <FaMapMarkerAlt className="text-green-600 text-3xl" />
                    <p className="text-lg text-gray-800">
                        <strong>Address:</strong> {contactDetails.address}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ContactDetailsBox;
