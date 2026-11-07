import mongoose from "mongoose";

const facultadSchema = new mongoose.Schema(
    {
        nombre: {
            type: String,
            required: true,
            trim: true,
            minlength: 3,
            maxlength: 150
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

export default mongoose.model("Facultad", facultadSchema, "facultades");
