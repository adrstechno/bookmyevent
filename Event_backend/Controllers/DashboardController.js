import db from "../Config/DatabaseCon.js";

class DashboardController {
  // Get simple KPIs for the logged in user
  static async userKpis(req, res) {
    try {
      const userId = req.user.user_id; // uuid stored in req.user

      // Total bookings for user
      const bookingsSql = `SELECT COUNT(*) as count FROM event_booking WHERE user_id = ? AND removed_at IS NULL`;
      // Total payments (sum of package amount for completed bookings)
      const paymentsSql = `SELECT IFNULL(SUM(vpack.amount),0) as total FROM event_booking eb LEFT JOIN vendor_packages vpack ON eb.package_id = vpack.package_id WHERE eb.user_id = ? AND eb.status = 'completed'`;
      // Saved vendors placeholder (if exists in DB this should be replaced)
      const savedSql = `SELECT 0 as count`;
      // Support tickets placeholder
      const ticketsSql = `SELECT 0 as count`;

      const bookings = await new Promise((resolve, reject) => {
        db.query(bookingsSql, [userId], (err, results) => (err ? reject(err) : resolve(results[0] || { count: 0 })));
      });

      const payments = await new Promise((resolve, reject) => {
        db.query(paymentsSql, [userId], (err, results) => (err ? reject(err) : resolve(results[0] || { total: 0 })));
      });

      const saved = await new Promise((resolve, reject) => {
        db.query(savedSql, [], (err, results) => (err ? reject(err) : resolve(results[0] || { count: 0 })));
      });

      const tickets = await new Promise((resolve, reject) => {
        db.query(ticketsSql, [], (err, results) => (err ? reject(err) : resolve(results[0] || { count: 0 })));
      });

      res.json({
        success: true,
        data: {
          bookings: bookings.count || 0,
          totalPayment: payments.total || 0,
          savedVendors: saved.count || 0,
          tickets: tickets.count || 0,
        },
      });
    } catch (err) {
      console.error("Dashboard KPI error:", err);
      res.status(500).json({ success: false, message: "Failed to fetch KPIs" });
    }
  }

  // Monthly chart data for bookings and payments
  static async monthlyChart(req, res) {
    try {
      const userId = req.user.user_id;

      // Last 6 months aggregation
      const sql = `
        SELECT DATE_FORMAT(event_date, '%Y-%m') as month, COUNT(*) as bookings, IFNULL(SUM(vpack.amount),0) as payments
        FROM event_booking eb
        LEFT JOIN vendor_packages vpack ON eb.package_id = vpack.package_id
        WHERE eb.user_id = ? AND eb.event_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH) AND eb.removed_at IS NULL
        GROUP BY month
        ORDER BY month ASC
      `;

      const results = await new Promise((resolve, reject) => {
        db.query(sql, [userId], (err, rows) => (err ? reject(err) : resolve(rows || [])));
      });

      res.json({ success: true, data: results });
    } catch (err) {
      console.error("Dashboard chart error:", err);
      res.status(500).json({ success: false, message: "Failed to fetch chart data" });
    }
  }
}

export default DashboardController;
