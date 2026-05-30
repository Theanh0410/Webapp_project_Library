import db from './config/db.js';

async function runMigration() {
  const connection = await db.getConnection();
  
  try {
    console.log('Starting database migration...');
    
    // First, check what status values exist
    console.log('1. Checking current status values...');
    const [rows] = await connection.query(`
      SELECT DISTINCT status FROM borrow_records
    `);
    console.log('   Current status values:', rows.map(r => r.status));
    
    // Step 1: Temporarily expand enum to include both old and new values
    console.log('2. Expanding enum to include all values...');
    await connection.query(`
      ALTER TABLE borrow_records 
      MODIFY COLUMN status ENUM('pending_approval', 'approved', 'pending_return_approval', 'returned', 'overdue', 'borrowed', 'active') 
          NOT NULL DEFAULT 'pending_approval'
    `);
    console.log('   ✓ Enum expanded');
    
    // Convert ALL records to 'approved'
    console.log('3. Converting all records to approved status...');
    await connection.query(`
      UPDATE borrow_records 
      SET status = 'approved'
    `);
    console.log('   ✓ All records updated to approved');
    
    // Step 2: Update enum to final list (removing old values)
    console.log('4. Finalizing enum...');
    await connection.query(`
      ALTER TABLE borrow_records 
      MODIFY COLUMN status ENUM('pending_approval', 'approved', 'pending_return_approval', 'returned', 'overdue') 
          NOT NULL DEFAULT 'pending_approval'
    `);
    console.log('   ✓ Status enum finalized');
    
    // Check if columns already exist
    console.log('5. Checking for existing approval columns...');
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'borrow_records' 
      AND TABLE_SCHEMA = 'library_management'
      AND COLUMN_NAME IN ('approved_by_staff_user_id', 'return_approved_by_staff_user_id')
    `);
    
    if (columns.length === 0) {
      console.log('6. Adding approval columns...');
      await connection.query(`
        ALTER TABLE borrow_records 
        ADD COLUMN approved_by_staff_user_id INT,
        ADD COLUMN return_approved_by_staff_user_id INT
      `);
      console.log('   ✓ Columns added');
      
      // Add foreign key constraints
      console.log('7. Adding foreign key constraints...');
      await connection.query(`
        ALTER TABLE borrow_records
        ADD CONSTRAINT fk_borrow_records_staff_approved
            FOREIGN KEY (approved_by_staff_user_id)
            REFERENCES users(id)
            ON DELETE SET NULL
            ON UPDATE CASCADE
      `);
      console.log('   ✓ First FK added');
      
      await connection.query(`
        ALTER TABLE borrow_records
        ADD CONSTRAINT fk_borrow_records_staff_return_approved
            FOREIGN KEY (return_approved_by_staff_user_id)
            REFERENCES users(id)
            ON DELETE SET NULL
            ON UPDATE CASCADE
      `);
      console.log('   ✓ Second FK added');
    } else {
      console.log('   ✓ Approval columns already exist');
    }
    
    console.log('\n✅ Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    if (error.code === 'ER_DUP_FIELDNAME' || error.code === 'ER_DUP_KEYNAME') {
      console.log('\nNote: Columns or constraints might already exist. This is okay - the database is already up to date.');
    }
  } finally {
    connection.release();
    process.exit(0);
  }
}

runMigration();
