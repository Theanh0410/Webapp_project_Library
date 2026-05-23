const fs = require('fs');
const path = require('path');

const escape = (str) => typeof str === 'string' ? `'${str.replace(/'/g, "''")}'` : str;

let sql = `-- Mock Data Generation (Approx 100 records each table)\n-- Foreign Keys are excluded per request\n\n`;

// Helpers
const randomDate = (start, end) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString().split('T')[0];
const randomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

// 1. Categories
sql += `-- 1. Table: categories\nINSERT INTO categories (id, name) VALUES \n`;
const catValues = Array.from({length: 100}, (_, i) => `(${i+1}, 'Category ${i+1}')`);
sql += catValues.join(',\n') + ';\n\n';

// 2. Subject
sql += `-- 2. Table: subject\nINSERT INTO subject (id, name) VALUES \n`;
const subValues = Array.from({length: 100}, (_, i) => `(${i+1}, 'Subject ${i+1}')`);
sql += subValues.join(',\n') + ';\n\n';

// 3. Books
sql += `-- 3. Table: books\nINSERT INTO books (id, title, author, published_year, isbn, description) VALUES \n`;
const bookValues = Array.from({length: 100}, (_, i) => {
    return `(${i+1}, 'Book Title ${i+1}', 'Author ${Math.floor(Math.random()*50)+1}', '${1990 + Math.floor(Math.random()*35)}', '978-${Math.floor(Math.random()*9000000000)+1000000000}', 'Description for book ${i+1}')`;
});
sql += bookValues.join(',\n') + ';\n\n';

// 4. Book Copies
sql += `-- 4. Table: book_copies\nINSERT INTO book_copies (id, copy_code, status) VALUES \n`;
const statuses = ['Available', 'Borrowed', 'Maintenance', 'Reserved', 'Lost'];
const copyValues = Array.from({length: 100}, (_, i) => `(${i+1}, ${10000+i+1}, '${randomElement(statuses)}')`);
sql += copyValues.join(',\n') + ';\n\n';

// 5. Users
sql += `-- 5. Table: users\nINSERT INTO users (id, name, username, password_hash, email, role, created_at) VALUES \n`;
const roles = ['Student', 'Lecturer', 'Staff', 'Manager'];
const userValues = Array.from({length: 100}, (_, i) => `(${i+1}, 'User ${i+1}', 'user${i+1}', 'hash_xyz${i}', 'user${i+1}@example.com', '${randomElement(roles)}', '${randomDate(new Date(2022, 0, 1), new Date())}')`);
sql += userValues.join(',\n') + ';\n\n';

// 6. Students
sql += `-- 6. Table: students\nINSERT INTO students (id, student_id, major, class_name) VALUES \n`;
const majors = ['Computer Science', 'Software Engineering', 'Information Systems', 'Data Science'];
const studentsValues = Array.from({length: 100}, (_, i) => `(${i+1}, 'STU${1000+i+1}', '${randomElement(majors)}', 'Class-${2020 + Math.floor(Math.random()*5)}')`);
sql += studentsValues.join(',\n') + ';\n\n';

// 7. Lecturers
sql += `-- 7. Table: lecturers\nINSERT INTO lecturers (id, department) VALUES \n`;
const depts = ['Computer Science Faculty', 'Mathematics', 'Physics', 'Business'];
const lecturerValues = Array.from({length: 100}, (_, i) => `(${i+1}, '${randomElement(depts)}')`);
sql += lecturerValues.join(',\n') + ';\n\n';

// 8. Staff
sql += `-- 8. Table: staff\nINSERT INTO staff (id, position) VALUES \n`;
const positions = ['Librarian', 'System Administrator', 'Assistant', 'Support'];
const staffValues = Array.from({length: 100}, (_, i) => `(${i+1}, '${randomElement(positions)}')`);
sql += staffValues.join(',\n') + ';\n\n';

// 9. Shifts
sql += `-- 9. Table: shifts\nINSERT INTO shifts (id, shift_date, start_time, end_time, note) VALUES \n`;
const shiftValues = Array.from({length: 100}, (_, i) => `(${i+1}, '${randomDate(new Date(2026, 0, 1), new Date(2026, 11, 31))}', '08:00:00', '16:00:00', 'Shift note ${i+1}')`);
sql += shiftValues.join(',\n') + ';\n\n';

// 10. Reservations
sql += `-- 10. Table: reservations\nINSERT INTO reservations (id, reservation_date, status) VALUES \n`;
const resStatuses = ['Pending', 'Fulfilled', 'Cancelled'];
const resValues = Array.from({length: 100}, (_, i) => `(${i+1}, '${randomDate(new Date(2026, 0, 1), new Date())}', '${randomElement(resStatuses)}')`);
sql += resValues.join(',\n') + ';\n\n';

// 11. Borrow Record
sql += `-- 11. Table: borrow_record\nINSERT INTO borrow_record (id, borrow_date, due_date, role, created_at) VALUES \n`;
const borrowValues = Array.from({length: 100}, (_, i) => {
    const bdate = randomDate(new Date(2025, 0, 1), new Date(2026, 4, 1));
    return `(${i+1}, '${bdate}', '2026-06-01', '${randomElement(roles)}', '${bdate}')`;
});
sql += borrowValues.join(',\n') + ';\n\n';

fs.writeFileSync(path.join(__dirname, 'mock_data.sql'), sql);
console.log("mock_data.sql file created successfully.");
