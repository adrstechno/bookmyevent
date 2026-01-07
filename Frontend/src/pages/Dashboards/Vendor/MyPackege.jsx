// import { useEffect, useState } from "react";
// import axios from "axios";
// import toast from "react-hot-toast";
// import { VITE_API_BASE_URL } from "../../../utils/api";
// import { FiEdit3, FiPackage } from "react-icons/fi";
// import { RiDeleteBin6Line } from "react-icons/ri";
// import { AiOutlinePlus, AiOutlineClose } from "react-icons/ai";
// import { MdOutlineDescription, MdOutlineAttachMoney } from "react-icons/md";

// export default function MyPackage() {
//   const [packages, setPackages] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [openModal, setOpenModal] = useState(false);
//   const [isUpdate, setIsUpdate] = useState(false);
//   const [form, setForm] = useState({ package_name: "", package_desc: "", amount: "", package_id: null });
//   const [vendorId, setVendorId] = useState(null);

//   // Fetch vendor profile to get vendor_id
//   const fetchVendorProfile = async () => {
//     try {
//       const res = await axios.get(`${VITE_API_BASE_URL}/Vendor/getvendorById`, {
//         withCredentials: true,
//       });

//       if (res.data?.vendor?.vendor_id) {
//         setVendorId(res.data.vendor.vendor_id);
//         return res.data.vendor.vendor_id;
//       }
//     } catch (e) {
//       console.error("Error fetching vendor profile:", e);
//       toast.error("Failed to fetch vendor profile");
//     }
//     return null;
//   };

//   const fetchPackages = async (vendor_id) => {
//     if (!vendor_id) {
//       console.log("No vendor_id provided");
//       return;
//     }

//     try {
//       setLoading(true);
//       const res = await axios.get(`${VITE_API_BASE_URL}/Vendor/getAllVendorPackages`, {
//         params: { vendor_id },
//         withCredentials: true,
//       });

//       console.log("API Response:", res.data);

//       // Handle the response structure: { message, count, packages: [...] }
//       const packagesData = res.data?.packages || [];
//       setPackages(Array.isArray(packagesData) ? packagesData : []);

//       if (packagesData.length === 0) {
//         toast.info("No packages found. Create your first package!");
//       }
//     } catch (e) {
//       console.error("Fetch packages error:", e);
//       toast.error(e.response?.data?.message || "Failed to load packages");
//       setPackages([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleCreate = async () => {
//     if (!form.package_name.trim()) return toast.error("Package name is required");
//     if (!form.amount || form.amount <= 0) return toast.error("Valid amount is required");

//     try {
//       // Backend extracts vendor_id from token, so we don't send it
//       await axios.post(`${VITE_API_BASE_URL}/Vendor/insertVendorPackage`, 
//         { 
//           package_name: form.package_name,
//           package_desc: form.package_desc,
//           amount: form.amount
//         }, 
//         { withCredentials: true }
//       );
//       toast.success("Package created successfully!");
//       setOpenModal(false);
//       setForm({ package_name: "", package_desc: "", amount: "", package_id: null });
//       if (vendorId) fetchPackages(vendorId);
//     } catch (e) {
//       console.error("Create error:", e);
//       toast.error(e.response?.data?.message || "Failed to create package");
//     }
//   };

//  const handleUpdate = async () => {
//   if (!form.package_name.trim()) return toast.error("Package name is required");
//   if (!form.amount || form.amount <= 0) return toast.error("Valid amount is required");

//   try {
//     const response = await axios.post(
//       `${VITE_API_BASE_URL}/Vendor/updateVendorPackage`,
//       {
//         package_name: form.package_name,
//         package_desc: form.package_desc,
//         amount: form.amount
//       },
//       {
//         params: { package_id: form.package_id },
//         withCredentials: true
//       }
//     );

//     toast.success("Package updated successfully!");
//     setOpenModal(false);
//     if (vendorId) fetchPackages(vendorId);
//   } catch (e) {
//     console.error("Update error:", e);
//     toast.error(e.response?.data?.message || "Failed to update package");
//   }
// };


//   const handleDelete = async (id) => {
//     if (!id) {
//       toast.error("Package ID is missing");
//       return;
//     }

//     if (!window.confirm("Are you sure you want to delete this package?")) return;

//     try {
//       console.log("Deleting package with ID:", id);

//       const response = await axios.delete(`${VITE_API_BASE_URL}/Vendor/deleteVendorPackage`, {
//         params: { package_id: id },
//         withCredentials: true,
//       });

//       console.log("Delete response:", response.data);
//       toast.success("Package deleted successfully!");
//       if (vendorId) fetchPackages(vendorId);
//     } catch (e) {
//       console.error("Delete error:", e);
//       console.error("Error response:", e.response?.data);
//       toast.error(e.response?.data?.message || e.response?.data?.error || "Failed to delete package");
//     }
//   };

//   const openCreate = () => {
//     setIsUpdate(false);
//     setForm({ package_name: "", package_desc: "", amount: "", package_id: null });
//     setOpenModal(true);
//   };

//   const openEdit = (pkg) => {
//     setIsUpdate(true);
//     setForm({ 
//       package_name: pkg.package_name || "",
//       package_desc: pkg.package_desc || "",
//       amount: pkg.amount || "",
//       package_id: pkg.package_id 
//     });
//     setOpenModal(true);
//   };

//   useEffect(() => {
//     const initializePage = async () => {
//       const vendor_id = await fetchVendorProfile();
//       if (vendor_id) {
//         fetchPackages(vendor_id);
//       }
//     };
//     initializePage();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header */}
//       <div className="bg-[#3c6e71] text-white shadow-md py-6 px-4 md:px-8">
//         <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
//           <div>
//             <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
//               <FiPackage className="text-3xl" />
//               My Packages
//             </h1>
//             <p className="text-gray-200 text-sm mt-1">Manage your service packages</p>
//           </div>
//           <button
//             onClick={openCreate}
//             className="bg-white text-[#3c6e71] hover:bg-gray-100 font-semibold px-6 py-3 rounded-lg shadow-lg transition-all duration-200 flex items-center gap-2 hover:scale-105"
//           >
//             <AiOutlinePlus className="text-xl" />
//             Create Package
//           </button>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="max-w-7xl mx-auto p-4 md:p-8">
//         {/* Packages Table */}
//         <div className="bg-white shadow-xl rounded-2xl border-t-4 border-[#3c6e71] overflow-hidden">
//           {loading ? (
//             <div className="flex justify-center items-center py-20">
//               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3c6e71]"></div>
//             </div>
//           ) : packages.length === 0 ? (
//             <div className="text-center py-20">
//               <FiPackage className="mx-auto text-6xl text-gray-300 mb-4" />
//               <p className="text-gray-500 text-lg">No packages found</p>
//               <p className="text-gray-400 text-sm mt-2">Create your first package to get started</p>
//             </div>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="w-full">
//                 <thead className="bg-gradient-to-r from-[#3c6e71] to-[#2f5b60] text-white">
//                   <tr>
//                     <th className="px-4 md:px-6 py-4 text-left text-sm md:text-base font-semibold">Package Name</th>
//                     <th className="px-4 md:px-6 py-4 text-left text-sm md:text-base font-semibold hidden md:table-cell">Description</th>
//                     <th className="px-4 md:px-6 py-4 text-left text-sm md:text-base font-semibold">Amount</th>
//                     <th className="px-4 md:px-6 py-4 text-center text-sm md:text-base font-semibold">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-gray-200">
//                   {packages.map((pkg, index) => (
//                     <tr 
//                       key={pkg.package_id || index} 
//                       className="hover:bg-gray-50 transition-colors duration-150"
//                     >
//                       <td className="px-4 md:px-6 py-4">
//                         <div className="flex items-center gap-2">
//                           <FiPackage className="text-[#3c6e71] text-xl hidden sm:block" />
//                           <span className="font-medium text-gray-800 text-sm md:text-base">
//                             {pkg.package_name}
//                           </span>
//                         </div>
//                       </td>
//                       <td className="px-4 md:px-6 py-4 text-gray-600 text-sm md:text-base hidden md:table-cell max-w-xs truncate">
//                         {pkg.package_desc || "No description"}
//                       </td>
//                       <td className="px-4 md:px-6 py-4">
//                         <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full font-semibold text-sm md:text-base">
//                           ₹ {pkg.amount}
//                         </span>
//                       </td>
//                       <td className="px-4 md:px-6 py-4">
//                         <div className="flex justify-center gap-2">
//                           <button
//                             onClick={() => openEdit(pkg)}
//                             className="p-2 md:p-2.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all duration-200 hover:scale-110"
//                             title="Edit Package"
//                           >
//                             <FiEdit3 className="text-lg md:text-xl" />
//                           </button>
//                           <button
//                             onClick={() => handleDelete(pkg.package_id)}
//                             className="p-2 md:p-2.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all duration-200 hover:scale-110"
//                             title="Delete Package"
//                           >
//                             <RiDeleteBin6Line className="text-lg md:text-xl" />
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Modal */}
//       {openModal && (
//         <div className="fixed inset-0 bg-white/10 backdrop-blur-md flex items-center justify-center z-50 p-4">
//           <div className="bg-white/95 backdrop-blur-xl w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-fadeIn border border-white/20">
//             {/* Modal Header */}
//             <div className="bg-gradient-to-r from-[#3c6e71] to-[#2f5b60] text-white px-6 py-5 flex justify-between items-center">
//               <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
//                 <FiPackage className="text-2xl" />
//                 {isUpdate ? "Update Package" : "Create New Package"}
//               </h2>
//               <button
//                 onClick={() => setOpenModal(false)}
//                 className="text-white hover:bg-white/20 rounded-full p-2 transition-all duration-200"
//               >
//                 <AiOutlineClose className="text-2xl" />
//               </button>
//             </div>

//             {/* Modal Body */}
//             <div className="p-6 space-y-5">
//               {/* Package Name */}
//               <div>
//                 <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
//                   <FiPackage className="text-[#3c6e71]" />
//                   Package Name
//                 </label>
//                 <input
//                   className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-[#3c6e71] focus:ring-2 focus:ring-[#3c6e71]/20 outline-none transition-all duration-200"
//                   placeholder="e.g., Premium Wedding Package"
//                   value={form.package_name}
//                   onChange={(e) => setForm({ ...form, package_name: e.target.value })}
//                 />
//               </div>

//               {/* Description */}
//               <div>
//                 <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
//                   <MdOutlineDescription className="text-[#3c6e71]" />
//                   Description
//                 </label>
//                 <textarea
//                   className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-[#3c6e71] focus:ring-2 focus:ring-[#3c6e71]/20 outline-none transition-all duration-200 resize-none"
//                   placeholder="Describe your package details..."
//                   rows="3"
//                   value={form.package_desc}
//                   onChange={(e) => setForm({ ...form, package_desc: e.target.value })}
//                 />
//               </div>

//               {/* Amount */}
//               <div>
//                 <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
//                   <MdOutlineAttachMoney className="text-[#3c6e71]" />
//                   Amount (₹)
//                 </label>
//                 <input
//                   className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-[#3c6e71] focus:ring-2 focus:ring-[#3c6e71]/20 outline-none transition-all duration-200"
//                   type="number"
//                   placeholder="Enter amount"
//                   value={form.amount}
//                   onChange={(e) => setForm({ ...form, amount: e.target.value })}
//                 />
//               </div>
//             </div>

//             {/* Modal Footer */}
//             <div className="px-6 py-4 bg-gray-50 flex flex-col sm:flex-row gap-3">
//               <button
//                 onClick={() => setOpenModal(false)}
//                 className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 rounded-lg transition-all duration-200"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={isUpdate ? handleUpdate : handleCreate}
//                 className="flex-1 bg-gradient-to-r from-[#3c6e71] to-[#2f5b60] hover:from-[#2f5b60] hover:to-[#3c6e71] text-white font-semibold py-3 rounded-lg shadow-lg transition-all duration-200 hover:scale-105"
//               >
//                 {isUpdate ? "Update Package" : "Create Package"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { VITE_API_BASE_URL } from "../../../utils/api";
import { FiEdit3, FiPackage } from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";
import { AiOutlinePlus, AiOutlineClose } from "react-icons/ai";
import { MdOutlineDescription, MdOutlineAttachMoney } from "react-icons/md";

export default function MyPackage() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);
  const [form, setForm] = useState({
    package_name: "",
    package_desc: "",
    amount: "",
    package_id: null
  });

  const [vendorId, setVendorId] = useState(null);

  // Fetch Vendor Profile
  const fetchVendorProfile = async () => {
    try {
      const res = await axios.get(`${VITE_API_BASE_URL}/Vendor/getvendorById`, {
        withCredentials: true,
      });

      if (res.data?.vendor?.vendor_id) {
        setVendorId(res.data.vendor.vendor_id);
        return res.data.vendor.vendor_id;
      }
    } catch (e) {
      console.error("Error fetching vendor:", e);
      toast.error("Failed to fetch vendor profile");
    }
    return null;
  };

  // Get All Packages
  const fetchPackages = async (vendor_id) => {
    if (!vendor_id) return;

    try {
      setLoading(true);
      const res = await axios.get(
        `${VITE_API_BASE_URL}/Vendor/getAllVendorPackages`,
        {
          params: { vendor_id },
          withCredentials: true,
        }
      );

      const data = res.data?.packages || [];
      setPackages(Array.isArray(data) ? data : []);
      console.log(data);


      if (data.length === 0) toast('No packages found!', {
        icon: '❗',
      });

    } catch (e) {
      console.error("Fetch packages error:", e);
      toast.error(
        e.response?.data?.message || "Failed to load packages"
      );
      setPackages([]);
    } finally {
      setLoading(false);
    }
  };

  // CREATE PACKAGE
  const handleCreate = async () => {
    if (!form.package_name.trim())
      return toast.error("Package name is required");

    if (!form.amount || form.amount <= 0)
      return toast.error("Valid amount required");

    try {
      await axios.post(
        `${VITE_API_BASE_URL}/Vendor/insertVendorPackage`,
        {
          package_name: form.package_name,
          package_desc: form.package_desc,
          amount: form.amount,
        },
        { withCredentials: true }
      );

      toast.success("Package created!");
      setOpenModal(false);
      setForm({ package_name: "", package_desc: "", amount: "", package_id: null });
      if (vendorId) fetchPackages(vendorId);
    } catch (e) {
      console.error("Create error:", e);
      toast.error(e.response?.data?.message || "Failed to create package");
    }
  };

  // UPDATE PACKAGE (POST with package_id in body)
  const handleUpdate = async () => {
    if (!form.package_name.trim())
      return toast.error("Package name is required");

    if (!form.amount || form.amount <= 0)
      return toast.error("Valid amount required");

    if (!form.package_id)
      return toast.error("Package ID missing!");

    try {
      console.log("Updating package:", {
        package_id: form.package_id,
        package_name: form.package_name,
        package_desc: form.package_desc,
        amount: form.amount
      });

      const response = await axios.post(
        `${VITE_API_BASE_URL}/Vendor/updateVendorPackage`,
        {
          package_id: form.package_id,
          package_name: form.package_name,
          package_desc: form.package_desc,
          amount: form.amount,
        },
        {
          withCredentials: true,
        }
      );

      console.log("Update response:", response.data);
      toast.success("Package updated successfully!");
      setOpenModal(false);
      if (vendorId) fetchPackages(vendorId);
    } catch (e) {
      console.error("Update error:", e);
      console.error("Error details:", e.response?.data);
      toast.error(e.response?.data?.message || "Failed to update");
    }
  };

  // DELETE PACKAGE (GET method with query param - matches backend route)
  const handleDelete = async (id) => {
    if (!id) return toast.error("Package ID missing");

    if (!window.confirm("Are you sure you want to delete this package?"))
      return;

    try {
      console.log("Deleting package ID:", id);

      const response = await axios.get(
        `${VITE_API_BASE_URL}/Vendor/deleteVendorPackage`,
        {
          params: { package_id: id },
          withCredentials: true,
        }
      );

      console.log("Delete response:", response.data);
      toast.success("Package deleted successfully!");
      if (vendorId) fetchPackages(vendorId);
    } catch (e) {
      console.error("Delete error:", e);
      console.error("Error details:", e.response?.data);
      toast.error(e.response?.data?.message || "Failed to delete package");
    }
  };

  const openCreate = () => {
    setIsUpdate(false);
    setForm({
      package_name: "",
      package_desc: "",
      amount: "",
      package_id: null,
    });
    setOpenModal(true);
  };

  const openEdit = (pkg) => {
    setIsUpdate(true);
    setForm({
      package_name: pkg.package_name,
      package_desc: pkg.package_desc,
      amount: pkg.amount,
      package_id: pkg.package_id,
    });
    setOpenModal(true);
  };

  useEffect(() => {
    const init = async () => {
      const id = await fetchVendorProfile();
      if (id) fetchPackages(id);
    };
    init();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#3c6e71] text-white shadow-md py-6 px-4 md:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
              <FiPackage className="text-3xl" />
              My Packages
            </h1>
            <p className="text-gray-200 text-sm mt-1">Manage your service packages</p>
          </div>

          <button
            onClick={openCreate}
            className="bg-white text-[#3c6e71] hover:bg-gray-100 font-semibold px-6 py-3 rounded-lg shadow-lg transition duration-200 flex items-center gap-2 hover:scale-105"
          >
            <AiOutlinePlus className="text-xl" /> Create Package
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="bg-white shadow-xl rounded-2xl border-t-4 border-[#3c6e71] overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3c6e71]"></div>
            </div>
          ) : packages.length === 0 ? (
            <div className="text-center py-20">
              <FiPackage className="mx-auto text-6xl text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">No packages found</p>
              <p className="text-gray-400 text-sm mt-2">Create your first package</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-[#3c6e71] to-[#2f5b60] text-white">
                  <tr>
                    <th className="px-6 py-4 text-left">Package Name</th>
                    <th className="px-6 py-4 text-left hidden md:table-cell">Description</th>
                    <th className="px-6 py-4 text-left">Amount</th>
                    <th className="px-6 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {packages.map((pkg, index) => (
                    <tr key={pkg.package_id || index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-800">
                        {pkg.package_name}
                      </td>

                      <td className="px-6 py-4 text-gray-600 hidden md:table-cell max-w-xs truncate">
                        {pkg.package_desc || "No description"}
                      </td>

                      <td className="px-6 py-4">
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">
                          ₹ {pkg.amount}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => openEdit(pkg)}
                            className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition"
                          >
                            <FiEdit3 />
                          </button>

                          <button
                            onClick={() => handleDelete(pkg.package_id)}
                            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition"
                          >
                            <RiDeleteBin6Line />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {openModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden animate-fadeIn">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#3c6e71] to-[#2f5b60] text-white px-6 py-5 flex justify-between items-center">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <FiPackage /> {isUpdate ? "Update Package" : "Create Package"}
              </h2>
              <button
                onClick={() => setOpenModal(false)}
                className="p-2 hover:bg-white/20 rounded-full"
              >
                <AiOutlineClose className="text-2xl" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">
              <div>
                <label className="block font-semibold mb-2">
                  Package Name
                </label>
                <input
                  className="w-full border rounded-lg px-4 py-3"
                  placeholder="Package name"
                  value={form.package_name}
                  onChange={(e) =>
                    setForm({ ...form, package_name: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block font-semibold mb-2">
                  Description
                </label>
                <textarea
                  className="w-full border rounded-lg px-4 py-3 resize-none"
                  rows="3"
                  placeholder="Description"
                  value={form.package_desc}
                  onChange={(e) =>
                    setForm({ ...form, package_desc: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block font-semibold mb-2">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  className="w-full border rounded-lg px-4 py-3"
                  placeholder="Amount"
                  value={form.amount}
                  onChange={(e) =>
                    setForm({ ...form, amount: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 flex gap-3">
              <button
                onClick={() => setOpenModal(false)}
                className="flex-1 bg-gray-200 py-3 rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={isUpdate ? handleUpdate : handleCreate}
                className="flex-1 bg-gradient-to-r from-[#3c6e71] to-[#2f5b60] text-white py-3 rounded-lg shadow"
              >
                {isUpdate ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
