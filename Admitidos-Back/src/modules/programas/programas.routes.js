import { Router } from "express";

import {
    listarProgramas,
    obtenerProgramaPorId,
    crearPrograma,
    actualizarPrograma,
    eliminarPrograma
} from "./programas.controller.js";

const router = Router();

router.get("/show/", listarProgramas);
router.get("/info/:id", obtenerProgramaPorId);
router.post("/create/", crearPrograma);
router.put("/update/:id", actualizarPrograma);
router.delete("/delete/:id", eliminarPrograma);

export default router;
