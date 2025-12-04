const pool = require('../config/database');

async function createPedigreeTable() {
  try {
    console.log('Creating pedigrees table...');

    await pool.query('DROP TABLE IF EXISTS pedigrees');

    const query = `
      CREATE TABLE pedigrees(
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  case_number VARCHAR(50) NOT NULL,
  data JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_case(user_id, case_number)
)
  `;

    await pool.query(query);
    console.log('Pedigrees table created successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Failed to create pedigrees table:', error);
    process.exit(1);
  }
}

createPedigreeTable();
