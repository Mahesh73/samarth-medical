const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  loginUser: (username, password) =>
    ipcRenderer.invoke("authenticate-user", { username, password }),
  backupDatabase: () => ipcRenderer.invoke("backup-database"),
  saveMedicalData: (data) => ipcRenderer.invoke("save-medicalData", data),
  getMedicalData: () => ipcRenderer.invoke("get-medicalData"),
  deleteMedicalData: (id) => ipcRenderer.invoke("deleteMedicalData", id),
  updateMedicalData: (data) => ipcRenderer.invoke("updateMedicalData", data),
  getCustomerData: () => ipcRenderer.invoke("get-customer-data"),
  addCustomerData: (customer) =>
    ipcRenderer.invoke("add-customer-data", customer),
  updateCustomerData: (customer) =>
    ipcRenderer.invoke("update-customer-data", customer),
  deleteCustomerData: (code) =>
    ipcRenderer.invoke("delete-customer-data", code),
  getTransportNames: () => ipcRenderer.invoke("get-transport-names"),
  getCityNames: () => ipcRenderer.invoke("get-city-names"),
  printData: (htmlContent) => ipcRenderer.invoke("print-data", htmlContent),
  getConnection: () => ipcRenderer.invoke("get-connection"),
  getTransportData: () => ipcRenderer.invoke("get-transport-data"),
  addTransportData: (transport) =>
    ipcRenderer.invoke("add-transport-data", transport),
  updateTransportData: (transport) =>
    ipcRenderer.invoke("update-transport-data", transport),
  deleteTransportData: (id) => ipcRenderer.invoke("delete-transport-data", id),
  getMedicalDataByTransportOrCity: (transportNames, cities) =>
    ipcRenderer.invoke("get-MedicalData-By-TransportOrCity", {transportNames, cities}),
});
