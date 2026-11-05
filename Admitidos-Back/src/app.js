import express from "express";
import { listarFacultades } from "./modules/facultades/facultades.controller.js";
import facultadesRoutes from "./modules/facultades/facultades.routes.js";
import programasRoutes from "./modules/programas/programas.routes.js";

const app = express();

app.use(express.json());
app.use("/api/facultades", facultadesRoutes);
app.use("/api/programas", programasRoutes);
app.get("/api/show", listarFacultades);

app.get("/api/health", (req, res) => {
    res.json({
        status: "ok",
        success: true,
        message: "API functioning correctly",
        version: "1.0.0"
    });
});

export default app;