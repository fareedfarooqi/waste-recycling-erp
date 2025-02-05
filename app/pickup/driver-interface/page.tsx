// 'use client';
// import React, { useState, useEffect } from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Input } from '@/components/ui/input';
// import PickupList from '@/components/PickupList';
// import { supabase } from '@/config/supabaseClient'; // Assuming supabase client is imported correctly
// import { motion } from 'framer-motion';
// import { Button } from '@/components/ui/button';
// // import SidebarSmall from '@/components/SidebarSmall';
// // import Sidebar from '@/components/Sidebar';
// // import { useSidebar } from '@/context/SidebarContext';

// // Define types for Driver and Pickup
// type Driver = {
//     id: string;
//     name: string;
//     contact_details: {
//         email: string;
//         phone?: string;
//     };
// };

// type Pickup = {
//     id: string;
//     customer_name: string;
//     pickup_location: string;
//     scheduled_datetime: string;
//     driver_id: string;
//     bins_to_deliver: string;
// };

// export default function DriverInterfacePage() {
//     const [drivers, setDrivers] = useState<Driver[]>([]); // Explicitly define the type as Driver[]
//     const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null); // For selected driver
//     const [pickups, setPickups] = useState<Pickup[]>([]); // Explicitly define the type as Pickup[]
//     const [scheduledPickups, setScheduledPickups] = useState<Pickup[]>([]); // Explicitly define the type as Pickup[] for scheduled pickups
//     const [driverId, setDriverId] = useState<string>(''); // To hold the input driver ID
//     const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false); // To track if the driver has logged in
//     // const { isSidebarOpen } = useSidebar();

//     // Fetch drivers list on component mount
//     useEffect(() => {
//         const fetchDrivers = async () => {
//             const { data, error } = await supabase
//                 .from('drivers')
//                 .select('id, name, contact_details'); // Include contact_details in the query

//             if (error) {
//                 console.error('Error fetching drivers:', error.message);
//             } else {
//                 setDrivers(data || []); // TypeScript will now understand that data is an array of Driver
//             }
//         };

//         fetchDrivers();
//     }, []);

//     // Fetch pickups when a driver is logged in
//     useEffect(() => {
//         if (!selectedDriver) return; // Don't fetch pickups if no driver is selected

//         const fetchPickups = async () => {
//             const { data, error } = await supabase
//                 .from('pickups')
//                 .select('*')
//                 .eq('driver_id', selectedDriver.id) // Assuming driver_id exists in pickups table
//                 .eq('status', 'completed');

//             if (error) {
//                 console.error('Error fetching pickups:', error.message);
//             } else {
//                 setPickups(data || []); // TypeScript will now understand that data is an array of Pickup
//             }
//         };

//         fetchPickups();
//     }, [selectedDriver]);

//     // Fetch scheduled pickups
//     useEffect(() => {
//         if (!selectedDriver) return; // Don't fetch scheduled pickups if no driver is selected

//         const fetchScheduledPickups = async () => {
//             // const { data, error } = await supabase
//             //   .from('pickups')
//             //   .select('*')
//             //   .eq('driver_id', selectedDriver.id) // Filter by driver_id
//             //   .is('status', null); // Assuming `` is null for scheduled pickups
//             const { data, error } = await supabase
//                 .from('pickups')
//                 .select('*', { count: 'exact' })
//                 .eq('driver_id', selectedDriver.id)
//                 .eq('status', 'scheduled');

//             if (error) {
//                 console.error(
//                     'Error fetching scheduled pickups:',
//                     error.message
//                 );
//             } else {
//                 setScheduledPickups(data || []); // TypeScript will now understand that data is an array of Pickup
//             }
//         };

//         fetchScheduledPickups();
//     }, [selectedDriver]);

//     const handleLogin = async () => {
//         try {
//             // Find the driver by ID from your system or database
//             const foundDriver = drivers.find(
//                 (driver) => driver.id === driverId
//             );

//             if (!foundDriver) {
//                 alert('Driver ID not found');
//                 return;
//             }

//             // After successful login, set session and driver details
//             setSelectedDriver(foundDriver);
//             setIsLoggedIn(true);

//             // Log user info for debugging
//             console.log('Logged in as', foundDriver);
//         } catch (err) {
//             console.error('Login error:', err);
//             alert(
//                 'Login failed: ' +
//                     (err instanceof Error ? err.message : 'Unknown error')
//             );
//         }
//     };
//     useEffect(() => {
//         const fetchSession = async () => {
//             // Check if the user is authenticated via Supabase session
//             const {
//                 data: { session },
//                 error: authError,
//             } = await supabase.auth.getSession();

//             if (authError || !session || !session.user) {
//                 console.log('No session found, please log in.');
//                 setIsLoggedIn(false);
//             } else {
//                 console.log('Authenticated session:', session.user);
//                 setIsLoggedIn(true);
//             }
//         };

//         fetchSession();
//     }, []);

//     return (
//         <div className="flex flex-col items-center min-h-screen bg-green-200 p-3">

//             {/* Login Section */}
//             {!isLoggedIn && (
//                 <motion.div className="w-full max-w-md bg-green-600 p-6 rounded-lg shadow-md" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
//                     <h2 className="text-white text-2xl font-semibold text-center">Driver Login</h2>
//                     <Input
//                         className="w-full bg-white p-3 my-4 text-gray-800 rounded"
//                         placeholder="Enter Driver ID"
//                         value={driverId}
//                         onChange={(e) => setDriverId(e.target.value)}
//                     />
//                     <Button className="w-full bg-white text-green-600 font-bold p-3 rounded hover:bg-gray-100" onClick={handleLogin}>
//                         Login
//                     </Button>
//                 </motion.div>
//             )}

//         <div className="flex h-screen">
//             {/* Sidebar (Collapsible) */}
//             {/* <div className={`transition-all duration-300 ${isSidebarOpen ? "w-64" : "w-20"} bg-gray-800 text-white h-full fixed left-0 top-0`}>
//                 {isSidebarOpen ? <Sidebar /> : <SidebarSmall />}
//             </div> */}
//             {/* Main Content (Shifts Based on Sidebar) */}
//             <div className="flex-1 p-6">
//                 {isLoggedIn && selectedDriver && (
//                     <>
//                         {/* Stats Section */}
//                         <div className="container mx-auto px-4 py-6">
//                             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
//                                 <Card className="bg-white shadow-sm">
//                                     <CardHeader className="pb-2">
//                                         <CardTitle className="text-sm text-green-600">
//                                             Pickups Completed
//                                         </CardTitle>
//                                     </CardHeader>
//                                     <CardContent>
//                                         <div className="text-2xl font-bold">
//                                             {pickups.length}
//                                         </div>
//                                     </CardContent>
//                                 </Card>
//                                 <Card className="bg-white shadow-sm">
//                                     <CardHeader className="pb-2">
//                                         <CardTitle className="text-sm text-green-600">
//                                             Pickups Scheduled
//                                         </CardTitle>
//                                     </CardHeader>
//                                     <CardContent>
//                                         <div className="text-2xl font-bold">
//                                             {scheduledPickups.length}
//                                         </div>
//                                     </CardContent>
//                                 </Card>
//                             </div>

//                             {/* Pickup List */}
//                             <div className="bg-white rounded-lg shadow mt-4 overflow-x-auto">
//                                 <table className="w-full">
//                                     <thead>
//                                         <tr className="bg-green-600 text-white">
//                                             <th className="px-4 py-3 text-left">Pickup ID</th>
//                                             <th className="px-4 py-3 text-left">Customer Name</th>
//                                             <th className="px-4 py-3 text-left">Pickup Location</th>
//                                             <th className="px-4 py-3 text-left">Scheduled Date & Time</th>
//                                             <th className="px-4 py-3 text-left">Assigned Driver</th>
//                                             <th className="px-4 py-3 text-center">Bins to Deliver</th>
//                                             <th className="px-4 py-3 text-center text-lg">Actions</th>
//                                         </tr>
//                                     </thead>
//                                     <tbody>
//                                         {selectedDriver ? (
//                                             <PickupList driverId={selectedDriver.id} />
//                                         ) : (
//                                             <tr>
//                                                 <td colSpan={7} className="text-center py-4">Select a driver...</td>
//                                             </tr>
//                                         )}
//                                     </tbody>
//                                 </table>
//                             </div>
//                         </div>
//                     </>
//                 )}
//             </div>
//         </div>
//             </div>
//     );
// }

// // final code
// 'use client';
// import React, { useState, useEffect } from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Input } from '@/components/ui/input';
// import PickupList from '@/components/PickupList';
// import { supabase } from '@/config/supabaseClient'; // Assuming supabase client is imported correctly
// import { motion } from 'framer-motion';
// import { Button } from '@/components/ui/button';
// import { Truck, UserCircle, Calendar, Clock } from 'lucide-react';

// type Driver = {
//     id: string;
//     name: string;
//     contact_details: {
//         email: string;
//         phone?: string;
//     };
// };

// type Pickup = {
//     id: string;
//     customer_name: string;
//     pickup_location: string;
//     scheduled_datetime: string;
//     driver_id: string;
//     bins_to_deliver: string;
// };

// export default function DriverInterfacePage() {
//     const [drivers, setDrivers] = useState<Driver[]>([]);
//     const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
//     const [pickups, setPickups] = useState<Pickup[]>([]);
//     const [scheduledPickups, setScheduledPickups] = useState<Pickup[]>([]);
//     const [driverId, setDriverId] = useState<string>('');
//     const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

//     useEffect(() => {
//         const fetchDrivers = async () => {
//             const { data, error } = await supabase
//                 .from('drivers')
//                 .select('id, name, contact_details');

//             if (error) {
//                 console.error('Error fetching drivers:', error.message);
//             } else {
//                 setDrivers(data || []);
//             }
//         };

//         fetchDrivers();
//     }, []);

//     useEffect(() => {
//         if (!selectedDriver) return;

//         const fetchPickups = async () => {
//             const { data, error } = await supabase
//                 .from('pickups')
//                 .select('*')
//                 .eq('driver_id', selectedDriver.id)
//                 .eq('status', 'completed');

//             if (error) {
//                 console.error('Error fetching pickups:', error.message);
//             } else {
//                 setPickups(data || []);
//             }
//         };

//         fetchPickups();
//     }, [selectedDriver]);

//     useEffect(() => {
//         if (!selectedDriver) return;

//         const fetchScheduledPickups = async () => {
//             const { data, error } = await supabase
//                 .from('pickups')
//                 .select('*', { count: 'exact' })
//                 .eq('driver_id', selectedDriver.id)
//                 .eq('status', 'scheduled');

//             if (error) {
//                 console.error('Error fetching scheduled pickups:', error.message);
//             } else {
//                 setScheduledPickups(data || []);
//             }
//         };

//         fetchScheduledPickups();
//     }, [selectedDriver]);

//     const handleLogin = async () => {
//         try {
//             const foundDriver = drivers.find((driver) => driver.id === driverId);

//             if (!foundDriver) {
//                 alert('Driver ID not found');
//                 return;
//             }

//             setSelectedDriver(foundDriver);
//             setIsLoggedIn(true);
//             console.log('Logged in as', foundDriver);
//         } catch (err) {
//             console.error('Login error:', err);
//             alert('Login failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
//         }
//     };

//     useEffect(() => {
//         const fetchSession = async () => {
//             const { data: { session }, error: authError } = await supabase.auth.getSession();

//             if (authError || !session || !session.user) {
//                 console.log('No session found, please log in.');
//                 setIsLoggedIn(false);
//             } else {
//                 console.log('Authenticated session:', session.user);
//                 setIsLoggedIn(true);
//             }
//         };

//         fetchSession();
//     }, []);

//     return (
//         <div className="flex flex-col items-center min-h-screen bg-green-200 p-3">
//             {!isLoggedIn && (
//                 <motion.div className="w-full max-w-md bg-green-600 p-6 rounded-lg shadow-md" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
//                     <h2 className="text-white text-2xl font-semibold text-center">
//                         <Truck className="mr-2 h-6 w-6 inline-block align-middle" />
//                         Driver Login
//                     </h2>
//                     <Input
//                         className="w-full bg-white p-3 my-4 text-gray-800 rounded"
//                         placeholder="Enter Driver ID"
//                         value={driverId}
//                         onChange={(e) => setDriverId(e.target.value)}
//                     />
//                     <Button className="w-full bg-white text-green-600 font-bold p-3 rounded hover:bg-gray-100" onClick={handleLogin}>
//                         Login
//                     </Button>
//                 </motion.div>
//             )}

//             {isLoggedIn && selectedDriver && (
//                 <div className="container mx-auto px-4 py-6 w-full">
//                     <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4">
//                         <Card className="bg-white shadow-sm">
//                             <CardHeader className="pb-2">
//                                 <CardTitle className="text-sm text-green-600">
//                                     <Truck className="mr-2 h-5 w-5 inline-block align-middle" />
//                                     Pickups Completed
//                                 </CardTitle>
//                             </CardHeader>
//                             <CardContent>
//                                 <div className="text-2xl font-bold">{pickups.length}</div>
//                             </CardContent>
//                         </Card>
//                         <Card className="bg-white shadow-sm">
//                             <CardHeader className="pb-2">
//                                 <CardTitle className="text-sm text-green-600">
//                                     <Calendar className="mr-2 h-5 w-5 inline-block align-middle" />
//                                     Pickups Scheduled
//                                 </CardTitle>
//                             </CardHeader>
//                             <CardContent>
//                                 <div className="text-2xl font-bold">{scheduledPickups.length}</div>
//                             </CardContent>
//                         </Card>
//                     </div>

//                     <div className="bg-white rounded-lg shadow mt-4 overflow-x-auto">
//                         <table className="w-full">
//                             <thead>
//                                 <tr className="bg-green-600 text-white">
//                                     <th className="px-4 py-3 text-left">
//                                         <Truck className="mr-2 h-5 w-5 inline-block align-middle" />
//                                         Pickup ID
//                                     </th>
//                                     <th className="px-4 py-3 text-left">
//                                         <UserCircle className="mr-2 h-5 w-5 inline-block align-middle" />
//                                         Customer Name
//                                     </th>
//                                     <th className="px-4 py-3 text-left">
//                                         <Truck className="mr-2 h-5 w-5 inline-block align-middle" />
//                                         Pickup Location
//                                     </th>
//                                     <th className="px-4 py-3 text-left">
//                                         <Calendar className="mr-2 h-5 w-5 inline-block align-middle" />
//                                         <Clock className="mr-2 h-5 w-5 inline-block align-middle" />
//                                         Scheduled Date & Time
//                                     </th>
//                                     <th className="px-4 py-3 text-left">
//                                         <UserCircle className="mr-2 h-5 w-5 inline-block align-middle" />
//                                         Assigned Driver
//                                     </th>
//                                     <th className="px-4 py-3 text-center">
//                                         <Truck className="mr-2 h-5 w-5 inline-block align-middle" />
//                                         Bins to Deliver
//                                     </th>
//                                     <th className="px-4 py-3 text-center text-lg">Actions</th>
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 {selectedDriver ? (
//                                     <PickupList driverId={selectedDriver.id} />
//                                 ) : (
//                                     <tr>
//                                         <td colSpan={7} className="text-center py-4">Select a driver...</td>
//                                     </tr>
//                                 )}
//                             </tbody>
//                         </table>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// }

// // FINAL CODE
// 'use client';
// import React, { useState, useEffect } from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import PickupList from '@/components/PickupList';
// import { supabase } from '@/config/supabaseClient';
// import { Truck, UserCircle, Calendar, Clock, ArrowLeft } from 'lucide-react';

// type Pickup = {
//     id: string;
//     customer_name: string;
//     pickup_location: string;
//     scheduled_datetime: string;
//     driver_id: string;
//     bins_to_deliver: string;
// };

// export default function DriverInterfacePage() {
//     const [pickups, setPickups] = useState<Pickup[]>([]);
//     const [scheduledPickups, setScheduledPickups] = useState<Pickup[]>([]);
//     const [userRole, setUserRole] = useState<string | null>(null);
//     const [driverId, setDriverId] = useState<string | null>(null);

//     useEffect(() => {
//         const fetchUserData = async () => {
//             const { data: { session }, error: sessionError } = await supabase.auth.getSession();
//             if (sessionError || !session || !session.user) {
//                 console.error('Error fetching session:', sessionError?.message);
//                 return;
//             }

//             const userId = session.user.id;

//             const { data, error } = await supabase
//                 .from('user_roles')
//                 .select('role')
//                 .eq('user_id', userId)
//                 .single();

//             if (error) {
//                 console.error('Error fetching user role:', error.message);
//             } else {
//                 setUserRole(data?.role || null);
//             }

//             setDriverId(userId);
//         };

//         fetchUserData();
//     }, []);

//     useEffect(() => {
//         const fetchPickups = async () => {
//             const { data, error } = await supabase.from('pickups').select('*').eq('status', 'completed');
//             if (error) {
//                 console.error('Error fetching pickups:', error.message);
//             } else {
//                 setPickups(data || []);
//             }
//         };

//         const fetchScheduledPickups = async () => {
//             const { data, error } = await supabase.from('pickups').select('*').eq('status', 'scheduled');
//             if (error) {
//                 console.error('Error fetching scheduled pickups:', error.message);
//             } else {
//                 setScheduledPickups(data || []);
//             }
//         };

//         fetchPickups();
//         fetchScheduledPickups();
//     }, []);

//     return (
//         <div className="flex flex-col items-center min-h-screen bg-green-50 p-3">
//             {/* Back Button (Only for Admins) */}
//             {userRole === 'admin' && (
//                 <Button onClick={() => window.history.back()} className="self-start mb-4 bg-gray-700 text-white">
//                     <ArrowLeft className="mr-2" />
//                     Back
//                 </Button>
//             )}

//             <div className="container mx-auto px-4 py-6 w-full">
//                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4">
//                     <Card className="bg-white shadow-sm">
//                         <CardHeader className="pb-2">
//                             <CardTitle className="text-sm text-green-600">
//                                 <Truck className="mr-2 h-5 w-5 inline-block align-middle" />
//                                 Pickups Completed
//                             </CardTitle>
//                         </CardHeader>
//                         <CardContent>
//                             <div className="text-2xl font-bold">{pickups.length}</div>
//                         </CardContent>
//                     </Card>
//                     <Card className="bg-white shadow-sm">
//                         <CardHeader className="pb-2">
//                             <CardTitle className="text-sm text-green-600">
//                                 <Calendar className="mr-2 h-5 w-5 inline-block align-middle" />
//                                 Pickups Scheduled
//                             </CardTitle>
//                         </CardHeader>
//                         <CardContent>
//                             <div className="text-2xl font-bold">{scheduledPickups.length}</div>
//                         </CardContent>
//                     </Card>
//                 </div>

//                 <div className="bg-white rounded-lg shadow mt-4 overflow-x-auto">
//                     <table className="w-full">
//                         <thead>
//                             <tr className="bg-green-600 text-white">
//                                 <th className="px-4 py-3 text-left">
//                                     <Truck className="mr-2 h-5 w-5 inline-block align-middle" />
//                                     Pickup ID
//                                 </th>
//                                 <th className="px-4 py-3 text-left">
//                                     <UserCircle className="mr-2 h-5 w-5 inline-block align-middle" />
//                                     Customer Name
//                                 </th>
//                                 <th className="px-4 py-3 text-left">
//                                     <Truck className="mr-2 h-5 w-5 inline-block align-middle" />
//                                     Pickup Location
//                                 </th>
//                                 <th className="px-4 py-3 text-left">
//                                     <Calendar className="mr-2 h-5 w-5 inline-block align-middle" />
//                                     <Clock className="mr-2 h-5 w-5 inline-block align-middle" />
//                                     Scheduled Date & Time
//                                 </th>
//                                 <th className="px-4 py-3 text-center">
//                                     <Truck className="mr-2 h-5 w-5 inline-block align-middle" />
//                                     Bins to Deliver
//                                 </th>
//                                 <th className="px-4 py-3 text-center text-lg">Actions</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {driverId && <PickupList driverId={driverId} />}
//                         </tbody>
//                     </table>
//                 </div>

//                 {/* Button with Role-Based Control */}
//                 <Button
//                     className={`mt-4 p-3 ${userRole === 'driver' ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white'}`}
//                     disabled={userRole === 'driver'}
//                 >
//                     {userRole === 'driver' ? 'Restricted' : 'Perform Action'}
//                 </Button>
//             </div>
//         </div>
//     );
// }

// // FINAL CODE -2 WITH THE HOOKS FILE
// 'use client';
// import React, { useState, useEffect } from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import PickupList from '@/components/PickupList';
// import { supabase } from '@/config/supabaseClient';
// import { Truck, UserCircle, Calendar, Clock, ArrowLeft } from 'lucide-react';
// import { useUserRole } from '@/hooks/useUserRole';

// type Pickup = {
//     id: string;
//     customer_name: string;
//     pickup_location: string;
//     scheduled_datetime: string;
//     driver_id: string;
//     bins_to_deliver: string;
// };

// export default function DriverInterfacePage() {
//     const [pickups, setPickups] = useState<Pickup[]>([]);
//     const [scheduledPickups, setScheduledPickups] = useState<Pickup[]>([]);
//     const [driverId, setDriverId] = useState<string | null>(null);
//     const { userRole, loading } = useUserRole();

//     useEffect(() => {
//         const fetchUserId = async () => {
//             const { data: { session } } = await supabase.auth.getSession();
//             if (session?.user) {
//                 setDriverId(session.user.id);
//             }
//         };

//         fetchUserId();
//     }, []);

//     useEffect(() => {
//         const fetchPickups = async () => {
//             const { data: completedData } = await supabase
//                 .from('pickups')
//                 .select('*')
//                 .eq('status', 'completed');
//             setPickups(completedData || []);

//             const { data: scheduledData } = await supabase
//                 .from('pickups')
//                 .select('*')
//                 .eq('status', 'scheduled');
//             setScheduledPickups(scheduledData || []);
//         };

//         fetchPickups();
//     }, []);

//     if (loading) {
//         return <div>Loading...</div>;
//     }

//     return (
//         <div className="flex flex-col items-center min-h-screen bg-green-50 p-3">
//             {/* Back Button - Only shown for admin */}
//             {userRole?.role === 'admin' && (
//                 <Button onClick={() => window.history.back()} className="self-start mb-4 bg-gray-700 text-white">
//                     <ArrowLeft className="mr-2" />
//                     Back
//                 </Button>
//             )}

//             <div className="container mx-auto px-4 py-6 w-full">
//                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4">
//                     <Card className="bg-white shadow-sm">
//                         <CardHeader className="pb-2">
//                             <CardTitle className="text-sm text-green-600">
//                                 <Truck className="mr-2 h-5 w-5 inline-block align-middle" />
//                                 Pickups Completed
//                             </CardTitle>
//                         </CardHeader>
//                         <CardContent>
//                             <div className="text-2xl font-bold">{pickups.length}</div>
//                         </CardContent>
//                     </Card>
//                     <Card className="bg-white shadow-sm">
//                         <CardHeader className="pb-2">
//                             <CardTitle className="text-sm text-green-600">
//                                 <Calendar className="mr-2 h-5 w-5 inline-block align-middle" />
//                                 Pickups Scheduled
//                             </CardTitle>
//                         </CardHeader>
//                         <CardContent>
//                             <div className="text-2xl font-bold">{scheduledPickups.length}</div>
//                         </CardContent>
//                     </Card>
//                 </div>

//                 <div className="bg-white rounded-lg shadow mt-4 overflow-x-auto">
//                     <table className="w-full">
//                         <thead>
//                             <tr className="bg-green-600 text-white">
//                                 <th className="px-4 py-3 text-left">
//                                     <Truck className="mr-2 h-5 w-5 inline-block align-middle" />
//                                     Pickup ID
//                                 </th>
//                                 <th className="px-4 py-3 text-left">
//                                     <UserCircle className="mr-2 h-5 w-5 inline-block align-middle" />
//                                     Customer Name
//                                 </th>
//                                 <th className="px-4 py-3 text-left">
//                                     <Truck className="mr-2 h-5 w-5 inline-block align-middle" />
//                                     Pickup Location
//                                 </th>
//                                 <th className="px-4 py-3 text-left">
//                                     <Calendar className="mr-2 h-5 w-5 inline-block align-middle" />
//                                     <Clock className="mr-2 h-5 w-5 inline-block align-middle" />
//                                     Scheduled Date & Time
//                                 </th>
//                                 <th className="px-4 py-3 text-center">
//                                     <Truck className="mr-2 h-5 w-5 inline-block align-middle" />
//                                     Bins to Deliver
//                                 </th>
//                                 <th className="px-4 py-3 text-center text-lg">Actions</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {driverId && <PickupList driverId={driverId} />}
//                         </tbody>
//                     </table>
//                 </div>
//             </div>
//         </div>
//     );
// }

// // FINAL CODE - 1 WITHOUT THE HOOKS FILE
'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PickupList from '@/components/PickupList';
import { supabase } from '@/config/supabaseClient';
import { Truck, UserCircle, Calendar, Clock, ArrowLeft } from 'lucide-react';

type Pickup = {
    id: string;
    customer_name: string;
    pickup_location: string;
    scheduled_datetime: string;
    driver_id: string;
    bins_to_deliver: string;
};

export default function DriverInterfacePage() {
    const [pickups, setPickups] = useState<Pickup[]>([]);
    const [scheduledPickups, setScheduledPickups] = useState<Pickup[]>([]);
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const [driverId, setDriverId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [isManager, setIsManager] = useState<boolean>(false);

    useEffect(() => {
        const fetchUserRole = async () => {
            try {
                // Get current user
                const {
                    data: { session },
                } = await supabase.auth.getSession();
                if (!session?.user) {
                    setLoading(false);
                    return;
                }

                setDriverId(session.user.id);

                // Get user's role from company_users table
                const { data: userData, error: userError } = await supabase
                    .from('company_users')
                    .select('role')
                    .eq('user_id', session.user.id)
                    .single();

                if (userError) {
                    console.error('Error fetching user role:', userError);
                    setLoading(false);
                    return;
                }

                // Set admin status based on role
                setIsAdmin(userData?.role === 'admin');
                setIsManager(userData?.role === 'manager');
                setLoading(false);
            } catch (error) {
                console.error('Error:', error);
                setLoading(false);
            }
        };

        fetchUserRole();
    }, []);

    useEffect(() => {
        const fetchPickups = async () => {
            const { data: completedData } = await supabase
                .from('pickups')
                .select('*')
                .eq('status', 'completed');
            setPickups(completedData || []);

            const { data: scheduledData } = await supabase
                .from('pickups')
                .select('*')
                .eq('status', 'scheduled');
            setScheduledPickups(scheduledData || []);
        };

        fetchPickups();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="flex flex-col items-center min-h-screen bg-green-50 p-3">
            {/* Back Button - Only shown for admin */}
            {(isAdmin || isManager) && (
                <Button
                    onClick={() => window.history.back()}
                    className="self-start mb-4 bg-gray-700 text-white"
                >
                    <ArrowLeft className="mr-2" />
                    Back
                </Button>
            )}

            <div className="container mx-auto px-4 py-6 w-full">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4">
                    <Card className="bg-white shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm text-green-600">
                                <Truck className="mr-2 h-5 w-5 inline-block align-middle" />
                                Pickups Completed
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {pickups.length}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm text-green-600">
                                <Calendar className="mr-2 h-5 w-5 inline-block align-middle" />
                                Pickups Scheduled
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {scheduledPickups.length}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="bg-white rounded-lg shadow mt-4 overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-green-600 text-white">
                                <th className="px-4 py-3 text-left">
                                    <Truck className="mr-2 h-5 w-5 inline-block align-middle" />
                                    Pickup ID
                                </th>
                                <th className="px-4 py-3 text-left">
                                    <UserCircle className="mr-2 h-5 w-5 inline-block align-middle" />
                                    Customer Name
                                </th>
                                <th className="px-4 py-3 text-left">
                                    <Truck className="mr-2 h-5 w-5 inline-block align-middle" />
                                    Pickup Location
                                </th>
                                <th className="px-4 py-3 text-left">
                                    <Calendar className="mr-2 h-5 w-5 inline-block align-middle" />
                                    <Clock className="mr-2 h-5 w-5 inline-block align-middle" />
                                    Scheduled Date & Time
                                </th>
                                <th className="px-4 py-3 text-center">
                                    <Truck className="mr-2 h-5 w-5 inline-block align-middle" />
                                    Bins to Deliver
                                </th>
                                <th className="px-4 py-3 text-center text-lg">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {driverId && <PickupList driverId={driverId} />}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

// CHAT CODE
// // FINAL CODE

// 'use client';

// import React, { useState, useEffect } from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import PickupList from '@/components/PickupList';
// import { supabase } from '@/config/supabaseClient';
// import { Truck, UserCircle, Calendar, Clock, ArrowLeft } from 'lucide-react';

// type Pickup = {
//     id: string;
//     customer_name: string;
//     pickup_location: string;
//     scheduled_datetime: string;
//     driver_id: string;
//     bins_to_deliver: string;
// };

// export default function DriverInterfacePage() {
//     const [pickups, setPickups] = useState<Pickup[]>([]);
//     const [scheduledPickups, setScheduledPickups] = useState<Pickup[]>([]);
//     const [userRole, setUserRole] = useState<string | null>(null);
//     const [driverId, setDriverId] = useState<string | null>(null);

//     useEffect(() => {
//         const fetchUserData = async () => {
//             const { data: { session }, error: sessionError } = await supabase.auth.getSession();
//             if (sessionError || !session || !session.user) {
//                 console.error('Error fetching session:', sessionError?.message);
//                 return;
//             }

//             const userId = session.user.id;

//             const { data, error } = await supabase
//                 .from('user_roles')
//                 .select('role')
//                 .eq('user_id', userId)
//                 .single();

//             if (error) {
//                 console.error('Error fetching user role:', error.message);
//             } else {
//                 setUserRole(data?.role || null);
//             }

//             setDriverId(userId);
//         };

//         fetchUserData();
//     }, []);

//     useEffect(() => {
//         const fetchPickups = async () => {
//             const { data, error } = await supabase.from('pickups').select('*').eq('status', 'completed');
//             if (error) {
//                 console.error('Error fetching pickups:', error.message);
//             } else {
//                 setPickups(data || []);
//             }
//         };

//         const fetchScheduledPickups = async () => {
//             const { data, error } = await supabase.from('pickups').select('*').eq('status', 'scheduled');
//             if (error) {
//                 console.error('Error fetching scheduled pickups:', error.message);
//             } else {
//                 setScheduledPickups(data || []);
//             }
//         };

//         fetchPickups();
//         fetchScheduledPickups();
//     }, []);

//     return (
//         <div className="flex flex-col items-center min-h-screen bg-green-50 p-3">
//             {/* Back Button (Only for Admins and Managers) */}
//             {(userRole === 'admin' || userRole === 'manager') && (
//                 <Button onClick={() => window.history.back()} className="self-start mb-4 bg-gray-700 text-white">
//                     <ArrowLeft className="mr-2" />
//                     Back
//                 </Button>
//             )}

//             <div className="container mx-auto px-4 py-6 w-full">
//                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4">
//                     <Card className="bg-white shadow-sm">
//                         <CardHeader className="pb-2">
//                             <CardTitle className="text-sm text-green-600">
//                                 <Truck className="mr-2 h-5 w-5 inline-block align-middle" />
//                                 Pickups Completed
//                             </CardTitle>
//                         </CardHeader>
//                         <CardContent>
//                             <div className="text-2xl font-bold">{pickups.length}</div>
//                         </CardContent>
//                     </Card>
//                     <Card className="bg-white shadow-sm">
//                         <CardHeader className="pb-2">
//                             <CardTitle className="text-sm text-green-600">
//                                 <Calendar className="mr-2 h-5 w-5 inline-block align-middle" />
//                                 Pickups Scheduled
//                             </CardTitle>
//                         </CardHeader>
//                         <CardContent>
//                             <div className="text-2xl font-bold">{scheduledPickups.length}</div>
//                         </CardContent>
//                     </Card>
//                 </div>

//                 <div className="bg-white rounded-lg shadow mt-4 overflow-x-auto">
//                     <table className="w-full">
//                         <thead>
//                             <tr className="bg-green-600 text-white">
//                                 <th className="px-4 py-3 text-left">
//                                     <Truck className="mr-2 h-5 w-5 inline-block align-middle" />
//                                     Pickup ID
//                                 </th>
//                                 <th className="px-4 py-3 text-left">
//                                     <UserCircle className="mr-2 h-5 w-5 inline-block align-middle" />
//                                     Customer Name
//                                 </th>
//                                 <th className="px-4 py-3 text-left">
//                                     <Truck className="mr-2 h-5 w-5 inline-block align-middle" />
//                                     Pickup Location
//                                 </th>
//                                 <th className="px-4 py-3 text-left">
//                                     <Calendar className="mr-2 h-5 w-5 inline-block align-middle" />
//                                     <Clock className="mr-2 h-5 w-5 inline-block align-middle" />
//                                     Scheduled Date & Time
//                                 </th>
//                                 <th className="px-4 py-3 text-center">
//                                     <Truck className="mr-2 h-5 w-5 inline-block align-middle" />
//                                     Bins to Deliver
//                                 </th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {driverId && <PickupList driverId={driverId} />}
//                         </tbody>
//                     </table>
//                 </div>
//             </div>
//         </div>
//     );
// }

// 'use client';
// import React, { useState, useEffect } from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Input } from '@/components/ui/input';
// import { Button } from '@/components/ui/button';
// import PickupList from '@/components/PickupList';
// import { supabase } from '@/config/supabaseClient';
// import { motion } from 'framer-motion';

// // Define types for Driver and Pickup
// type Driver = {
//     id: string;
//     name: string;
//     contact_details: {
//         email: string;
//         phone?: string;
//     };
// };

// type Pickup = {
//     id: string;
//     customer_name: string;
//     pickup_location: string;
//     scheduled_datetime: string;
//     driver_id: string;
//     bins_to_deliver: string;
// };

// export default function DriverInterfacePage() {
//     const [drivers, setDrivers] = useState<Driver[]>([]);
//     const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
//     const [pickups, setPickups] = useState<Pickup[]>([]);
//     const [scheduledPickups, setScheduledPickups] = useState<Pickup[]>([]);
//     const [driverId, setDriverId] = useState<string>('');
//     const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

//     useEffect(() => {
//         const fetchDrivers = async () => {
//             const { data, error } = await supabase.from('drivers').select('id, name, contact_details');
//             if (!error) setDrivers(data || []);
//         };
//         fetchDrivers();
//     }, []);

//     const handleLogin = () => {
//         const foundDriver = drivers.find(driver => driver.id === driverId);
//         if (foundDriver) {
//             setSelectedDriver(foundDriver);
//             setIsLoggedIn(true);
//         } else {
//             alert('Invalid Driver ID');
//         }
//     };

//     return (
//         <div className="flex flex-col items-center min-h-screen bg-white p-4">
//             {/* Login Section */}
//             {!isLoggedIn && (
//                 <motion.div className="w-full max-w-md bg-green-600 p-6 rounded-lg shadow-md" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
//                     <h2 className="text-white text-2xl font-semibold text-center">Driver Login</h2>
//                     <Input
//                         className="w-full bg-white p-3 my-4 text-gray-800 rounded"
//                         placeholder="Enter Driver ID"
//                         value={driverId}
//                         onChange={(e) => setDriverId(e.target.value)}
//                     />
//                     <Button className="w-full bg-white text-green-600 font-bold p-3 rounded hover:bg-gray-100" onClick={handleLogin}>
//                         Login
//                     </Button>
//                 </motion.div>
//             )}

//             {/* Dashboard */}
//             {isLoggedIn && selectedDriver && (
//     <div className="w-full max-w-3xl bg-white p-6 rounded-lg shadow-lg mt-6">
//         <h2 className="text-green-600 text-2xl font-semibold">
//             Welcome, {selectedDriver.name}
//         </h2>
//         <div className="grid grid-cols-2 gap-4 my-6">
//             <Card className="bg-white shadow-md">
//                 <CardHeader>
//                     <CardTitle className="text-sm text-gray-600">
//                         Pickups Completed
//                     </CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                     <div className="text-2xl font-bold text-center">{pickups.length}</div>
//                 </CardContent>
//             </Card>
//             <Card className="bg-white shadow-md">
//                 <CardHeader>
//                     <CardTitle className="text-sm text-gray-600">
//                         Pickups Scheduled
//                     </CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                     <div className="text-2xl font-bold text-center">{scheduledPickups.length}</div>
//                 </CardContent>
//             </Card>
//         </div>

//         {/* Add table wrapper around PickupList */}
//         <table className="w-full border-collapse border border-gray-300">
//             <thead>
//                 <tr>
//                     <th className="border border-gray-300 p-2">Pickup ID</th>
//                     <th className="border border-gray-300 p-2">Status</th>
//                 </tr>
//             </thead>
//             <tbody>
//                 <PickupList driverId={selectedDriver.id} />
//             </tbody>
//         </table>
//     </div>
//             )}
//         </div>
//     );
// }
