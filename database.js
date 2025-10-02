import mysql from 'mysql2'
import dotenv from 'dotenv';
dotenv.config();

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
}).promise()

export async function createUsersTable() {
    await pool.execute(`
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(50) NOT NULL,
            surname VARCHAR(50) NOT NULL,
            password VARCHAR(255) NOT NULL,
            email VARCHAR(100) NOT NULL,
            last_login DATETIME NULL,
            status ENUM('unverified', 'active', 'blocked') NOT NULL DEFAULT 'unverified', 
            prev_status ENUM('unverified', 'active') DEFAULT 'unverified',
            verification_token VARCHAR(255) DEFAULT NULL,
            created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            UNIQUE INDEX index_email (email)
        )
    `);
}

export async function getUsers() {
    const [rows] = await pool.query(`
        SELECT * 
        FROM users
        ORDER BY last_login DESC
        `
    );
    return rows;
}

export async function getUser(id){
    const [rows] = await pool.query(`
        SELECT *
        FROM users
        WHERE id = ?
        `,[id]);
    return rows[0];
}
export async function updateLoginTime(email){
    await pool.query(`
        UPDATE users
        SET last_login = NOW()
        WHERE email = ?
        `,[email]);
}
export async function blockUser(email) {
    const sql = `UPDATE users SET prev_status = status, status = 'blocked' WHERE email = ?`;
    await pool.query(sql, [email]);
}
export async function verifyUser(email) {
    const sql = `UPDATE users SET prev_status = status, status = 'active' WHERE email = ?`;
    await pool.query(sql, [email]);
}
export async function unblockUser(email) {
    const sql = `UPDATE users SET status = prev_status WHERE email = ?`;
    await pool.query(sql, [email]);
}
export async function getUserByEmail(email) {
    const sql = `
        SELECT * FROM users
        WHERE email = ?
    `;
    const [rows] = await pool.query(sql, [email]);
    return rows[0];
}
export async function deleteUser(email){
    const [rows] = await pool.query(`
        DELETE
        FROM users
        WHERE email = ?
        `,[email]);
    return rows.affectedRows;
}
export async function findUserByToken(verification_token){
    const [rows] = await pool.query(`
        SELECT *
        FROM users
        WHERE verification_token = ?
        `,[verification_token]);
    return rows[0];
}
export async function deleteUnverifiedUsers(){
    const [rows] = await pool.query(`
        DELETE
        FROM users
        WHERE status = 'unverified'
        `);
    return rows.affectedRows;
}
export async function createUser(name,surname,password,email,verification_token){
    const [result] = await pool.query(`
        INSERT INTO users(name,surname,password,email,verification_token)
        VALUES (?, ?, ?, ?, ?)
        `,[name,surname,password,email,verification_token]);
    return getUser(result.insertId);
}
