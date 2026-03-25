// Check users table structure
import db from './Config/DatabaseCon.js';

console.log('🔍 Checking users table structure...\n');

db.query('DESCRIBE users', (err, structure) => {
    if (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
    
    console.log('📊 Users Table Structure:');
    console.table(structure);
    
    // Find uuid column
    const uuidColumn = structure.find(col => col.Field === 'uuid');
    if (uuidColumn) {
        console.log('\n✅ UUID Column Details:');
        console.log('   Type:', uuidColumn.Type);
        console.log('   Null:', uuidColumn.Null);
        console.log('   Key:', uuidColumn.Key);
        console.log('   Default:', uuidColumn.Default);
        console.log('   Extra:', uuidColumn.Extra);
    }
    
    process.exit(0);
});
