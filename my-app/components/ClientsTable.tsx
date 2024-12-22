"use client";
import { useState, useEffect } from "react";
import { FaTrashAlt, FaEye, FaEdit } from "react-icons/fa";
import { supabase } from "@/config/supabaseClient";

type Client = {
	id: string;
	company_name: string;
	contact_details: { email: string, phone: string, address: string };
	locations: { location_name: string, address: string, initial_empty_bins: string }[];
}

/*const clients = [
  { 
    name: "Green Waste Inc.", 
    details: "555-1234, green@mail.com", 
    locations: "3 Locations", 
    bins: 3 
  },
  { 
    name: "Clean-Up Ltd.", 
    details: "999-5678, cleanup@mail.com", 
    locations: "2 Locations", 
    bins: 2 
  },
  {
    name: "Recycle Corp",
    details: "111-2222, recycle@mail.com",
    locations: "1 Location",
    bins: 3,
  },
  {
    name: "Clean City",
    details: "333-4444, eco@mail.com",
    locations: "5 Locations",
    bins: 10,
  },
  {
    name: "Recycle Heaven",
    details: "4444-3312, clean@mail.com",
    locations: "1 Location",
    bins: 11,
  },
  {
    name: "Clean Crew Ltd.",
    details: "1202-2912, greencity@mail.com",
    locations: "2 Locations",
    bins: 6,
  },
  {
    name: "Big State Ltd.",
    details: "3920-1231, cityclean@mail.com",
    locations: "6 Locations",
    bins: 12,
  },
  {
    name: "Dream Clean",
    details: "5544-3312, dreamclean@mail.com",
    locations: "11 Locations",
    bins: 15,
  },
];

const ClientsTable = (): JSX.Element => {
  return (
    <div className="overflow-x-auto border rounded-lg">
      <table className="min-w-full text-left border-collapse">
        <thead className="bg-green-200">
          <tr>
            <th className="px-4 py-2 border-b">Company Name</th>
            <th className="px-4 py-2 border-b">Company Details</th>
            <th className="px-4 py-2 border-b">Locations</th>
            <th className="px-4 py-2 border-b">Empty Bins</th>
            <th className="px-4 py-2 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client, index) => (
            <tr key={index} className="hover:bg-green-50">
              <td className="px-4 py-2 border-b">{client.name}</td>
              <td className="px-4 py-2 border-b">{client.details}</td>
              <td className="px-4 py-2 border-b">{client.locations}</td>
              <td className="px-4 py-2 border-b">{client.bins}</td>
              <td className="px-4 py-2 border-b">
                <div className="flex items-center space-x-4">
                  <FaEye className="text-gray-500 cursor-pointer hover:text-green-500" />
                  <FaEdit className="text-gray-500 cursor-pointer hover:text-green-500" />
                  <FaTrashAlt className="text-gray-500 cursor-pointer hover:text-red-500" />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};*/

const ClientsTable = (): JSX.Element => {
	const [clients, setClients] = useState<Client[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const [isViewingLocation, setIsViewingLocation] = useState<boolean>(false);
	const [customerToViewLocation, setCustomerToViewLocation] = useState<Partial<Client>>({});

	const openViewLocaitonModal = (clientId: string) => {
		const client = clients.find((client) => client.id === clientId);
		setIsViewingLocation(true);
		setCustomerToViewLocation(client as Client);
	}

	const closeViewModal = () => {
		setIsViewingLocation(false);
		setCustomerToViewLocation({});
	}

	const fetchClients = async () => {
		setLoading(true);
		
		const { data, error } = await supabase
			.from("customers")
			.select("*") // This will need to be updated with the user's id once auth is set up.

		if (error) {
			console.error("Error fetching customer: ", error.message);
			alert(error);
		} else {
			setClients(data as Client[]);
		}
		setLoading(false);
	}

	useEffect(() => {
		fetchClients();
	}, []);

	if (loading) {
		<div className="text-center py-8">Loading...</div>
	}

	return (
	  <div className="flex justify-center py-8">
		<div className="w-4/5 overflow-x-auto border rounded-lg shadow-lg">
		  <table className="min-w-full border-collapse">
			<thead className="bg-green-600 text-white text-center">
			  <tr>
				<th className="font-extrabold px-6 py-8">Company Name</th>
				<th className="font-extrabold px-6 py-8">Company Details</th>
				<th className="font-extrabold px-6 py-8">Locations</th>
				<th className="font-extrabold px-6 py-8">Total Empty Bins</th>
				<th className="font-extrabold px-6 py-8">Actions</th>
			  </tr>
			</thead>
			<tbody>
			  {clients.map((client) => (
				<tr
				  key={client.id}
				  className="hover:bg-gray-100 even:bg-gray-50 odd:bg-white text-center"
				>
				  <td className="px-6 py-8 border-b">{client.company_name}</td>
				  <td className="px-6 py-8 border-b">
					{client.contact_details.phone}<br/>
					{client.contact_details.email}<br/>
					{client.contact_details.address}
				  </td>
				  <td className="px-6 py-8 border-b">
					{client.locations.length}
					
				  </td>
				  <td className="px-6 py-8 border-b">
					{client.locations.reduce((total, location) => total + Number(location.initial_empty_bins), 0)}
				</td>
				  <td className="px-6 py-8 border-b">
					<div className="flex justify-center space-x-4">
					  <FaEye
						className="text-gray-500 cursor-pointer hover:text-green-500"
						onClick={() => openViewLocaitonModal(client.id)}
						size={18}
					  />
					  <FaEdit
						className="text-gray-500 cursor-pointer hover:text-green-500"
						size={18}
					  />
					  <FaTrashAlt
						className="text-gray-500 cursor-pointer hover:text-red-500"
						size={18}
					  />
					</div>
				  </td>
				</tr>
			  ))}
			</tbody>
		  </table>
		</div>
		{isViewingLocation && (
			<div
				className="fixed inset-0 bg-gray-700 bg-opacity-50 z-50 flex justify-center items-center"
				onClick={closeViewModal}
			>
				<div
				className="bg-white w-[90%] max-w-xl rounded-md border-[0.35rem] border-gray-300 p-6 font-sans shadow-lg relative"
				onClick={(e) => e.stopPropagation()}
				>
				<h3 className="font-bold text-lg mb-4">Client Details</h3>
				<div>
					<p><strong>Company Name: </strong>{customerToViewLocation.company_name || "N/A"}</p>
					<p><strong>Phone No: </strong>{customerToViewLocation.contact_details?.phone || "N/A"}</p>
					<p><strong>Email: </strong>{customerToViewLocation.contact_details?.email || "N/A"}</p>
					<p><strong>Address: </strong>{customerToViewLocation.contact_details?.address || "N/A"}</p>
					<p className="mt-4"><strong>Locations:</strong></p>
					{customerToViewLocation.locations && customerToViewLocation.locations.length > 0 ? (
					<ul className="mt-2 list-none space-y-4">
						{customerToViewLocation.locations.map((location, index) => (
						<li key={index} className="p-4 bg-gray-100 rounded-md">
							<p><strong>Location Name:</strong> {location.location_name || "N/A"}</p>
							<p><strong>Address:</strong> {location.address || "N/A"}</p>
							<p><strong>Initial Empty Bins:</strong> {location.initial_empty_bins || "0"}</p>
						</li>
						))}
					</ul>
					) : (
					<p>No locations available.</p>
					)}
				</div>
				<button
					className="mt-6 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
					onClick={closeViewModal}
				>
					Close
				</button>
				</div>
			</div>
		)}
	  </div>
	);
  };
  
  export default ClientsTable;





/*
					{client.locations.map((location, index) => {
						return (
							<div key={index}>
								{location.location_name}
								{location.description}
							</div>
						);
					})}



										{client.locations.map((location, index) => {
						return (
							<div key={index}>
								{location.initial_empty_bins}
							</div>
						);
					})}
*/
/*

"use client";
import { useState, useEffect } from "react";
import { FaTrashAlt, FaEye, FaEdit } from "react-icons/fa";
import { supabase } from "@/config/supabaseClient";

type Client = {
  id: string;
  company_name: string;
  contact_details: { email: string; phone: string };
  locations: { location_name: string; description: string }[];
};

const ClientsTable = (): JSX.Element => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch clients data from Supabase
  const fetchClients = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("customers") // Replace "customers" with your table name
      .select("*");

    if (error) {
      console.error("Error fetching clients:", error.message);
    } else {
      setClients(data as Client[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchClients(); // Fetch data when the component mounts
  }, []);

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="flex justify-center py-8">
      <div className="w-4/5 overflow-x-auto border rounded-lg shadow-lg">
        <table className="min-w-full border-collapse">
          <thead className="bg-green-600 text-white text-center">
            <tr>
              <th className="font-extrabold px-6 py-8">Company Name</th>
              <th className="font-extrabold px-6 py-8">Company Details</th>
              <th className="font-extrabold px-6 py-8">Locations</th>
              <th className="font-extrabold px-6 py-8">Empty Bins</th>
              <th className="font-extrabold px-6 py-8">Actions</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr
                key={client.id}
                className="hover:bg-gray-100 even:bg-gray-50 odd:bg-white text-center"
              >
                <td className="px-6 py-8 border-b">{client.company_name}</td>
                <td className="px-6 py-8 border-b">
                  Email: {client.contact_details.email}
                  <br />
                  Phone: {client.contact_details.phone}
                </td>
                <td className="px-6 py-8 border-b">
                  {client.locations.map(
                    (location, idx) => (
                      <span key={idx}>{location.location_name}</span>
                    )
                  )}
                </td>
                <td className="px-6 py-8 border-b">N/A</td>
                <td className="px-6 py-8 border-b">
                  <div className="flex justify-center space-x-4">
                    <FaEye
                      className="text-gray-500 cursor-pointer hover:text-green-500"
                      size={18}
                    />
                    <FaEdit
                      className="text-gray-500 cursor-pointer hover:text-green-500"
                      size={18}
                    />
                    <FaTrashAlt
                      className="text-gray-500 cursor-pointer hover:text-red-500"
                      size={18}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClientsTable;
*/