import mongoose from "mongoose";

const estudianteSchema = new mongoose.Schema(
    {
        tipoDocumento: {
            type: String,
            required: true,
            uppercase: true,
            enum: ["CC", "TI", "CE", "PA"]
        },
        numeroDocumento: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        nombres: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 80
        },
        apellidos: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 80
        },
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            maxlength: 120
        },
        telefono: {
            type: String,
            trim: true,
            maxlength: 20
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

export default mongoose.model("Estudiante", estudianteSchema, "estudiantes");
