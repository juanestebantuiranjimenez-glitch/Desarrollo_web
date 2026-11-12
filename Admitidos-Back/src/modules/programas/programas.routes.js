import { Router } from "express";

import { autenticar, soloAdmin } from "../../middleware/auth.middleware.js";
import {
    listarProgramas,
    obtenerProgramaPorId,
    crearPrograma,
    actualizarPrograma,
    eliminarPrograma
} from "./programas.controller.js";

const router = Router();

router.get("/show/", autenticar, listarProgramas);
router.get("/info/:id", autenticar, obtenerProgramaPorId);
router.post("/create/", autenticar, soloAdmin, crearPrograma);
router.put("/update/:id", autenticar, soloAdmin, actualizarPrograma);
router.delete("/delete/:id", autenticar, soloAdmin, eliminarPrograma);

export default router;
