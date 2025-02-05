// 'use client';

// import { supabase } from '@/config/supabaseClient';
// import BinInfo from '@/components/BinInfo';
// import CustomerSignature from '@/components/CustomerSignature';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import Link from 'next/link';
// import { ArrowLeft, FileText } from 'lucide-react';
// import { useEffect, useState } from 'react';
// import { useSearchParams } from 'next/navigation';
// import InvoiceStatus from '@/components/InvoiceStatus';

// import { Badge } from '@/components/ui/badge';

// import SidebarSmall from '@/components/SidebarSmall';
// import Sidebar from '@/components/Sidebar';
// import { useSidebar } from '@/context/SidebarContext';

// interface Location {
//     address: string;
//     location_name: string;
//     initial_empty_bins: number;
//     default_product_types: string[];
// }

// interface PickupData {
//     id: number;
//     pickup_location: Location;
//     pickup_date: string;
//     empty_bins_delivered: number;
//     filled_bins_collected: number;
//     products_collected: Product[];
//     status: string;
//     signature: string | null;
//     customer: { company_name: string } | null;
//     driver: { name: string } | null;
//     invoice_status: string | null;
// }

// interface Product {
//     product_name: string;
//     quantity: number;
// }

// interface BadgeProps {
//     variant?: "default" | "destructive" | "outline" | "secondary" | "success" | null | undefined;
//     // other props...
//   }

// export default function PickupDetailsPage() {
//     const searchParams = useSearchParams();
//     const pickupId = searchParams.get('id');

//     const [pickup, setPickup] = useState<PickupData | null>(null);
//     const [error, setError] = useState<string | null>(null);
//     const [isLoading, setIsLoading] = useState(true);

//     const { isSidebarOpen } = useSidebar();

//     const handleCreateInbound = async () => {
//         if (!pickup) return;

//         try {
//             // Step 1: Get product UUIDs for the collected products
//             const productIds = await Promise.all(
//                 pickup.products_collected.map(async (product) => {
//                     const { data: productData, error: productError } = await supabase
//                         .from('products')
//                         .select('id')  // Assuming 'id' is the UUID for the product
//                         .eq('name', product.product_name)  // Match product name
//                         .single();  // Ensure a single result is returned

//                     if (productError) {
//                         throw new Error(`Error fetching product ID for ${product.product_name}: ${productError.message}`);
//                     }

//                     return productData ? productData.id : null;  // Return UUID or null if not found
//                 })
//             );

//             // Filter out any products that don't have a valid product ID
//             const inboundProductLogs = productIds
//                 .filter((id) => id !== null)
//                 .map((productId, index) => ({
//                     product_id: productId,  // Use the fetched UUID here
//                     provider_id: pickup.customer?.company_name || null,
//                     quantity_received: pickup.products_collected[index].quantity,
//                     invoice_required: true,
//                     created_at: new Date(),
//                 }));

//             if (inboundProductLogs.length === 0) {
//                 throw new Error('No valid products found for inbound process.');
//             }

//             // Insert the inbound product logs
//             const { error: inboundError } = await supabase
//                 .from('inbound_product_logging')
//                 .insert(inboundProductLogs);

//             if (inboundError) throw inboundError;

//             // Step 2: Update the Pickup record
//             const { error: pickupError } = await supabase
//                 .from('pickups')
//                 .update({
//                     status: 'completed',
//                     invoice_status: 'invoiced',
//                 })
//                 .eq('id', pickup.id);

//             if (pickupError) throw pickupError;

//             // Optionally, show a success message or toast
//             window.location.reload();
//         } catch (err: unknown) {
//             // Log the full error object
//             console.error('Unexpected error during inbound process:', JSON.stringify(err, null, 2));

//             if (err && typeof err === 'object') {
//                 const errorDetails = err as { message?: string; details?: string };
//                 if (errorDetails.message) {
//                     console.error('Error message:', errorDetails.message);
//                 }
//                 if (errorDetails.details) {
//                     console.error('Error details:', errorDetails.details);
//                 }
//             } else {
//                 console.error('Error is not an object or has no message property');
//             }

//             // Handle error (you could add a toast notification here)
//         }
//     };

//     useEffect(() => {
//         const fetchPickupDetails = async () => {
//             if (!pickupId) {
//                 setError('Pickup ID is required');
//                 setIsLoading(false);
//                 return;
//             }

//             try {
//                 const { data, error } = await supabase
//                     .from('pickups')
//                     .select(
//                         `
//             id,
//             pickup_location,
//             pickup_date,
//             empty_bins_delivered,
//             filled_bins_collected,
//             products_collected,
//             status,
//             signature,
//             invoice_status,
//             customer:customer_id(company_name),
//             driver:driver_id(name)
//           `
//                     )
//                     .eq('id', pickupId)
//                     .single();

//                 if (error) throw error;

//                 const processedProducts = data.products_collected.map(
//                     (product: Product) => ({
//                         product_name:
//                             product.product_name || 'Product Name Missing',
//                         quantity: product.quantity || 0,
//                     })
//                 );

//                 const customer = Array.isArray(data.customer)
//                     ? data.customer[0]
//                     : data.customer;
//                 const driver = Array.isArray(data.driver)
//                     ? data.driver[0]
//                     : data.driver;

//                 if (data) {
//                     setPickup({
//                         ...data,
//                         products_collected: processedProducts,
//                         customer: customer
//                             ? { company_name: customer.company_name }
//                             : null,
//                         driver: driver ? { name: driver.name } : null,
//                     });
//                 } else {
//                     setError('Pickup not found');
//                 }
//             } catch (err: unknown) {
//                 if (err instanceof Error) {
//                     console.error('Error fetching pickup:', err.message);
//                 } else {
//                     console.error('An unexpected error occurred');
//                 }
//                 setError('Failed to load pickup details');
//             } finally {
//                 setIsLoading(false);
//             }
//         };

//         fetchPickupDetails();
//     }, [pickupId]);

//     if (isLoading) {
//         return (
//             <div className="flex items-center justify-center min-h-screen">
//                 <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
//             </div>
//         );
//     }

//     if (error) {
//         return (
//             <div className="container mx-auto px-4 py-8 max-w-4xl">
//                 <p className="text-red-600">Error: {error}</p>
//                 <Link href="/pickup">
//                     <Button variant="outline" className="mt-4">
//                         <ArrowLeft className="mr-2 h-4 w-4" /> Back
//                     </Button>
//                 </Link>
//             </div>
//         );
//     }

//     if (!pickup) {
//         return (
//             <div className="container mx-auto px-4 py-8 max-w-4xl">
//                 <p>No pickup data found</p>
//                 <Link href="/pickup">
//                     <Button variant="outline" className="mt-4">
//                         <ArrowLeft className="mr-2 h-4 w-4" /> Back
//                     </Button>
//                 </Link>
//             </div>
//         );
//     }

//     const locationDisplay = pickup.pickup_location.location_name
//         ? `${pickup.pickup_location.location_name} - ${pickup.pickup_location.address}`
//         : pickup.pickup_location.address;

//     return (
//         <div className="flex gap-2 bg-green-700">
//             {isSidebarOpen ? <Sidebar /> : <SidebarSmall />}
//             <div className="flex-grow">
//                 <div className="flex justify-between items-center">
//                     <Link href="/pickup">
//                         <Button variant="outline">
//                             <ArrowLeft className="mr-2 h-4 w-4" /> Back
//                         </Button>
//                     </Link>
//                     <Button
//                         className="bg-green-500 text-white hover:bg-green-600"
//                         onClick={handleCreateInbound}
//                         >
//                         <FileText className="mr-2 h-4 w-4" /> Create Inbound
//                         </Button>
//                 </div>

//                 <Card>
//                     <CardHeader>
//                         <CardTitle>Pickup Details</CardTitle>
//                     </CardHeader>
//                     <CardContent>
//                         <div className="grid grid-cols-2 gap-4">
//                             <div>
//                                 <strong>Pickup ID:</strong> {pickup.id}
//                             </div>
//                             <div>
//                                 <strong>Customer Name:</strong>{' '}
//                                 {pickup.customer?.company_name ?? 'N/A'}
//                             </div>
//                             <div>
//                                 <strong>Pickup Location:</strong>{' '}
//                                 {locationDisplay}
//                             </div>
//                             <div>
//                                 <strong>Date & Time:</strong>{' '}
//                                 {new Date(pickup.pickup_date).toLocaleString()}
//                             </div>
//                             <div>
//                                 <strong>Status:</strong> {pickup.status}
//                             </div>
//                             <div>
//                                 <strong>Driver:</strong>{' '}
//                                 {pickup.driver?.name || 'N/A'}
//                             </div>
//                         </div>
//                     </CardContent>
//                 </Card>

//                 <BinInfo
//                     emptyBinsDelivered={pickup.empty_bins_delivered}
//                     filledBinsCollected={pickup.filled_bins_collected}
//                 />

//                  <Card>
//         <CardHeader>
//           <CardTitle>Invoice Status (via Xero)</CardTitle>
//         </CardHeader>
//         {/* <CardContent>
//           <Badge variant={pickupDetails.invoiceStatus === 'Paid' ? 'success' :
//                           pickupDetails.invoiceStatus === 'Overdue' ? 'destructive' : 'default'}>
//             {pickupDetails.invoiceStatus}
//           </Badge>
//         </CardContent> */}
//         {/* {pickupId && <InvoiceStatus pickupId={pickupId} />} */}

//         <Card>
//   <CardHeader>
//   </CardHeader>
//   <CardContent>
//   <Badge
//   variant={
//     pickup.invoice_status === 'Paid' ? 'default' :
//     pickup.invoice_status === 'Overdue' ? 'destructive' : 'secondary'
//   }
//   style={
//     pickup.invoice_status === 'Pending' ? { backgroundColor: '#feeb9c', borderColor: '#ff9800' } : {}
//   }
// >
//   {pickup.invoice_status || 'Pending'}
// </Badge>

//   </CardContent>
// </Card>

//       </Card>

//                 <CustomerSignature signature={pickup.signature} />
//             </div>
//         </div>
//     );
// }

// // final code - 0
// import { supabase } from '@/config/supabaseClient';
// import BinInfo from '@/components/BinInfo';
// import CustomerSignature from '@/components/CustomerSignature';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import Link from 'next/link';
// import { ArrowLeft, FileText } from 'lucide-react';
// import { useEffect, useState } from 'react';
// import { useSearchParams } from 'next/navigation';
// import InvoiceStatus from '@/components/InvoiceStatus';

// import { Badge } from '@/components/ui/badge';

// import SidebarSmall from '@/components/SidebarSmall';
// import Sidebar from '@/components/Sidebar';
// import { useSidebar } from '@/context/SidebarContext';

// interface Location {
//     address: string;
//     location_name: string;
//     initial_empty_bins: number;
//     default_product_types: string[];
// }

// interface PickupData {
//     id: number;
//     pickup_location: Location;
//     pickup_date: string;
//     empty_bins_delivered: number;
//     filled_bins_collected: number;
//     products_collected: Product[];
//     status: string;
//     signature: string | null;
//     customer: { company_name: string } | null;
//     driver: { name: string } | null;
//     invoice_status: string | null;
// }

// interface Product {
//     product_name: string;
//     quantity: number;
// }

// export default function PickupDetailsPage() {
//     const searchParams = useSearchParams();
//     const pickupId = searchParams.get('id');

//     const [pickup, setPickup] = useState<PickupData | null>(null);
//     const [error, setError] = useState<string | null>(null);
//     const [isLoading, setIsLoading] = useState(true);

//     const { isSidebarOpen } = useSidebar();

//     const handleCreateInbound = async () => {
//         if (!pickup) return;
//         // Create inbound logic here...
//     };

//     useEffect(() => {
//         const fetchPickupDetails = async () => {
//             if (!pickupId) {
//                 setError('Pickup ID is required');
//                 setIsLoading(false);
//                 return;
//             }
//             // Fetch pickup details logic here...
//         };
//         fetchPickupDetails();
//     }, [pickupId]);

//     if (isLoading) {
//         return (
//             <div className="flex items-center justify-center min-h-screen">
//                 <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
//             </div>
//         );
//     }

//     if (error) {
//         return (
//             <div className="container mx-auto px-4 py-8 max-w-4xl">
//                 <p className="text-red-600">Error: {error}</p>
//                 <Link href="/pickup">
//                     <Button variant="outline" className="mt-4">
//                         <ArrowLeft className="mr-2 h-4 w-4" /> Back
//                     </Button>
//                 </Link>
//             </div>
//         );
//     }

//     if (!pickup) {
//         return (
//             <div className="container mx-auto px-4 py-8 max-w-4xl">
//                 <p>No pickup data found</p>
//                 <Link href="/pickup">
//                     <Button variant="outline" className="mt-4">
//                         <ArrowLeft className="mr-2 h-4 w-4" /> Back
//                     </Button>
//                 </Link>
//             </div>
//         );
//     }

//     const locationDisplay = pickup.pickup_location.location_name
//         ? `${pickup.pickup_location.location_name} - ${pickup.pickup_location.address}`
//         : pickup.pickup_location.address;

//     return (
//         <div className="flex gap-2 bg-gray-100">
//             {isSidebarOpen ? <Sidebar /> : <SidebarSmall />}
//             <div className="flex-grow p-8">
//                 <div className="flex justify-between items-center mb-6">
//                     <Link href="/pickup">
//                         <Button variant="outline" className="text-gray-600 border-gray-300 hover:bg-gray-100">
//                             <ArrowLeft className="mr-2 h-4 w-4" /> Back
//                         </Button>
//                     </Link>
//                     <Button
//                         className="bg-green-500 text-white hover:bg-green-600"
//                         onClick={handleCreateInbound}
//                     >
//                         <FileText className="mr-2 h-4 w-4" /> Create Inbound
//                     </Button>
//                 </div>

//                 {/* Pickup Details Card */}
//                 <Card className="mb-6 shadow-lg">
//                     <CardHeader className="bg-green-500 text-white">
//                         <CardTitle>Pickup Details</CardTitle>
//                     </CardHeader>
//                     <CardContent className="grid grid-cols-2 gap-4">
//                         <div>
//                             <strong>Pickup ID:</strong> {pickup.id}
//                         </div>
//                         <div>
//                             <strong>Customer Name:</strong> {pickup.customer?.company_name ?? 'N/A'}
//                         </div>
//                         <div>
//                             <strong>Pickup Location:</strong> {locationDisplay}
//                         </div>
//                         <div>
//                             <strong>Date & Time:</strong> {new Date(pickup.pickup_date).toLocaleString()}
//                         </div>
//                         <div>
//                             <strong>Status:</strong> {pickup.status}
//                         </div>
//                         <div>
//                             <strong>Driver:</strong> {pickup.driver?.name || 'N/A'}
//                         </div>
//                     </CardContent>
//                 </Card>

//                 {/* Bin Info */}
//                 <BinInfo
//                     emptyBinsDelivered={pickup.empty_bins_delivered}
//                     filledBinsCollected={pickup.filled_bins_collected}
//                 />

//                 {/* Invoice Status */}
//                 <Card className="mb-6 shadow-lg">
//                     <CardHeader>
//                         <CardTitle>Invoice Status (via Xero)</CardTitle>
//                     </CardHeader>
//                     <CardContent>
//                         <Badge
//                             variant={
//                                 pickup.invoice_status === 'Paid'
//                                     ? 'success'
//                                     : pickup.invoice_status === 'Overdue'
//                                     ? 'destructive'
//                                     : 'secondary'
//                             }
//                             className="text-center w-full py-2"
//                         >
//                             {pickup.invoice_status || 'Pending'}
//                         </Badge>
//                     </CardContent>
//                 </Card>

//                 {/* Customer Signature */}
//                 <CustomerSignature signature={pickup.signature} />
//             </div>
//         </div>
//     );
// }
// // final code -1

// 'use client';

// import { supabase } from '@/config/supabaseClient';
// import BinInfo from '@/components/BinInfo';
// import CustomerSignature from '@/components/CustomerSignature';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import Link from 'next/link';
// import { ArrowLeft, FileText } from 'lucide-react';
// import { useEffect, useState } from 'react';
// import { useSearchParams } from 'next/navigation';
// import InvoiceStatus from '@/components/InvoiceStatus';

// import { Badge } from '@/components/ui/badge';

// import SidebarSmall from '@/components/SidebarSmall';
// import Sidebar from '@/components/Sidebar';
// import { useSidebar } from '@/context/SidebarContext';

// interface Location {
//     address: string;
//     location_name: string;
//     initial_empty_bins: number;
//     default_product_types: string[];
// }

// interface PickupData {
//     id: number;
//     pickup_location: Location;
//     pickup_date: string;
//     empty_bins_delivered: number;
//     filled_bins_collected: number;
//     products_collected: Product[];
//     status: string;
//     signature: string | null;
//     customer: { company_name: string } | null;
//     driver: { name: string } | null;
//     invoice_status: string | null;
// }

// interface Product {
//     product_name: string;
//     quantity: number;
// }

// export default function PickupDetailsPage() {
//     const searchParams = useSearchParams();
//     const pickupId = searchParams.get('id');

//     const [pickup, setPickup] = useState<PickupData | null>(null);
//     const [error, setError] = useState<string | null>(null);
//     const [isLoading, setIsLoading] = useState(true);

//     const { isSidebarOpen } = useSidebar();

//     useEffect(() => {
//         const fetchPickupDetails = async () => {
//             if (!pickupId) {
//                 setError('Pickup ID is required');
//                 setIsLoading(false);
//                 return;
//             }

//             try {
//                 const { data, error } = await supabase
//                     .from('pickups')
//                     .select(
//                         `
//                         id,
//                         pickup_location,
//                         pickup_date,
//                         empty_bins_delivered,
//                         filled_bins_collected,
//                         products_collected,
//                         status,
//                         signature,
//                         invoice_status,
//                         customer:customer_id(company_name),
//                         driver:driver_id(name)
//                         `
//                     )
//                     .eq('id', pickupId)
//                     .single();

//                 if (error) throw error;

//                 const processedProducts = data.products_collected.map((product: Product) => ({
//                     product_name: product.product_name || 'Product Name Missing',
//                     quantity: product.quantity || 0,
//                 }));

//                 const customer = Array.isArray(data.customer) ? data.customer[0] : data.customer;
//                 const driver = Array.isArray(data.driver) ? data.driver[0] : data.driver;

//                 if (data) {
//                     setPickup({
//                         ...data,
//                         products_collected: processedProducts,
//                         customer: customer ? { company_name: customer.company_name } : null,
//                         driver: driver ? { name: driver.name } : null,
//                     });
//                 } else {
//                     setError('Pickup not found');
//                 }
//             } catch (err: unknown) {
//                 setError('Failed to load pickup details');
//             } finally {
//                 setIsLoading(false);
//             }
//         };

//         fetchPickupDetails();
//     }, [pickupId]);

//     if (isLoading) {
//         return (
//             <div className="flex items-center justify-center min-h-screen">
//                 <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
//             </div>
//         );
//     }

//     if (error) {
//         return (
//             <div className="container mx-auto px-6 py-8 max-w-4xl text-center">
//                 <p className="text-red-600">{error}</p>
//                 <Link href="/pickup">
//                     <Button variant="outline" className="mt-4 text-white hover:bg-gray-800">
//                         <ArrowLeft className="mr-2 h-4 w-4" /> Back
//                     </Button>
//                 </Link>
//             </div>
//         );
//     }

//     if (!pickup) {
//         return (
//             <div className="container mx-auto px-6 py-8 max-w-4xl text-center">
//                 <p>No pickup data found</p>
//                 <Link href="/pickup">
//                     <Button variant="outline" className="mt-4 text-white hover:bg-gray-800">
//                         <ArrowLeft className="mr-2 h-4 w-4" /> Back
//                     </Button>
//                 </Link>
//             </div>
//         );
//     }

//     const locationDisplay = pickup.pickup_location.location_name
//         ? `${pickup.pickup_location.location_name} - ${pickup.pickup_location.address}`
//         : pickup.pickup_location.address;

//     return (
//         <div className="flex gap-4 bg-gradient-to-r from-green-500 via-green-600 to-green-700 min-h-screen">
//             {isSidebarOpen ? <Sidebar /> : <SidebarSmall />}
//             <div className="flex-grow p-6">
//                 <div className="flex justify-between items-center mb-8">
//                     <Link href="/pickup">
//                         <Button variant="outline" className="text-white hover:bg-gray-800">
//                             <ArrowLeft className="mr-2 h-4 w-4" /> Back
//                         </Button>
//                     </Link>
//                     <Button
//                         className="bg-green-600 text-white hover:bg-green-700 rounded-full px-6 py-3"
//                         onClick={handleCreateInbound}
//                     >
//                         <FileText className="mr-2 h-4 w-4" /> Create Inbound
//                     </Button>
//                 </div>

//                 <Card className="shadow-lg rounded-lg">
//                     <CardHeader className="bg-green-600 text-white">
//                         <CardTitle className="text-2xl">Pickup Details</CardTitle>
//                     </CardHeader>
//                     <CardContent className="bg-white p-6">
//                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
//                             <div>
//                                 <strong className="text-gray-700">Pickup ID:</strong> {pickup.id}
//                             </div>
//                             <div>
//                                 <strong className="text-gray-700">Customer Name:</strong>{' '}
//                                 {pickup.customer?.company_name ?? 'N/A'}
//                             </div>
//                             <div>
//                                 <strong className="text-gray-700">Pickup Location:</strong>{' '}
//                                 {locationDisplay}
//                             </div>
//                             <div>
//                                 <strong className="text-gray-700">Date & Time:</strong>{' '}
//                                 {new Date(pickup.pickup_date).toLocaleString()}
//                             </div>
//                             <div>
//                                 <strong className="text-gray-700">Status:</strong> {pickup.status}
//                             </div>
//                             <div>
//                                 <strong className="text-gray-700">Driver:</strong>{' '}
//                                 {pickup.driver?.name || 'N/A'}
//                             </div>
//                         </div>
//                     </CardContent>
//                 </Card>

//                 <BinInfo
//                     emptyBinsDelivered={pickup.empty_bins_delivered}
//                     filledBinsCollected={pickup.filled_bins_collected}
//                 />

//                 <Card className="mt-6 shadow-lg">
//                     <CardHeader>
//                         <CardTitle className="text-xl">Invoice Status (via Xero)</CardTitle>
//                     </CardHeader>
//                     <CardContent>
//                         <Badge
//                             variant={
//                                 pickup.invoice_status === 'Paid'
//                                     ? 'success'
//                                     : pickup.invoice_status === 'Overdue'
//                                     ? 'destructive'
//                                     : 'secondary'
//                             }
//                         >
//                             {pickup.invoice_status || 'Pending'}
//                         </Badge>
//                     </CardContent>
//                 </Card>

//                 <CustomerSignature signature={pickup.signature} />
//             </div>
//         </div>
//     );
// }

// // draft
// 'use client';

// import { supabase } from '@/config/supabaseClient';
// import BinInfo from '@/components/BinInfo';
// import CustomerSignature from '@/components/CustomerSignature';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import Link from 'next/link';
// import { ArrowLeft, FileText } from 'lucide-react';
// import { useEffect, useState } from 'react';
// import { useSearchParams } from 'next/navigation';
// import InvoiceStatus from '@/components/InvoiceStatus';

// import { Badge } from '@/components/ui/badge';

// import SidebarSmall from '@/components/SidebarSmall';
// import Sidebar from '@/components/Sidebar';
// import { useSidebar } from '@/context/SidebarContext';
// import {Truck, User, MapPin, CalendarDays, CheckCircle, XCircle, Receipt } from 'lucide-react'; // Import more icons

// interface Location {
//     address: string;
//     location_name: string;
//     initial_empty_bins: number;
//     default_product_types: string[];
// }

// interface PickupData {
//     id: number;
//     pickup_location: Location;
//     pickup_date: string;
//     empty_bins_delivered: number;
//     filled_bins_collected: number;
//     products_collected: Product[];
//     status: string;
//     signature: string | null;
//     customer: { company_name: string } | null;
//     driver: { name: string } | null;
//     invoice_status: string | null;
// }

// interface Product {
//     product_name: string;
//     quantity: number;
// }

// type BadgeProps = {
//     variant?: "default" | "destructive" | "outline" | "secondary" | "success" | null | undefined;
//   };
// export default function PickupDetailsPage() {
//     const searchParams = useSearchParams();
//     const pickupId = searchParams.get('id');

//     const [pickup, setPickup] = useState<PickupData | null>(null);
//     const [error, setError] = useState<string | null>(null);
//     const [isLoading, setIsLoading] = useState(true);

//     const { isSidebarOpen } = useSidebar();

//     const handleCreateInbound = async () => {
//         if (!pickup) return;

//         try {
//             // Step 1: Get product UUIDs for the collected products
//             const productIds = await Promise.all(
//                 pickup.products_collected.map(async (product) => {
//                     const { data: productData, error: productError } = await supabase
//                         .from('products')
//                         .select('id')  // Assuming 'id' is the UUID for the product
//                         .eq('name', product.product_name)  // Match product name
//                         .single();  // Ensure a single result is returned

//                     if (productError) {
//                         throw new Error(`Error fetching product ID for ${product.product_name}: ${productError.message}`);
//                     }

//                     return productData ? productData.id : null;  // Return UUID or null if not found
//                 })
//             );

//             // Filter out any products that don't have a valid product ID
//             const inboundProductLogs = productIds
//                 .filter((id) => id !== null)
//                 .map((productId, index) => ({
//                     product_id: productId,  // Use the fetched UUID here
//                     provider_id: pickup.customer?.company_name || null,
//                     quantity_received: pickup.products_collected[index].quantity,
//                     invoice_required: true,
//                     created_at: new Date(),
//                 }));

//             if (inboundProductLogs.length === 0) {
//                 throw new Error('No valid products found for inbound process.');
//             }

//             // Insert the inbound product logs
//             const { error: inboundError } = await supabase
//                 .from('inbound_product_logging')
//                 .insert(inboundProductLogs);

//             if (inboundError) throw inboundError;

//             // Step 2: Update the Pickup record
//             const { error: pickupError } = await supabase
//                 .from('pickups')
//                 .update({
//                     status: 'completed',
//                     invoice_status: 'invoiced',
//                 })
//                 .eq('id', pickup.id);

//             if (pickupError) throw pickupError;

//             // Optionally, show a success message or toast
//             window.location.reload();
//         } catch (err: unknown) {
//             // Log the full error object
//             console.error('Unexpected error during inbound process:', JSON.stringify(err, null, 2));

//             if (err && typeof err === 'object') {
//                 const errorDetails = err as { message?: string; details?: string };
//                 if (errorDetails.message) {
//                     console.error('Error message:', errorDetails.message);
//                 }
//                 if (errorDetails.details) {
//                     console.error('Error details:', errorDetails.details);
//                 }
//             } else {
//                 console.error('Error is not an object or has no message property');
//             }

//             // Handle error (you could add a toast notification here)
//         }
//     };

//     useEffect(() => {
//         const fetchPickupDetails = async () => {
//             if (!pickupId) {
//                 setError('Pickup ID is required');
//                 setIsLoading(false);
//                 return;
//             }

//             try {
//                 const { data, error } = await supabase
//                     .from('pickups')
//                     .select(
//                         `
//             id,
//             pickup_location,
//             pickup_date,
//             empty_bins_delivered,
//             filled_bins_collected,
//             products_collected,
//             status,
//             signature,
//             invoice_status,
//             customer:customer_id(company_name),
//             driver:driver_id(name)
//           `
//                     )
//                     .eq('id', pickupId)
//                     .single();

//                 if (error) throw error;

//                 const processedProducts = data.products_collected.map(
//                     (product: Product) => ({
//                         product_name:
//                             product.product_name || 'Product Name Missing',
//                         quantity: product.quantity || 0,
//                     })
//                 );

//                 const customer = Array.isArray(data.customer)
//                     ? data.customer[0]
//                     : data.customer;
//                 const driver = Array.isArray(data.driver)
//                     ? data.driver[0]
//                     : data.driver;

//                 if (data) {
//                     setPickup({
//                         ...data,
//                         products_collected: processedProducts,
//                         customer: customer
//                             ? { company_name: customer.company_name }
//                             : null,
//                         driver: driver ? { name: driver.name } : null,
//                     });
//                 } else {
//                     setError('Pickup not found');
//                 }
//             } catch (err: unknown) {
//                 if (err instanceof Error) {
//                     console.error('Error fetching pickup:', err.message);
//                 } else {
//                     console.error('An unexpected error occurred');
//                 }
//                 setError('Failed to load pickup details');
//             } finally {
//                 setIsLoading(false);
//             }
//         };

//         fetchPickupDetails();
//     }, [pickupId]);

//     if (isLoading) {
//         return (
//             <div className="flex items-center justify-center min-h-screen">
//                 <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
//             </div>
//         );
//     }

//     if (error) {
//         return (
//             <div className="container mx-auto px-4 py-8 max-w-4xl">
//                 <p className="text-red-600">Error: {error}</p>
//                 <Link href="/pickup">
//                     <Button variant="outline" className="mt-4">
//                         <ArrowLeft className="mr-2 h-4 w-4" /> Back
//                     </Button>
//                 </Link>
//             </div>
//         );
//     }

//     if (!pickup) {
//         return (
//             <div className="container mx-auto px-4 py-8 max-w-4xl">
//                 <p>No pickup data found</p>
//                 <Link href="/pickup">
//                     <Button variant="outline" className="mt-4">
//                         <ArrowLeft className="mr-2 h-4 w-4" /> Back
//                     </Button>
//                 </Link>
//             </div>
//         );
//     }

//     const locationDisplay = pickup.pickup_location.location_name
//         ? `${pickup.pickup_location.location_name} - ${pickup.pickup_location.address}`
//         : pickup.pickup_location.address;

//     return (
//         <div className="flex min-h-screen bg-green-100"> {/* Added background color and min-height */}
//         {isSidebarOpen ? <Sidebar /> : <SidebarSmall />}
//         <div className="flex-grow p-6"> {/* Added padding */}

//             <div className="flex justify-between items-center mb-6"> {/* Added margin bottom */}
//                 <Link href="/pickup">
//                     <Button variant="outline">
//                         <ArrowLeft className="mr-2 h-4 w-4" /> Back
//                     </Button>
//                 </Link>
//                 <Button
//                     className="bg-green-500 text-white hover:bg-green-600"
//                     onClick={handleCreateInbound}
//                 >
//                     <FileText className="mr-2 h-4 w-4" /> Create Inbound
//                 </Button>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> {/* Grid layout for responsiveness */}
//             <Card className="shadow-md">
//   <CardHeader className="flex items-center space-x-2">
//     <Truck className="h-6 w-6 text-blue-500" />
//     <CardTitle>Pickup Details</CardTitle>
//   </CardHeader>
//   <CardContent className="space-y-4"> {/* Increased spacing */}
//     <div className="flex items-start"> {/* Align items to the top */}
//       <span className="font-semibold mr-2 flex-shrink-0"> {/* Prevent label from shrinking */}
//         <MapPin className="h-5 w-5 text-gray-500 mr-1" /> Location:
//       </span>
//       <div className="break-words"> {/* Allow location text to wrap */}
//         {pickup.pickup_location.location_name && ( // Conditionally render location name
//           <div className="font-medium text-gray-800"> {/* Style location name */}
//             {pickup.pickup_location.location_name}
//           </div>
//         )}
//         <div className="text-gray-600"> {/* Style address */}
//           {pickup.pickup_location.address}
//         </div>
//       </div>
//     </div>

//     {/* ... other details (Customer, Date & Time, Status, Driver, ID) */}
//        <div className="flex items-center">
//           <span className="font-semibold mr-2">Customer:</span> {/* Style label */}
//           {pickup.customer?.company_name ?? 'N/A'} {/* Style value */}
//         </div>
//         <div className="flex items-center">
//           <span className="font-semibold mr-2">Date & Time:</span>
//           {new Date(pickup.pickup_date).toLocaleString()}
//         </div>
//         <div className="flex items-center">
//         <span className="font-semibold mr-2">Status:</span>
//         <Badge
//   variant={pickup.status === 'completed' ? 'secondary' : 'secondary'}
//   className={pickup.status === 'completed' ? 'bg-green-500 text-white' : ''}>
//   {pickup.status}
// </Badge>
//         </div>
//         <div className="flex items-center">
//            <span className="font-semibold mr-2">Driver:</span>
//           {pickup.driver?.name || 'N/A'}
//         </div>
//         <div className="flex items-center">
//            <span className="font-semibold mr-2">ID:</span>
//             {pickup.id}
//          </div>
//   </CardContent>
// </Card>

// <div className="text-2xl font-bold">
//   <BinInfo
//     emptyBinsDelivered={pickup.empty_bins_delivered}
//     filledBinsCollected={pickup.filled_bins_collected}
//   />
// </div>

//                 <Card className="shadow-md">
//                     <CardHeader className="flex items-center space-x-2">
//                         <Receipt className="h-6 w-6 text-yellow-500" />
//                         <CardTitle>Invoice Status (via Xero)</CardTitle>
//                     </CardHeader>
//                     <CardContent>
//                         {pickupId && <InvoiceStatus pickupId={pickupId} />}
//                     </CardContent>
//                 </Card>

//                 <CustomerSignature signature={pickup.signature} />
//             </div>
//         </div>
//     </div>
// );
// }

// FINAL CODE
'use client';
import { supabase } from '@/config/supabaseClient';
import BinInfo from '@/components/BinInfo';
import CustomerSignature from '@/components/CustomerSignature';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import {
    ArrowLeft,
    FileText,
    Truck,
    Calendar,
    UserCircle,
    CheckCircle,
    XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import SidebarSmall from '@/components/SidebarSmall';
import Sidebar from '@/components/Sidebar';
import { useSidebar } from '@/context/SidebarContext';

interface Location {
    address: string;
    location_name: string;
    initial_empty_bins: number;
    default_product_types: string[];
}

interface PickupData {
    id: number;
    pickup_location: Location;
    pickup_date: string;
    empty_bins_delivered: number;
    filled_bins_collected: number;
    products_collected: Product[];
    status: string;
    signature: string | null;
    customer: { company_name: string } | null;
    driver: { name: string } | null;
    invoice_status: string | null;
}

interface Product {
    product_name: string;
    quantity: number;
}

export default function PickupDetailsPage() {
    const searchParams = useSearchParams();
    const pickupId = searchParams.get('id');

    const [pickup, setPickup] = useState<PickupData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const { isSidebarOpen } = useSidebar();

    useEffect(() => {
        const fetchPickupDetails = async () => {
            if (!pickupId) {
                setError('Pickup ID is required');
                setIsLoading(false);
                return;
            }

            try {
                const { data, error } = await supabase
                    .from('pickups')
                    .select(
                        `
            id, 
            pickup_location,
            pickup_date,
            empty_bins_delivered,
            filled_bins_collected,
            products_collected,
            status,
            signature,
            invoice_status, 
            customer:customer_id(company_name),
            driver:driver_id(name)
          `
                    )
                    .eq('id', pickupId)
                    .single();

                if (error) throw error;

                const processedProducts = data.products_collected.map(
                    (product: Product) => ({
                        product_name:
                            product.product_name || 'Product Name Missing',
                        quantity: product.quantity || 0,
                    })
                );

                const customer = Array.isArray(data.customer)
                    ? data.customer[0]
                    : data.customer;
                const driver = Array.isArray(data.driver)
                    ? data.driver[0]
                    : data.driver;

                if (data) {
                    setPickup({
                        ...data,
                        products_collected: processedProducts,
                        customer: customer
                            ? { company_name: customer.company_name }
                            : null,
                        driver: driver ? { name: driver.name } : null,
                    });
                } else {
                    setError('Pickup not found');
                }
            } catch (err: unknown) {
                if (err instanceof Error) {
                    console.error('Error fetching pickup:', err.message);
                } else {
                    console.error('An unexpected error occurred');
                }
                setError('Failed to load pickup details');
            } finally {
                setIsLoading(false);
            }
        };

        fetchPickupDetails();
    }, [pickupId]);

    const handleCreateInbound = async () => {
        if (!pickup) return;

        try {
            // Step 1: Get product UUIDs for the collected products
            const productIds = await Promise.all(
                pickup.products_collected.map(async (product) => {
                    const { data: productData, error: productError } =
                        await supabase
                            .from('products')
                            .select('id') // Assuming 'id' is the UUID for the product
                            .eq('name', product.product_name) // Match product name
                            .single(); // Ensure a single result is returned

                    if (productError) {
                        throw new Error(
                            `Error fetching product ID for ${product.product_name}: ${productError.message}`
                        );
                    }

                    return productData ? productData.id : null; // Return UUID or null if not found
                })
            );

            // Filter out any products that don't have a valid product ID
            const inboundProductLogs = productIds
                .filter((id) => id !== null)
                .map((productId, index) => ({
                    product_id: productId, // Use the fetched UUID here
                    provider_id: pickup.customer?.company_name || null,
                    quantity_received:
                        pickup.products_collected[index].quantity,
                    invoice_required: true,
                    created_at: new Date(),
                }));

            if (inboundProductLogs.length === 0) {
                throw new Error('No valid products found for inbound process.');
            }

            // Insert the inbound product logs
            const { error: inboundError } = await supabase
                .from('inbound_product_logging')
                .insert(inboundProductLogs);

            if (inboundError) throw inboundError;

            // Step 2: Update the Pickup record
            const { error: pickupError } = await supabase
                .from('pickups')
                .update({
                    status: 'completed',
                    invoice_status: 'invoiced',
                })
                .eq('id', pickup.id);

            if (pickupError) throw pickupError;

            // Optionally, show a success message or toast
            window.location.reload();
        } catch (err: unknown) {
            // Log the full error object
            console.error(
                'Unexpected error during inbound process:',
                JSON.stringify(err, null, 2)
            );

            if (err && typeof err === 'object') {
                const errorDetails = err as {
                    message?: string;
                    details?: string;
                };
                if (errorDetails.message) {
                    console.error('Error message:', errorDetails.message);
                }
                if (errorDetails.details) {
                    console.error('Error details:', errorDetails.details);
                }
            } else {
                console.error(
                    'Error is not an object or has no message property'
                );
            }

            // Handle error (you could add a toast notification here)
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }
    if (error) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <p className="text-red-600">Error: {error}</p>
                <Link href="/pickup">
                    <Button variant="outline" className="mt-4 gray-200">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                </Link>
            </div>
        );
    }

    if (!pickup) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <p>No pickup data found</p>
                <Link href="/pickup">
                    <Button variant="outline" className="mt-4">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                </Link>
            </div>
        );
    }

    const locationDisplay = pickup.pickup_location.location_name
        ? `${pickup.pickup_location.location_name} - ${pickup.pickup_location.address}`
        : pickup.pickup_location.address;

    return (
        <div className="flex gap-2 bg-green-50">
            {isSidebarOpen ? <Sidebar /> : <SidebarSmall />}
            <div className="flex-grow">
                <div className="flex justify-between items-center mb-4">
                    <Link href="/pickup">
                        <Button variant="outline">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back
                        </Button>
                    </Link>
                    <Button
                        className="bg-green-500 text-white hover:bg-green-400"
                        onClick={handleCreateInbound}
                    >
                        <FileText className="mr-2 h-4 w-4" /> Create Inbound
                    </Button>
                </div>

                <Card className="mb-4">
                    <CardHeader>
                        <CardTitle>
                            <Truck className="mr-2 h-6 w-6 inline-block align-middle" />{' '}
                            Pickup Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <strong>Pickup ID:</strong> {pickup.id}
                            </div>
                            <div>
                                <strong>Customer Name:</strong>{' '}
                                <UserCircle className="mr-2 h-5 w-5 inline-block align-middle" />
                                {pickup.customer?.company_name ?? 'N/A'}
                            </div>
                            <div>
                                <strong>Pickup Location:</strong>{' '}
                                <span className="inline-flex items-center">
                                    <Truck className="mr-2 h-5 w-5 inline-block align-middle" />
                                    {locationDisplay}
                                </span>
                            </div>
                            <div>
                                <strong>Date & Time:</strong>{' '}
                                <Calendar className="mr-2 h-5 w-5 inline-block align-middle" />
                                {new Date(pickup.pickup_date).toLocaleString()}
                            </div>
                            <div>
                                <strong>Status:</strong>{' '}
                                {pickup.status === 'completed' ? (
                                    <CheckCircle className="mr-2 h-5 w-5 inline-block align-middle text-green-500" />
                                ) : (
                                    <XCircle className="mr-2 h-5 w-5 inline-block align-middle text-red-500" />
                                )}
                                {pickup.status}
                            </div>
                            <div>
                                <strong>Driver:</strong>{' '}
                                <UserCircle className="mr-2 h-5 w-5 inline-block align-middle" />
                                {pickup.driver?.name || 'N/A'}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <BinInfo
                    emptyBinsDelivered={pickup.empty_bins_delivered}
                    filledBinsCollected={pickup.filled_bins_collected}
                />

                <Card className="mb-4">
                    <CardHeader>
                        <CardTitle>
                            <FileText className="mr-2 h-6 w-6 inline-block align-middle" />{' '}
                            Invoice Status (via Xero)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Badge
                            variant={
                                pickup.invoice_status === 'Paid'
                                    ? 'default'
                                    : pickup.invoice_status === 'Overdue'
                                      ? 'destructive'
                                      : 'secondary'
                            }
                            style={
                                pickup.invoice_status === 'Pending'
                                    ? {
                                          backgroundColor: '#feeb9c',
                                          borderColor: '#ff9800',
                                      }
                                    : {}
                            }
                        >
                            {pickup.invoice_status || 'Pending'}
                        </Badge>
                    </CardContent>
                </Card>

                <CustomerSignature signature={pickup.signature} />
            </div>
        </div>
    );
}
