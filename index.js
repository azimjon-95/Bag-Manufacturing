require("dotenv").config();
const express = require("express");
const { connect } = require("mongoose");
const cors = require("cors");
const PORT = process.env.PORT || 5000;
const notfound = require("./middleware/notfound.middleware");
const router = require("./routes/router");
const { createServer } = require("node:http");
const soket = require("./socket");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

const app = express();
const server = createServer(app);
const io = require("./middleware/socket.header")(server);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// CORS sozlamalari
const corsOptions = {
  origin: ["http://localhost:3000", "https://bag-manufacturing.up.railway.app/"],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true,
};
app.use(cors(corsOptions));

// MongoDB ulanish
(async () => {
  await connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDBga ulanish muvaffaqiyatli! ✅✅✅"))
    .catch((err) => console.log("MongoDB ulanish xatosi: 🛑🛑🛑", err));
})();

// Swagger sozlamalari
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Bag Manufacturing Factory Server APIs",
      version: "1.0.0",
      description:
        "A comprehensive set of server-side APIs designed for managing operations in a bag manufacturing factory.",
    },
    servers: [
      { url: "https://bag-manufacturing.up.railway.app" },
      { url: "http://localhost:5000" },
    ],
  },
  apis: ["./routes/router.js"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
console.log("Swagger Spec Generated:", JSON.stringify(swaggerSpec, null, 2)); // Swagger specni tekshirish
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));

// Socket.IO sozlamalari
app.set("socket", io);
soket.connect(io);

app.use("/api", /* authMiddleware, */ router); // Routerlarni ulash
app.get("/", (req, res) => res.send("Salom dunyo")); // Bosh sahifa
app.use(notfound); // 404 middleware

// Serverni ishga tushirish
server.listen(PORT, () => console.log(`http://localhost:${PORT}`));