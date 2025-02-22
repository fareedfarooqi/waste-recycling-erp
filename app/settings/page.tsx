// import React, { useState } from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Input } from '@/components/ui/input';
// import { Button } from '@/components/ui/button';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { Label } from '@/components/ui/label';
// import { Textarea } from '@/components/ui/textarea';
// import { Alert, AlertDescription } from '@/components/ui/alert';
// import { User, Key, Ticket, Info } from 'lucide-react';

// const SettingsPage = () => {
//   const [passwordForm, setPasswordForm] = useState({
//     currentPassword: '',
//     newPassword: '',
//     confirmPassword: ''
//   });

//   const [profileForm, setProfileForm] = useState({
//     name: 'John Doe',
//     email: 'john@example.com',
//     avatar: '/api/placeholder/150/150'
//   });

//   const [featureRequest, setFeatureRequest] = useState('');

//   return (
//     <div className="container mx-auto p-6 max-w-4xl">
//       <h1 className="text-3xl font-bold mb-6">Settings</h1>

//       <Tabs defaultValue="profile" className="space-y-6">
//         <TabsList className="grid w-full grid-cols-4">
//           <TabsTrigger value="profile" className="flex items-center gap-2">
//             <User className="h-4 w-4" />
//             Profile
//           </TabsTrigger>
//           <TabsTrigger value="password" className="flex items-center gap-2">
//             <Key className="h-4 w-4" />
//             Password
//           </TabsTrigger>
//           <TabsTrigger value="feature-request" className="flex items-center gap-2">
//             <Ticket className="h-4 w-4" />
//             Feature Request
//           </TabsTrigger>
//           <TabsTrigger value="about" className="flex items-center gap-2">
//             <Info className="h-4 w-4" />
//             About
//           </TabsTrigger>
//         </TabsList>

//         {/* Profile Section */}
//         <TabsContent value="profile">
//           <Card>
//             <CardHeader>
//               <CardTitle>Profile Settings</CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div className="flex items-center space-x-4">
//                 <img
//                   src={profileForm.avatar}
//                   alt="Profile"
//                   className="w-24 h-24 rounded-full"
//                 />
//                 <Button>Upload Photo</Button>
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="name">Name</Label>
//                 <Input
//                   id="name"
//                   value={profileForm.name}
//                   onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
//                 />
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="email">Email</Label>
//                 <Input
//                   id="email"
//                   type="email"
//                   value={profileForm.email}
//                   onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
//                 />
//               </div>

//               <Button className="mt-4">Save Changes</Button>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         {/* Password Section */}
//         <TabsContent value="password">
//           <Card>
//             <CardHeader>
//               <CardTitle>Change Password</CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div className="space-y-2">
//                 <Label htmlFor="current-password">Current Password</Label>
//                 <Input
//                   id="current-password"
//                   type="password"
//                   value={passwordForm.currentPassword}
//                   onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
//                 />
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="new-password">New Password</Label>
//                 <Input
//                   id="new-password"
//                   type="password"
//                   value={passwordForm.newPassword}
//                   onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
//                 />
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="confirm-password">Confirm New Password</Label>
//                 <Input
//                   id="confirm-password"
//                   type="password"
//                   value={passwordForm.confirmPassword}
//                   onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
//                 />
//               </div>

//               <Button className="mt-4">Update Password</Button>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         {/* Feature Request Section */}
//         <TabsContent value="feature-request">
//           <Card>
//             <CardHeader>
//               <CardTitle>Request a Feature</CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <Alert>
//                 <AlertDescription>
//                   Your feature request will be sent to our team at support@example.com
//                 </AlertDescription>
//               </Alert>

//               <div className="space-y-2">
//                 <Label htmlFor="feature-request">Describe the feature you'd like to see</Label>
//                 <Textarea
//                   id="feature-request"
//                   value={featureRequest}
//                   onChange={(e) => setFeatureRequest(e.target.value)}
//                   rows={5}
//                   placeholder="Tell us about the feature you'd like us to add..."
//                 />
//               </div>

//               <Button className="mt-4">Submit Request</Button>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         {/* About Section */}
//         <TabsContent value="about">
//           <Card>
//             <CardHeader>
//               <CardTitle>About Our Platform</CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div className="prose">
//                 <h3 className="text-xl font-semibold mb-2">Version 1.0.0</h3>
//                 <p className="text-gray-600">
//                   Our platform is designed to help you manage and organize your work efficiently.
//                   We're constantly working to improve and add new features based on user feedback.
//                 </p>

//                 <h3 className="text-xl font-semibold mt-6 mb-2">Contact Us</h3>
//                 <p className="text-gray-600">
//                   For support: support@example.com<br />
//                   For business inquiries: business@example.com
//                 </p>

//                 <h3 className="text-xl font-semibold mt-6 mb-2">Legal</h3>
//                 <div className="space-y-2">
//                   <Button variant="link" className="p-0">Terms of Service</Button><br />
//                   <Button variant="link" className="p-0">Privacy Policy</Button>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>
//       </Tabs>
//     </div>
//   );
// };

// export default SettingsPage;

// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { FeatureRequestForm } from '@/components/FeatureRequestForm'

// export default function SettingsPage() {
//   return (
//     <div className="container mx-auto py-10">
//       <h1 className="text-3xl font-bold mb-6">Settings</h1>

//       <div className="space-y-6">
//         <Card>
//           <CardHeader>
//             <CardTitle>Change Password</CardTitle>
//             <CardDescription>Update your password here. We recommend using a strong, unique password.</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <form className="space-y-4">
//               <Input type="password" placeholder="Current Password" />
//               <Input type="password" placeholder="New Password" />
//               <Input type="password" placeholder="Confirm New Password" />
//               <Button type="submit">Update Password</Button>
//             </form>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader>
//             <CardTitle>Feature Request / Bug Report</CardTitle>
//             <CardDescription>Let us know about features you'd like to see or bugs you've encountered.</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <FeatureRequestForm />
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader>
//             <CardTitle>About Our Platform</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <p>
//               Our platform is designed to provide you with the best possible experience. We're constantly working to
//               improve and add new features based on user feedback.
//             </p>
//             <p className="mt-2">Version: 1.0.0</p>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   )
// }

// 'use client';
// import { Button } from '@/components/ui/button';
// import { FeatureRequestForm } from '@/components/FeatureRequestForm';

// export default function SettingsPage() {
//     return (
//         <div className="container mx-auto py-10">
//             <h1 className="text-3xl font-bold mb-6 text-green-500">Settings</h1>

//             <div className="space-y-6">
//                 <div className="bg-white p-6 rounded-lg shadow">
//                     <h2 className="text-xl font-semibold mb-2 text-green-500">
//                         Change Password
//                     </h2>
//                     <p className="text-gray-600 mb-4">
//                         Update your password here. We recommend using a strong,
//                         unique password.
//                     </p>
//                     <form className="space-y-4">
//                         <input
//                             type="password"
//                             placeholder="Current Password"
//                             className="w-full p-2 border rounded"
//                         />
//                         <input
//                             type="password"
//                             placeholder="New Password"
//                             className="w-full p-2 border rounded"
//                         />
//                         <input
//                             type="password"
//                             placeholder="Confirm New Password"
//                             className="w-full p-2 border rounded"
//                         />
//                         <Button
//                             type="submit"
//                             className="text-green-500 hover:text-green-700"
//                         >
//                             Update Password
//                         </Button>
//                     </form>
//                 </div>

//                 <div className="bg-white p-6 rounded-lg shadow">
//                     <h2 className="text-xl font-semibold mb-2 text-green-500">
//                         Report
//                     </h2>
//                     <p className="text-gray-600 mb-4">
//                         Let us know about features you like to see or bugs you
//                         have encountered.
//                     </p>
//                     <FeatureRequestForm />
//                 </div>

//                 <div className="bg-white p-6 rounded-lg shadow">
//                     <h2 className="text-xl font-semibold mb-2">
//                         About Our Platform
//                     </h2>
//                     <p className="text-gray-600">
//                         At Recycling & Waste ERP System, we are committed to
//                         transforming waste management through innovation. Our
//                         platform streamlines recycling and waste operations,
//                         offering efficient tracking, optimized logistics, and
//                         real-time reporting. By leveraging technology, we
//                         empower businesses and organizations to reduce waste,
//                         enhance sustainability, and drive eco-friendly
//                         initiatives. Join us in creating a cleaner, greener
//                         future!
//                     </p>
//                     {/* <p className="text-gray-600 mt-2">Version: 1.0.0</p> */}
//                 </div>
//             </div>
//         </div>
//     );
// }

// FINAL CODE
'use client';
import { Button } from '@/components/ui/button';
import { FeatureRequestForm } from '@/components/FeatureRequestForm';

export default function SettingsPage() {
    return (
        <div className="container mx-auto py-12 px-6 bg-gray-50">
            <h1 className="text-4xl font-extrabold mb-8 text-green-600 text-center">
                Settings
            </h1>

            <div className="space-y-8">
                {/* Feature Request Section */}
                <div className="bg-white p-8 rounded-lg shadow-xl hover:shadow-2xl transition-shadow duration-300 ease-in-out">
                    <h2 className="text-2xl font-semibold mb-4 text-green-600">
                        Report an Issue or Request a Feature
                    </h2>
                    <p className="text-gray-700 mb-6">
                        We are continuously improving. Let us know if you found
                        a bug or have a feature request!
                    </p>
                    <FeatureRequestForm />
                </div>

                {/* About Platform Section */}
                <div className="bg-white p-8 rounded-lg shadow-xl hover:shadow-2xl transition-shadow duration-300 ease-in-out">
                    <h2 className="text-2xl font-semibold mb-4 text-green-600">
                        About Our Platform
                    </h2>
                    <p className="text-gray-700 mb-4">
                        At Recycling & Waste ERP System, we are committed to
                        transforming waste management through innovation. Our
                        platform streamlines recycling and waste operations,
                        offering efficient tracking, optimized logistics, and
                        real-time reporting. By leveraging technology, we
                        empower businesses and organizations to reduce waste,
                        enhance sustainability, and drive eco-friendly
                        initiatives. Join us in creating a cleaner, greener
                        future!
                    </p>
                </div>
            </div>
        </div>
    );
}
