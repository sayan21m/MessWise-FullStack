import express from "express";
import helmet from "helmet";
import cors from "cors";
import "./config/db.js";

import { allowedFrontendOrigins, corsOriginDelegate } from "./config/cors.js";
import userRoutes from "./routes/user.routes.js";
import messRoutes from "./routes/mess.routes.js";
import transactionRoutes from "./routes/transaction.routes.js";

const app = express();

app.disable("x-powered-by");
app.set("trust proxy", 1);

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'none'"],
        frameAncestors: ["'none'"],
      },
    },
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false,
  })
);

app.use(
  cors({
    origin: corsOriginDelegate(allowedFrontendOrigins()),
    credentials: true,
  })
);

app.use(express.json());

app.get("/", (_req, res) => {
  res.send("MessWise Backend Running");
});

app.use("/api/v1", userRoutes);
app.use("/api/v1/mess", messRoutes);
app.use("/api/v1/mess", transactionRoutes);

app.use((error, _req, res, _next) => {
  if (res.headersSent) {
    return;
  }

  const status = Number(error.statusCode || error.status || 500);

  res.status(status).json({
    message: status >= 500 ? "Internal server error" : error.message,
  });
});

export default app;
