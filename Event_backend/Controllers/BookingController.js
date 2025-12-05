import BookingModel from "../Models/BookingModel.js";
import NotificationModel from "../Models/NotificationModel.js";
import BookingOtpModel from "../Models/BookingOtpModel.js";
import { verifyToken } from "../Utils/Verification.js";
import { v4 as uuidv4 } from "uuid";

import crypto from "crypto";

export const insertBooking = (req, res) => {
  try {
    let data = req.body;

    // Verify user login
    const token = req.cookies.auth_token;
    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: "Invalid Token" });
    }

    // Add generated UUID and user ID into data object
    data.booking_uuid = uuidv4();
    data.user_id = decoded.userId;

    data.status = "pending";
    data.admin_approval = "pending";

    // Now call model
    BookingModel.insertBooking(data, (err, result) => {
      if (err) {
        return res.status(500).json({ error: "Database Error", details: err });
      }

      // created a 6 digit otp for booking confirmation

    //   const otp = Math.floor(100000 + Math.random() * 900000);
    // save this otp into cookiesusko 


      res.status(201).json({
        message: "Booking Created Successfully. Awaiting admin approval",
        bookingId: result.insertId,
      });
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const updateBooking = (req, res) => {
  try {
    const booking_id = req.body.booking_id;
    const data = req.body;

    const token = req.cookies.auth_token;
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    const decoded = verifyToken(token);
    if (!decoded) return res.status(401).json({ error: "Invalid Token" });

    BookingModel.updateBooking(booking_id, data, (err, result) => {
      if (err) {
        return res.status(500).json({
          error: "Database Error",
          details: err,
        });
      }

      res.status(200).json({
        message: "Booking Updated Successfully",
      });
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const deleteBooking = (req, res) => {
  try {
    const booking_id = req.params.id;

    const token = req.cookies.auth_token;
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    const decoded = verifyToken(token);
    if (!decoded) return res.status(401).json({ error: "Invalid Token" });

    BookingModel.deleteBooking(booking_id, (err, result) => {
      if (err) {
        return res.status(500).json({
          error: "Database Error",
          details: err,
        });
      }
      res.status(200).json({
        message: "Booking Deleted Successfully",
      });
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getBookingsByUserId = (req, res) => {
  try {
    const token = req.cookies.auth_token;
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    const decoded = verifyToken(token);
    if (!decoded) return res.status(401).json({ error: "Invalid Token" });

    const user_id = decoded.userId;

    BookingModel.getBookingsByUserId(user_id, (err, result) => {
      if (err) {
        return res.status(500).json({
          error: "Database Error",
          details: err,
        });
      }

      res.status(200).json({
        bookings: result,
      });
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getBookingsByVendorId = (req, res) => {
  try {
    const vendor_id = req.query.vendorId;

    const token = req.cookies.auth_token;
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    const decoded = verifyToken(token);
    if (!decoded) return res.status(401).json({ error: "Invalid Token" });

    BookingModel.getAllByVendorId(vendor_id, (err, result) => {
      if (err) {
        return res.status(500).json({
          error: "Database Error",
          details: err,
        });
      }

      res.status(200).json({
        bookings: result,
      });
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getBookingById = (req, res) => {
  try {
    const booking_id = req.query.bookingId;

    const token = req.cookies.auth_token;
    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: "Invalid Token" });
    }

    BookingModel.getBookingById(booking_id, (err, result) => {
      if (err) {
        return res.status(500).json({
          error: "Database Error",
          details: err,
        });
      }

      if (result.length === 0) {
        return res.status(404).json({
          message: "Booking not found",
        });
      }

      res.status(200).json({
        booking: result[0],
      });
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const approveBooking = (req, res) => {
  try {
    const booking_id = req.body.booking_id;

    const token = req.cookies.auth_token;
    if(!token) return res.status(401).json({error: "UnAuthorized"});

    const decoded = verifyToken(token);
    if(!decoded || !decoded.isAdmin)
      return res.status(403).json({error: "Admin access only"});

    const data = {
      admin_approval: "approved",
      status: "confirmed"
    };

    BookingModel.updateBooking(booking_id, data, (err, result) => {
      if(err) return res.status(500).json({error: "database error", details: err});

      BookingModel.getBookingById(booking_id, (err2, bookingData) => {
        if(err2 || !bookingData.length){
          return res.status(500).json({error: "Error fetching booking"});
        }

        const booking = bookingData[0];
        const user_id = booking.user_id;
        const vendor_id = booking.vendor_id;

        const otp = crypto.randomInt(100000, 999999).toString();
        const expires_at = new Date(Date.now() + 48 * 60 * 60 * 1000);

        BookingOtpModel.createOtp(
          {
            booking_id,
            user_id,
            vendor_id,
            otp,
            expires_at,
            generated_by: decoded.admin_id
          },
          (err3) => {
            if(err3) console.error("Error saving otp", err3);
          }
        );

        NotificationModel.sendNotification(
          booking.user_id,
          "Booking approved 😃",
          `Your booking (ID: ${booking.booking_uuid}) has been approved by admin.`,
          () => {}
        );

        NotificationModel.sendNotification(
          vendor_id,
          "New Booking Approved 📌",
          `A new booking is allocated to you.\nCustomer OTP: ${otp}`,
          () => {}
        );

        res.status(200).json({
          message: "Booking Approved successfully"
        });
      });
    });

  }
  catch (err) {
    res.status(500).json({error: "Internal server error"});
  }
}

