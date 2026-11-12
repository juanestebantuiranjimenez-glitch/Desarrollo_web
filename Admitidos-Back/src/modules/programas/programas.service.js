import Programa from "./programas.model.js";

export async function listarProgramas() {
    return await Programa.find().populate("facultad", "nombre").sort({ nombre: 1 });
}

export async function listarProgramasPorFacultad(facultadId) {
    return await Programa.find({ facultad: facultadId })
        .populate("facultad", "nombre")
        .sort({ nombre: 1 });
}

export async function obtenerProgramaPorId(id) {
    return await Programa.findById(id).populate("facultad", "nombre");
}

export async function buscarProgramaPorNombre(nombre, facultad) {
    return await Programa.findOne({ nombre: nombre.trim(), facultad });
}

export async function buscarProgramaPorCodigo(codigo) {
    return await Programa.findOne({ codigo: codigo.trim().toUpperCase() });
}

export async function crearPrograma(datos) {
    return await Programa.create(datos);
}

export async function actualizarPrograma(id, datos) {
    return await Programa.findByIdAndUpdate(
        id,
        datos,
        { returnDocument: "after", runValidators: true }
    ).populate("facultad", "nombre");
}

export async function eliminarPrograma(id) {
    const eliminado = await Programa.findByIdAndDelete(id);
    return eliminado !== null;
}
