import mongoose from "mongoose";

const usuarioSchema = new mongoose.Schema(
    {
        nombre: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 120
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            maxlength: 120
        },
        passwordHash: {
            type: String,
            required: true
        },
        rol: {
            type: String,
            required: true,
            enum: ["admin", "estudiante"]
        },
        activo: {
            type: Boolean,
            default: true
        },
        avatar: {
            type: String,
            enum: ["mike", "sulley", "art", "squishy", null],
            default: null
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

export default mongoose.model("Usuario", usuarioSchema, "usuarios");
