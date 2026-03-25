// Run Database Migration Script
// Usage: node run-migration.js

import db from './Config/DatabaseCon.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// First, let's check the users table structure
const checkUsersTableSQL = 'DESCRIBE users';

// Migration SQL - will be adjusted based on uuid column type
let migrationSQL = `
-- Migration: Create password_reset_tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    token TEXT NOT NULL,
    expires_at DATETIME NOT NULL,
    used_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_expires_at (expires_at),
    INDEX idx_used_at (used_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`;

console.log('🚀 Starting database migration...\n');

// First check users table structure
console.log('🔍 Checking users table structure...');
db.query(checkUsersTableSQL, (err, structure) => {
    if (err) {
        console.error('❌ Failed to check users table:', err.message);
        process.exit(1);
    }
    
    // Find uuid column
    const uuidColumn = structure.find(col => col.Field === 'uuid');
    if (!uuidColumn) {
        console.error('❌ UUID column not found in users table');
        process.exit(1);
    }
    
    console.log('✅ Found UUID column with type:', uuidColumn.Type);
    
    // Adjust user_id type to match uuid type
    const uuidType = uuidColumn.Type;
    migrationSQL = migrationSQL.replace('user_id VARCHAR(36)', `user_id ${uuidType}`);
    
    console.log('📝 Creating password_reset_tokens table...\n');
    
    // Run migration
    db.query(migrationSQL, (err, result) => {
        if (err) {
            console.error('❌ Migration failed:', err.message);
            
            // If table already exists, that's okay
            if (err.message.includes('already exists')) {
                console.log('ℹ️  Table already exists, checking structure...');
                verifyTable();
            } else {
                process.exit(1);
            }
            return;
        }
        
        console.log('✅ Migration completed successfully!');
        console.log('📋 Table "password_reset_tokens" created\n');
        
        verifyTable();
    });
});

function verifyTable() {
    // Verify table was created
    db.query('SHOW TABLES LIKE "password_reset_tokens"', (err, tables) => {
        if (err) {
            console.error('❌ Verification failed:', err.message);
            process.exit(1);
        }
        
        if (tables.length > 0) {
            console.log('✅ Verification successful - Table exists\n');
            
            // Show table structure
            db.query('DESCRIBE password_reset_tokens', (err, structure) => {
                if (err) {
                    console.error('❌ Could not describe table:', err.message);
                    process.exit(1);
                }
                
                console.log('📊 Table Structure:');
                console.table(structure);
                
                console.log('\n✨ Migration complete! You can now use the forgot password feature.\n');
                process.exit(0);
            });
        } else {
            console.error('❌ Table was not created');
            process.exit(1);
        }
    });
}
