import mongoose from "mongoose";

import * as ProgramasService from "./programas.service.js";
import * as FacultadesService from "../facultades/facultades.service.js";

const nivelesPermitidos = ["pregrado", "posgrado", "otros"];

async function validarDatosPrograma({ codigo, nombre, nivel, facultad }) {
    if (codigo === undefined || nombre === undefined || nivel === undefined || facultad === undefined) {
        return "Los campos 'codigo', 'nombre', 'nivel' y 'facultad' son obligatorios";
    }

    if (codigo.trim().length < 2 || codigo.trim().length > 20) {
        return "El campo 'codigo' debe tener entre 2 y 20 caracteres";
    }

    if (nombre.trim().length < 3 || nombre.trim().length > 150) {
        return "El campo 'nombre' debe tener entre 3 y 150 caracteres";
    }

    if (!nivelesPermitidos.includes(nivel.toLowerCase())) {
        return "El campo 'nivel' debe ser pregrado, posgrado u otros";
    }

    if (!mongoose.Types.ObjectId.isValid(facultad)) {
        return "El id de la facultad no es válido";
    }

    const facultadExiste = await FacultadesService.obtenerFacultadPorId(facultad);
    if (!facultadExiste) {
        return "La facultad no existe";
    }

    return null;
}

export async function listarProgramas(req, res) {
    try {
        const programas = await ProgramasService.listarProgramas();
        res.json({
            statusCode: 200,
            success: true,
            message: "Programas listados correctamente",
            data: programas
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            statusCode: 500,
            success: false,
            message: "Error al listar los programas"
        });
    }
}

export async function obtenerProgramaPorId(req, res) {
    const id = req.params.id;

    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                statusCode: 400,
                success: false,
                message: "ID de programa inválido"
            });
        }

        const programa = await ProgramasService.obtenerProgramaPorId(id);
        if (!programa) {
            return res.status(404).json({
                statusCode: 404,
                success: false,
                message: "Programa no encontrado"
            });
        }

        res.json({
            statusCode: 200,
            success: true,
            message: "Programa obtenido correctamente",
            data: programa
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            statusCode: 500,
            success: false,
            message: "Error al obtener el programa"
        });
    }
}

export async function crearPrograma(req, res) {
    try {
        const { codigo, nombre, nivel, facultad } = req.body;

        const error = await validarDatosPrograma({ codigo, nombre, nivel, facultad });
        if (error) {
            return res.status(400).json({
                statusCode: 400,
                success: false,
                message: error
            });
        }

        const codigoRepetido = await ProgramasService.buscarProgramaPorCodigo(codigo);
        if (codigoRepetido) {
            return res.status(409).json({
                statusCode: 409,
                success: false,
                message: "Ya existe un programa con ese código"
            });
        }

        const nombreRepetido = await ProgramasService.buscarProgramaPorNombre(nombre, facultad);
        if (nombreRepetido) {
            return res.status(409).json({
                statusCode: 409,
                success: false,
                message: "Ya existe un programa con ese nombre en esta facultad"
            });
        }

        const programa = await ProgramasService.crearPrograma({ codigo, nombre, nivel, facultad });
        res.status(201).json({
            statusCode: 201,
            success: true,
            message: "Programa creado correctamente",
            data: programa
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            statusCode: 500,
            success: false,
            message: "Error al crear el programa"
        });
    }
}

export async function actualizarPrograma(req, res) {
    try {
        const id = req.params.id;
        const { codigo, nombre, nivel, facultad } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                statusCode: 400,
                success: false,
                message: "ID de programa inválido"
            });
        }

        const programaActual = await ProgramasService.obtenerProgramaPorId(id);
        if (!programaActual) {
            return res.status(404).json({
                statusCode: 404,
                success: false,
                message: "Programa no encontrado"
            });
        }

        const error = await validarDatosPrograma({ codigo, nombre, nivel, facultad });
        if (error) {
            return res.status(400).json({
                statusCode: 400,
                success: false,
                message: error
            });
        }

        const codigoRepetido = await ProgramasService.buscarProgramaPorCodigo(codigo);
        if (codigoRepetido && codigoRepetido._id.toString() !== id) {
            return res.status(409).json({
                statusCode: 409,
                success: false,
                message: "Ya existe un programa con ese código"
            });
        }

        const nombreRepetido = await ProgramasService.buscarProgramaPorNombre(nombre, facultad);
        if (nombreRepetido && nombreRepetido._id.toString() !== id) {
            return res.status(409).json({
                statusCode: 409,
                success: false,
                message: "Ya existe un programa con ese nombre en esta facultad"
            });
        }

        const programa = await ProgramasService.actualizarPrograma(id, { codigo, nombre, nivel, facultad });
        res.status(200).json({
            statusCode: 200,
            success: true,
            message: "Programa actualizado correctamente",
            data: programa
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            statusCode: 500,
            success: false,
            message: "Error al actualizar el programa"
        });
    }
}

export async function eliminarPrograma(req, res) {
    try {
        const id = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                statusCode: 400,
                success: false,
                message: "ID de programa inválido"
            });
        }

        const programaActual = await ProgramasService.obtenerProgramaPorId(id);
        if (!programaActual) {
            return res.status(404).json({
                statusCode: 404,
                success: false,
                message: "Programa no encontrado"
            });
        }

        const eliminado = await ProgramasService.eliminarPrograma(id);

        if (!eliminado) {
            return res.status(500).json({
                statusCode: 500,
                success: false,
                message: "Error al eliminar el programa"
            });
        }

        return res.json({
            statusCode: 200,
            success: true,
            message: "Programa eliminado correctamente",
            data: programaActual
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            statusCode: 500,
            success: false,
            message: "Error al eliminar el programa"
        });
    }
}
