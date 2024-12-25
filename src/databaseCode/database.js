const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");
const { app } = require("electron");

let dbPath = path.join(app.getPath('userData'), 'database.db');
const sourceDbPath = path.join(__dirname, 'database.db');
if (!fs.existsSync(dbPath)) {
  fs.copyFileSync(sourceDbPath, dbPath);
}

// Change for dev and prod
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
// const db = new sqlite3.Database(path.join(__dirname, "database.db"), (err) => {
  if (err) {
    console.error("Error opening database:", err.message);
  } else {
    console.log("Connected to the SQLite database.");
    db.run(`CREATE TABLE IF NOT EXISTS medicalData (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customerCode TEXT,
      customerNameEnglish TEXT,
      customerNameMarathi TEXT,
      invoice TEXT,
      transportNameEnglish TEXT,
      transportNameMarathi TEXT,
      partyName TEXT,
      description TEXT,
      cityEnglish TEXT,
      cityMarathi TEXT,
      billValue TEXT,
      createdDate TEXT,
      updatedDate TEXT
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT,
      role TEXT  -- 'admin' or 'user'
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS TransportData (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      transport_name_english TEXT UNIQUE,
      transport_name_hindi TEXT,
      number TEXT,
      city TEXT,
      address TEXT
    )`);
  }
});

module.exports = db;
