-- ============================================
-- SCRIPT COMPLETO DE BASE DE DATOS CINEX
-- Proyecto: CineConnect - Red Social de Películas
-- Base de datos: PostgreSQL
-- Fecha: Noviembre 2025
-- ============================================

-- ============================================
-- SECCIÓN 1: CREACIÓN DE TABLAS
-- ============================================

-- Tabla de Usuarios
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Películas
CREATE TABLE peliculas (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    año INTEGER,
    genero VARCHAR(100),
    director VARCHAR(255),
    sinopsis TEXT,
    imagen_url VARCHAR(500),
    tmdb_id INTEGER UNIQUE,
    fecha_agregada TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Calificaciones
CREATE TABLE calificaciones (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    pelicula_id INTEGER NOT NULL REFERENCES peliculas(id) ON DELETE CASCADE,
    puntuacion INTEGER CHECK(puntuacion >= 1 AND puntuacion <= 5),
    fecha_calificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(usuario_id, pelicula_id)
);

-- Tabla de Listas
CREATE TABLE listas (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    pelicula_id INTEGER NOT NULL REFERENCES peliculas(id) ON DELETE CASCADE,
    tipo_lista VARCHAR(20) CHECK(tipo_lista IN ('por_ver', 'vistas')),
    fecha_agregada TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- SECCIÓN 2: ÍNDICES PARA OPTIMIZACIÓN
-- ============================================

CREATE INDEX idx_usuario_email ON usuarios(email);
CREATE INDEX idx_usuario_username ON usuarios(username);
CREATE INDEX idx_calificaciones_usuario ON calificaciones(usuario_id);
CREATE INDEX idx_calificaciones_pelicula ON calificaciones(pelicula_id);
CREATE INDEX idx_listas_usuario ON listas(usuario_id);
CREATE INDEX idx_listas_pelicula ON listas(pelicula_id);
CREATE INDEX idx_peliculas_genero ON peliculas(genero);
CREATE INDEX idx_peliculas_tmdb ON peliculas(tmdb_id);

-- ============================================
-- SECCIÓN 3: COMENTARIOS Y DOCUMENTACIÓN
-- ============================================

COMMENT ON TABLE usuarios IS 'Almacena información de usuarios registrados';
COMMENT ON TABLE peliculas IS 'Catálogo de películas obtenidas de TMDB API';
COMMENT ON TABLE calificaciones IS 'Calificaciones de usuarios a películas (1-5 estrellas)';
COMMENT ON TABLE listas IS 'Listas personales: por_ver y vistas';

COMMENT ON COLUMN usuarios.password IS 'Password hasheado con bcrypt';
COMMENT ON COLUMN peliculas.tmdb_id IS 'ID de la película en TMDB API';
COMMENT ON COLUMN calificaciones.puntuacion IS 'Escala del 1 al 5';
COMMENT ON COLUMN listas.tipo_lista IS 'Valores permitidos: por_ver, vistas';

-- ============================================
-- SECCIÓN 4: DATOS DE PRUEBA
-- ============================================

-- INSERTAR 5 USUARIOS
INSERT INTO usuarios (email, password, username) VALUES
('juan@cinex.com', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', 'juan_perez'),
('maria@cinex.com', '$2a$10$bcdefghijklmnopqrstuvwxyz1234567', 'maria_garcia'),
('carlos@cinex.com', '$2a$10$cdefghijklmnopqrstuvwxyz12345678', 'carlos_lopez'),
('ana@cinex.com', '$2a$10$defghijklmnopqrstuvwxyz123456789', 'ana_martinez'),
('luis@cinex.com', '$2a$10$efghijklmnopqrstuvwxyz1234567890', 'luis_rodriguez');

-- INSERTAR 5 PELÍCULAS (Películas populares reales)
INSERT INTO peliculas (titulo, año, genero, director, sinopsis, imagen_url, tmdb_id) VALUES
(
    'The Shawshank Redemption',
    1994,
    'Drama',
    'Frank Darabont',
    'Dos hombres encarcelados crean un vínculo durante varios años, encontrando consuelo y eventual redención a través de actos de decencia común.',
    'https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
    278
),
(
    'The Godfather',
    1972,
    'Crime',
    'Francis Ford Coppola',
    'El patriarca envejecido de una dinastía del crimen organizado transfiere el control de su imperio clandestino a su reacio hijo.',
    'https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
    238
),
(
    'The Dark Knight',
    2008,
    'Action',
    'Christopher Nolan',
    'Cuando la amenaza conocida como el Joker causa estragos y caos en la gente de Gotham, Batman debe aceptar una de las pruebas psicológicas y físicas más grandes.',
    'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    155
),
(
    'Inception',
    2010,
    'Sci-Fi',
    'Christopher Nolan',
    'Un ladrón que roba secretos corporativos mediante el uso de tecnología de compartir sueños recibe la tarea inversa de plantar una idea en la mente de un CEO.',
    'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
    27205
),
(
    'Pulp Fiction',
    1994,
    'Crime',
    'Quentin Tarantino',
    'Las vidas de dos sicarios de la mafia, un boxeador, la esposa de un gángster y un par de bandidos de la cena se entrelazan en cuatro historias de violencia y redención.',
    'https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
    680
);

-- INSERTAR 5 CALIFICACIONES (diferentes usuarios calificando diferentes películas)
INSERT INTO calificaciones (usuario_id, pelicula_id, puntuacion) VALUES
(1, 1, 5), -- Juan califica The Shawshank Redemption con 5 estrellas
(2, 1, 5), -- Maria califica The Shawshank Redemption con 5 estrellas
(1, 2, 4), -- Juan califica The Godfather con 4 estrellas
(3, 3, 5), -- Carlos califica The Dark Knight con 5 estrellas
(4, 4, 4); -- Ana califica Inception con 4 estrellas

-- INSERTAR 5 LISTAS (películas en listas "por_ver" o "vistas")
INSERT INTO listas (usuario_id, pelicula_id, tipo_lista) VALUES
(1, 3, 'por_ver'),    -- Juan tiene The Dark Knight en "por ver"
(2, 2, 'vistas'),     -- Maria tiene The Godfather en "vistas"
(3, 5, 'por_ver'),    -- Carlos tiene Pulp Fiction en "por ver"
(4, 1, 'vistas'),     -- Ana tiene The Shawshank Redemption en "vistas"
(5, 4, 'por_ver');    -- Luis tiene Inception en "por ver"

-- ============================================
-- SECCIÓN 5: CONSULTAS DE VERIFICACIÓN
-- ============================================

-- Ver todos los usuarios
-- SELECT * FROM usuarios;

-- Ver todas las películas
-- SELECT * FROM peliculas;

-- Ver todas las calificaciones con nombres
-- SELECT u.username, p.titulo, c.puntuacion 
-- FROM calificaciones c
-- JOIN usuarios u ON c.usuario_id = u.id
-- JOIN peliculas p ON c.pelicula_id = p.id;

-- Ver todas las listas con detalles
-- SELECT u.username, p.titulo, l.tipo_lista 
-- FROM listas l
-- JOIN usuarios u ON l.usuario_id = u.id
-- JOIN peliculas p ON l.pelicula_id = p.id;

-- Ver calificación promedio por película
-- SELECT p.titulo, ROUND(AVG(c.puntuacion), 2) as promedio
-- FROM peliculas p
-- LEFT JOIN calificaciones c ON p.id = c.pelicula_id
-- GROUP BY p.titulo
-- ORDER BY promedio DESC;

-- ============================================
-- FIN DEL SCRIPT
-- ============================================
