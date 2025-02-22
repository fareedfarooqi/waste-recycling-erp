// // import { XeroClient } from 'xero-node';

// // const xero = new XeroClient({
// //     clientId: process.env.XERO_CLIENT_ID!,
// //     clientSecret: process.env.XERO_CLIENT_SECRET!,
// //     redirectUris: [process.env.XERO_REDIRECT_URI!],
// //     scopes: ['accounting.transactions.read', 'accounting.settings.read'],
// // });

// // export { xero };

// import { XeroClient } from 'xero-node';

// class XeroService {
//   private static instance: XeroService;
//   private client: XeroClient;
//   private tenantId: string | null = null;

//   private constructor() {
//     this.client = new XeroClient({
//       clientId: process.env.XERO_CLIENT_ID!,
//       clientSecret: process.env.XERO_CLIENT_SECRET!,
//       redirectUris: [process.env.XERO_REDIRECT_URI!],
//       scopes: [
//         'offline_access',
//         'accounting.transactions.read',
//         'accounting.settings.read',
//         'accounting.contacts.read'
//       ]
//     });
//   }

//   public static getInstance(): XeroService {
//     if (!XeroService.instance) {
//       XeroService.instance = new XeroService();
//     }
//     return XeroService.instance;
//   }

//   public async initialize() {
//     try {
//       // Get token using client credentials
//       const tokenSet = await this.client.clientCredentials.getToken();
//       this.client.setTokenSet(tokenSet);

//       // Get the first connected tenant
//       const connections = await this.client.connections.getConnections();
//       if (connections.length > 0) {
//         this.tenantId = connections[0].tenantId;
//       }
//     } catch (error) {
//       console.error('Error initializing Xero service:', error);
//       throw error;
//     }
//   }

//   public getClient(): XeroClient {
//     return this.client;
//   }

//   public getTenantId(): string | null {
//     return this.tenantId;
//   }

//   public async refreshTokenIfNeeded() {
//     try {
//       const tokenSet = await this.client.readTokenSet();
//       if (tokenSet.expired()) {
//         const newTokenSet = await this.client.refreshToken();
//         this.client.setTokenSet(newTokenSet);
//       }
//     } catch (error) {
//       console.error('Error refreshing token:', error);
//       throw error;
//     }
//   }
// }

// export const xeroService = XeroService.getInstance();
