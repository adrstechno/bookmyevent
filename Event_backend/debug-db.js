import db from './Config/DatabaseCon.js';

// console.log('🔍 Debugging database structure...');

// Test 1: Check table structure
// console.log('\n1️⃣ Checking table structure...');
db.query('DESCRIBE service_categories', (err, results) => {
    if (err) {
        console.error('❌ Error describing table:', err);
    } else {
        // console.log('✅ Table structure:');
        console.table(results);
    }

    // Test 2: Check actual data
    // console.log('\n2️⃣ Checking actual data...');
    db.query('SELECT * FROM service_categories LIMIT 3', (err, results) => {
        if (err) {
            console.error('❌ Error fetching data:', err);
        } else {
            // console.log('✅ Sample data:');
            // console.log(JSON.stringify(results, null, 2));
        }

        // Test 3: Test specific query that's failing
        // console.log('\n3️⃣ Testing GET by ID query...');
        db.query('SELECT * FROM service_categories WHERE category_id = ?', [1], (err, results) => {
            if (err) {
                console.error('❌ Error with category_id query:', err);
            } else {
                // console.log('✅ Query with category_id works:');
                // console.log(JSON.stringify(results, null, 2));
            }

            // Close connection
            db.end();
        });
    });
});