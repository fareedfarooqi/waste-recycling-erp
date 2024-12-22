import Navbar from '@/components/Navbar';
import ClientsTable from '@/components/ClientsTable';

function ClientListPage(): JSX.Element {
    return (
        <>
            <Navbar />
            <ClientsTable />
        </>
    );
}

export default ClientListPage;
