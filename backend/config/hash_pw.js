import fs from "fs";
import bcrypt from "bcryptjs";

const inputFile = "mock_data.sql";
const outputFile = "mock_data_hashed_password_123456.sql";

const plainPassword = "123456";

const saltRounds = 10;
const hashedPassword = bcrypt.hashSync(plainPassword, saltRounds);

let sql = fs.readFileSync(inputFile, "utf8");

sql = sql.replace(/'hash_[^']*'/g, `'${hashedPassword}'`);

fs.writeFileSync(outputFile, sql, "utf8");

console.log("Done!");
console.log(`All passwords were changed to bcrypt hash of: ${plainPassword}`);
console.log(`Output file created: ${outputFile}`);