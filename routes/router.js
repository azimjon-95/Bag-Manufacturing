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
const {
  createSale,
  getAllSales,
  getDebtors,
  payDebt,
} = require("../controller/saleController");

const {
  getMonthlyEntries,
  getMonthlyMaterialUsage,
  getMonthlySales,
} = require("../controller/statisticController");

const brakController = require("../controller/brakController");

// Dashboard Routes
const dashboardController = require("../controller/dashboardController");
const brakValidation = require("../validation/brakValidation");
const CustomerController = require("../controller/customerController");
const customerValidation = require("../validation/customerValidation");
const aktsverkaController = require("../controller/aktsverka");

router.get("/dashboard", dashboardController.getDashboardData);

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
router.put("/workers/salary/:id", workerController.giveSalary);
router.get("/workers/given-salaries", workerController.getSalaries);

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
router.get("/sales-debtors", getDebtors);
router.post("/sales-pay-debt", payDebt);

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

// statistics
router.get("/statistics", getMonthlyEntries);
router.get("/statistics/materials", getMonthlyMaterialUsage);
router.get("/statistics/sales", getMonthlySales);

// brak
router.post("/brak-create", [brakValidation], brakController.create);
router.get("/brak-all", brakController.getAll);

// customer
router.get("/customers", CustomerController.getAllCustomers);
router.post(
  "/customers/create",
  [customerValidation],
  CustomerController.createCustomer
);
router.get("/customers/:id", CustomerController.getCustomerById);
router.put("/customers/:id", CustomerController.updateCustomer);
router.delete("/customers/:id", CustomerController.deleteCustomer);
router.put("/customers/update-balans/:id", CustomerController.updateBalans);

// aktsverkaController
router.post("/dalolatnoma", aktsverkaController.getOne);

module.exports = router;
