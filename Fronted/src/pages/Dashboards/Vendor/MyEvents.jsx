// import React, { useState, useEffect } from "react";
// import { PlusCircleIcon, CalendarDaysIcon } from "@heroicons/react/24/outline";
// import axios from "axios";
// import { VITE_API_BASE_URL } from "../../../utils/api";
// import toast from "react-hot-toast";

// const MyEvents = () => {
//   const [events, setEvents] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [filter, setFilter] = useState("all");

//   // ✅ Fetch vendor events
//   useEffect(() => {
//     const fetchEvents = async () => {
//       try {
//         setLoading(true);
//         const response = await axios.get(
//           `${VITE_API_BASE_URL}/Vendor/GetvendorEventImages`,
//           { withCredentials: true }
//         );

//         if (Array.isArray(response.data?.data)) {
//           setEvents(response.data.data);
//         } else {
//           toast.error("No events found!");
//         }
//       } catch (error) {
//         console.error("Error fetching events:", error);
//         toast.error("Failed to load events.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchEvents();
//   }, []);

//   // ✅ Filter Events
//   const filteredEvents =
//     filter === "all"
//       ? events
//       : events.filter((e) => e.status?.toLowerCase() === filter);

//   return (
//     <div className="min-h-screen bg-[#f7f7f8] p-6">
//       {/* Header */}
//       <div className="flex justify-between items-center mb-6">
//         <div>
//           <h1 className="text-2xl font-semibold text-[#284b63]">My Events</h1>
//           <p className="text-gray-500 text-sm">Manage all your organized events</p>
//         </div>

//         <button
//           onClick={() => toast("Add New Event clicked")}
//           className="flex items-center gap-2 bg-[#3c6e71] hover:bg-[#284b63] text-white px-5 py-2 rounded-lg shadow-md transition"
//         >
//           <PlusCircleIcon className="h-5 w-5" />
//           Add New Event
//         </button>
//       </div>

//       {/* Filters */}
//       <div className="flex gap-3 mb-6">
//         {["all", "active", "completed", "cancelled"].map((type) => (
//           <button
//             key={type}
//             onClick={() => setFilter(type)}
//             className={`px-4 py-1.5 rounded-full text-sm font-medium border transition ${
//               filter === type
//                 ? "bg-[#3c6e71] text-white border-[#3c6e71]"
//                 : "bg-white text-gray-600 border-gray-300 hover:bg-gray-100"
//             }`}
//           >
//             {type.charAt(0).toUpperCase() + type.slice(1)}
//           </button>
//         ))}
//       </div>

//       {/* Loading */}
//       {loading && (
//         <div className="text-center text-gray-500 py-10">Loading events...</div>
//       )}

//       {/* No Events */}
//       {!loading && filteredEvents.length === 0 && (
//         <div className="text-center text-gray-500 py-10">
//           <p className="text-lg font-medium">No events found</p>
//           <p className="text-sm">Try creating your first event!</p>
//         </div>
//       )}

//       {/* Events Grid */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//         {filteredEvents.map((event) => (
//           <div
//             key={event.event_id}
//             className="bg-white rounded-2xl shadow-md hover:shadow-lg transition p-5 border-t-4 border-[#3c6e71]"
//           >
//             <div className="flex justify-between items-start mb-3">
//               <h3 className="text-lg font-semibold text-[#284b63]">
//                 {event.event_name || "Untitled Event"}
//               </h3>
//               <span
//                 className={`text-xs font-semibold px-2 py-1 rounded-full ${
//                   event.status === "Completed"
//                     ? "bg-green-100 text-green-700"
//                     : event.status === "Active"
//                     ? "bg-blue-100 text-blue-700"
//                     : event.status === "Cancelled"
//                     ? "bg-red-100 text-red-700"
//                     : "bg-gray-100 text-gray-600"
//                 }`}
//               >
//                 {event.status || "Pending"}
//               </span>
//             </div>

//             {/* Date */}
//             <div className="flex items-center text-gray-600 text-sm mb-2">
//               <CalendarDaysIcon className="h-4 w-4 mr-1 text-[#3c6e71]" />
//               <span>
//                 {new Date(event.date).toLocaleDateString("en-IN", {
//                   year: "numeric",
//                   month: "short",
//                   day: "numeric",
//                 })}
//               </span>
//             </div>

//             <p className="text-gray-600 text-sm mb-3 line-clamp-2">
//               {event.description || "No description available."}
//             </p>

//             {/* Footer */}
//             <div className="flex justify-between items-center">
//               <span className="text-[#284b63] font-semibold text-sm">
//                 ₹ {event.budget || "0"}
//               </span>

//               <button
//                 onClick={() => toast(`View event ${event.event_name}`)}
//                 className="text-[#3c6e71] hover:text-[#284b63] text-sm font-medium"
//               >
//                 View Details →
//               </button>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default MyEvents;

import React, { useState, useEffect } from "react";
import { PlusCircleIcon, CalendarDaysIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import { VITE_API_BASE_URL } from "../../../utils/api";
import toast from "react-hot-toast";

const MyEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");

  // Fetch vendor events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${VITE_API_BASE_URL}/Vendor/GetvendorEventImages`,
          { withCredentials: true }
        );

        if (Array.isArray(response.data?.data)) {
          setEvents(response.data.data);
        } else {
          toast.error("No events found!");
        }
      } catch (error) {
        console.error("Error fetching events:", error);
        toast.error("Failed to load events.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const filteredEvents =
    filter === "all"
      ? events
      : events.filter((e) => e.status?.toLowerCase() === filter.toLowerCase());

  return (
    <div className="min-h-screen bg-[#f7f7f8] p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#284b63]">My Events</h1>
          <p className="text-gray-500 text-sm">Manage all your organized events</p>
        </div>

        <button
          onClick={() => toast("Add New Event clicked")}
          className="flex items-center gap-2 bg-[#3c6e71] hover:bg-[#284b63] text-white px-5 py-2 rounded-lg shadow-md transition"
        >
          <PlusCircleIcon className="h-5 w-5" />
          Add New Event
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        {["all", "active", "completed", "cancelled"].map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition ${
              filter === type
                ? "bg-[#3c6e71] text-white border-[#3c6e71]"
                : "bg-white text-gray-600 border-gray-300 hover:bg-gray-100"
            }`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center text-gray-500 py-10">Loading events...</div>
      )}

      {/* No Events */}
      {!loading && filteredEvents.length === 0 && (
        <div className="text-center text-gray-500 py-10">
          <p className="text-lg font-medium">No events found</p>
          <p className="text-sm">Try creating your first event!</p>
        </div>
      )}

      {/* Events Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((event) => (
          <div
            key={event.event_id}
            className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 p-5 border-t-4 border-[#3c6e71]"
          >
            {/* Event Image */}
            {event.image_url && (
              <img
                src={event.image_url}
                alt="Event"
                className="w-full h-40 object-cover rounded-lg mb-4"
              />
            )}

            {/* Header */}
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-lg font-semibold text-[#284b63]">
                {event.event_name || "Untitled Event"}
              </h3>

              <span
                className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  event.status === "Completed"
                    ? "bg-green-100 text-green-700"
                    : event.status === "Active"
                    ? "bg-blue-100 text-blue-700"
                    : event.status === "Cancelled"
                    ? "bg-red-100 text-red-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {event.status || "Pending"}
              </span>
            </div>

            {/* Date */}
            <div className="flex items-center text-gray-600 text-sm mb-2">
              <CalendarDaysIcon className="h-4 w-4 mr-1 text-[#3c6e71]" />
              <span>
                {new Date(event.date).toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>

            {/* Description */}
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {event.description || "No description available."}
            </p>

            {/* Footer */}
            <div className="flex justify-between items-center">
              <span className="text-[#284b63] font-semibold text-sm">
                ₹ {event.budget || "0"}
              </span>

              <button
                onClick={() => toast(`View event ${event.event_name}`)}
                className="text-[#3c6e71] hover:text-[#284b63] text-sm font-medium transition"
              >
                View Details →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyEvents;
