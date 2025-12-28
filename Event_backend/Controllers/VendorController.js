import { resolve } from "url";
import VendorModel from "../Models/VendorModel.js";
import { verifyToken } from "../Utils/Verification.js";
import { v4 as uuidv4 } from "uuid";

export const insertVendor = (req, res) => {
  // ✅ Check if file exists
  if (!req.file) {
    return res
      .status(400)
      .json({ message: "No file uploaded. Please upload a profile picture." });
  }

  const data = req.body;
  const token = req.cookies.auth_token;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }

  const userId = decoded.userId;
  // vendorData.user_id = userId;

  // // ✅ Get the Cloudinary URL from req.file
  const profile_url = req.file.path; // Cloudinary provides this
  // vendorData.is_verified = 0;
  // vendorData.is_active = 1;

  const vendorData = {
    user_id: userId,
    business_name: data.business_name,
    service_category_id: data.service_category_id,
    description: data.description,
    years_experience: data.years_experience,
    contact: data.contact,
    address: data.address,
    city: data.city,
    state: data.state,
    is_verified: 0,
    is_active: 1,
    profile_url: profile_url,
    event_profiles_url: data.event_profiles_url,
  };

  console.log(vendorData);

  VendorModel.insertVendor(vendorData, (err, result) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Error inserting vendor", error: err });
    }
    const vendor_id = result.insertId;
    const vendorSubscriptionData = {
      vendor_id: vendor_id,
      start_date: new Date(),
      end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      billing_cycle: "annual",
      status: "active",
    };

    VendorModel.insertVendorSubcription(
      vendorSubscriptionData,
      (err, subResult) => {
        if (err) {
          return res.status(500).json({
            message: "Error inserting vendor subscription",
            error: err,
          });
        }
        return res.status(200).json({
          message: "Vendor inserted successfully",
          vendorId: result.insertId,
          subscriptionId: subResult.insertId,
          profileUrl: vendorData.profile_url, // ✅ Return the URL
        });
      }
    );
  });
};

export const getAllVendor = (req, res) => {
  // Allow public access - no authentication required for viewing vendors
  VendorModel.getallVendors((err, results) => {
    if (err) {
      return res.status(500).json({
        messege: "Error getting vendors",
        error: err,
      });
    }
    res.status(200).json(results);
  });
};

export const AddEventImages = async (req, res) => {
  try {
    //  Verify token
    const token = req.cookies.auth_token;
    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }

    // 2️⃣ Get vendor_id using a promisified helper
    const vendor_id = await promisifyFindVendorID(decoded.userId);
    if (!vendor_id) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    console.log("✅ Vendor ID:", vendor_id);

    // 3️⃣ Validate uploaded files
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const imagePaths = req.files.map((file) => file.path);

    // 4️⃣ Insert all images for this vendor
    const results = await Promise.all(
      imagePaths.map((url) => promisifyAddEventImages(vendor_id, url))
    );

    return res.status(200).json({
      message: "Event images added successfully",
      count: results.length,
      results,
    });
  } catch (err) {
    console.error("❌ Error adding event images:", err);
    return res.status(500).json({
      message: "Error adding event images",
      error: err.message,
    });
  }
};

// 🧩 Promisify vendor lookup
const promisifyFindVendorID = (decodedUserID) => {
  return new Promise((resolve, reject) => {
    VendorModel.findVendorID(decodedUserID, (err, result) => {
      if (err) return reject(err);
      if (!result || result.length === 0) return resolve(null);
      resolve(result[0].vendor_id);
    });
  });
};

// 🧩 Promisify image insert
const promisifyAddEventImages = (vendor_id, url) => {
  return new Promise((resolve, reject) => {
    const data = { vendor_id, event_profiles_url: url };
    VendorModel.addEventImages(data, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
};

export const getvendorById = async (req, res) => {
  try {
    const token = req.cookies.auth_token;

    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }

    const vendor = await new Promise((resolve, reject) => {
      VendorModel.findVendor(decoded.userId, (err, result) => {
        if (err) {
          console.error("Error fetching vendor:", err);
          reject(err);
        } else {
          resolve(result && result.length > 0 ? result[0] : null);
        }
      });
    });

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    return res
      .status(200)
      .json({ message: "Vendor retrieved successfully", vendor });
  } catch (err) {
    console.error("Error getting vendor:", err);
    return res
      .status(500)
      .json({ error: "Server error", details: err.message });
  }
};

export const updateVendorProfile = async (req, res) => {
  try {
    const data = req.body;
    const profile_url = req.file?.path;

    // Validate token
    const token = req.cookies.auth_token;
    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized: User not logged in" });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }

    // Find vendor ID
    const vendor_id = await new Promise((resolve, reject) => {
      VendorModel.findVendorID(decoded.userId, (err, result) => {
        if (err) {
          reject(err);
        } else if (!result || result.length === 0) {
          resolve(null);
        } else {
          resolve(result[0].vendor_id);
        }
      });
    });

    if (!vendor_id) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    // Prepare update data
    const updateData = {
      ...data,
      ...(profile_url && { profile_url }),
    };

    // Update vendor profile
    await new Promise((resolve, reject) => {
      VendorModel.updateVendor(vendor_id, updateData, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });

    return res.status(200).json({
      message: "Vendor profile updated successfully",
      vendor_id,
    });
  } catch (err) {
    console.error("Error updating vendor profile:", err);
    return res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};

export const VendorShift = async (req, res) => {
  try {
    const token = req.cookies.auth_token;

    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized: User not logged in" });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }

    const { shift_name, start_time, end_time, days_of_week } = req.body;

    // Validate input
    if (!shift_name || !start_time || !end_time || !days_of_week) {
      return res.status(400).json({
        message: "All fields required. days_of_week must be an array",
      });
    }

    const vendor_id = await new Promise((resolve, reject) => {
      VendorModel.findVendorID(decoded.userId, (err, result) => {
        if (err) reject(err);
        else resolve(result?.[0]?.vendor_id || null);
      });
    });

    if (!vendor_id) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    await new Promise((resolve, reject) => {
      VendorModel.insertVendorShift(
        {
          vendor_id,
          shift_name,
          start_time,
          end_time,
          days_of_week,
          is_active: true,
        },
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      );
    });

    return res.status(201).json({ message: "Shift added successfully" });
  } catch (err) {
    console.error("Error adding shift:", err);
    return res
      .status(500)
      .json({ error: "Server error", details: err.message });
  }
};

export const getVendorShiftforVendor = async (req, res) => {
  try {
    const token = req.cookies.auth_token;
    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized: User not logged in" });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }

    const vendor_id = await new Promise((resolve, reject) => {
      VendorModel.findVendorID(decoded.userId, (err, result) => {
        if (err) reject(err);
        else resolve(result?.[0]?.vendor_id || null);
      });
    });

    if (!vendor_id) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    const shifts = await new Promise((resolve, reject) => {
      VendorModel.getVendorShifts(vendor_id, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    if (!shifts || shifts.length === 0) {
      return res.status(200).json({ message: "No shifts found", shifts: [] });
    }

    return res.status(200).json({
      message: "Shifts retrieved successfully",
      count: shifts.length,
      shifts,
    });
  } catch (err) {
    console.error("Error fetching shifts:", err);
    return res
      .status(500)
      .json({ error: "Server error", details: err.message });
  }
};

export const GetvendorEventImages = async (req, res) => {
  try {
    let vendor_id = req.query.vendor_id;

    // If vendor_id not provided, try to derive it from auth token
    if (!vendor_id) {
      const token = req.cookies.auth_token;
      if (!token) {
        return res
          .status(401)
          .json({ message: "Unauthorized: No token provided and vendor_id missing" });
      }

      const decoded = verifyToken(token);
      if (!decoded) {
        return res.status(401).json({ message: "Unauthorized: Invalid token" });
      }

      const foundVendorId = await new Promise((resolve, reject) => {
        VendorModel.findVendorID(decoded.userId, (err, result) => {
          if (err) return reject(err);
          resolve(result && result.length > 0 ? result[0].vendor_id : null);
        });
      });

      if (!foundVendorId) {
        return res.status(404).json({ message: "Vendor not found" });
      }

      vendor_id = foundVendorId;
    }

    // Directly use vendor_id to get event images
    const eventImages = await new Promise((resolve, reject) => {
      VendorModel.getEventImages(vendor_id, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });

    return res.status(200).json({
      message: "Event images retrieved successfully",
      count: eventImages.length,
      eventImages,
    });
  } catch (err) {
    console.error("Error fetching event images:", err);
    return res
      .status(500)
      .json({ error: "Server error", details: err.message });
  }
};

export const updateVendorShiftbyId = async (req, res) => {
  try {
    const token = req.cookies.auth_token;
    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized: User not logged in" });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }

    const { shift_id, shift_name, start_time, end_time, days_of_week } =
      req.body;

    if (!shift_id || !shift_name || !start_time || !end_time || !days_of_week) {
      return res.status(400).json({
        message: "All fields required. days_of_week must be an array",
      });
    }

    const ShiftData = {
      shift_name,
      start_time,
      end_time,
      days_of_week,
      is_active: true,
    };

    const updateVendorShift = await new Promise((resolve, reject) => {
      VendorModel.updateVendorShift(shift_id, ShiftData, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    if (updateVendorShift.affectedRows === 0) {
      return res.status(404).json({ message: "Shift not found" });
    } else {
      return res.status(200).json({ message: "Shift updated successfully" });
    }
  } catch (err) {
    console.error("Error updating shift:", err);
    return res.status(500).json({ error: "Server error", details: err.message });
  }
};

export const deleteVendorShiftbyId = async (req, res) => {
  try {
    const token = req.cookies.auth_token;
    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized: User not logged in" });
    }
    
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
    
    const {shift_id} = req.query;
    if (!shift_id) {
      return res.status(400).json({ message: "shift_id is required" });
    }
    const deleteShift = await new Promise((resolve, reject) => {
      VendorModel.deleteVendorShift(shift_id, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    }
    );
    
    if (deleteShift.affectedRows === 0) {
      return res.status(404).json({ message: "Shift not found" });
    } else {
      return res.status(200).json({ message: "Shift deleted successfully" });
    }
  }
  catch (err) {
    console.error("Error deleting shift:", err);
    return res.status(500).json({ error: "Server error", details: err.message });
  }
};

export const insertVendorPackage = (req, res) => {
  try {
    const data = req.body;
    const token = req.cookies.auth_token;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }

    const userId = decoded.userId;

    // Find vendor ID and handle insertion in callback
    VendorModel.findVendorID(userId, (err, result) => {
      if (err) {
        return res.status(500).json({ message: "Error finding vendor", error: err });
      }

      if (!result || result.length === 0) {
        return res.status(404).json({ message: "Vendor not found" });
      }

      const vendor_id = result[0].vendor_id;
      const package_uuid = uuidv4();

      const packageData = {
        package_uuid: package_uuid,
        vendor_id: vendor_id,
        package_name: data.package_name,
        package_desc: data.package_desc,
        amount: data.amount,
      };

      VendorModel.insertVendorPackage(packageData, (err, result) => {
        if (err) {
          return res.status(500).json({ message: "Error inserting vendor package", error: err });
        }

        return res.status(200).json({
          message: "Vendor package inserted successfully",
          packageId: result.insertId
        });
      });
    });
  } catch (err) {
    console.error("Error inserting vendor package:", err);
    return res.status(500).json({ error: "Server error", details: err.message });
  }
};

export const updateVendorPackage = (req, res) => {
  try {
    const data = req.body;
   const {package_id} = req.body;
    
    const token = req.cookies.auth_token;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }
    
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
    
    VendorModel.updateVendorPackage(package_id, data, (err, result) => {
      if (err) {
        return res.status(500).json({ message: "Error updating vendor package", error: err });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Vendor package not found" });
      }
      return res.status(200).json({ message: "Vendor package updated successfully" });
    });
  }
  catch (err) {
    console.error("Error updating vendor package:", err);
    return res.status(500).json({ error: "Server error", details: err.message });
  }
};
 
export const deleteVendorPackage = (req, res) => {
  try{ 
    const {package_id} = req.query;
    
    const token = req.cookies.auth_token;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }
    
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
    
    VendorModel.deleteVendorPackage(package_id, (err, result) => {
      if (err) {
        return res.status(500).json({ message: "Error deleting vendor package", error: err });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Vendor package not found" });
      }
      return res.status(200).json({ message: "Vendor package deleted successfully" });
    });
  }
  catch (err) {
    console.error("Error deleting vendor package:", err);
    return res.status(500).json({ error: "Server error", details: err.message });
  }
}

export const getAllVendorPackages = (req, res) => {
  try{ 
    const vendor_id = req.query.vendor_id;
    
    // Allow public access - no authentication required for viewing packages
    VendorModel.getAllVendorPackages(vendor_id, (err, results) => {
      if (err) {
        return res.status(500).json({ message: "Error fetching vendor packages", error: err });
      }
      return  res.status(200).json({ message: "Vendor packages retrieved successfully", count: results.length, packages: results });
    });

  }catch (err) {
    console.error("Error fetching vendor packages:", err);
    return res.status(500).json({ error: "Server error", details: err.message });
  }
}
  
export const getvendorsByServiceId = (req, res) => {
  try {
    const service_category_id = req.query.service_category_id;


    VendorModel.getVendorByServiceId(service_category_id, (err, results) => {
      if (err) {
        return res.status(500).json({ message: "Error fetching vendors by service ID", error: err });
      }
      return res.status(200).json({ message: "Vendors retrieved successfully", count: results.length, vendors: results });
    });
  } catch (err) {
    console.error("Error fetching vendors by service ID:", err);
    return res.status(500).json({ error: "Server error", details: err.message });
  }
};  

export const getFreeVendorsByDay = async (req, res) => {
  try {
    const { date, service_id } = req.query;

    if (!date) {
      return res.status(400).json({ message: "Date query param is required" });
    }

    if (!service_id) {
      return res.status(400).json({ message: "service_id query param is required" });
    }

    // Full day names
    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday"
    ];
    const day = dayNames[new Date(date).getDay()];

    console.log("Fetching free vendors for day:", day, "and service:", service_id);

    // Step 1 — Get vendor IDs who match both
    const vendorIds = await new Promise((resolve, reject) => {
      VendorModel.findVendorsByDayAndService(day, service_id, (err, result) => {
        if (err) return reject(err);
        resolve(result.map(r => r.vendor_id));
      });
    });

    if (!vendorIds || vendorIds.length === 0) {
      return res.status(200).json({
        message: "No vendors available for this day and service",
        vendors: []
      });
    }

    // Step 2 — Get vendor details
    const vendors = await new Promise((resolve, reject) => {
      VendorModel.getVendorsByIds(vendorIds, (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });

    return res.status(200).json({
      message: "Vendors retrieved successfully",
      count: vendors.length,
      vendors
    });

  } catch (err) {
    console.error("Error fetching vendors:", err);
    return res.status(500).json({
      error: "Server error",
      details: err.message
    });
  }
};

export const GetVendorKPIs = async (req, res) => {
  try {
    const token = req.cookies.auth_token;
    if (!token) return res.status(401).json({ message: 'Unauthorized: No token provided' });

    const decoded = verifyToken(token);
    if (!decoded) return res.status(401).json({ message: 'Unauthorized: Invalid token' });

    const vendor_id = await new Promise((resolve, reject) => {
      VendorModel.findVendorID(decoded.userId, (err, result) => {
        if (err) return reject(err);
        resolve(result && result.length > 0 ? result[0].vendor_id : null);
      });
    });

    if (!vendor_id) return res.status(404).json({ message: 'Vendor not found' });

    const [totalSales] = await new Promise((resolve, reject) => {
      VendorModel.getTotalSales(vendor_id, (err, result) => (err ? reject(err) : resolve(result)));
    });

    const [newOrders] = await new Promise((resolve, reject) => {
      VendorModel.getNewOrdersCount(vendor_id, (err, result) => (err ? reject(err) : resolve(result)));
    });

    const [activeEvents] = await new Promise((resolve, reject) => {
      VendorModel.getActiveEventsCount(vendor_id, (err, result) => (err ? reject(err) : resolve(result)));
    });

    const [totalClients] = await new Promise((resolve, reject) => {
      VendorModel.getTotalClientsCount(vendor_id, (err, result) => (err ? reject(err) : resolve(result)));
    });

    return res.status(200).json({
      message: 'KPIs retrieved successfully',
      kpis: {
        totalSales: totalSales?.total_sales || 0,
        newOrders: newOrders?.new_orders || 0,
        activeEvents: activeEvents?.active_events || 0,
        totalClients: totalClients?.total_clients || 0,
      },
    });
  } catch (err) {
    console.error('Error getting KPIs:', err);
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
};

export const GetVendorRecentActivities = async (req, res) => {
  try {
    const token = req.cookies.auth_token;
    if (!token) return res.status(401).json({ message: 'Unauthorized: No token provided' });

    const decoded = verifyToken(token);
    if (!decoded) return res.status(401).json({ message: 'Unauthorized: Invalid token' });

    const vendor_id = await new Promise((resolve, reject) => {
      VendorModel.findVendorID(decoded.userId, (err, result) => {
        if (err) return reject(err);
        resolve(result && result.length > 0 ? result[0].vendor_id : null);
      });
    });

    if (!vendor_id) return res.status(404).json({ message: 'Vendor not found' });

    const limit = parseInt(req.query.limit, 10) || 5;
    const activities = await new Promise((resolve, reject) => {
      VendorModel.getRecentActivities(vendor_id, limit, (err, result) => (err ? reject(err) : resolve(result)));
    });

    return res.status(200).json({ message: 'Recent activities retrieved', activities });
  } catch (err) {
    console.error('Error fetching recent activities:', err);
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
};