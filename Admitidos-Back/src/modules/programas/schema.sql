ALTER TABLE facultades
    ADD UNIQUE KEY uq_facultades_id (id);

CREATE TABLE programas (
    id INT NOT NULL AUTO_INCREMENT,
    codigo VARCHAR(30) NULL,
    facultadId INT NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    nivel VARCHAR(20) NOT NULL,
    CreateBy VARCHAR(100) NOT NULL DEFAULT 'System',
    CreatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_programas_codigo (codigo),
    UNIQUE KEY uq_programas_facultad_nombre (facultadId, nombre),
    KEY idx_programas_facultad (facultadId),
    CONSTRAINT fk_programas_facultades
        FOREIGN KEY (facultadId) REFERENCES facultades (id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
