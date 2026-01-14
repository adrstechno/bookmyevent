// Controllers/AdminController.js
import AdminModel from "../Models/adminModel.js";

class AdminController {
  
  // Get all users
  static async getAllUsers(req, res) {
    AdminModel.getAllUsers((err, result) => {
      if (err) {
        return res.status(500).json({
          message: "Database error while fetching users",
          error: err,
        });
      }

      return res.status(200).json({
        message: "Users fetched successfully",
        users: result,
      });
    });
  }

  // Get all vendors
  static async getAllVendors(req, res) {
    AdminModel.getAllVendors((err, result) => {
      if (err) {
        return res.status(500).json({
          message: "Database error while fetching vendors",
          error: err,
        });
      }

      return res.status(200).json({
        message: "Vendors fetched successfully",
        vendors: result,
      });
    });
  }


  

}



export default AdminController;
