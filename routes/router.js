// const router = require("express").Router();
// const workerController = require("../controller/workerController");
// const workerValidation = require("../validation/WorkerValidation");
// const { validateAttendanceScan, validatePieceWork } = require("../validation/attendanceValidation");
// const adminController = require("../controller/adminController");
// const adminValidation = require("../validation/adminValidation");
// const AttendanceController = require('../controller/attendanceCtrl');
// const { validateWarehouse, validateMaterial } = require("../validation/materialValidation");
// const CompanyController = require('../controller/companyController');
// const validateCompany = require('../validation/companyValidation');
// const validatePiece = require('../validation/pieceValidation');
// const pieceController = require('../controller/pieceController');
// const warehouseController = require("../controller/materialController");

// // Admin Routes
// router.post("/admin/login", adminController.login);
// router.get("/admin/all", adminController.getAdmins);
// router.get("/admin/:id", adminController.getAdminById);
// router.post("/admin/create", adminValidation, adminController.createAdmin);
// router.put("/admin/update/:id", adminValidation, adminController.updateAdmin);
// router.delete("/admin/delete/:id", adminController.deleteAdmin);

// // Workers Routes
// router.get("/workers/all", workerController.getWorkers);
// router.get("/workers/:id", workerController.getWorkerById);
// router.post("/workers/create", workerValidation, workerController.createWorker);
// router.put("/workers/update/:id", workerController.updateWorker);
// router.put("/workers/status/:id", workerController.changeStatus);
// router.delete("/workers/delete/:id", workerController.deleteWorker);

// // Attendance Routes
// router.post('/attendance/scan', validateAttendanceScan, AttendanceController.handleQRScan);
// router.post('/attendance/piecework', validatePieceWork, AttendanceController.addPieceWork);
// router.get('/attendance/:id', AttendanceController.getAttendanceById);

// // Company Routes
// router.get('/company/all', CompanyController.getCompanies);
// router.post('/company/create', validateCompany, CompanyController.createOrUpdateCompany);
// router.delete('/company/delete/:id', CompanyController.deleteCompany);

// // Piece Routes
// router.post("/piece", validatePiece, pieceController.createPiece);
// router.get("/piece", pieceController.getAllPieces);
// router.get("/piece/:id", pieceController.getPieceById);
// router.put("/piece/:id", pieceController.updatePiece);
// router.delete("/piece/:id", pieceController.deletePiece);

// // Warehouse CRUD routes
// router.post("/warehouse", validateWarehouse, warehouseController.createWarehouse);
// router.get("/warehouse", warehouseController.getAllWarehouses);
// router.get("/warehouse/:id", warehouseController.getWarehouseById);
// router.put("/warehouse/:id", validateWarehouse, warehouseController.updateWarehouse);
// router.delete("/warehouse/:id", warehouseController.deleteWarehouse);

// // Material CRUD Routes within Warehouse
// router.post("/warehouse/:id/materials", validateMaterial, warehouseController.addMaterial);
// router.get("/warehouse/:id/materials/:materialId", warehouseController.getMaterial);
// router.put("/warehouse/:id/materials/:materialId", validateMaterial, warehouseController.updateMaterial);
// router.delete("/warehouse/:id/materials/:materialId", warehouseController.deleteMaterial);

// module.exports = router;


























const router = require("express").Router();
const workerController = require("../controller/workerController");
const workerValidation = require("../validation/WorkerValidation");
const { validateAttendanceScan, validatePieceWork } = require("../validation/attendanceValidation");
const adminController = require("../controller/adminController");
const adminValidation = require("../validation/adminValidation");
const AttendanceController = require('../controller/attendanceCtrl');
const { validateWarehouse, validateMaterial } = require("../validation/materialValidation");
const CompanyController = require('../controller/companyController');
const validateCompany = require('../validation/companyValidation');
const validatePiece = require('../validation/pieceValidation');
const pieceController = require('../controller/pieceController');
const warehouseController = require("../controller/materialController");


//==========================================================
// Admin Routes

/**
 * @swagger
 * /api/admin/login:
 *   post:
 *     summary: Admin login
 *     tags: [Admins]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               login:
 *                 type: string
 *                 description: Admin login
 *               password:
 *                 type: string
 *                 description: Admin password
 *             required:
 *               - login
 *               - password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: Authentication token
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               example: auth=token_value; HttpOnly; Path=/
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Server error
 *     security: [] # This endpoint doesn't require authentication
 */
router.post("/admin/login", adminController.login);

/**
 * @swagger
 * /api/admin/all:
 *   get:
 *     summary: Fetch all admins
 *     description: Retrieve a list of all admin users from the system.
 *     security:
 *       - ApiKeyAuth: [] # Requires the auth cookie with Bearer token
 *     responses:
 *       200:
 *         description: List of admins
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   firstName:
 *                     type: string
 *                     example: "John"
 *                   lastName:
 *                     type: string
 *                     example: "Doe"
 *                   login:
 *                     type: string
 *                     example: "admin123"
 *                   password:
 *                     type: string
 *                     example: "hashedpassword"
 *                   role:
 *                     type: string
 *                     enum: ["Manager", "Admin", "SuperAdmin"]
 *                     example: "Manager"
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                     example: "2025-04-01T08:33:59.040Z"
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *                     example: "2025-04-01T08:33:59.040Z"
 *       401:
 *         description: Unauthorized - Invalid or missing auth token
 *       500:
 *         description: Server error
 */
router.get("/admin/all", adminController.getAdmins);

/**
 * @swagger
 * /api/admin/{id}:
 *   get:
 *     summary: Fetch an admin by ID
 *     tags: [Admins]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Admin ID
 *     responses:
 *       200:
 *         description: Admin details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 firstName:
 *                   type: string
 *                 lastName:
 *                   type: string
 *                 login:
 *                   type: string
 *                 password:
 *                   type: string
 *                 role:
 *                   type: string
 *                   enum: ["Owner", "Manager", "Warehouseman"]
 *                   default: Manager
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Admin not found
 *       500:
 *         description: Server error
 */
router.get("/admin/:id", adminController.getAdminById);

/**
 * @swagger
 * /api/admin/create:
 *   post:
 *     summary: Create a new admin
 *     tags: [Admins]
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - login
 *               - password
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               login:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: ["Owner", "Manager", "Warehouseman"]
 *                 default: Manager
 *     responses:
 *       201:
 *         description: Admin created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 firstName:
 *                   type: string
 *                 lastName:
 *                   type: string
 *                 login:
 *                   type: string
 *                 password:
 *                   type: string
 *                 role:
 *                   type: string
 *                   enum: ["Owner", "Manager", "Warehouseman"]
 *                   default: Manager
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.post("/admin/create", adminValidation, adminController.createAdmin);

/**
 * @swagger
 * /api/admin/update/{id}:
 *   put:
 *     summary: Update an admin
 *     tags: [Admins]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Admin ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - login
 *               - password
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               login:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: ["Owner", "Manager", "Warehouseman"]
 *                 default: Manager
 *     responses:
 *       200:
 *         description: Admin updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 firstName:
 *                   type: string
 *                 lastName:
 *                   type: string
 *                 login:
 *                   type: string
 *                 password:
 *                   type: string
 *                 role:
 *                   type: string
 *                   enum: ["Owner", "Manager", "Warehouseman"]
 *                   default: Manager
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Admin not found
 *       500:
 *         description: Server error
 */
router.put("/admin/update/:id", adminValidation, adminController.updateAdmin);

/**
 * @swagger
 * /api/admin/delete/{id}:
 *   delete:
 *     summary: Delete an admin
 *     tags: [Admins]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Admin ID
 *     responses:
 *       200:
 *         description: Admin deleted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Admin not found
 *       500:
 *         description: Server error
 */
router.delete("/admin/delete/:id", adminController.deleteAdmin);

//==========================================================
// Workers Routes

/**
 * @swagger
 * /api/workers/all:
 *   get:
 *     summary: Fetch all workers
 *     tags: [Workers]
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: List of workers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: Worker ID
 *                   fullname:
 *                     type: string
 *                     description: Worker’s full name
 *                   phone:
 *                     type: string
 *                     description: Unique phone number
 *                   workType:
 *                     type: string
 *                     enum: ["daily", "hourly", "task"]
 *                     description: Work type
 *                   rate:
 *                     type: number
 *                     description: Payment rate
 *                   isActive:
 *                     type: boolean
 *                     description: Active status
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                     description: Creation timestamp
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *                     description: Last update timestamp
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get("/workers/all", workerController.getWorkers);

/**
 * @swagger
 * /api/workers/{id}:
 *   get:
 *     summary: Fetch a worker by ID
 *     tags: [Workers]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Worker ID
 *     responses:
 *       200:
 *         description: Worker details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: Worker ID
 *                 fullname:
 *                   type: string
 *                   description: Worker’s full name
 *                 phone:
 *                   type: string
 *                   description: Unique phone number
 *                 workType:
 *                   type: string
 *                   enum: ["daily", "hourly", "task"]
 *                   description: Work type
 *                 rate:
 *                   type: number
 *                   description: Payment rate
 *                 isActive:
 *                   type: boolean
 *                   description: Active status
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   description: Creation timestamp
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                   description: Last update timestamp
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Worker not found
 *       500:
 *         description: Server error
 */
router.get("/workers/:id", workerController.getWorkerById);

/**
 * @swagger
 * /api/workers/create:
 *   post:
 *     summary: Create a new worker
 *     tags: [Workers]
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullname
 *               - phone
 *               - workType
 *               - rate
 *             properties:
 *               fullname:
 *                 type: string
 *                 description: Worker’s full name
 *               phone:
 *                 type: string
 *                 description: Unique phone number
 *               workType:
 *                 type: string
 *                 enum: ["daily", "hourly", "task"]
 *                 description: Work type
 *               rate:
 *                 type: number
 *                 description: Payment rate
 *               isActive:
 *                 type: boolean
 *                 description: Active status
 *                 default: false
 *     responses:
 *       201:
 *         description: Worker created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: Worker ID
 *                 fullname:
 *                   type: string
 *                   description: Worker’s full name
 *                 phone:
 *                   type: string
 *                   description: Unique phone number
 *                 workType:
 *                   type: string
 *                   enum: ["daily", "hourly", "task"]
 *                   description: Work type
 *                 rate:
 *                   type: number
 *                   description: Payment rate
 *                 isActive:
 *                   type: boolean
 *                   description: Active status
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   description: Creation timestamp
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                   description: Last update timestamp
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.post("/workers/create", workerValidation, workerController.createWorker);

/**
 * @swagger
 * /api/workers/update/{id}:
 *   put:
 *     summary: Update a worker
 *     tags: [Workers]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Worker ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullname
 *               - phone
 *               - workType
 *               - rate
 *             properties:
 *               fullname:
 *                 type: string
 *                 description: Worker’s full name
 *               phone:
 *                 type: string
 *                 description: Unique phone number
 *               workType:
 *                 type: string
 *                 enum: ["daily", "hourly", "task"]
 *                 description: Work type
 *               rate:
 *                 type: number
 *                 description: Payment rate
 *               isActive:
 *                 type: boolean
 *                 description: Active status
 *                 default: false
 *     responses:
 *       200:
 *         description: Worker updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: Worker ID
 *                 fullname:
 *                   type: string
 *                   description: Worker’s full name
 *                 phone:
 *                   type: string
 *                   description: Unique phone number
 *                 workType:
 *                   type: string
 *                   enum: ["daily", "hourly", "task"]
 *                   description: Work type
 *                 rate:
 *                   type: number
 *                   description: Payment rate
 *                 isActive:
 *                   type: boolean
 *                   description: Active status
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   description: Creation timestamp
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                   description: Last update timestamp
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Worker not found
 *       500:
 *         description: Server error
 */
router.put("/workers/update/:id", workerController.updateWorker);

/**
 * @swagger
 * /api/workers/status/{id}:
 *   put:
 *     summary: Update worker status
 *     tags: [Workers]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Worker ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isActive:
 *                 type: boolean
 *                 description: Worker active status
 *             required:
 *               - isActive
 *     responses:
 *       200:
 *         description: Status updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: Worker ID
 *                 fullname:
 *                   type: string
 *                   description: Worker’s full name
 *                 phone:
 *                   type: string
 *                   description: Unique phone number
 *                 workType:
 *                   type: string
 *                   enum: ["daily", "hourly", "task"]
 *                   description: Work type
 *                 rate:
 *                   type: number
 *                   description: Payment rate
 *                 isActive:
 *                   type: boolean
 *                   description: Active status
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   description: Creation timestamp
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                   description: Last update timestamp
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Worker not found
 *       500:
 *         description: Server error
 */
router.put("/workers/status/:id", workerController.changeStatus);

/**
 * @swagger
 * /api/workers/delete/{id}:
 *   delete:
 *     summary: Delete a worker
 *     tags: [Workers]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Worker ID
 *     responses:
 *       200:
 *         description: Worker deleted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Worker not found
 *       500:
 *         description: Server error
 */
router.delete("/workers/delete/:id", workerController.deleteWorker);

//==========================================================
// Attendance Routes

/**
 * @swagger
 * /api/attendance/scan:
 *   post:
 *     summary: Handle QR scan for attendance
 *     tags: [Attendance]
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               workerId:
 *                 type: string
 *                 description: Worker ID (MongoDB _id used as QR code)
 *             required:
 *               - workerId
 *     responses:
 *       201:
 *         description: Worker arrival recorded
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Ishga kelish qayd etildi"
 *                 attendance:
 *                   $ref: '#/components/schemas/Attendance'
 *       200:
 *         description: Worker departure recorded
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Ishdan ketish qayd etildi"
 *                 attendance:
 *                   $ref: '#/components/schemas/Attendance'
 *       400:
 *         description: Attendance already completed for today
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Worker not found
 *       500:
 *         description: Server error
 */
router.post('/attendance/scan', validateAttendanceScan, AttendanceController.handleQRScan);

/**
 * @swagger
 * /api/attendance/piecework:
 *   post:
 *     summary: Add piecework for an attendance record
 *     tags: [Attendance]
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               attendanceId:
 *                 type: string
 *                 description: Attendance record ID
 *               pieceWorkData:
 *                 type: object
 *                 properties:
 *                   taskName:
 *                     type: string
 *                     description: Name of the task
 *                   quantity:
 *                     type: number
 *                     description: Number of completed tasks
 *                   unitPrice:
 *                     type: number
 *                     description: Price per task unit
 *                   totalPrice:
 *                     type: number
 *                     description: Total price for the task (automatically calculated as quantity * unitPrice)
 *                     readOnly: true
 *                 required:
 *                   - taskName
 *                   - quantity
 *                   - unitPrice
 *             required:
 *               - attendanceId
 *               - pieceWorkData
 *     responses:
 *       200:
 *         description: Piecework added
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Ish qo'shildi"
 *                 attendance:
 *                   $ref: '#/components/schemas/Attendance'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Attendance not found or not piecework type
 *       500:
 *         description: Server error
 */
router.post('/attendance/piecework', validatePieceWork, AttendanceController.addPieceWork);

/**
 * @swagger
 * /api/attendance/{id}:
 *   get:
 *     summary: Fetch an attendance record by ID
 *     tags: [Attendance]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Attendance ID
 *     responses:
 *       200:
 *         description: Attendance details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Attendance topildi"
 *                 attendance:
 *                   $ref: '#/components/schemas/Attendance'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Attendance not found
 *       500:
 *         description: Server error
 */
router.get('/attendance/:id', AttendanceController.getAttendanceById);

//==========================================================
// Company Routes

/**
 * @swagger
 * /api/company/all:
 *   get:
 *     summary: Fetch all companies (only one allowed)
 *     tags: [Company]
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: List of companies
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Kompaniyalar ro'yxati"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Company'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/company/all', CompanyController.getCompanies);

/**
 * @swagger
 * /api/company/create:
 *   post:
 *     summary: Create a new company (updates existing if one exists)
 *     tags: [Company]
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Company name
 *               address:
 *                 type: string
 *                 description: Company address (optional)
 *               defaultWorkingHours:
 *                 type: object
 *                 properties:
 *                   start:
 *                     type: string
 *                     description: Start time in HH:MM format (e.g., 08:00)
 *                   end:
 *                     type: string
 *                     description: End time in HH:MM format (e.g., 17:00)
 *                 required:
 *                   - start
 *                   - end
 *             required:
 *               - name
 *     responses:
 *       201:
 *         description: Company created (first time)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Kompaniya muvaffaqiyatli yaratildi"
 *                 data:
 *                   $ref: '#/components/schemas/Company'
 *       200:
 *         description: Existing company updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Mavjud kompaniya yangilandi"
 *                 data:
 *                   $ref: '#/components/schemas/Company'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Validatsiya xatosi"
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Kompaniya nomi kiritish majburiy"]
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/company/create', validateCompany, CompanyController.createOrUpdateCompany);

/**
 * @swagger
 * /api/company/delete/{id}:
 *   delete:
 *     summary: Delete a company by ID
 *     tags: [Company]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Company ID
 *     responses:
 *       200:
 *         description: Company deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Kompaniya muvaffaqiyatli o'chirildi"
 *                 data:
 *                   type: null
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Company not found
 *       500:
 *         description: Server error
 */
router.delete('/company/delete/:id', CompanyController.deleteCompany);


//==========================================================
// Piece Routes

/**
 * @swagger
 * /api/piece:
 *   post:
 *     summary: Create a new piece work
 *     tags: [Pieces]
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the piece work
 *               price:
 *                 type: number
 *                 description: Price of the piece work
 *               type:
 *                 type: string
 *                 default: Dona
 *                 description: Type of work (fixed as Dona)
 *     responses:
 *       201:
 *         description: Piece work created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: Unique identifier
 *                 name:
 *                   type: string
 *                   description: Name of the piece work
 *                 price:
 *                   type: number
 *                   description: Price of the piece work
 *                 type:
 *                   type: string
 *                   default: Dona
 *                   description: Type of work
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   description: Creation timestamp
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                   description: Last update timestamp
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post("/piece", validatePiece, pieceController.createPiece);

/**
 * @swagger
 * /api/piece:
 *   get:
 *     summary: Fetch all piece works
 *     tags: [Pieces]
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: List of piece works
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: Unique identifier
 *                   name:
 *                     type: string
 *                     description: Name of the piece work
 *                   price:
 *                     type: number
 *                     description: Price of the piece work
 *                   type:
 *                     type: string
 *                     default: Dona
 *                     description: Type of work
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                     description: Creation timestamp
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *                     description: Last update timestamp
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get("/piece", pieceController.getAllPieces);

/**
 * @swagger
 * /api/piece/{id}:
 *   get:
 *     summary: Fetch a piece work by ID
 *     tags: [Pieces]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Piece work ID
 *     responses:
 *       200:
 *         description: Piece work details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: Unique identifier
 *                 name:
 *                   type: string
 *                   description: Name of the piece work
 *                 price:
 *                   type: number
 *                   description: Price of the piece work
 *                 type:
 *                   type: string
 *                   default: Dona
 *                   description: Type of work
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   description: Creation timestamp
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                   description: Last update timestamp
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Piece work not found
 *       500:
 *         description: Server error
 */
router.get("/piece/:id", pieceController.getPieceById);

/**
 * @swagger
 * /api/piece/{id}:
 *   put:
 *     summary: Update a piece work
 *     tags: [Pieces]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Piece work ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the piece work
 *               price:
 *                 type: number
 *                 description: Price of the piece work
 *               type:
 *                 type: string
 *                 default: Dona
 *                 description: Type of work (fixed as Dona)
 *     responses:
 *       200:
 *         description: Piece work updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: Unique identifier
 *                 name:
 *                   type: string
 *                   description: Name of the piece work
 *                 price:
 *                   type: number
 *                   description: Price of the piece work
 *                 type:
 *                   type: string
 *                   default: Dona
 *                   description: Type of work
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   description: Creation timestamp
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                   description: Last update timestamp
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Piece work not found
 *       500:
 *         description: Server error
 */
router.put("/piece/:id", pieceController.updatePiece);

/**
 * @swagger
 * /api/piece/{id}:
 *   delete:
 *     summary: Delete a piece work
 *     tags: [Pieces]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Piece work ID
 *     responses:
 *       200:
 *         description: Piece work deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Confirmation message
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Piece work not found
 *       500:
 *         description: Server error
 */
router.delete("/piece/:id", pieceController.deletePiece);


//==========================================================
// Warehouse CRUD routes

// models/Material.js (No changes to the Mongoose schema, only Swagger annotations added below)

// Warehouse CRUD Routes with Swagger Annotations

/**
 * @swagger
 * components:
 *   schemas:
 *     Material:
 *       type: object
 *       required:
 *         - name
 *         - unit
 *         - quantity
 *         - price
 *       properties:
 *         name:
 *           type: string
 *           description: Materialning nomi
 *           example: "Tsement"
 *         unit:
 *           type: string
 *           enum: ["kg", "piece", "meter", "liter", "roll"]
 *           description: Materialning o'lchov birligi
 *           example: "kg"
 *         quantity:
 *           type: number
 *           description: Materialning miqdori
 *           minimum: 0
 *           example: 500
 *         price:
 *           type: number
 *           description: Materialning narxi
 *           example: 25000
 *         category:
 *           type: string
 *           description: Materialning kategoriyasi (ixtiyoriy)
 *           example: "Qurilish materiallari"
 *         code:
 *           type: string
 *           description: Materialning noyob kodi (standart bo'sh qator)
 *           default: ""
 *           example: "CEM-001"
 *         supplier:
 *           type: string
 *           description: Materialni yetkazib beruvchi (standart bo'sh qator)
 *           default: ""
 *           example: "ABC Supplies"
 *         receivedDate:
 *           type: string
 *           format: date-time
 *           description: Material qabul qilingan sana (standart holatda hozirgi vaqt)
 *           default: "current timestamp"
 *           example: "2025-04-01T10:00:00Z"
 *         _id:
 *           type: string
 *           description: Materialning avtomatik generatsiya qilinadigan IDsi
 *           example: "615f2c8e9f1b2c001f8b4567"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Yaratilgan sana
 *           example: "2025-04-01T10:00:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Yangilangan sana
 *           example: "2025-04-01T12:00:00Z"
 *     WarehouseResponse:
 *       type: object
 *       properties:
 *         state:
 *           type: boolean
 *           description: Operatsiya muvaffaqiyatli bo'lganligi
 *           example: true
 *         message:
 *           type: string
 *           description: Operatsiya haqida xabar
 *           example: "Ombor muvaffaqiyatli yangilandi"
 *         innerData:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *               description: Omborning noyob identifikatori
 *               example: "615f2c8e9f1b2c001f8b1234"
 *             name:
 *               type: string
 *               description: Ombor nomi
 *               example: "Asosiy ombor"
 *             description:
 *               type: string
 *               description: Ombor tavsifi
 *               example: "Qurilish materiallari uchun ombor"
 *             category:
 *               type: string
 *               enum: ["Tayyor maxsulotlar", "Homashyolar"]
 *               description: Ombor kategoriyasi
 *               example: "Homashyolar"
 *             materials:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Material'
 *             createdAt:
 *               type: string
 *               format: date-time
 *               description: Yaratilgan sana
 *               example: "2025-04-01T10:00:00Z"
 *             updatedAt:
 *               type: string
 *               format: date-time
 *               description: Yangilangan sana
 *               example: "2025-04-01T12:00:00Z"
 */

/**
 * @swagger
 * /api/warehouse:
 *   post:
 *     summary: Yangi ombor yaratish
 *     tags: [Warehouses]
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - category
 *             properties:
 *               name:
 *                 type: string
 *                 description: Ombor nomi (noyob bo'lishi kerak)
 *                 example: "Asosiy ombor"
 *               description:
 *                 type: string
 *                 description: Ombor tavsifi
 *                 example: "Qurilish materiallari uchun ombor"
 *               category:
 *                 type: string
 *                 enum: ["Tayyor maxsulotlar", "Homashyolar"]
 *                 description: Ombor kategoriyasi
 *                 example: "Homashyolar"
 *     responses:
 *       201:
 *         description: Ombor muvaffaqiyatli yaratildi
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WarehouseResponse'
 *       400:
 *         description: Validatsiya xatosi
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server xatosi
 */
router.post("/warehouse", validateWarehouse, warehouseController.createWarehouse);

/**
 * @swagger
 * /api/warehouse:
 *   get:
 *     summary: Barcha omborlarni olish
 *     tags: [Warehouses]
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Omborlar ro'yxati
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 state:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 innerData:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/WarehouseResponse/properties/innerData'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server xatosi
 */
router.get("/warehouse", warehouseController.getAllWarehouses);

/**
 * @swagger
 * /api/warehouse/{id}:
 *   get:
 *     summary: Omborni ID bo'yicha olish
 *     tags: [Warehouses]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Ombor IDsi
 *     responses:
 *       200:
 *         description: Ombor ma'lumotlari
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WarehouseResponse'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Ombor topilmadi
 *       500:
 *         description: Server xatosi
 */
router.get("/warehouse/:id", warehouseController.getWarehouseById);

/**
 * @swagger
 * /api/warehouse/{id}:
 *   put:
 *     summary: Omborni yangilash
 *     tags: [Warehouses]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Ombor IDsi
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Ombor nomi (noyob bo'lishi kerak)
 *                 example: "Asosiy ombor"
 *               description:
 *                 type: string
 *                 description: Ombor tavsifi
 *                 example: "Qurilish materiallari uchun ombor"
 *               category:
 *                 type: string
 *                 enum: ["Tayyor maxsulotlar", "Homashyolar"]
 *                 description: Ombor kategoriyasi
 *                 example: "Homashyolar"
 *     responses:
 *       200:
 *         description: Ombor yangilandi
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WarehouseResponse'
 *       400:
 *         description: Validatsiya xatosi
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Ombor topilmadi
 *       500:
 *         description: Server xatosi
 */
router.put("/warehouse/:id", validateWarehouse, warehouseController.updateWarehouse);

/**
 * @swagger
 * /api/warehouse/{id}:
 *   delete:
 *     summary: Omborni o'chirish
 *     tags: [Warehouses]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Ombor IDsi
 *     responses:
 *       200:
 *         description: Ombor o'chirildi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 state:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 innerData:
 *                   type: null
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Ombor topilmadi
 *       500:
 *         description: Server xatosi
 */
router.delete("/warehouse/:id", warehouseController.deleteWarehouse);

// Material CRUD Routes within Warehouse

/**
 * @swagger
 * /api/warehouse/{id}/materials:
 *   post:
 *     summary: Omborga material qo'shish
 *     tags: [Materials]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Ombor IDsi
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Material'
 *     responses:
 *       201:
 *         description: Material qo'shildi
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WarehouseResponse'
 *       400:
 *         description: Validatsiya xatosi
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Ombor topilmadi
 *       500:
 *         description: Server xatosi
 */
router.post("/warehouse/:id/materials", validateMaterial, warehouseController.addMaterial);

/**
 * @swagger
 * /api/warehouse/{id}/materials/{materialId}:
 *   get:
 *     summary: Materialni ID bo'yicha olish
 *     tags: [Materials]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Ombor IDsi
 *       - in: path
 *         name: materialId
 *         required: true
 *         schema:
 *           type: string
 *         description: Material IDsi
 *     responses:
 *       200:
 *         description: Material ma'lumotlari
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 state:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 innerData:
 *                   $ref: '#/components/schemas/Material'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Ombor yoki material topilmadi
 *       500:
 *         description: Server xatosi
 */
router.get("/warehouse/:id/materials/:materialId", warehouseController.getMaterial);

/**
 * @swagger
 * /api/warehouse/{id}/materials/{materialId}:
 *   put:
 *     summary: Materialni yangilash
 *     tags: [Materials]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Ombor IDsi
 *       - in: path
 *         name: materialId
 *         required: true
 *         schema:
 *           type: string
 *         description: Material IDsi
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Material'
 *     responses:
 *       200:
 *         description: Material yangilandi
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WarehouseResponse'
 *       400:
 *         description: Validatsiya xatosi
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Ombor yoki material topilmadi
 *       500:
 *         description: Server xatosi
 */
router.put("/warehouse/:id/materials/:materialId", validateMaterial, warehouseController.updateMaterial);

/**
 * @swagger
 * /api/warehouse/{id}/materials/{materialId}:
 *   delete:
 *     summary: Materialni o'chirish
 *     tags: [Materials]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Ombor IDsi
 *       - in: path
 *         name: materialId
 *         required: true
 *         schema:
 *           type: string
 *         description: Material IDsi
 *     responses:
 *       200:
 *         description: Material o'chirildi
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WarehouseResponse'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Ombor yoki material topilmadi
 *       500:
 *         description: Server xatosi
 */
router.delete("/warehouse/:id/materials/:materialId", warehouseController.deleteMaterial);


// Additional Swagger components for reusability
/**
 * @swagger
 * components:
 *   schemas:
 *     Material:
 *       type: object
 *       required:
 *         - name
 *         - unit
 *         - quantity
 *         - price
 *       properties:
 *         name:
 *           type: string
 *           description: Material nomi
 *         unit:
 *           type: string
 *           enum: ["kg", "piece", "meter", "liter", "roll"]
 *           description: O'lchov birligi
 *         quantity:
 *           type: number
 *           description: Miqdori
 *         price:
 *           type: number
 *           description: Narxi
 *         category:
 *           type: string
 *           description: Kategoriyasi
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     WarehouseResponse:
 *       type: object
 *       properties:
 *         state:
 *           type: boolean
 *         message:
 *           type: string
 *         innerData:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             name:
 *               type: string
 *             description:
 *               type: string
 *             category:
 *               type: string
 *               enum: ["Tayyor maxsulotlar", "Homashyolar"]
 *             materials:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Material'
 *             createdAt:
 *               type: string
 *               format: date-time
 *             updatedAt:
 *               type: string
 *               format: date-time
 */
//==========================================================

/**
 * @swagger
 * components:
 *   schemas:
 *     Attendance:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Attendance record ID
 *         workerId:
 *           type: string
 *           description: Worker ID associated with this attendance
 *         arrivalTime:
 *           type: string
 *           format: date-time
 *           description: Time of arrival
 *         departureTime:
 *           type: string
 *           format: date-time
 *           description: Time of departure (optional)
 *         pieceWork:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               taskName:
 *                 type: string
 *                 description: Name of the task
 *               quantity:
 *                 type: number
 *                 description: Number of completed tasks
 *               unitPrice:
 *                 type: number
 *                 description: Price per task unit
 *               totalPrice:
 *                 type: number
 *                 description: Total price for the task
 *           description: List of piecework tasks (optional)
 *       required:
 *         - _id
 *         - workerId
 *         - arrivalTime
 *
 *     Company:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Company ID
 *         name:
 *           type: string
 *           description: Company name
 *         address:
 *           type: string
 *           description: Company address (optional)
 *         defaultWorkingHours:
 *           type: object
 *           properties:
 *             start:
 *               type: string
 *               description: Start time in HH:MM format
 *             end:
 *               type: string
 *               description: End time in HH:MM format
 *           required:
 *             - start
 *             - end
 *       required:
 *         - _id
 *         - name
 */
module.exports = router;













