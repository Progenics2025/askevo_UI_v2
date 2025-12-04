const pool = require('../config/database');

async function updateSchema() {
    try {
        console.log('Updating users table schema...');

        const columns = [
            "profession VARCHAR(100)",
            "organization VARCHAR(255)",
            "phone_number VARCHAR(20)",
            "primary_use_case TEXT"
        ];

        for (const col of columns) {
            const query = `ALTER TABLE users ADD COLUMN ${col}`;
            try {
                await pool.query(query);
                console.log(`Executed: ${query}`);
            } catch (err) {
                if (err.code === 'ER_DUP_FIELDNAME') {
                    console.log(`Skipped (already exists): ${col}`);
                } else {
                    console.error(`Error adding ${col}:`, err.message);
                    // Don't exit, try next column
                }
            }
        }

        console.log('Schema update complete.');
        process.exit(0);
    } catch (error) {
        console.error('Schema update failed:', error);
        process.exit(1);
    }
}

updateSchema();
