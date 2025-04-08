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
const getMonthlyWorkerSalaries = require("../controller/salaryController");
const {
  createProductNorma,
  getAllProductNormas,
} = require("../controller/productNormaController");

const {
  createProductEntry,
  getAllProductEntries,
} = require("../controller/productEntryController");

const { createSale, getAllSales } = require("../controller/saleController");

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

//==========================================================
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

router.get("/attendance/:id", AttendanceController.getAttendanceById);

//==========================================================
// Company Routes

router.get("/company/all", CompanyController.getCompanies);

router.post(
  "/company/create",
  validateCompany,
  CompanyController.createOrUpdateCompany
);

router.delete("/company/delete/:id", CompanyController.deleteCompany);

//==========================================================
// Piece Routes

router.post("/piece", validatePiece, pieceController.createPiece);

router.get("/piece", pieceController.getAllPieces);

router.get("/piece/:id", pieceController.getPieceById);

router.put("/piece/:id", pieceController.updatePiece);

router.delete("/piece/:id", pieceController.deletePiece);

//==========================================================
// Warehouse routes
router.post(
  "/warehouses",
  validateWarehouse,
  WarehouseController.createWarehouse
); // Create warehouse
router.get("/warehouses", WarehouseController.getAllWarehouses); // Get all warehouses
router.get("/warehouses/:id", WarehouseController.getWarehouseById); // Get warehouse by ID
router.put(
  "/warehouses/:id",
  validateWarehouse,
  WarehouseController.updateWarehouse
); // Update warehouse
router.delete("/warehouses/:id", WarehouseController.deleteWarehouse); // Delete warehouse

// Material routes
router.post(
  "/warehouses/materials",
  validateMaterial,
  WarehouseController.addMaterial
); // Add material to warehouse
router.put(
  "/materials/:materialId",
  validateMaterial,
  WarehouseController.updateMaterial
); // Update material
router.delete("/materials/:materialId", WarehouseController.deleteMaterial); // Delete material
router.get("/materials/:materialId", WarehouseController.getMaterial); // Get material by ID
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

router.post("/product-normas", createProductNorma);
router.get("/product-normas", getAllProductNormas);

router.post("/product-entries", createProductEntry);
router.get("/product-entries", getAllProductEntries);

// salary

router.post("/salary/monthly", getMonthlyWorkerSalaries);

// sales
router.post("/sales-create", createSale);
router.post("/sales-all", getAllSales);

module.exports = router;
