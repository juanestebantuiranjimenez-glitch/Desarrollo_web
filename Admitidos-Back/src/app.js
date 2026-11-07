import express from "express";
import facultadesRoutes from "./modules/facultades/facultades.routes.js";
import programasRoutes from "./modules/programas/programas.routes.js";
import estudiantesRoutes from "./modules/estudiantes/estudiantes.routes.js";

const app = express();

app.disable("x-powered-by");
app.use(express.json());

/* Facultades */
app.use("/api/facultades", facultadesRoutes);

/* Programas */
app.use("/api/programas", programasRoutes);

/* Estudiantes */
app.use("/api/estudiantes", estudiantesRoutes);

app.get("/api/health", (req, res) => {
    res.json({
        status: "ok",
        success: true,
        message: "API functioning correctly",
        version: "1.0.0"
    });
});

app.use((req, res) => {
    res.status(404).json({
        statusCode: 404,
        success: false,
        message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`
    });
});

app.use((error, req, res, next) => {
    console.error(error);
    if (res.headersSent) {
        return next(error);
    }
    res.status(500).json({
        statusCode: 500,
        success: false,
        message: "Error interno del servidor"
    });
});

export default app;
