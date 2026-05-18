import db from './Config/DatabaseCon.js';

const steps = [
    {
        name: 'razorpay_order_id',
        check: `SELECT COUNT(*) AS cnt FROM information_schema.columns
                WHERE table_schema = DATABASE() AND table_name = 'vendor_subscriptions' AND column_name = 'razorpay_order_id'`,
        alter: `ALTER TABLE vendor_subscriptions ADD COLUMN razorpay_order_id VARCHAR(255) NULL`
    },
    {
        name: 'razorpay_payment_id',
        check: `SELECT COUNT(*) AS cnt FROM information_schema.columns
                WHERE table_schema = DATABASE() AND table_name = 'vendor_subscriptions' AND column_name = 'razorpay_payment_id'`,
        alter: `ALTER TABLE vendor_subscriptions ADD COLUMN razorpay_payment_id VARCHAR(255) NULL`
    },
    {
        name: 'amount_paid',
        check: `SELECT COUNT(*) AS cnt FROM information_schema.columns
                WHERE table_schema = DATABASE() AND table_name = 'vendor_subscriptions' AND column_name = 'amount_paid'`,
        alter: `ALTER TABLE vendor_subscriptions ADD COLUMN amount_paid DECIMAL(10,2) NULL`
    }
];

const query = (sql) => new Promise((resolve, reject) =>
    db.query(sql, (err, result) => err ? reject(err) : resolve(result))
);

async function run() {
    console.log('🚀 Migration 005 — vendor_subscriptions Razorpay columns\n');

    for (const step of steps) {
        const [row] = await query(step.check);
        if (row.cnt > 0) {
            console.log(`✅ Column "${step.name}" already exists — skipped`);
        } else {
            await query(step.alter);
            console.log(`✅ Column "${step.name}" added`);
        }
    }

    const cols = await query(
        `SELECT column_name, column_type FROM information_schema.columns
         WHERE table_schema = DATABASE() AND table_name = 'vendor_subscriptions'
         ORDER BY ordinal_position`
    );
    console.log('\n📊 vendor_subscriptions columns:');
    cols.forEach(c => console.log(`   ${c.column_name} — ${c.column_type}`));
    console.log('\n✨ Migration complete.\n');
    process.exit(0);
}

run().catch(err => {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
});
