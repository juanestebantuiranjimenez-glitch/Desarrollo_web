import mongoose from "mongoose";

const programaSchema = new mongoose.Schema(
    {
        id: { type: Number, required: true, unique: true },
        codigo: { type: String, required: true, unique: true },
        facultadId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Facultad",
            required: true
        },
        nombre: { type: String, required: true, trim: true },
        nivel: { type: String, required: true, trim: true },
        CreateBy: { type: String, default: "System" },
        CreatedAt: { type: Date, default: Date.now }
    },
    { versionKey: false, id: false }
);

programaSchema.index(
    { facultadId: 1, nombre: 1 },
    { unique: true, collation: { locale: "en", strength: 2 } }
);

const programaCounterSchema = new mongoose.Schema(
    {
        _id: { type: String, required: true },
        sequence: { type: Number, required: true, default: 0 }
    },
    { versionKey: false, id: false }
);

const Programa =
    mongoose.models.Programa || mongoose.model("Programa", programaSchema);
export const ProgramaCounter =
    mongoose.models.ProgramaCounter ||
    mongoose.model("ProgramaCounter", programaCounterSchema);

export default Programa;
