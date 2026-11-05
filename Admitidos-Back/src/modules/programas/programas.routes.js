import { Router } from "express";
import {
    actualizarPrograma,
    crearPrograma,
    eliminarPrograma,
    listarProgramas,
    obtenerProgramaPorId
} from "./programas.controller.js";

const router = Router();

router.get("/", listarProgramas);
router.get("/show", listarProgramas);
router.get("/info/:id", obtenerProgramaPorId);
router.get("/:id", obtenerProgramaPorId);
router.post("/", crearPrograma);
router.post("/store", crearPrograma);
router.post("/create", crearPrograma);
router.put("/update/:id", actualizarPrograma);
router.put("/:id", actualizarPrograma);
router.delete("/delete/:id", eliminarPrograma);
router.delete("/:id", eliminarPrograma);

export default router;
