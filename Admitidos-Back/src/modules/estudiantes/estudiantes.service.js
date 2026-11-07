import Estudiante from "./estudiantes.model.js";

export async function listarEstudiantes() {
    return await Estudiante.find().sort({ apellidos: 1, nombres: 1 });
}

export async function obtenerEstudiantePorId(id) {
    return await Estudiante.findById(id);
}

export async function buscarEstudiantePorDocumento(numeroDocumento) {
    return await Estudiante.findOne({ numeroDocumento: numeroDocumento.trim() });
}

export async function crearEstudiante(datos) {
    return await Estudiante.create(datos);
}

export async function actualizarEstudiante(id, datos) {
    return await Estudiante.findByIdAndUpdate(
        id,
        datos,
        { returnDocument: "after", runValidators: true }
    );
}

export async function eliminarEstudiante(id) {
    const eliminado = await Estudiante.findByIdAndDelete(id);
    return eliminado !== null;
}
