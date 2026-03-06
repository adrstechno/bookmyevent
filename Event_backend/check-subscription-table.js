import db from './Config/DatabaseCon.js';
import dotenv from 'dotenv';

dotenv.config();

// Check if vendor_subscriptions table has required columns
const checkSubscriptionTable = () => {
    console.log('🔍 Checking vendor_subscriptions table structure...\n');

    const query = `DESCRIBE vendor_subscriptions`;

    db.query(query, (err, results) => {
        if (err) {
            console.error('❌ Error checking table:', err);
            process.exit(1);
        }

        console.log('✅ Table structure:\n');
        results.forEach(column => {
            console.log(`- ${column.Field} (${column.Type}) ${column.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
        });

        // Check for required columns
        const requiredColumns = [
            'razorpay_order_id',
            'razorpay_payment_id',
            'amount_paid'
        ];

        console.log('\n🔍 Checking required columns:');
        requiredColumns.forEach(col => {
            const exists = results.find(r => r.Field === col);
            if (exists) {
                console.log(`✅ ${col} - EXISTS`);
            } else {
                console.log(`❌ ${col} - MISSING (need to run migration!)`);
            }
        });

        // Check if there are any existing subscriptions
        const countQuery = `SELECT COUNT(*) as count FROM vendor_subscriptions`;
        db.query(countQuery, (err, countResult) => {
            if (err) {
                console.error('❌ Error counting subscriptions:', err);
            } else {
                console.log(`\n📊 Total subscriptions: ${countResult[0].count}`);
            }
            process.exit(0);
        });
    });
};

checkSubscriptionTable();
