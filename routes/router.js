const router = require("express").Router();
const workerController = require("../controller/workerController");
const workerValidation = require("../validation/WorkerValidation");
const materialController = require("../controller/materialController");
const materialValidation = require("../validation/materialValidation");
const adminController = require("../controller/adminController");
const adminValidation = require("../validation/adminValidation");

//==========================================================
// Workers Routes
/**
 * @swagger
 * /api/workers/all:
 *   get:
 *     summary: Fetch all workers
 *     tags: [Workers]
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
 *       404:
 *         description: Worker not found
 *       500:
 *         description: Server error
 */
router.delete("/workers/delete/:id", workerController.deleteWorker);

//==========================================================
// Materials Routes
/**
 * @swagger
 * /api/materials/all:
 *   get:
 *     summary: Fetch all materials
 *     tags: [Materials]
 *     responses:
 *       200:
 *         description: List of materials
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: Material ID
 *                   name:
 *                     type: string
 *                     description: Material name
 *                   code:
 *                     type: string
 *                     description: Unique material code
 *                   unit:
 *                     type: string
 *                     enum: ["kg", "piece", "meter", "liter", "roll"]
 *                     description: Unit of measurement
 *                   quantity:
 *                     type: number
 *                     description: Stock quantity
 *                     minimum: 0
 *                   supplier:
 *                     type: string
 *                     description: Material supplier
 *                   receivedDate:
 *                     type: string
 *                     format: date-time
 *                     description: Date received
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                     description: Creation timestamp
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *                     description: Last update timestamp
 *       500:
 *         description: Server error
 */
router.get("/materials/all", materialController.getMaterials);

/**
 * @swagger
 * /api/materials/{id}:
 *   get:
 *     summary: Fetch a material by ID
 *     tags: [Materials]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Material ID
 *     responses:
 *       200:
 *         description: Material details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: Material ID
 *                 name:
 *                   type: string
 *                   description: Material name
 *                 code:
 *                   type: string
 *                   description: Unique material code
 *                 unit:
 *                   type: string
 *                   enum: ["kg", "piece", "meter", "liter", "roll"]
 *                   description: Unit of measurement
 *                 quantity:
 *                   type: number
 *                   description: Stock quantity
 *                   minimum: 0
 *                 supplier:
 *                   type: string
 *                   description: Material supplier
 *                 receivedDate:
 *                   type: string
 *                   format: date-time
 *                   description: Date received
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   description: Creation timestamp
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                   description: Last update timestamp
 *       404:
 *         description: Material not found
 *       500:
 *         description: Server error
 */
router.get("/materials/:id", materialController.getMaterialById);

/**
 * @swagger
 * /api/materials/create:
 *   post:
 *     summary: Create a new material
 *     tags: [Materials]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - code
 *               - unit
 *               - quantity
 *               - supplier
 *             properties:
 *               name:
 *                 type: string
 *                 description: Material name
 *               code:
 *                 type: string
 *                 description: Unique material code
 *               unit:
 *                 type: string
 *                 enum: ["kg", "piece", "meter", "liter", "roll"]
 *                 description: Unit of measurement
 *               quantity:
 *                 type: number
 *                 description: Stock quantity
 *                 minimum: 0
 *               supplier:
 *                 type: string
 *                 description: Material supplier
 *               receivedDate:
 *                 type: string
 *                 format: date-time
 *                 description: Date received (optional)
 *     responses:
 *       201:
 *         description: Material created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: Material ID
 *                 name:
 *                   type: string
 *                   description: Material name
 *                 code:
 *                   type: string
 *                   description: Unique material code
 *                 unit:
 *                   type: string
 *                   enum: ["kg", "piece", "meter", "liter", "roll"]
 *                   description: Unit of measurement
 *                 quantity:
 *                   type: number
 *                   description: Stock quantity
 *                   minimum: 0
 *                 supplier:
 *                   type: string
 *                   description: Material supplier
 *                 receivedDate:
 *                   type: string
 *                   format: date-time
 *                   description: Date received
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
 *       500:
 *         description: Server error
 */
router.post("/materials/create", materialValidation, materialController.createMaterial);

/**
 * @swagger
 * /api/materials/update/{id}:
 *   put:
 *     summary: Update a material
 *     tags: [Materials]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Material ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - code
 *               - unit
 *               - quantity
 *               - supplier
 *             properties:
 *               name:
 *                 type: string
 *                 description: Material name
 *               code:
 *                 type: string
 *                 description: Unique material code
 *               unit:
 *                 type: string
 *                 enum: ["kg", "piece", "meter", "liter", "roll"]
 *                 description: Unit of measurement
 *               quantity:
 *                 type: number
 *                 description: Stock quantity
 *                 minimum: 0
 *               supplier:
 *                 type: string
 *                 description: Material supplier
 *               receivedDate:
 *                 type: string
 *                 format: date-time
 *                 description: Date received (optional)
 *     responses:
 *       200:
 *         description: Material updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: Material ID
 *                 name:
 *                   type: string
 *                   description: Material name
 *                 code:
 *                   type: string
 *                   description: Unique material code
 *                 unit:
 *                   type: string
 *                   enum: ["kg", "piece", "meter", "liter", "roll"]
 *                   description: Unit of measurement
 *                 quantity:
 *                   type: number
 *                   description: Stock quantity
 *                   minimum: 0
 *                 supplier:
 *                   type: string
 *                   description: Material supplier
 *                 receivedDate:
 *                   type: string
 *                   format: date-time
 *                   description: Date received
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   description: Creation timestamp
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                   description: Last update timestamp
 *       404:
 *         description: Material not found
 *       500:
 *         description: Server error
 */
router.put("/materials/update/:id", materialValidation, materialController.updateMaterial);

/**
 * @swagger
 * /api/materials/stock/{id}:
 *   put:
 *     summary: Update material stock
 *     tags: [Materials]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Material ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: number
 *                 description: New stock quantity
 *                 minimum: 0
 *             required:
 *               - quantity
 *     responses:
 *       200:
 *         description: Stock updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: Material ID
 *                 name:
 *                   type: string
 *                   description: Material name
 *                 code:
 *                   type: string
 *                   description: Unique material code
 *                 unit:
 *                   type: string
 *                   enum: ["kg", "piece", "meter", "liter", "roll"]
 *                   description: Unit of measurement
 *                 quantity:
 *                   type: number
 *                   description: Stock quantity
 *                   minimum: 0
 *                 supplier:
 *                   type: string
 *                   description: Material supplier
 *                 receivedDate:
 *                   type: string
 *                   format: date-time
 *                   description: Date received
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   description: Creation timestamp
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                   description: Last update timestamp
 *       404:
 *         description: Material not found
 *       500:
 *         description: Server error
 */
router.put("/materials/stock/:id", materialController.updateStock);

/**
 * @swagger
 * /api/materials/delete/{id}:
 *   delete:
 *     summary: Delete a material
 *     tags: [Materials]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Material ID
 *     responses:
 *       200:
 *         description: Material deleted
 *       404:
 *         description: Material not found
 *       500:
 *         description: Server error
 */
router.delete("/materials/delete/:id", materialController.deleteMaterial);

//==========================================================
// Admin Routes
/**
 * @swagger
 * /api/admin/all:
 *   get:
 *     summary: Fetch all admins
 *     tags: [Admins]
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
 *                     description: Admin’s first name
 *                   lastName:
 *                     type: string
 *                     description: Admin’s last name
 *                   login:
 *                     type: string
 *                     description: Unique login
 *                   password:
 *                     type: string
 *                     description: Password (min 6 characters)
 *                   role:
 *                     type: string
 *                     enum: ["Owner", "Manager", "Warehouseman"]
 *                     default: Manager
 *                     description: Admin role
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                     description: Creation timestamp
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *                     description: Last update timestamp
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
 *                   description: Admin’s first name
 *                 lastName:
 *                   type: string
 *                   description: Admin’s last name
 *                 login:
 *                   type: string
 *                   description: Unique login
 *                 password:
 *                   type: string
 *                   description: Password (min 6 characters)
 *                 role:
 *                   type: string
 *                   enum: ["Owner", "Manager", "Warehouseman"]
 *                   default: Manager
 *                   description: Admin role
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   description: Creation timestamp
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                   description: Last update timestamp
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
 *                 description: Admin’s first name
 *               lastName:
 *                 type: string
 *                 description: Admin’s last name
 *               login:
 *                 type: string
 *                 description: Unique login
 *               password:
 *                 type: string
 *                 description: Password (min 6 characters)
 *               role:
 *                 type: string
 *                 enum: ["Owner", "Manager", "Warehouseman"]
 *                 default: Manager
 *                 description: Admin role
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
 *                   description: Admin’s first name
 *                 lastName:
 *                   type: string
 *                   description: Admin’s last name
 *                 login:
 *                   type: string
 *                   description: Unique login
 *                 password:
 *                   type: string
 *                   description: Password (min 6 characters)
 *                 role:
 *                   type: string
 *                   enum: ["Owner", "Manager", "Warehouseman"]
 *                   default: Manager
 *                   description: Admin role
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
 *                 description: Admin’s first name
 *               lastName:
 *                 type: string
 *                 description: Admin’s last name
 *               login:
 *                 type: string
 *                 description: Unique login
 *               password:
 *                 type: string
 *                 description: Password (min 6 characters)
 *               role:
 *                 type: string
 *                 enum: ["Owner", "Manager", "Warehouseman"]
 *                 default: Manager
 *                 description: Admin role
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
 *                   description: Admin’s first name
 *                 lastName:
 *                   type: string
 *                   description: Admin’s last name
 *                 login:
 *                   type: string
 *                   description: Unique login
 *                 password:
 *                   type: string
 *                   description: Password (min 6 characters)
 *                 role:
 *                   type: string
 *                   enum: ["Owner", "Manager", "Warehouseman"]
 *                   default: Manager
 *                   description: Admin role
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   description: Creation timestamp
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                   description: Last update timestamp
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
 *       404:
 *         description: Admin not found
 *       500:
 *         description: Server error
 */
router.delete("/admin/delete/:id", adminController.deleteAdmin);

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
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Server error
 */
router.post("/admin/login", adminController.login);

module.exports = router;