import mongoose from "mongoose";

const programaSchema = new mongoose.Schema(
    {
        codigo: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            uppercase: true
        },
        nombre: {
            type: String,
            required: true,
            trim: true,
            minlength: 3,
            maxlength: 150
        },
        nivel: {
            type: String,
            required: true,
            lowercase: true,
            enum: ["pregrado", "posgrado", "otros"]
        },
        facultad: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Facultad",
            required: true
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

export default mongoose.model("Programa", programaSchema, "programas");
