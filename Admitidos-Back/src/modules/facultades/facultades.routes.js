import { Router } from "express";

import {
    crearFacultad,
    listarFacultades,
    obtenerFacultadPorId
} from "./facultades.controller.js";

const router = Router();

router.get("/show/", listarFacultades);
router.get("/info/:id", obtenerFacultadPorId);
router.post("/create/", crearFacultad);




export default router;