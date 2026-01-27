import db from './Config/DatabaseCon.js';

// Check if columns exist
db.query("DESCRIBE event_booking", (err, results) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('Current event_booking table structure:');
    results.forEach(column => {
      console.log(`- ${column.Field}: ${column.Type}`);
    });
    
    const hasLatitude = results.some(col => col.Field === 'event_latitude');
    const hasLongitude = results.some(col => col.Field === 'event_longitude');
    
    if (!hasLatitude || !hasLongitude) {
      console.log('\n🔧 Adding coordinate columns...');
      
      const alterSql = `
        ALTER TABLE event_booking 
        ADD COLUMN event_latitude DECIMAL(10, 8) NULL COMMENT 'Event location latitude',
        ADD COLUMN event_longitude DECIMAL(11, 8) NULL COMMENT 'Event location longitude'
      `;
      
      db.query(alterSql, (alterErr) => {
        if (alterErr) {
          console.error('❌ Failed to add columns:', alterErr);
        } else {
          console.log('✅ Coordinate columns added successfully');
        }
        db.end();
      });
    } else {
      console.log('✅ Coordinate columns already exist');
      db.end();
    }
  }
});