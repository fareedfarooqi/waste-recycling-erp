import React from 'react';
import CompanyDetailsForm from '@/components/CompanyDetails/CompanyDetailsForm';
import Background from '@/components/Sign-in/Background';

function SetupCompanyPage(): JSX.Element {
    return (
        <Background>
            <CompanyDetailsForm />
        </Background>
    );
}

export default SetupCompanyPage;
