import Facultades from "./facultades.model.js";
import Programa from "../programas/programas.model.js";

export const listarFacultades = async () => {
    return await Facultades.find().sort({ nombre: 1 });
}

export async function obtenerFacultadPorId(id) {
    return await Facultades.findById(id);
}

export async function crearFacultad(nombre) {
    return await Facultades.create({nombre});
}

export async function actualizarFacultad(id, nombre) {
    return await Facultades.findByIdAndUpdate(id, { nombre }, { returnDocument: "after", runValidators: true });
}

export async function eliminarFacultad(id) {
    if (await Programa.exists({ facultadId: id })) {
        const error = new Error(
            "No se puede eliminar la facultad porque tiene programas asociados"
        );
        error.code = "FACULTY_HAS_PROGRAMS";
        throw error;
    }

    const eliminada = await Facultades.findByIdAndDelete(id);
    return eliminada !== null;
}