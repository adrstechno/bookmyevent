// Controllers/AdminController.js
import AdminModel from "../Models/adminModel.js";
import db from "../Config/DatabaseCon.js";

class AdminController {
  
  // Get admin dashboard KPIs
  static async getAdminKPIs(req, res) {
    try {
      console.log('🔍 Admin KPIs request received');
      console.log('User:', req.user);

      // Total users
      const totalUsersQuery = `SELECT COUNT(*) as count FROM users WHERE user_type = 'user'`;
      console.log('Executing query:', totalUsersQuery);
      const totalUsers = await new Promise((resolve, reject) => {
        db.query(totalUsersQuery, (err, results) => {
          if (err) {
            console.error('Total users query error:', err);
            reject(err);
          } else {
            console.log('Total users result:', results);
            resolve(results[0]?.count || 0);
          }
        });
      });

      // Total vendors
      const totalVendorsQuery = `SELECT COUNT(*) as count FROM vendor_profiles`;
      console.log('Executing query:', totalVendorsQuery);
      const totalVendors = await new Promise((resolve, reject) => {
        db.query(totalVendorsQuery, (err, results) => {
          if (err) {
            console.error('Total vendors query error:', err);
            reject(err);
          } else {
            console.log('Total vendors result:', results);
            resolve(results[0]?.count || 0);
          }
        });
      });

      // Total bookings
      const totalBookingsQuery = `SELECT COUNT(*) as count FROM event_booking WHERE removed_at IS NULL`;
      console.log('Executing query:', totalBookingsQuery);
      const totalBookings = await new Promise((resolve, reject) => {
        db.query(totalBookingsQuery, (err, results) => {
          if (err) {
            console.error('Total bookings query error:', err);
            reject(err);
          } else {
            console.log('Total bookings result:', results);
            resolve(results[0]?.count || 0);
          }
        });
      });

      // Total revenue (sum of all completed bookings)
      const totalRevenueQuery = `
        SELECT IFNULL(SUM(vp.amount), 0) as revenue 
        FROM event_booking eb 
        JOIN vendor_packages vp ON eb.package_id = vp.package_id 
        WHERE eb.status = 'completed' AND eb.removed_at IS NULL
      `;
      console.log('Executing query:', totalRevenueQuery);
      const totalRevenue = await new Promise((resolve, reject) => {
        db.query(totalRevenueQuery, (err, results) => {
          if (err) {
            console.error('Total revenue query error:', err);
            reject(err);
          } else {
            console.log('Total revenue result:', results);
            resolve(results[0]?.revenue || 0);
          }
        });
      });

      // Pending approvals
      const pendingApprovalsQuery = `SELECT COUNT(*) as count FROM event_booking WHERE admin_approval = 'pending'`;
      console.log('Executing query:', pendingApprovalsQuery);
      const pendingApprovals = await new Promise((resolve, reject) => {
        db.query(pendingApprovalsQuery, (err, results) => {
          if (err) {
            console.error('Pending approvals query error:', err);
            reject(err);
          } else {
            console.log('Pending approvals result:', results);
            resolve(results[0]?.count || 0);
          }
        });
      });

      // Active bookings (confirmed/pending)
      const activeBookingsQuery = `SELECT COUNT(*) as count FROM event_booking WHERE status IN ('confirmed', 'pending') AND removed_at IS NULL`;
      console.log('Executing query:', activeBookingsQuery);
      const activeBookings = await new Promise((resolve, reject) => {
        db.query(activeBookingsQuery, (err, results) => {
          if (err) {
            console.error('Active bookings query error:', err);
            reject(err);
          } else {
            console.log('Active bookings result:', results);
            resolve(results[0]?.count || 0);
          }
        });
      });

      // Monthly growth (new users this month vs last month)
      const monthlyGrowthQuery = `
        SELECT 
          SUM(CASE WHEN MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE()) THEN 1 ELSE 0 END) as this_month,
          SUM(CASE WHEN MONTH(created_at) = MONTH(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)) AND YEAR(created_at) = YEAR(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)) THEN 1 ELSE 0 END) as last_month
        FROM users WHERE user_type = 'user'
      `;
      console.log('Executing query:', monthlyGrowthQuery);
      const growthData = await new Promise((resolve, reject) => {
        db.query(monthlyGrowthQuery, (err, results) => {
          if (err) {
            console.error('Monthly growth query error:', err);
            reject(err);
          } else {
            console.log('Monthly growth result:', results);
            resolve(results[0] || { this_month: 0, last_month: 0 });
          }
        });
      });

      const growthPercentage = growthData.last_month > 0 
        ? Math.round(((growthData.this_month - growthData.last_month) / growthData.last_month) * 100)
        : growthData.this_month > 0 ? 100 : 0;

      const responseData = {
        totalUsers,
        totalVendors,
        totalBookings,
        totalRevenue,
        pendingApprovals,
        activeBookings,
        monthlyGrowth: {
          thisMonth: growthData.this_month,
          lastMonth: growthData.last_month,
          percentage: growthPercentage
        }
      };

      console.log('📊 Final KPI data:', responseData);

      return res.status(200).json({
        success: true,
        message: "Admin KPIs retrieved successfully",
        data: responseData
      });

    } catch (error) {
      console.error('❌ Error fetching admin KPIs:', error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch admin KPIs",
        error: error.message
      });
    }
  }

  // Get admin dashboard recent activities
  static async getAdminRecentActivities(req, res) {
    try {
      console.log('🔍 Admin activities request received');
      const limit = parseInt(req.query.limit) || 10;

      const activitiesQuery = `
        SELECT 
          eb.booking_id,
          eb.booking_uuid,
          eb.status,
          eb.admin_approval,
          eb.created_at,
          eb.updated_at,
          eb.event_date,
          u.first_name as user_name,
          u.email as user_email,
          vp.business_name as vendor_name,
          pkg.package_name,
          pkg.amount
        FROM event_booking eb
        LEFT JOIN users u ON eb.user_id = u.uuid
        LEFT JOIN vendor_profiles vp ON eb.vendor_id = vp.vendor_id
        LEFT JOIN vendor_packages pkg ON eb.package_id = pkg.package_id
        WHERE eb.removed_at IS NULL
        ORDER BY eb.updated_at DESC
        LIMIT ?
      `;

      console.log('Executing activities query with limit:', limit);
      const activities = await new Promise((resolve, reject) => {
        db.query(activitiesQuery, [limit], (err, results) => {
          if (err) {
            console.error('Activities query error:', err);
            reject(err);
          } else {
            console.log('Activities result:', results);
            resolve(results || []);
          }
        });
      });

      console.log('📋 Activities data:', activities);

      return res.status(200).json({
        success: true,
        message: "Recent activities retrieved successfully",
        data: activities
      });

    } catch (error) {
      console.error('❌ Error fetching admin activities:', error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch recent activities",
        error: error.message
      });
    }
  }

  // Get admin dashboard analytics (charts data)
  static async getAdminAnalytics(req, res) {
    try {
      console.log('🔍 Admin analytics request received');

      // Monthly bookings for the last 12 months
      const monthlyBookingsQuery = `
        SELECT 
          DATE_FORMAT(created_at, '%Y-%m') as month,
          COUNT(*) as bookings,
          IFNULL(SUM(vp.amount), 0) as revenue
        FROM event_booking eb
        LEFT JOIN vendor_packages vp ON eb.package_id = vp.package_id
        WHERE eb.created_at >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
        AND eb.removed_at IS NULL
        GROUP BY month
        ORDER BY month ASC
      `;

      console.log('Executing monthly bookings query');
      const monthlyData = await new Promise((resolve, reject) => {
        db.query(monthlyBookingsQuery, (err, results) => {
          if (err) {
            console.error('Monthly bookings query error:', err);
            reject(err);
          } else {
            console.log('Monthly bookings result:', results);
            resolve(results || []);
          }
        });
      });

      // Booking status distribution
      const statusDistributionQuery = `
        SELECT 
          status,
          COUNT(*) as count
        FROM event_booking 
        WHERE removed_at IS NULL
        GROUP BY status
      `;

      console.log('Executing status distribution query');
      const statusData = await new Promise((resolve, reject) => {
        db.query(statusDistributionQuery, (err, results) => {
          if (err) {
            console.error('Status distribution query error:', err);
            reject(err);
          } else {
            console.log('Status distribution result:', results);
            resolve(results || []);
          }
        });
      });

      // Top vendors by bookings
      const topVendorsQuery = `
        SELECT 
          vp.business_name,
          vp.vendor_id,
          COUNT(eb.booking_id) as booking_count,
          IFNULL(SUM(pkg.amount), 0) as total_revenue
        FROM vendor_profiles vp
        LEFT JOIN event_booking eb ON vp.vendor_id = eb.vendor_id AND eb.removed_at IS NULL
        LEFT JOIN vendor_packages pkg ON eb.package_id = pkg.package_id
        GROUP BY vp.vendor_id, vp.business_name
        ORDER BY booking_count DESC
        LIMIT 10
      `;

      console.log('Executing top vendors query');
      const topVendors = await new Promise((resolve, reject) => {
        db.query(topVendorsQuery, (err, results) => {
          if (err) {
            console.error('Top vendors query error:', err);
            reject(err);
          } else {
            console.log('Top vendors result:', results);
            resolve(results || []);
          }
        });
      });

      const responseData = {
        monthlyBookings: monthlyData,
        statusDistribution: statusData,
        topVendors: topVendors
      };

      console.log('📈 Analytics data:', responseData);

      return res.status(200).json({
        success: true,
        message: "Admin analytics retrieved successfully",
        data: responseData
      });

    } catch (error) {
      console.error('❌ Error fetching admin analytics:', error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch admin analytics",
        error: error.message
      });
    }
  }

  // Test database connectivity
  static async testDatabase(req, res) {
    try {
      console.log('🔍 Testing database connectivity...');

      // Test basic connection
      const testQuery = `SELECT 1 as test`;
      const testResult = await new Promise((resolve, reject) => {
        db.query(testQuery, (err, results) => {
          if (err) {
            console.error('Database test query error:', err);
            reject(err);
          } else {
            console.log('Database test result:', results);
            resolve(results);
          }
        });
      });

      // Check if tables exist
      const tablesQuery = `SHOW TABLES`;
      const tables = await new Promise((resolve, reject) => {
        db.query(tablesQuery, (err, results) => {
          if (err) {
            console.error('Show tables query error:', err);
            reject(err);
          } else {
            console.log('Tables result:', results);
            resolve(results);
          }
        });
      });

      // Check users table
      const usersCountQuery = `SELECT COUNT(*) as count FROM users`;
      const usersCount = await new Promise((resolve, reject) => {
        db.query(usersCountQuery, (err, results) => {
          if (err) {
            console.error('Users count query error:', err);
            reject(err);
          } else {
            console.log('Users count result:', results);
            resolve(results[0]?.count || 0);
          }
        });
      });

      return res.status(200).json({
        success: true,
        message: "Database connectivity test successful",
        data: {
          connectionTest: testResult,
          tables: tables,
          usersCount: usersCount
        }
      });

    } catch (error) {
      console.error('❌ Database test error:', error);
      return res.status(500).json({
        success: false,
        message: "Database connectivity test failed",
        error: error.message
      });
    }
  }
  
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
