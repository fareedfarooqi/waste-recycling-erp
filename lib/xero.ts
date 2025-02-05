import { XeroClient } from 'xero-node';

const xero = new XeroClient({
    clientId: process.env.XERO_CLIENT_ID!,
    clientSecret: process.env.XERO_CLIENT_SECRET!,
    redirectUris: [process.env.XERO_REDIRECT_URI!],
    scopes: ['accounting.transactions.read', 'accounting.settings.read'],
});

export { xero };
