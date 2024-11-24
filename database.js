// // database.js
// const sqlite3 = require('sqlite3').verbose();
// const path = require('path');
// const fs = require('fs');
// const { app } = require('electron');


// let dbPath = path.join(app.getAppPath('userData'), 'database.db');
// const sourceDbPath = path.join(__dirname, 'database.db');
// fs.copyFileSync(sourceDbPath, dbPath);

// // Connect to SQLite database
// const db = new sqlite3.Database(path.resolve(__dirname, 'database.db'), (err) => {
//   if (err) {
//     console.error("Error opening database:", err.message);
//   } else {
//     console.log("Connected to the SQLite database.");
//     db.run(`CREATE TABLE IF NOT EXISTS medicalData (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       customerCode TEXT,
//       customerName TEXT,
//       invoice TEXT,
//       transportName TEXT,
//       partyName TEXT,
//       description TEXT,
//       city TEXT
//     )`);
//   }
// });

// module.exports = db;
