const router = require("express").Router();
const workerController = require("../controller/workerController");
const workerValidation = require("../validation/WorkerValidation");
const {
  validateAttendanceScan,
  validatePieceWork,
} = require("../validation/attendanceValidation");
const adminController = require("../controller/adminController");
const adminValidation = require("../validation/adminValidation");
const AttendanceController = require("../controller/attendanceCtrl");
const CompanyController = require("../controller/companyController");
const validateCompany = require("../validation/companyValidation");
const validatePiece = require("../validation/pieceValidation");
const pieceController = require("../controller/pieceController");
const WarehouseController = require("../controller/materialController");
const validateMaterial = require("../validation/materialValidation");
const validateWarehouse = require("../validation/warehouseValidation");
const expenseController = require("../controller/expenseController");
const balanceController = require("../controller/balance.controller");
const getMonthlyWorkerSalaries = require("../controller/salaryController");
const multer = require("multer");
const IncomingProductController = require("../controller/IncomingProduct.controller");
const upload = multer({ storage: multer.memoryStorage() });

const {
  createProductNorma,
  getAllProductNormas,
  updateProductNorma,
  deleteProductNorma,
  getProductNormaById,
} = require("../controller/productNormaController");
const {
  createProductEntry,
  getAllProductEntries,
} = require("../controller/productEntryController");
const { createSale, getAllSales } = require("../controller/saleController");

router.get("/balance", balanceController.getBalance);

router.post("/admin/login", adminController.login);
router.get("/admin/all", adminController.getAdmins);
router.get("/admin/:id", adminController.getAdminById);
router.post("/admin/create", adminValidation, adminController.createAdmin);
router.put("/admin/update/:id", adminValidation, adminController.updateAdmin);
router.delete("/admin/delete/:id", adminController.deleteAdmin);

router.get("/workers/all", workerController.getWorkers);
router.get("/workers/:id", workerController.getWorkerById);
router.post("/workers/create", workerValidation, workerController.createWorker);
router.put("/workers/update/:id", workerController.updateWorker);
router.put("/workers/status/:id", workerController.changeStatus);
router.delete("/workers/delete/:id", workerController.deleteWorker);

// Attendance Routes
router.post(
  "/attendance/scan",
  validateAttendanceScan,
  AttendanceController.handleQRScan
);
router.post(
  "/attendance/piecework",
  validatePieceWork,
  AttendanceController.addPieceWork
);
router.get("/attendance/todays", AttendanceController.getAttendanceTodays);
router.get(
  "/attendance/todaysPiecework",
  AttendanceController.getAttendanceTodaysPiecework
);
router.get("/attendance/all", AttendanceController.getAttendanceAll);
router.get("/attendance/:id", AttendanceController.getAttendanceById);
// all attendance

// Company Routes
router.get("/company/all", CompanyController.getCompanies);
router.post(
  "/company/create",
  validateCompany,
  CompanyController.createOrUpdateCompany
);
router.delete("/company/delete/:id", CompanyController.deleteCompany);

// Piece Routes
router.post("/piece", validatePiece, pieceController.createPiece);
router.get("/piece", pieceController.getAllPieces);
router.get("/piece/:id", pieceController.getPieceById);
router.put("/piece/:id", pieceController.updatePiece);
router.delete("/piece/:id", pieceController.deletePiece);

// Warehouse routes
router.post(
  "/warehouses",
  validateWarehouse,
  WarehouseController.createWarehouse
);
router.get("/warehouses", WarehouseController.getAllWarehouses);
router.get("/warehouses/:id", WarehouseController.getWarehouseById);
router.put(
  "/warehouses/:id",
  validateWarehouse,
  WarehouseController.updateWarehouse
);
router.delete("/warehouses/:id", WarehouseController.deleteWarehouse);

// Material routes
router.post(
  "/warehouses/materials",
  validateMaterial,
  WarehouseController.addMaterial
);
router.put(
  "/materials/:materialId",
  validateMaterial,
  WarehouseController.updateMaterial
);
router.delete("/materials/:materialId", WarehouseController.deleteMaterial);
router.get("/materials/:materialId", WarehouseController.getMaterial);
router.get(
  "/warehouses/:id/materials",
  WarehouseController.getMaterialsByWarehouseId
);
router.get("/material-all", WarehouseController.getAllMaterials);

// Expenses
router.post("/expenses/create", expenseController.createExpense);
router.get("/expenses/all", expenseController.getAllExpenses);
router.get("/expenses/:id", expenseController.getExpenseById);
router.put("/expenses/:id", expenseController.updateExpense);
router.delete("/expenses/:id", expenseController.deleteExpense);
router.post("/expenses/period", expenseController.getExpensesByPeriod);
router.get(
  "/expenses/relevant/:relevantId",
  expenseController.getExpenseByRelevantId
);

// Product Normas
router.post("/product-normas", upload.single("image"), createProductNorma);
router.get("/product-normas", getAllProductNormas);
router.get("/product-normas/:id", getProductNormaById);
router.put("/product-normas/:id", updateProductNorma);
router.delete("/product-normas/:id", deleteProductNorma);

// Product Entries
router.post("/product-entries", createProductEntry);
router.get("/product-entries", getAllProductEntries);

// Salary
router.post("/salary/monthly", getMonthlyWorkerSalaries);

// Sales
router.post("/sales-create", createSale);
router.get("/sales-all", getAllSales);

// Incoming Products
router.get(
  "/incoming/product",
  IncomingProductController.getAllIncomingProducts
);
router.get(
  "/incoming/product/:id",
  IncomingProductController.getIncomingProductById
);
router.post(
  "/incoming/product",
  upload.single("image"),
  IncomingProductController.createIncomingProduct
);
router.put(
  "/incoming/product/:id",
  upload.single("image"),
  IncomingProductController.updateIncomingProduct
);
router.delete(
  "/incoming/product/:id",
  IncomingProductController.deleteIncomingProduct
);

module.exports = router;

// const router = require("express").Router();
// const workerController = require("../controller/workerController");
// const workerValidation = require("../validation/WorkerValidation");
// const {
//   validateAttendanceScan,
//   validatePieceWork,
// } = require("../validation/attendanceValidation");
// const adminController = require("../controller/adminController");
// const adminValidation = require("../validation/adminValidation");
// const AttendanceController = require("../controller/attendanceCtrl");
// const CompanyController = require("../controller/companyController");
// const validateCompany = require("../validation/companyValidation");
// const validatePiece = require("../validation/pieceValidation");
// const pieceController = require("../controller/pieceController");
// const WarehouseController = require("../controller/materialController");
// const validateMaterial = require("../validation/materialValidation");
// const validateWarehouse = require("../validation/warehouseValidation");
// const expenseController = require("../controller/expenseController");
// const getMonthlyWorkerSalaries = require("../controller/salaryController");
// const multer = require("multer");
// const IncomingProductController = require("../controller/IncomingProduct.controller"); // Controller faylingizga yo‘lni sozlang
// const upload = multer({ storage: multer.memoryStorage() });

// // ===========================================================
// const {
//   createProductNorma,
//   getAllProductNormas,
// } = require("../controller/productNormaController");

// const {
//   createProductEntry,
//   getAllProductEntries,
// } = require("../controller/productEntryController");

// const { createSale, getAllSales } = require("../controller/saleController");

// router.post("/admin/login", adminController.login);

// router.get("/admin/all", adminController.getAdmins);

// router.get("/admin/:id", adminController.getAdminById);

// router.post("/admin/create", adminValidation, adminController.createAdmin);

// router.put("/admin/update/:id", adminValidation, adminController.updateAdmin);

// router.delete("/admin/delete/:id", adminController.deleteAdmin);

// router.get("/workers/all", workerController.getWorkers);

// router.get("/workers/:id", workerController.getWorkerById);

// router.post("/workers/create", workerValidation, workerController.createWorker);

// router.put("/workers/update/:id", workerController.updateWorker);

// router.put("/workers/status/:id", workerController.changeStatus);

// router.delete("/workers/delete/:id", workerController.deleteWorker);

// //==========================================================
// // Attendance Routes
// router.post(
//   "/attendance/scan",
//   validateAttendanceScan,
//   AttendanceController.handleQRScan
// );

// router.post(
//   "/attendance/piecework",
//   validatePieceWork,
//   AttendanceController.addPieceWork
// );

// router.get("/attendance/:id", AttendanceController.getAttendanceById);

// //==========================================================
// // Company Routes

// router.get("/company/all", CompanyController.getCompanies);

// router.post(
//   "/company/create",
//   validateCompany,
//   CompanyController.createOrUpdateCompany
// );

// router.delete("/company/delete/:id", CompanyController.deleteCompany);

// //==========================================================
// // Piece Routes

// router.post("/piece", validatePiece, pieceController.createPiece);

// router.get("/piece", pieceController.getAllPieces);

// router.get("/piece/:id", pieceController.getPieceById);

// router.put("/piece/:id", pieceController.updatePiece);

// router.delete("/piece/:id", pieceController.deletePiece);

// //==========================================================
// // Warehouse routes
// router.post(
//   "/warehouses",
//   validateWarehouse,
//   WarehouseController.createWarehouse
// ); // Create warehouse
// router.get("/warehouses", WarehouseController.getAllWarehouses); // Get all warehouses
// router.get("/warehouses/:id", WarehouseController.getWarehouseById); // Get warehouse by ID
// router.put(
//   "/warehouses/:id",
//   validateWarehouse,
//   WarehouseController.updateWarehouse
// ); // Update warehouse
// router.delete("/warehouses/:id", WarehouseController.deleteWarehouse); // Delete warehouse

// // Material routes
// router.post(
//   "/warehouses/materials",
//   validateMaterial,
//   WarehouseController.addMaterial
// ); // Add material to warehouse
// router.put(
//   "/materials/:materialId",
//   validateMaterial,
//   WarehouseController.updateMaterial
// ); // Update material
// router.delete("/materials/:materialId", WarehouseController.deleteMaterial); // Delete material
// router.get("/materials/:materialId", WarehouseController.getMaterial); // Get material by ID
// router.get(
//   "/warehouses/:id/materials",
//   WarehouseController.getMaterialsByWarehouseId
// );

// router.get("/material-all", WarehouseController.getAllMaterials);

// // Expenses
// router.post("/expenses/create", expenseController.createExpense);
// router.get("/expenses/all", expenseController.getAllExpenses);
// router.get("/expenses/:id", expenseController.getExpenseById);
// router.put("/expenses/:id", expenseController.updateExpense);
// router.delete("/expenses/:id", expenseController.deleteExpense);
// router.post("/expenses/period", expenseController.getExpensesByPeriod);
// router.get(
//   "/expenses/relevant/:relevantId",
//   expenseController.getExpenseByRelevantId
// );

// router.post("/product-normas", upload.single("image"), createProductNorma);
// router.get("/product-normas", getAllProductNormas);

// router.post("/product-entries", createProductEntry);
// router.get("/product-entries", getAllProductEntries);

// // salary

// router.post("/salary/monthly", getMonthlyWorkerSalaries);

// // sales
// router.post("/sales-create", createSale);
// router.get("/sales-all", getAllSales);

// //==========================================================
// router.get("/incoming/product", IncomingProductController.getAllIncomingProducts);
// router.get("/incoming/product/:id", IncomingProductController.getIncomingProductById);
// router.post("/incoming/product", upload.single("image"), IncomingProductController.createIncomingProduct);
// router.put("/incoming/product/:id", upload.single("image"), IncomingProductController.updateIncomingProduct);
// router.delete("/incoming/product/:id", IncomingProductController.deleteIncomingProduct);

// module.exports = router;
