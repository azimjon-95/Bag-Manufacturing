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
  origin: ["http://localhost:3000", "https://bag-manufacturing.vercel.app"],
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
        "A comprehensive set of server-side APIs designed for managing operations in a bag manufacturing factory. This includes endpoints for handling workers, materials, and administrative tasks to streamline production processes.",
    },
    servers: [
      {
        url: "https://bag-manufacturing.vercel.app",
      },
      {
        url: "http://localhost:5000",
      },
    ],
  },
  apis: ["./routes/router.js"], // Route fayllarini ko‘rsatish
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Socket.IO sozlamalari
app.set("socket", io);
soket.connect(io);

app.use("/api", /* authMiddleware, */ router); // Routerlarni ulash
app.get("/", (req, res) => res.send("Salom dunyo")); // Bosh sahifa
app.use(notfound); // 404 middleware

// Serverni ishga tushirish
server.listen(PORT, () => console.log(`http://localhost:${PORT}`));




// require("dotenv").config();
// const express = require("express");
// const { connect } = require("mongoose");
// const cors = require("cors");
// const PORT = process.env.PORT || 5000;
// const notfound = require("./middleware/notfound.middleware");
// const router = require("./routes/router");
// const authMiddleware = require("./middleware/AuthMiddleware");

// const { createServer } = require("node:http");
// const soket = require("./socket");
// const app = express();
// const server = createServer(app);
// const io = require("./middleware/socket.header")(server);

// app.use(express.urlencoded({ extended: true }));
// app.use(express.json());

// const corsOptions = {
//   origin: ["http://localhost:3000"],
//   // origin: "*",
//   methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
//   credentials: true,
// };

// app.use(cors(corsOptions));

// (async () => {
//   await connect(process.env.MONGO_URI)
//     .then(() => console.log("MongoDBga ulanish muvaffaqiyatli! ✅✅✅"))
//     .catch((err) => console.log("MongoDB ulanish xatosi:,🛑🛑🛑", err));
// })();

// app.set("socket", io);
// soket.connect(io);
// app.use(
//   "/api",
//   // authMiddleware,
//   router
// );
// app.get("/", (req, res) => res.send("Salom dunyo"));
// app.use(notfound);

// server.listen(PORT, () => console.log(`http://localhost:${PORT}`));
