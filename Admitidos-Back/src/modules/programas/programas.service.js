import Programa, { ProgramaCounter } from "./programas.model.js";
import Facultad from "../facultades/facultades.model.js";

export async function listarProgramas() {
    return Programa.find()
        .select("-_id -__v")
        .sort({ nombre: 1 })
        .lean();
}

export async function obtenerProgramaPorId(id) {
    return Programa.findOne({ id })
        .select("-_id -__v")
        .lean();
}

export async function crearPrograma({ facultadId, nombre, nivel }) {
    const latestPrograma = await Programa.findOne()
        .sort({ id: -1 })
        .select("id")
        .lean();
    const latestId = latestPrograma?.id ?? 0;

    try {
        await ProgramaCounter.findOneAndUpdate(
            { _id: "programas" },
            { $max: { sequence: latestId } },
            { upsert: true, new: true }
        );
    } catch (error) {
        if (error.code !== 11000) {
            throw error;
        }
        await ProgramaCounter.updateOne(
            { _id: "programas" },
            { $max: { sequence: latestId } }
        );
    }

    const counter = await ProgramaCounter.findOneAndUpdate(
        { _id: "programas" },
        { $inc: { sequence: 1 } },
        { new: true }
    );
    const id = counter.sequence;
    const codigo = `PROG-${String(id).padStart(4, "0")}`;

    const programa = await Programa.create({
        id,
        codigo,
        facultadId,
        nombre,
        nivel
    });
    return {
        id: programa.id,
        codigo: programa.codigo,
        facultadId: programa.facultadId,
        nombre: programa.nombre,
        nivel: programa.nivel,
        CreateBy: programa.CreateBy,
        CreatedAt: programa.CreatedAt
    };
}

export async function actualizarPrograma(id, { facultadId, nombre, nivel }) {
    return Programa.findOneAndUpdate(
        { id },
        { facultadId, nombre, nivel },
        { new: true, runValidators: true }
    )
        .select("-_id -__v")
        .lean();
}

export async function eliminarPrograma(id) {
    const result = await Programa.deleteOne({ id });
    return result.deletedCount > 0;
}

export async function existeFacultad(id) {
    return Boolean(await Facultad.exists({ _id: id }));
}
