import { Router } from "express";

import { autenticar, soloAdmin } from "../../middleware/auth.middleware.js";
import {
    listarFacultades,
    obtenerFacultadPorId,
    crearFacultad,
    actualizarFacultad,
    eliminarFacultad
} from "./facultades.controller.js";

const router = Router();

router.get("/show/", autenticar, listarFacultades);
router.get("/info/:id", autenticar, obtenerFacultadPorId);
router.post("/create/", autenticar, soloAdmin, crearFacultad);
router.put("/update/:id", autenticar, soloAdmin, actualizarFacultad);
router.delete("/delete/:id", autenticar, soloAdmin, eliminarFacultad);

export default router;
