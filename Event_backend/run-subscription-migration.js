import db from './Config/DatabaseCon.js';
import dotenv from 'dotenv';

dotenv.config();

// Run subscription schema migration
const runMigration = async () => {
    console.log('🚀 Running subscription schema migration...\n');

    try {
        // Step 1: Add razorpay_order_id column
        console.log('📝 Adding razorpay_order_id column...');
        await new Promise((resolve, reject) => {
            db.query(
                `ALTER TABLE vendor_subscriptions ADD COLUMN IF NOT EXISTS razorpay_order_id VARCHAR(255) NULL`,
                (err, result) => {
                    if (err) {
                        if (err.code === 'ER_DUP_FIELDNAME') {
                            console.log('   ℹ️  Column already exists, skipping');
                            resolve();
                        } else {
                            reject(err);
                        }
                    } else {
                        console.log('   ✅ Added razorpay_order_id');
                        resolve(result);
                    }
                }
            );
        });

        // Step 2: Add razorpay_payment_id column
        console.log('📝 Adding razorpay_payment_id column...');
        await new Promise((resolve, reject) => {
            db.query(
                `ALTER TABLE vendor_subscriptions ADD COLUMN IF NOT EXISTS razorpay_payment_id VARCHAR(255) NULL`,
                (err, result) => {
                    if (err) {
                        if (err.code === 'ER_DUP_FIELDNAME') {
                            console.log('   ℹ️  Column already exists, skipping');
                            resolve();
                        } else {
                            reject(err);
                        }
                    } else {
                        console.log('   ✅ Added razorpay_payment_id');
                        resolve(result);
                    }
                }
            );
        });

        // Step 3: Add amount_paid column
        console.log('📝 Adding amount_paid column...');
        await new Promise((resolve, reject) => {
            db.query(
                `ALTER TABLE vendor_subscriptions ADD COLUMN IF NOT EXISTS amount_paid DECIMAL(10, 2) NULL`,
                (err, result) => {
                    if (err) {
                        if (err.code === 'ER_DUP_FIELDNAME') {
                            console.log('   ℹ️  Column already exists, skipping');
                            resolve();
                        } else {
                            reject(err);
                        }
                    } else {
                        console.log('   ✅ Added amount_paid');
                        resolve(result);
                    }
                }
            );
        });

        // Step 4: Add index on razorpay_payment_id
        console.log('📝 Adding index on razorpay_payment_id...');
        await new Promise((resolve, reject) => {
            db.query(
                `ALTER TABLE vendor_subscriptions ADD INDEX IF NOT EXISTS idx_razorpay_payment (razorpay_payment_id)`,
                (err, result) => {
                    if (err) {
                        if (err.code === 'ER_DUP_KEYNAME') {
                            console.log('   ℹ️  Index already exists, skipping');
                            resolve();
                        } else {
                            // Try without IF NOT EXISTS for older MySQL versions
                            db.query(
                                `SHOW INDEX FROM vendor_subscriptions WHERE Key_name = 'idx_razorpay_payment'`,
                                (checkErr, indexes) => {
                                    if (checkErr) {
                                        reject(checkErr);
                                    } else if (indexes.length > 0) {
                                        console.log('   ℹ️  Index already exists, skipping');
                                        resolve();
                                    } else {
                                        db.query(
                                            `ALTER TABLE vendor_subscriptions ADD INDEX idx_razorpay_payment (razorpay_payment_id)`,
                                            (addErr, addResult) => {
                                                if (addErr) reject(addErr);
                                                else {
                                                    console.log('   ✅ Added index idx_razorpay_payment');
                                                    resolve(addResult);
                                                }
                                            }
                                        );
                                    }
                                }
                            );
                        }
                    } else {
                        console.log('   ✅ Added index idx_razorpay_payment');
                        resolve(result);
                    }
                }
            );
        });

        // Step 5: Add index on status and end_date
        console.log('📝 Adding index on status and end_date...');
        await new Promise((resolve, reject) => {
            db.query(
                `SHOW INDEX FROM vendor_subscriptions WHERE Key_name = 'idx_status_end_date'`,
                (checkErr, indexes) => {
                    if (checkErr) {
                        reject(checkErr);
                    } else if (indexes.length > 0) {
                        console.log('   ℹ️  Index already exists, skipping');
                        resolve();
                    } else {
                        db.query(
                            `ALTER TABLE vendor_subscriptions ADD INDEX idx_status_end_date (status, end_date)`,
                            (addErr, addResult) => {
                                if (addErr) reject(addErr);
                                else {
                                    console.log('   ✅ Added index idx_status_end_date');
                                    resolve(addResult);
                                }
                            }
                        );
                    }
                }
            );
        });

        // Step 6: Update billing_cycle for existing records
        console.log('📝 Updating billing_cycle for existing records...');
        await new Promise((resolve, reject) => {
            db.query(
                `UPDATE vendor_subscriptions SET billing_cycle = 'annual' WHERE billing_cycle IS NULL OR billing_cycle = ''`,
                (err, result) => {
                    if (err) reject(err);
                    else {
                        console.log(`   ✅ Updated ${result.affectedRows} records`);
                        resolve(result);
                    }
                }
            );
        });

        console.log('\n✅ Migration completed successfully!\n');
        
        // Verify the changes
        console.log('🔍 Verifying table structure...');
        db.query(`DESCRIBE vendor_subscriptions`, (err, results) => {
            if (err) {
                console.error('❌ Error verifying:', err);
            } else {
                console.log('\n✅ Current table structure:');
                results.forEach(column => {
                    console.log(`   - ${column.Field} (${column.Type})`);
                });
            }
            process.exit(0);
        });

    } catch (error) {
        console.error('\n❌ Migration failed:', error);
        process.exit(1);
    }
};

runMigration();
