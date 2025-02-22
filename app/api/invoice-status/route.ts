// // import { NextResponse } from 'next/server';
// // import { supabase } from '@/config/supabaseClient';
// // import { XeroClient, AccountingIdentityResponse, AccountingInvoice } from 'xero-node';

// // const xero = new XeroClient({
// //   clientId: process.env.XERO_CLIENT_ID!,
// //   clientSecret: process.env.XERO_CLIENT_SECRET!,
// //   redirectUris: [process.env.XERO_REDIRECT_URI!],
// //   scopes: ['accounting.invoices.read', 'accounting.settings.read'],
// // });

// // export async function GET(request: Request) {
// //   const { searchParams } = new URL(request.url);
// //   const pickupId = searchParams.get('id');

// //   if (!pickupId) {
// //     return NextResponse.json({ error: 'Pickup ID is required' }, { status: 400 });
// //   }

// //   try {
// //     // 1. Get the invoice reference from Supabase
// //     const { data: pickup, error: pickupError } = await supabase
// //       .from('pickups')
// //       .select('invoice_reference, invoice_status')
// //       .eq('id', pickupId)
// //       .single();

// //     if (pickupError) {
// //       throw pickupError;
// //     }

// //     // If no invoice reference, return the current status
// //     if (!pickup.invoice_reference) {
// //       return NextResponse.json({ status: pickup.invoice_status || 'Pending' });
// //     }

// //     // 2. Obtain the XERO_TENANT_ID
// //     const identityResponse: AccountingIdentityResponse = await xero.accounting.getIdentity();
// //     const tenantId = identityResponse.tenants[0].tenantId;

// //     // 3. Obtain the access token using the client credentials
// //     const tokenSet = await xero.oauth2.clientCredentialsFlow();
// //     xero.setTokenSet(tokenSet);

// //     // 4. Fetch the invoice from Xero
// //     const xeroResponse = await xero.accounting.getInvoice(tenantId, pickup.invoice_reference);
// //     const invoice = xeroResponse.body.invoices?.[0] as AccountingInvoice | undefined;

// //     // 5. Determine the invoice status
// //     let status: string;
// //     if (invoice?.status) {
// //       switch (invoice.status) {
// //         case 'PAID':
// //           status = 'Paid';
// //           break;
// //         case 'VOIDED':
// //           status = 'Cancelled';
// //           break;
// //         case 'DRAFT':
// //         case 'SUBMITTED':
// //           status = 'Pending';
// //           break;
// //         case 'AUTHORISED':
// //           status = 'Overdue';
// //           break;
// //         default:
// //           status = 'Pending';
// //       }
// //     } else {
// //       status = 'Pending';
// //     }

// //     // 6. Update the Supabase record with the latest status
// //     await supabase
// //       .from('pickups')
// //       .update({ invoice_status: status })
// //       .eq('id', pickupId);

// //     return NextResponse.json({ status });
// //   } catch (error) {
// //     console.error('Error fetching invoice status:', error);
// //     return NextResponse.json({ status: 'Pending' }, { status: 500 });
// //   }
// // }

// import { NextResponse } from 'next/server';
// import { supabase } from '@/config/supabaseClient';
// import { xeroService } from '@/lib/xero';

// export async function GET(request: Request) {
//   const { searchParams } = new URL(request.url);
//   const pickupId = searchParams.get('id');

//   if (!pickupId) {
//     return NextResponse.json({ error: 'Pickup ID is required' }, { status: 400 });
//   }

//   try {
//     // Initialize Xero service if not already initialized
//     await xeroService.initialize();

//     // Get the invoice reference from Supabase
//     const { data: pickup, error: pickupError } = await supabase
//       .from('pickups')
//       .select('invoice_status')
//       .eq('id', pickupId)
//       .single();

//     if (pickupError) throw pickupError;

//     // If no invoice reference, return current status
//     if (!pickup.invoice_reference) {
//       return NextResponse.json({ status: pickup.invoice_status || 'Pending' });
//     }

//     // Refresh token if needed
//     await xeroService.refreshTokenIfNeeded();

//     const tenantId = xeroService.getTenantId();
//     if (!tenantId) {
//       throw new Error('No tenant ID available');
//     }

//     // Get invoice from Xero
//     const client = xeroService.getClient();
//     const response = await client.accountingApi.getInvoice(
//       tenantId,
//       pickup.invoice_reference
//     );

//     // Determine status
//     let status = 'Pending';
//     const invoice = response.body.invoices?.[0];

//     if (invoice) {
//       switch (invoice.status) {
//         case 'PAID':
//           status = 'Paid';
//           break;
//         case 'AUTHORISED':
//           const dueDate = new Date(invoice.dueDate);
//           status = dueDate < new Date() ? 'Overdue' : 'Pending';
//           break;
//         case 'VOIDED':
//           status = 'Cancelled';
//           break;
//         default:
//           status = 'Pending';
//       }
//     }

//     // Update status in Supabase
//     await supabase
//       .from('pickups')
//       .update({ invoice_status: status })
//       .eq('id', pickupId);

//     return NextResponse.json({ status });
//   } catch (error) {
//     console.error('Error fetching invoice status:', error);
//     return NextResponse.json({ status: 'Error' }, { status: 500 });
//   }
// }
