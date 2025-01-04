const sqlite3 = require("sqlite3").verbose();

// Connect to the SQLite database
const db = new sqlite3.Database("./src/databaseCode/database.db", {  
    verbose: true  
  });

db.serialize(function () {
  db.run(`CREATE TABLE IF NOT EXISTS customers(id INTEGER PRIMARY KEY AUTOINCREMENT,code TEXT,customer_name_marathi TEXT,customer_name_english TEXT,city_marathi TEXT,city_english TEXT,address_marathi TEXT,address_english TEXT);`);
  const stmt = db.prepare("INSERT INTO customers(code,customer_name_marathi,customer_name_english,city_marathi,city_english,address_marathi,address_english)VALUES(?,?,?,?,?,?,?);");  

  const jsonData = [
    {
      CODE: "A001",
      CUSTOMER_NAME_MARATHI: "डॉ सुनील माजोलवार",
      CUSTOMER_NAME_ENGLISH: "DR SUNIL MAJOLWAR",
      CITY_MARATHI: "चंद्रपूर",
      CITY_ENGLISH: "CHANDRAPUR",
    },
  ]

  jsonData.forEach((customer) => {  
    stmt.run([  
     customer.CODE,  
     customer.CUSTOMER_NAME_MARATHI,  
     customer.CUSTOMER_NAME_ENGLISH,  
     customer.CITY_MARATHI,  
     customer.CITY_ENGLISH,  
     customer.ADDRESS_MARATHI ?? null,  
     customer.ADDRESS_ENGLISH ?? null,  
    ], (err) => {  
     if (err) {  
       console.error(err);  
     }  
    });  
   });
   db.run("UPDATE customers SET id = ROWID;", (err) => {  
    if (err) {  
     console.error(err);  
    }  
   }); 

  stmt.finalize((err) => {  
    if (err) {  
     console.error(err);  
    }  
   });

});

db.close((err) => {  
    if (err) {  
     console.error(err);  
    }  
  });