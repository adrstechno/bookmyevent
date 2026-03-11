import db from './Config/DatabaseCon.js';
import dotenv from 'dotenv';

dotenv.config();

// Debug script to check vendor profile data
const checkVendorProfile = async () => {
    try {
        // console.log('🔍 Checking vendor profiles...\n');

        // Get all users with vendor type
        const usersQuery = `
            SELECT user_id, uuid, email, first_name, last_name, user_type
            FROM users
            WHERE user_type = 'vendor'
            ORDER BY created_at DESC
            LIMIT 5
        `;

        db.query(usersQuery, (err, users) => {
            if (err) {
                console.error('❌ Error fetching users:', err);
                process.exit(1);
            }

            // console.log(`✅ Found ${users.length} vendor users:\n`);
            users.forEach(user => {
                // console.log(`User ID: ${user.user_id}`);
                // console.log(`UUID: ${user.uuid}`);
                // console.log(`Email: ${user.email}`);
                // console.log(`Name: ${user.first_name} ${user.last_name}`);
                // console.log('---');
            });

            // Get all vendor profiles
            const vendorQuery = `
                SELECT vp.vendor_id, vp.user_id, vp.business_name, 
                       u.uuid as user_uuid, u.email
                FROM vendor_profiles vp
                LEFT JOIN users u ON (vp.user_id = u.user_id OR vp.user_id = u.uuid)
                ORDER BY vp.created_at DESC
                LIMIT 5
            `;

            db.query(vendorQuery, (err, vendors) => {
                if (err) {
                    console.error('❌ Error fetching vendor profiles:', err);
                    process.exit(1);
                }

                // console.log(`\n✅ Found ${vendors.length} vendor profiles:\n`);
                vendors.forEach(vendor => {
                    // console.log(`Vendor ID: ${vendor.vendor_id}`);
                    // console.log(`User ID (stored): ${vendor.user_id}`);
                    // console.log(`User UUID (from join): ${vendor.user_uuid}`);
                    // console.log(`Business Name: ${vendor.business_name}`);
                    // console.log(`Email: ${vendor.email}`);
                    // console.log('---');
                });

                // Check if there's a mismatch
                // console.log('\n🔍 Checking for mismatches...\n');
                
                const checkQuery = `
                    SELECT 
                        u.uuid,
                        u.email,
                        u.user_type,
                        vp.vendor_id,
                        vp.user_id as vp_user_id,
                        CASE 
                            WHEN vp.user_id = u.user_id THEN 'Matched by user_id'
                            WHEN vp.user_id = u.uuid THEN 'Matched by uuid'
                            ELSE 'NO MATCH'
                        END as match_type
                    FROM users u
                    LEFT JOIN vendor_profiles vp ON (vp.user_id = u.user_id OR vp.user_id = u.uuid)
                    WHERE u.user_type = 'vendor'
                    ORDER BY u.created_at DESC
                    LIMIT 5
                `;

                db.query(checkQuery, (err, results) => {
                    if (err) {
                        console.error('❌ Error checking matches:', err);
                        process.exit(1);
                    }

                    results.forEach(result => {
                        // console.log(`UUID: ${result.uuid}`);
                        // console.log(`Email: ${result.email}`);
                        // console.log(`Vendor ID: ${result.vendor_id || 'NOT FOUND'}`);
                        // console.log(`Match Type: ${result.match_type}`);
                        // console.log('---');
                    });

                    // console.log('\n✅ Debug complete!');
                    process.exit(0);
                });
            });
        });

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

checkVendorProfile();
