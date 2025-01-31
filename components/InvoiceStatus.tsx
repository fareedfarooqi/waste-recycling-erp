// interface InvoiceStatusProps {
//     status: string; // You can define a more specific type if needed
//   }

//   const InvoiceStatus = ({ status }: InvoiceStatusProps) => {
//     return (
//       <div>
//         <p><strong>Invoice Status:</strong> {status}</p>
//       </div>
//     );
//   };

// //   export default InvoiceStatus;
// 'use client';
// import React, { useEffect, useState } from "react";
// import { supabase } from "@/config/supabaseClient"; // Adjust the import according to your project structure

// interface InvoiceStatusProps {
//   pickupId: number;
// }

// const InvoiceStatus: React.FC<InvoiceStatusProps> = ({ pickupId }) => {
//   const [status, setStatus] = useState<string>("");

//   useEffect(() => {
//     const fetchInvoiceStatus = async () => {
//       const { data, error } = await supabase
//         .from("invoices")
//         .select("status")
//         .eq("pickup_id", pickupId)
//         .single();

//       if (data) {
//         setStatus(data.status);
//       } else {
//         console.error("Error fetching invoice status:", error);
//       }
//     };

//     fetchInvoiceStatus();
//   }, [pickupId]);

//   return (
//     <div className="invoice-status-container">
//       <h2 className="section-title">Invoice Status</h2>
//       <p>{status ? status : "Loading..."}</p>
//     </div>
//   );
// };

// export default InvoiceStatus;

// FINAL CODRE - 1

// 'use client';

// import React, { useEffect, useState } from "react";
// import { supabase } from "@/config/supabaseClient"; // Adjust the import according to your project structure
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";

// interface InvoiceStatusProps {
//   pickupId: number;
//   status?: string;

// }

// const InvoiceStatus: React.FC<InvoiceStatusProps> = ({ pickupId, status }) => {
//   const [fetchedStatus, setFetchedStatus] = useState<string | null>(null);

//   useEffect(() => {
//     if (pickupId) {
//       const fetchInvoiceStatus = async () => {
//         const { data, error } = await supabase
//           .from("invoices")
//           .select("status")
//           .eq("pickup_id", pickupId)
//           .single();

//         if (data) {
//           setFetchedStatus(data.status);
//         } else {
//           console.error("Error fetching invoice status:", error);
//         }
//       };

//       fetchInvoiceStatus();
//     }
//   }, [pickupId]);

//   const displayStatus = status || fetchedStatus || "Loading...";

//   return (
//     <div className="invoice-status-container">
//       <h2 className="section-title">Invoice Status</h2>
//       <p>{displayStatus}</p>
//     </div>
//   );
// };

// export default InvoiceStatus;

// DRAFT CODE

// const InvoiceStatus: React.FC<InvoiceStatusProps> = ({ pickupId }) => {
//   const [status, setStatus] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchInvoiceStatus = async () => {
//       const { data, error } = await supabase
//         .from("invoices")
//         .select("status")
//         .eq("pickup_id", pickupId)
//         .single();

//       if (data) {
//         setStatus(data.status);
//       } else {
//         console.error("Error fetching invoice status:", error);
//         setStatus("Unknown");
//       }
//     };

//     fetchInvoiceStatus();
//   }, [pickupId]);

//   const getBadgeVariant = (status: string | null) => {
//     switch (status) {
//       case "Paid":
//         return "default";
//       case "Overdue":
//         return "destructive";
//       case "Pending":
//         return "outline";
//       default:
//         return "secondary";
//     }
//   };

//   return (
//     <Card className="mb-4">
//       <CardHeader>
//         <CardTitle>Invoice Status (via Xero)</CardTitle>
//       </CardHeader>
//       <CardContent>
//         {status ? (
//           <Badge variant={getBadgeVariant(status)}>{status}</Badge>
//         ) : (
//           <p className="text-gray-500">Loading...</p>
//         )}
//       </CardContent>
//     </Card>
//   );
// };

// export default InvoiceStatus;

// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"

// export default function InvoiceStatus({ status }: { status: string }) {
//   return (
//     <Card className="mb-4">
//       <CardHeader>
//         <CardTitle>Invoice Status (via Xero)</CardTitle>
//       </CardHeader>
//       <CardContent>
//         <Badge variant={status === 'Paid' ? 'success' : status === 'Overdue' ? 'destructive' : 'default'}>
//           {status}
//         </Badge>
//       </CardContent>
//     </Card>
//   )
// }
// I have this error "Type '"default" | "destructive" | "success"' is not assignable to type '"default" | "destructive" | "outline" | "secondary" | null | undefined'.
//   Type '"success"' is not assignable to type '"default" | "destructive" | "outline" | "secondary" | null | undefined'.ts(2322)
// badge.tsx(10, 13): The expected type comes from property 'variant' which is declared here on type 'IntrinsicAttributes & BadgeProps'

// FINAL CODE - 2
'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/config/supabaseClient';
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';

interface InvoiceStatusProps {
    pickupId: string;
}

const InvoiceStatus: React.FC<InvoiceStatusProps> = ({ pickupId }) => {
    const [fetchedStatus, setFetchedStatus] = useState<string | null>(null);

    useEffect(() => {
        const fetchInvoiceStatus = async () => {
            const { data, error } = await supabase
                .from('invoices')
                .select('status')
                .eq('pickup_id', pickupId)
                .single();

            if (data) {
                setFetchedStatus(data.status);
            } else {
                console.error('Error fetching invoice status:', error);
            }
        };

        fetchInvoiceStatus();
    }, [pickupId]);

    return (
        <div className="mb-4">
            <h2 className="text-xl font-semibold">Invoice Status</h2>
            <Badge
                className={`px-4 py-2 rounded-full ${fetchedStatus === 'Paid' ? 'bg-green-100 text-green-800' : fetchedStatus === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}
            >
                {fetchedStatus || 'Loading...'}
            </Badge>
        </div>
    );
};

export default InvoiceStatus;

// draft
