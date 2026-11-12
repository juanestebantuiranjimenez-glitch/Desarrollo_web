import { Router } from "express";

import { autenticar, soloAdmin } from "../../middleware/auth.middleware.js";
import {
    actualizarAvatar,
    listarAdministradores,
    login,
    miPerfil,
    programasParaRegistro,
    registrarAdministrador,
    registrarEstudiante
} from "./auth.controller.js";

const router = Router();

/* Público */
router.get("/programas", programasParaRegistro);
router.post("/register/estudiante", registrarEstudiante);
router.post("/login", login);

/* Requiere sesión */
router.get("/me", autenticar, miPerfil);
router.put("/me/avatar", autenticar, actualizarAvatar);

/* Solo administradores */
router.post("/register/admin", autenticar, soloAdmin, registrarAdministrador);
router.get("/admins", autenticar, soloAdmin, listarAdministradores);

export default router;
