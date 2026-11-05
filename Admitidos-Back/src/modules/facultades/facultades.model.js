import mongoose from "mongoose";

const facultadSchema = new mongoose.Schema(
    {
        nombre: { type: String, required: true, trim: true, minlength: 1, maxlength: 150 }
    },

    { 
        timestamps: true,
        versionKey: false
    }
);

facultadSchema.index(
    { nombre: 1 },
    { unique: true, collation: { locale: "en", strength: 2 } }
);

const Facultad =
    mongoose.models.Facultad ||
    mongoose.model("Facultad", facultadSchema, "facultades");

export default Facultad;
