-- Migration: Add approval workflow columns to borrow_records table

ALTER TABLE borrow_records 
MODIFY COLUMN status ENUM('pending_approval', 'approved', 'pending_return_approval', 'returned', 'overdue') 
    NOT NULL DEFAULT 'pending_approval';

ALTER TABLE borrow_records 
ADD COLUMN approved_by_staff_user_id INT,
ADD COLUMN return_approved_by_staff_user_id INT;

ALTER TABLE borrow_records
ADD CONSTRAINT fk_borrow_records_staff_approved
    FOREIGN KEY (approved_by_staff_user_id)
    REFERENCES users(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE;

ALTER TABLE borrow_records
ADD CONSTRAINT fk_borrow_records_staff_return_approved
    FOREIGN KEY (return_approved_by_staff_user_id)
    REFERENCES users(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE;

-- Update existing records to approved status so they're not stuck in pending
UPDATE borrow_records 
SET status = 'approved' 
WHERE status = 'borrowed';
