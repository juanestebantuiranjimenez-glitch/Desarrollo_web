import Estudiante from "./estudiantes.model.js";

const populatePrograma = {
    path: "programa",
    populate: { path: "facultad", select: "nombre" }
};

const populateUsuario = {
    path: "usuario",
    select: "nombre avatar"
};

export async function listarEstudiantes() {
    return await Estudiante.find()
        .populate(populatePrograma)
        .populate(populateUsuario)
        .sort({ apellidos: 1, nombres: 1 });
}

export async function obtenerEstudiantePorId(id) {
    return await Estudiante.findById(id)
        .populate(populatePrograma)
        .populate(populateUsuario);
}

export async function obtenerEstudiantePorUsuario(usuarioId) {
    return await Estudiante.findOne({ usuario: usuarioId })
        .populate(populatePrograma)
        .populate(populateUsuario);
}

export async function listarEstudiantesPorIds(ids) {
    return await Estudiante.find({ _id: { $in: ids } })
        .populate(populateUsuario)
        .sort({ apellidos: 1, nombres: 1 });
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
