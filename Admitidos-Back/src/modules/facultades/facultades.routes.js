import { Router } from "express";

import {
    actualizarFacultad,
    crearFacultad,
    eliminarFacultad,
    listarFacultades,
    obtenerFacultadPorId
} from "./facultades.controller.js";

const router = Router();

router.get("/show/", listarFacultades);
router.get("/info/:id", obtenerFacultadPorId);
router.post("/create/", crearFacultad);
router.put("/update/:id", actualizarFacultad);
router.delete("/delete/:id", eliminarFacultad);

export default router;