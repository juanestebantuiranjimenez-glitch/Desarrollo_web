import { Router } from "express";

import { autenticar, soloAdmin } from "../../middleware/auth.middleware.js";
import {
    listarEstudiantes,
    obtenerEstudiantePorId,
    crearEstudiante,
    actualizarEstudiante,
    eliminarEstudiante
} from "./estudiantes.controller.js";

const router = Router();

router.get("/show/", autenticar, listarEstudiantes);
router.get("/info/:id", autenticar, obtenerEstudiantePorId);
router.post("/create/", autenticar, soloAdmin, crearEstudiante);
router.put("/update/:id", autenticar, soloAdmin, actualizarEstudiante);
router.delete("/delete/:id", autenticar, soloAdmin, eliminarEstudiante);

export default router;
