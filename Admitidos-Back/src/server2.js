import express from "express";

const app = express();
app.use(express.json());

const PORT = Number(process.env.PORT);
const HOST = process.env.HOST;
const APP_NAME = process.env.APP_NAME;


app.get("/api/health", (req, res) => {
    res.json({
        status: "ok",
        success: true,
        message: "API functioning correctly",
        version: "1.0.0"
    });
});

const facultades = [
    { id: 1, nombre: "Facultad de Ingeniería" },
    { id: 2, nombre: "Facultad de Ciencias Sociales" },
    { id: 3, nombre: "Facultad de Ciencias de la Salud" },
    { id: 4, nombre: "Facultad de Arquitectura y urbanismo" }
];

const programas = [
    { id: 1, codigo: "IS", facultadId: 1, nombre: "Ingeniería de Sistemas", nivel: "Pregrado", CreateBy: "System", CreatedAt: new Date().toISOString() },
    { id: 2, codigo: "IC", facultadId: 1, nombre: "Ingeniería civil", nivel: "Pregrado", CreateBy: "System", CreatedAt: new Date().toISOString() },
    { id: 3, codigo: "II", facultadId: 1, nombre: "Ingeniería Industrial", nivel: "Pregrado", CreateBy: "System", CreatedAt: new Date().toISOString() },
    { id: 4, codigo: "PS", facultadId: 2, nombre: "Psicología", nivel: "Pregrado", CreateBy: "System", CreatedAt: new Date().toISOString() }
];

const nivelesPermitidos = ["pregrado", "posgrado", "otros", "otro"];
let nextProgramId = programas.length + 1;

app.get("/api/facultades", (req, res) => {
    res.json({
        statusCode: 200,
        data: facultades,
    });
});

app.get("/api/programas", (req, res) => {
    res.json({
        statusCode: 200,
        data: programas,
    });
});

app.post("/api/programas/store", (req, res) => {
    const { nivel, facultadId } = req.body ?? {};
    const nombre = req.body?.nombre ?? req.body?.name;

    if (
        typeof nivel !== "string" ||
        !nivel.trim() ||
        typeof nombre !== "string" ||
        !nombre.trim() ||
        !Number.isInteger(facultadId) ||
        facultadId <= 0
    ) {
        return res.status(422).json({
            statusCode: 422,
            success: false,
            message: "los campos 'nivel', 'name' y 'facultadId' son obligatorios",
        });
    }

    const facultadExists = facultades.some(facultad => facultad.id === facultadId);
    if (!facultadExists) {
        return res.status(404).json({
            statusCode: 404,
            success: false,
            message: "la facultad con el id proporcionado no existe",
        });
    }

    if (!nivelesPermitidos.includes(nivel.trim().toLowerCase())) {
        return res.status(422).json({
            statusCode: 422,
            success: false,
            message: "el nivel proporcionado no está permitido",
        });
    }

    const nombreNormalizado =
        nombre
            .trim()
            .toLowerCase()

    const programaExists = 
        programas.some(
            programa =>
                programa.facultadId ===
                Number(facultadId) 
                &&

                programa.nombre
                    .trim()
                    .toLowerCase() 
                === nombreNormalizado
        );


    if (programaExists) {
        return res.status(409).json({
            statusCode: 409,
            success: false,
            message: "el programa con el nombre proporcionado ya existe en la facultad especificada",
        });
    }

    const codigo = 
        `PROG-${String(
            nextProgramId
        ).padStart(4, "0")}`;

    const newPrograma = {
        id: nextProgramId++,
        codigo,
        nivel: nivel.trim(),
        nombre: nombre.trim(),
        facultadId,
        CreateBy: "System",
        CreatedAt: new Date().toISOString()
    };
    programas.push(newPrograma);

    res.status(201).json({
        statusCode: 201,
        success: true,
        received: req.body,
        data: newPrograma,
    });
});

app.listen(PORT, HOST, () => {
    console.log(APP_NAME);
        console.log(`Server is running on http://${HOST}:${PORT}`);
});