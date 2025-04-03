const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const db = require("../src/databaseCode/database");
const fs = require("fs");

async function backupDatabase() {
  const { filePath } = await dialog.showSaveDialog({
    title: "Save Database Backup",
    defaultPath: path.join(
      app.getPath("documents"),
      `database_backup_${new Date().toISOString().split("T")[0]}.db`
    ),
    buttonLabel: "Save Backup",
    filters: [{ name: "SQLite Database", extensions: ["db"] }],
  });

  if (!filePath) return; // If no location is chosen, exit
  const dbPath = path.join(app.getPath("userData"), "database.db");

  try {
    fs.copyFileSync(dbPath, filePath);
    console.log("Database backup created at:", filePath);
  } catch (error) {
    console.error("Error creating database backup:", error);
  }
}

ipcMain.handle("backup-database", backupDatabase);

ipcMain.handle("authenticate-user", async (event, { username, password }) => {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT role FROM users WHERE username = ? AND password = ?",
      [username, password],
      (err, row) => {
        if (err) {
          console.error("Database error:", err);
          reject(err.message);
        } else if (row) {
          resolve({ success: true, role: row.role });
        } else {
          resolve({ success: false, error: "Invalid username or password" });
        }
      }
    );
  });
});

ipcMain.handle("save-medicalData", async (event, data) => {
  return new Promise((resolve, reject) => {
    const createdDate = new Date().toISOString();
    const updatedDate = createdDate;
    const placeholders = data.invoice.map(() => "?").join(",");
    const query = `INSERT INTO medicalData (customerCode, customerNameEnglish, customerNameMarathi, invoice,
     partyName, description, cityEnglish, cityMarathi, transportNameEnglish, transportNameMarathi, billValue,
     caseNo, createdDate, updatedDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const invoiceNoJSON = JSON.stringify(data.invoice);
    const values = [
      data.customerCode,
      data.customerNameEnglish,
      data.customerNameMarathi,
      invoiceNoJSON,
      data.partyName,
      data.description,
      data.cityEnglish,
      data.cityMarathi,
      data.transportNameEnglish,
      data.transportNameMarathi,
      data.billValue,
      data.caseNo || "",
      createdDate,
      updatedDate,
    ];
    db.all(
      `SELECT * FROM medicalData WHERE EXISTS (
         SELECT 1 FROM json_each(medicalData.invoice)
         WHERE json_each.value IN (${placeholders})
       )`,
      data.invoice,
      (err, rows) => {
        if (err) {
          console.error(err.message);
          reject(err);
        }
        if (rows && rows.length > 0) {
          // Step 2: Return duplicate error if rows found
          const existingNos = rows.flatMap((row) => JSON.parse(row.invoice));
          const duplicates = data.invoice.filter((num) =>
            existingNos.includes(num)
          );
          resolve({
            error: `Duplicate invoice numbers found: ${duplicates.join(", ")}`,
          });
        } else {
          // Step 3: Insert if no duplicates
          db.run(query, values, function (err) {
            if (err) {
              console.error(err.message);
              reject(err);
            } else {
              resolve({ success: true });
            }
          });
        }
      }
    );
  });
});

ipcMain.handle("updateMedicalData", async (event, data) => {
  const invoiceNoJSON = JSON.stringify(data.invoice);
  const updatedDate = new Date().toISOString();
  const placeholders = data.invoice.map(() => "?").join(",");
  const query = `UPDATE medicalData SET customerCode = ?, customerNameEnglish = ?, customerNameMarathi = ?,
   invoice = ?, partyName = ?, description = ?, cityEnglish = ?, cityMarathi = ?, transportNameEnglish = ?,
   transportNameMarathi = ?, billValue = ?, caseNo = ?, updatedDate = ? WHERE id = ?`;
  const values = [
    data.customerCode,
    data.customerNameEnglish,
    data.customerNameMarathi,
    invoiceNoJSON,
    data.partyName,
    data.description,
    data.cityEnglish,
    data.cityMarathi,
    data.transportNameEnglish,
    data.transportNameMarathi,
    data.billValue,
    data.caseNo || "",
    updatedDate,
    data.id,
  ];
  const lowercasedInvoices = data.invoice.map((invoice) =>
    invoice.toLowerCase()
  );
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT * FROM medicalData WHERE EXISTS (
         SELECT 1 FROM json_each(medicalData.invoice)
         WHERE LOWER(json_each.value) IN (${placeholders})
       ) AND id != ?`,
      [...lowercasedInvoices, data.id],
      (err, rows) => {
        if (err) {
          console.error(err.message);
          reject(err);
        }
        if (rows && rows.length > 0) {
          // Step 2: Return duplicate error if rows found
          const existingNos = rows
            .flatMap((row) => JSON.parse(row.invoice))
            .map((item) => item.toLowerCase());
          const duplicates = lowercasedInvoices.filter((num) =>
            existingNos.includes(num)
          );
          resolve({
            error: `Duplicate invoice numbers found: ${duplicates.join(", ")}`,
          });
        } else {
          // Step 3: Insert if no duplicates
          db.run(query, values, function (err) {
            if (err) {
              console.error(err.message);
              reject(err);
            } else {
              resolve({ success: true });
            }
          });
        }
      }
    );
  });
});

// IPC listener to get invoices
ipcMain.handle("get-medicalData", async () => {
  return new Promise((resolve, reject) => {
    db.all(
      "SELECT * FROM medicalData ORDER BY updatedDate DESC",
      [],
      (err, rows) => {
        if (err) reject(err.message);
        resolve(rows);
      }
    );
  });
});

ipcMain.handle("deleteMedicalData", async (event, id) => {
  return new Promise((resolve, reject) => {
    db.run(`DELETE FROM medicalData WHERE id = ?`, [id], function (err) {
      if (err) {
        console.error(err.message);
        reject(err);
      } else {
        resolve({ success: true });
      }
    });
  });
});

ipcMain.handle("get-customer-data", async () => {
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM customers ORDER BY id DESC`, (err, rows) => {
      if (err) {
        console.error("Error fetching customer data:", err);
        reject("Error fetching customer data.");
      } else {
        resolve(rows);
      }
    });
  });
});

ipcMain.handle("get-transport-data", async () => {
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM TransportData ORDER BY id DESC`, (err, rows) => {
      if (err) {
        console.error("Error fetching customer data:", err);
        reject("Error fetching customer data.");
      } else {
        resolve(rows);
      }
    });
  });
});

ipcMain.handle("add-transport-data", async (_, transport) => {
  const {
    transport_name_english,
    transport_name_hindi,
    number,
    city,
    city_hindi,
    address,
  } = transport;
  return new Promise((resolve, reject) => {
    const cleanedTransportName = transport_name_english.trim().toLowerCase();
    db.get(
      "SELECT * FROM transportData WHERE LOWER(transport_name_english) = ?",
      [cleanedTransportName],
      (err, row) => {
        if (err) {
          console.error("Error checking transport details:", err);
          reject("Error checking transport details");
        } else if (row) {
          reject("Error: Transport Name already exists.");
        } else {
          const insertStmt = `INSERT INTO transportData (transport_name_english, transport_name_hindi, number, city, city_hindi, address)
        VALUES (?, ?, ?, ?, ?, ?)`;
          db.run(
            insertStmt,
            [
              transport_name_english,
              transport_name_hindi,
              number,
              city,
              city_hindi,
              address,
            ],
            function (err) {
              if (err) {
                console.error("Error adding transport details:", err);
                reject("Error: Could not add transport details.");
              } else {
                resolve("Transport details added successfully.");
              }
            }
          );
        }
      }
    );
  });
});

ipcMain.handle("update-transport-data", async (_, transport) => {
  const {
    id,
    transport_name_english,
    transport_name_hindi,
    number,
    city,
    city_hindi,
    address,
  } = transport;
  return new Promise((resolve, reject) => {
    const cleanedTransportName = transport_name_english.trim().toLowerCase();
    db.get(
      "SELECT * FROM transportData WHERE LOWER(transport_name_english) = ? AND id != ?",
      [cleanedTransportName, id],
      (err, row) => {
        if (err) {
          console.error("Error checking transport details:", err);
          reject("Error checking transport details");
        } else if (row) {
          reject("Error: Transport Name already exists.");
        } else {
          const updateStmt = `UPDATE transportData SET transport_name_english = ?, transport_name_hindi = ?, number = ?, city = ?, city_hindi = ?, address = ?
                          WHERE id = ?`;
          db.run(
            updateStmt,
            [
              transport_name_english,
              transport_name_hindi,
              number,
              city,
              city_hindi,
              address,
              id,
            ],
            function (err) {
              if (err) {
                console.error("Error adding transport details:", err);
                reject("Error: Could not add transport details.");
              } else if (this.changes === 0) {
                resolve("Customer code not found.");
              } else {
                resolve("Transport details added successfully.");
              }
            }
          );
        }
      }
    );
  });
});

ipcMain.handle("delete-transport-data", async (_, id) => {
  return new Promise((resolve, reject) => {
    const deleteStmt = `DELETE FROM transportData WHERE id = ?`;
    db.run(deleteStmt, [id], function (err) {
      if (err) {
        console.error("Error deleting transport:", err);
        reject("Error: Could not delete transport.");
      } else if (this.changes === 0) {
        resolve("Error: Transport id not found.");
      } else {
        resolve("Transport deleted successfully.");
      }
    });
  });
});

ipcMain.handle("add-customer-data", async (_, customer) => {
  return new Promise((resolve, reject) => {
    const {
      code,
      customer_name_english,
      customer_name_marathi,
      city_english,
      city_marathi,
      address_english,
      address_marathi,
    } = customer;

    const checkStmt = `SELECT 1 FROM customers WHERE code = ? LIMIT 1`;
    db.get(checkStmt, [code], (err, row) => {
      if (err) {
        console.error("Error checking customer code:", err);
        reject("Error checking customer code.");
      } else if (row) {
        // If customer_code exists, return an error message
        resolve("Error: Customer code already exists.");
      } else {
        const insertStmt = `INSERT INTO customers (code, customer_name_english, customer_name_marathi, city_english, city_marathi, address_english, address_marathi)
                          VALUES (?, ?, ?, ?, ?, ?, ?)`;
        db.run(
          insertStmt,
          [
            code,
            customer_name_english,
            customer_name_marathi,
            city_english,
            city_marathi,
            address_english,
            address_marathi,
          ],
          function (err) {
            if (err) {
              console.error("Error adding customer:", err);
              reject("Error: Could not add customer.");
            } else {
              resolve("Customer added successfully.");
            }
          }
        );
      }
    });
  });
});

ipcMain.handle("update-customer-data", async (_, customer) => {
  return new Promise((resolve, reject) => {
    const {
      code,
      customer_name_english,
      customer_name_marathi,
      city_english,
      city_marathi,
      address_english,
      address_marathi,
    } = customer;

    const updateStmt = `UPDATE customers
                        SET customer_name_english = ?, customer_name_marathi = ?, city_english = ?, city_marathi = ?, address_english = ?, address_marathi = ?
                        WHERE code = ?`;
    db.run(
      updateStmt,
      [
        customer_name_english,
        customer_name_marathi,
        city_english,
        city_marathi,
        address_english,
        address_marathi,
        code,
      ],
      function (err) {
        if (err) {
          console.error("Error updating customer:", err);
          reject("Error: Could not update customer.");
        } else if (this.changes === 0) {
          resolve("Customer code not found.");
        } else {
          resolve("Customer updated successfully.");
        }
      }
    );
  });
});

ipcMain.handle("delete-customer-data", async (_, code) => {
  return new Promise((resolve, reject) => {
    const deleteStmt = `DELETE FROM customers WHERE code = ?`;
    db.run(deleteStmt, [code], function (err) {
      if (err) {
        console.error("Error deleting customer:", err);
        reject("Error: Could not delete customer.");
      } else if (this.changes === 0) {
        // If no rows were affected, it means the code was not found
        resolve("Error: Customer code not found.");
      } else {
        resolve("Customer deleted successfully.");
      }
    });
  });
});

ipcMain.handle("get-transport-names", async () => {
  return new Promise((resolve, reject) => {
    const query = `SELECT DISTINCT transportNameEnglish FROM medicalData ORDER BY id DESC`;

    db.all(query, (err, rows) => {
      if (err) {
        console.error("Error fetching transport names:", err);
        reject("Error: Could not fetch transport names.");
      } else {
        const transportNames = rows.map((row) => row.transportNameEnglish);
        resolve(transportNames); 
      }
    });
  });
});

ipcMain.handle("get-city-names", async () => {
  return new Promise((resolve, reject) => {
    const query = `SELECT DISTINCT cityEnglish FROM medicalData ORDER BY id DESC`;

    db.all(query, (err, rows) => {
      if (err) {
        console.error("Error fetching city names:", err);
        reject("Error: Could not fetch city names.");
      } else {
        const city = rows.map((row) => row.cityEnglish);
        resolve(city);
      }
    });
  });
});

ipcMain.handle(
  "get-MedicalData-By-TransportOrCity",
  async (event, { transportNames, cities }) => {
    return new Promise((resolve, reject) => {
      const transportPlaceholders = transportNames.map(() => "?").join(",");
      const cityPlaceholders = cities.map(() => "?").join(",");
      const query = `
        SELECT *
        FROM medicalData
        WHERE TRIM(transportNameEnglish) IN (${transportPlaceholders})
          OR TRIM(cityEnglish) IN (${cityPlaceholders});
      `;
      const values = [...transportNames, ...cities];
      db.all(query, values, (err, rows) => {
        if (err) {
          console.error("Error fetching medical data:", err.message);
          reject("Error: Could not fetch medical data.");
        } else {
          resolve(rows);
        }
      });
    });
  }
);

ipcMain.handle("print-data", async (event, htmlContent) => {
  const printWindow = new BrowserWindow({
    show: true,
    webPreferences: {
      nodeIntegration: false,
    },
  });

  printWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`);

  printWindow.webContents.on("did-finish-load", () => {
    printWindow.webContents.print(
      {
        silent: true,
        deviceName: 'EPSON L3210 Series',
        // deviceName: 'Canon G3030 series HTTP',
        printBackground: true,
        pageSize: {
          width: 101600, // 4 inches * 25400 microns
          height: 152400, // 6 inches * 25400 microns
        },
        margins: {
          marginType: "none",
        },
        landscape: true
      },
      (success, errorType) => {
        if (!success) console.error(`Print failed: ${errorType}`);
        printWindow.close();
      }
    );
  });

});

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
    },
  });
  // win.loadURL("http://localhost:8080/#/"); // development
  win.loadURL(`file://${path.join(__dirname, "index.html")}`); //production
}

app.on("ready", createWindow);
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
