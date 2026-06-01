import React, { useState, useEffect } from "react";
import { PlusCircleIcon, CalendarDaysIcon, TrashIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import { VITE_API_BASE_URL } from "../../../utils/api";
import toast from "react-hot-toast";

const MyEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");
  const [selectedImage, setSelectedImage] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Fetch vendor events from NEW API
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);

        const response = await axios.get(
          `${VITE_API_BASE_URL}/Vendor/GetvendorEventImages`,
          { withCredentials: true }
        );

        console.log("📸 API Response:", response.data);
        console.log("📸 Event Images:", response.data?.eventImages);

        if (Array.isArray(response.data?.eventImages)) {
          console.log("📸 Setting events with count:", response.data.eventImages.length);
          response.data.eventImages.forEach((img, idx) => {
            console.log(`  Image ${idx}:`, { imageID: img.imageID, vendor_id: img.vendor_id, url: img.imageUrl });
          });
          setEvents(response.data.eventImages);
        } else {
          toast.error("No events found!");
        }
      } catch (error) {
        console.error("Error fetching events:", error);
        
        // Handle vendor not found - redirect to profile setup
        if (error.response?.status === 404 && error.response?.data?.message === "Vendor not found") {
          toast("Please complete your vendor profile setup first!", {
            icon: "⚠️",
            duration: 4000,
          });
        } else if (error.response?.status === 401) {
          toast.error("Please log in again.");
        } else {
          toast.error("Failed to load events.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleDeletePhoto = async (imageID, e) => {
    e.stopPropagation();
    
    console.log("🗑️ Delete requested for imageID:", imageID, "Type:", typeof imageID);
    
    // Show confirmation dialog
    if (!window.confirm("Are you sure you want to delete this photo?")) {
      return;
    }

    setDeletingId(imageID);
    try {
      console.log("📤 Sending delete request with:", { imageID });
      
      const response = await axios.post(
        `${VITE_API_BASE_URL}/Vendor/DeleteEventImage`,
        { imageID },
        { withCredentials: true }
      );

      console.log("✅ Delete response:", response.status, response.data);

      if (response.status === 200) {
        // Remove the deleted image from state
        setEvents(events.filter((e) => e.imageID !== imageID));
        toast.success("Photo deleted successfully!");
      }
    } catch (error) {
      console.error("❌ Error deleting photo:", error);
      console.error("Response data:", error.response?.data);
      console.error("Status:", error.response?.status);
      
      if (error.response?.status === 404) {
        toast.error(error.response?.data?.message || "Photo not found or already deleted");
      } else if (error.response?.status === 401) {
        toast.error("Please log in again.");
      } else if (error.response?.status === 400) {
        toast.error(error.response?.data?.message || "Invalid request");
      } else {
        toast.error(error.response?.data?.error || "Failed to delete photo.");
      }
    } finally {
      setDeletingId(null);
    }
  };

  const filteredEvents =
    filter === "all"
      ? events
      : events.filter((e) => (e.status || "Active").toLowerCase() === filter.toLowerCase());

  return (
    <div className="min-h-screen bg-[#f7f7f8] p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between gap-2 items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#284b63]">My Events</h1>
          <p className="text-gray-500 text-sm">Manage all your organized events</p>
        </div>

        {/* <button
          onClick={() => toast("Add New Event clicked")}
          className="flex items-center gap-2 bg-[#3c6e71] hover:bg-[#284b63] text-white md:px-5 md:py-2  px-10 py-2 rounded-lg shadow-md transition"
        >
          <PlusCircleIcon className="h-5 w-5" />
          Add New Event
        </button> */}
      </div>

      {/* Filters */}
      {/* <div className="mb-6">
        <div className="flex flex-wrap gap-3 items-center">
          {["all", "active", "completed", "cancelled"].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`min-w-[76px] px-4 py-1.5 rounded-full text-sm font-medium border transition whitespace-nowrap ${
                filter === type
                  ? "bg-[#3c6e71] text-white border-[#3c6e71]"
                  : "bg-white text-gray-600 border-gray-300 hover:bg-gray-100"
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div> */}

      {/* Loading */}
      {loading && <div className="text-center text-gray-500 py-10">Loading events...</div>}

      {/* No Events */}
      {!loading && filteredEvents.length === 0 && (
        <div className="text-center text-gray-500 py-10">
          <p className="text-lg font-medium">No events found</p>
          <p className="text-sm">Try creating your first event!</p>
        </div>
      )}

      {/* Events Gallery */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filteredEvents.map((event) => (
          <div
            key={event.imageID}
            className="group relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300"
          >
            {event.imageUrl && (
              <img
                src={event.imageUrl}
                alt="Event"
                className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
              />
            )}
            
            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
              <button
                onClick={() => setSelectedImage(event.imageUrl)}
                className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded transition"
              >
                View
              </button>
              <button
                onClick={(e) => handleDeletePhoto(event.imageID, e)}
                disabled={deletingId === event.imageID}
                className="p-1.5 bg-red-500 hover:bg-red-600 text-white rounded transition disabled:opacity-50"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Image Modal/Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-7xl max-h-full">
            {/* Close Button */}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 text-3xl font-bold transition"
            >
              ✕
            </button>
            
            {/* Large Image */}
            <img
              src={selectedImage}
              alt="Event Full View"
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MyEvents;
