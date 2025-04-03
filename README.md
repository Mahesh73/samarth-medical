SAMARTH Medical

go to the path / folder cd src\databaseCode\database.js and write sqlite3 database.db to write query
--new user query----
INSERT INTO users (username, password, role) VALUES ('adminUser', 'securePassword123', 'admin');

--update user query------
UPDATE users SET password = 'newSecurePassword456' WHERE username = 'adminUser';

--delete user query----
DELETE FROM users WHERE username = 'adminUser';

--add column to any table---
ALTER TABLE medicalData ADD COLUMN caseNo TEXT;

release
package.json - src to dist
main.js - win.loadURL("http://localhost:8080"); to win.loadURL(`file://${path.join(__dirname, "index.html")}`);
database.js - const db = new sqlite3.Database(path.join(__dirname, "database.db"), (err) => { 
    to 
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {

add these lines to copy database
let dbPath = path.join(app.getPath('userData'), 'database.db');
const sourceDbPath = path.join(__dirname, 'database.db');
fs.copyFileSync(sourceDbPath, dbPath);

if dev already running then stop first and run

npm run build 
npm run dist



---------------
development

npm run start