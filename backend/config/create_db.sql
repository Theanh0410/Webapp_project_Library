CREATE DATABASE IF NOT EXISTS library_management;

USE library_management;

-- =========================
-- 1. USERS TABLE
-- =========================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE,
    role ENUM('student', 'lecturer', 'staff', 'manager') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- 2. STUDENTS TABLE
-- =========================
CREATE TABLE students (
    user_id INT PRIMARY KEY,
    student_code VARCHAR(50) NOT NULL UNIQUE,
    major VARCHAR(100),
    class_name VARCHAR(50),

    CONSTRAINT fk_students_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- =========================
-- 3. LECTURERS TABLE
-- =========================
CREATE TABLE lecturers (
    user_id INT PRIMARY KEY,
    department VARCHAR(100),

    CONSTRAINT fk_lecturers_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- =========================
-- 4. STAFF TABLE
-- =========================
CREATE TABLE staff (
    user_id INT PRIMARY KEY,
    position VARCHAR(100),

    CONSTRAINT fk_staff_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- =========================
-- 5. CATEGORIES TABLE
-- =========================
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

-- =========================
-- 6. SUBJECTS TABLE
-- =========================
CREATE TABLE subjects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,

    CONSTRAINT fk_subjects_category
        FOREIGN KEY (category_id)
        REFERENCES categories(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- =========================
-- 7. BOOKS TABLE
-- =========================
CREATE TABLE books (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(150),
    published_year YEAR,
    isbn VARCHAR(50) UNIQUE,
    category_id INT,
    subject_id INT,
    description TEXT,

    CONSTRAINT fk_books_category
        FOREIGN KEY (category_id)
        REFERENCES categories(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,

    CONSTRAINT fk_books_subject
        FOREIGN KEY (subject_id)
        REFERENCES subjects(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);

-- =========================
-- 8. BOOK COPIES TABLE
-- =========================
CREATE TABLE book_copies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    book_id INT NOT NULL,
    status ENUM('available', 'borrowed', 'lost', 'damaged') 
        NOT NULL DEFAULT 'available',

    CONSTRAINT fk_book_copies_book
        FOREIGN KEY (book_id)
        REFERENCES books(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- If you want to keep copy_code later, use this:
-- ALTER TABLE book_copies ADD copy_code VARCHAR(50) UNIQUE;

-- =========================
-- 9. BORROW RECORDS TABLE
-- =========================
CREATE TABLE borrow_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    borrower_user_id INT NOT NULL,
    book_copy_id INT NOT NULL,
    borrow_date DATE NOT NULL,
    due_date DATE NOT NULL,
    return_date DATE NULL,
    status ENUM('borrowed', 'returned', 'overdue') 
        NOT NULL DEFAULT 'borrowed',
    created_by_staff_user_id INT,

    CONSTRAINT fk_borrow_records_user
        FOREIGN KEY (borrower_user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_borrow_records_book_copy
        FOREIGN KEY (book_copy_id)
        REFERENCES book_copies(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_borrow_records_staff
        FOREIGN KEY (created_by_staff_user_id)
        REFERENCES staff(user_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);

-- =========================
-- 10. SHIFTS TABLE
-- =========================
CREATE TABLE shifts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    staff_user_id INT NOT NULL,
    shift_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    note TEXT,

    CONSTRAINT fk_shifts_staff
        FOREIGN KEY (staff_user_id)
        REFERENCES staff(user_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- =========================
-- 11. RESERVATIONS TABLE
-- =========================
CREATE TABLE reservations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    book_id INT NOT NULL,
    reservation_date DATE NOT NULL,
    status ENUM('pending', 'approved', 'cancelled', 'completed') 
        NOT NULL DEFAULT 'pending',

    CONSTRAINT fk_reservations_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_reservations_book
        FOREIGN KEY (book_id)
        REFERENCES books(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);