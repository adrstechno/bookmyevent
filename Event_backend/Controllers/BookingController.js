import BookingModel from "../Models/BookingModel.js";
import { verifyToken } from "../Utils/Verification.js";
import { v4 as uuidv4 } from "uuid";

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

    // Now call model
    BookingModel.insertBooking(data, (err, result) => {
      if (err) {
        return res.status(500).json({ error: "Database Error", details: err });
      }

      res.status(201).json({
        message: "Booking Created Successfully",
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



