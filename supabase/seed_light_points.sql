-- ============================================================
-- SEED: Puntos de luz de Barcelona
-- Datos representativos de la infraestructura de alumbrado
-- público de Barcelona por distrito y barrio
-- ============================================================

-- Limpiar datos previos (opcional, comentar en producción)
-- TRUNCATE TABLE public.light_points;

-- ═══════════════════════════════════════════════════════════
-- EIXAMPLE
-- ═══════════════════════════════════════════════════════════

-- Passeig de Gràcia
INSERT INTO public.light_points (latitude, longitude, street_name, light_type, power_watts, district, neighborhood) VALUES
(41.38700, 2.16500, 'Passeig de Gràcia', 'LED', 200, 'Eixample', 'Dreta de l''Eixample'),
(41.38808, 2.16488, 'Passeig de Gràcia', 'LED', 200, 'Eixample', 'Dreta de l''Eixample'),
(41.38916, 2.16476, 'Passeig de Gràcia', 'LED', 200, 'Eixample', 'Dreta de l''Eixample'),
(41.39024, 2.16464, 'Passeig de Gràcia', 'LED', 200, 'Eixample', 'Dreta de l''Eixample'),
(41.39132, 2.16452, 'Passeig de Gràcia', 'LED', 200, 'Eixample', 'Dreta de l''Eixample'),
(41.39240, 2.16440, 'Passeig de Gràcia', 'LED', 200, 'Eixample', 'Dreta de l''Eixample'),
(41.39348, 2.16428, 'Passeig de Gràcia', 'LED', 200, 'Eixample', 'Dreta de l''Eixample'),
(41.39456, 2.16416, 'Passeig de Gràcia', 'LED', 200, 'Eixample', 'Dreta de l''Eixample'),
(41.39550, 2.16200, 'Passeig de Gràcia', 'LED', 200, 'Eixample', 'Dreta de l''Eixample');

-- Gran Via de les Corts Catalanes
INSERT INTO public.light_points (latitude, longitude, street_name, light_type, power_watts, district, neighborhood) VALUES
(41.38700, 2.12000, 'Gran Via de les Corts Catalanes', 'LED', 250, 'Eixample', 'Eixample'),
(41.38700, 2.12500, 'Gran Via de les Corts Catalanes', 'LED', 250, 'Eixample', 'Eixample'),
(41.38700, 2.13000, 'Gran Via de les Corts Catalanes', 'LED', 250, 'Eixample', 'Eixample'),
(41.38700, 2.13500, 'Gran Via de les Corts Catalanes', 'LED', 250, 'Eixample', 'Eixample'),
(41.38700, 2.14000, 'Gran Via de les Corts Catalanes', 'LED', 250, 'Eixample', 'Eixample'),
(41.38700, 2.14500, 'Gran Via de les Corts Catalanes', 'LED', 250, 'Eixample', 'Eixample'),
(41.38700, 2.15000, 'Gran Via de les Corts Catalanes', 'LED', 250, 'Eixample', 'Eixample'),
(41.38700, 2.15500, 'Gran Via de les Corts Catalanes', 'LED', 250, 'Eixample', 'Eixample'),
(41.38700, 2.16000, 'Gran Via de les Corts Catalanes', 'LED', 250, 'Eixample', 'Eixample'),
(41.38700, 2.16500, 'Gran Via de les Corts Catalanes', 'LED', 250, 'Eixample', 'Eixample'),
(41.38700, 2.17000, 'Gran Via de les Corts Catalanes', 'LED', 250, 'Eixample', 'Eixample'),
(41.38700, 2.17500, 'Gran Via de les Corts Catalanes', 'LED', 250, 'Eixample', 'Eixample'),
(41.38700, 2.18000, 'Gran Via de les Corts Catalanes', 'LED', 250, 'Eixample', 'Eixample'),
(41.38700, 2.18500, 'Gran Via de les Corts Catalanes', 'LED', 250, 'Eixample', 'Eixample'),
(41.38700, 2.19000, 'Gran Via de les Corts Catalanes', 'LED', 250, 'Eixample', 'Eixample');

-- Avinguda Diagonal
INSERT INTO public.light_points (latitude, longitude, street_name, light_type, power_watts, district, neighborhood) VALUES
(41.38700, 2.11300, 'Avinguda Diagonal', 'LED', 250, 'Eixample', 'Eixample'),
(41.38987, 2.11786, 'Avinguda Diagonal', 'LED', 250, 'Eixample', 'Eixample'),
(41.39274, 2.12272, 'Avinguda Diagonal', 'LED', 250, 'Eixample', 'Eixample'),
(41.39561, 2.12758, 'Avinguda Diagonal', 'LED', 250, 'Eixample', 'Eixample'),
(41.39848, 2.13244, 'Avinguda Diagonal', 'LED', 250, 'Eixample', 'Eixample'),
(41.40135, 2.13730, 'Avinguda Diagonal', 'LED', 250, 'Eixample', 'Eixample'),
(41.40422, 2.14216, 'Avinguda Diagonal', 'LED', 250, 'Eixample', 'Eixample'),
(41.40500, 2.15000, 'Avinguda Diagonal', 'LED', 250, 'Eixample', 'Eixample'),
(41.40500, 2.16000, 'Avinguda Diagonal', 'LED', 250, 'Eixample', 'Eixample'),
(41.40500, 2.17000, 'Avinguda Diagonal', 'LED', 250, 'Eixample', 'Eixample'),
(41.40500, 2.18000, 'Avinguda Diagonal', 'LED', 250, 'Eixample', 'Eixample'),
(41.40500, 2.19000, 'Avinguda Diagonal', 'LED', 250, 'Eixample', 'Eixample'),
(41.40500, 2.19500, 'Avinguda Diagonal', 'LED', 250, 'Eixample', 'Eixample');

-- Carrer d'Aragó
INSERT INTO public.light_points (latitude, longitude, street_name, light_type, power_watts, district, neighborhood) VALUES
(41.39080, 2.14000, 'Carrer d''Aragó', 'LED', 150, 'Eixample', 'Eixample'),
(41.39080, 2.14600, 'Carrer d''Aragó', 'LED', 150, 'Eixample', 'Eixample'),
(41.39080, 2.15200, 'Carrer d''Aragó', 'LED', 150, 'Eixample', 'Eixample'),
(41.39080, 2.15800, 'Carrer d''Aragó', 'LED', 150, 'Eixample', 'Eixample'),
(41.39080, 2.16400, 'Carrer d''Aragó', 'LED', 150, 'Eixample', 'Eixample'),
(41.39080, 2.17000, 'Carrer d''Aragó', 'LED', 150, 'Eixample', 'Eixample'),
(41.39080, 2.17600, 'Carrer d''Aragó', 'LED', 150, 'Eixample', 'Eixample'),
(41.39080, 2.18000, 'Carrer d''Aragó', 'LED', 150, 'Eixample', 'Eixample');

-- Carrer de Balmes
INSERT INTO public.light_points (latitude, longitude, street_name, light_type, power_watts, district, neighborhood) VALUES
(41.38700, 2.15850, 'Carrer de Balmes', 'LED', 150, 'Eixample', 'Eixample'),
(41.38950, 2.15700, 'Carrer de Balmes', 'LED', 150, 'Eixample', 'Eixample'),
(41.39200, 2.15550, 'Carrer de Balmes', 'LED', 150, 'Eixample', 'Eixample'),
(41.39450, 2.15400, 'Carrer de Balmes', 'LED', 150, 'Eixample', 'Eixample'),
(41.39700, 2.15250, 'Carrer de Balmes', 'LED', 150, 'Eixample', 'Eixample'),
(41.39950, 2.15100, 'Carrer de Balmes', 'LED', 150, 'Sarrià-Sant Gervasi', 'Sant Gervasi'),
(41.40200, 2.14950, 'Carrer de Balmes', 'LED', 150, 'Sarrià-Sant Gervasi', 'Sant Gervasi');

-- Rambla de Catalunya
INSERT INTO public.light_points (latitude, longitude, street_name, light_type, power_watts, district, neighborhood) VALUES
(41.38700, 2.16300, 'Rambla de Catalunya', 'LED', 180, 'Eixample', 'Dreta de l''Eixample'),
(41.38850, 2.16270, 'Rambla de Catalunya', 'LED', 180, 'Eixample', 'Dreta de l''Eixample'),
(41.39000, 2.16240, 'Rambla de Catalunya', 'LED', 180, 'Eixample', 'Dreta de l''Eixample'),
(41.39150, 2.16210, 'Rambla de Catalunya', 'LED', 180, 'Eixample', 'Dreta de l''Eixample'),
(41.39300, 2.16180, 'Rambla de Catalunya', 'LED', 180, 'Eixample', 'Dreta de l''Eixample'),
(41.39450, 2.16150, 'Rambla de Catalunya', 'LED', 180, 'Eixample', 'Dreta de l''Eixample'),
(41.39550, 2.16000, 'Rambla de Catalunya', 'LED', 180, 'Eixample', 'Dreta de l''Eixample');

-- Plaça de Catalunya
INSERT INTO public.light_points (latitude, longitude, street_name, light_type, power_watts, district, neighborhood) VALUES
(41.38680, 2.16970, 'Plaça de Catalunya', 'LED', 250, 'Eixample', 'Dreta de l''Eixample'),
(41.38720, 2.16970, 'Plaça de Catalunya', 'LED', 250, 'Eixample', 'Dreta de l''Eixample'),
(41.38700, 2.17010, 'Plaça de Catalunya', 'LED', 250, 'Eixample', 'Dreta de l''Eixample'),
(41.38700, 2.16940, 'Plaça de Catalunya', 'LED', 250, 'Eixample', 'Dreta de l''Eixample'),
(41.38660, 2.17010, 'Plaça de Catalunya', 'LED', 250, 'Eixample', 'Dreta de l''Eixample'),
(41.38740, 2.17010, 'Plaça de Catalunya', 'LED', 250, 'Eixample', 'Dreta de l''Eixample'),
(41.38760, 2.16960, 'Plaça de Catalunya', 'LED', 250, 'Eixample', 'Dreta de l''Eixample'),
(41.38640, 2.16960, 'Plaça de Catalunya', 'LED', 250, 'Eixample', 'Dreta de l''Eixample');

-- Plaça de la Sagrada Família
INSERT INTO public.light_points (latitude, longitude, street_name, light_type, power_watts, district, neighborhood) VALUES
(41.40330, 2.17420, 'Plaça de la Sagrada Família', 'LED', 250, 'Eixample', 'Sagrada Família'),
(41.40370, 2.17420, 'Plaça de la Sagrada Família', 'LED', 250, 'Eixample', 'Sagrada Família'),
(41.40350, 2.17460, 'Plaça de la Sagrada Família', 'LED', 250, 'Eixample', 'Sagrada Família'),
(41.40350, 2.17390, 'Plaça de la Sagrada Família', 'LED', 250, 'Eixample', 'Sagrada Família'),
(41.40310, 2.17460, 'Plaça de la Sagrada Família', 'LED', 250, 'Eixample', 'Sagrada Família'),
(41.40390, 2.17460, 'Plaça de la Sagrada Família', 'LED', 250, 'Eixample', 'Sagrada Família');

-- ═══════════════════════════════════════════════════════════
-- CIUTAT VELLA
-- ═══════════════════════════════════════════════════════════

-- La Rambla
INSERT INTO public.light_points (latitude, longitude, street_name, light_type, power_watts, district, neighborhood) VALUES
(41.37470, 2.17000, 'La Rambla', 'LED', 200, 'Ciutat Vella', 'El Raval'),
(41.37620, 2.17050, 'La Rambla', 'LED', 200, 'Ciutat Vella', 'El Raval'),
(41.37770, 2.17100, 'La Rambla', 'LED', 200, 'Ciutat Vella', 'El Raval'),
(41.37920, 2.17130, 'La Rambla', 'LED', 200, 'Ciutat Vella', 'Barri Gòtic'),
(41.38070, 2.17150, 'La Rambla', 'LED', 200, 'Ciutat Vella', 'Barri Gòtic'),
(41.38220, 2.17200, 'La Rambla', 'LED', 200, 'Ciutat Vella', 'Barri Gòtic'),
(41.38300, 2.17250, 'La Rambla', 'LED', 200, 'Ciutat Vella', 'Barri Gòtic');

-- Via Laietana
INSERT INTO public.light_points (latitude, longitude, street_name, light_type, power_watts, district, neighborhood) VALUES
(41.37900, 2.17600, 'Via Laietana', 'LED', 200, 'Ciutat Vella', 'Barri Gòtic'),
(41.38050, 2.17620, 'Via Laietana', 'LED', 200, 'Ciutat Vella', 'Barri Gòtic'),
(41.38200, 2.17640, 'Via Laietana', 'LED', 200, 'Ciutat Vella', 'Barri Gòtic'),
(41.38350, 2.17660, 'Via Laietana', 'LED', 200, 'Ciutat Vella', 'Barri Gòtic'),
(41.38500, 2.17680, 'Via Laietana', 'LED', 200, 'Ciutat Vella', 'Sant Pere'),
(41.38650, 2.17700, 'Via Laietana', 'LED', 200, 'Ciutat Vella', 'Sant Pere'),
(41.38700, 2.17700, 'Via Laietana', 'LED', 200, 'Ciutat Vella', 'Sant Pere');

-- Passeig de Colom
INSERT INTO public.light_points (latitude, longitude, street_name, light_type, power_watts, district, neighborhood) VALUES
(41.37480, 2.17300, 'Passeig de Colom', 'LED', 200, 'Ciutat Vella', 'Barceloneta'),
(41.37520, 2.17600, 'Passeig de Colom', 'LED', 200, 'Ciutat Vella', 'Barceloneta'),
(41.37560, 2.17900, 'Passeig de Colom', 'LED', 200, 'Ciutat Vella', 'Barceloneta'),
(41.37580, 2.18200, 'Passeig de Colom', 'LED', 200, 'Ciutat Vella', 'Barceloneta'),
(41.37600, 2.18500, 'Passeig de Colom', 'LED', 200, 'Ciutat Vella', 'Barceloneta');

-- Avinguda del Portal de l'Àngel
INSERT INTO public.light_points (latitude, longitude, street_name, light_type, power_watts, district, neighborhood) VALUES
(41.38500, 2.17250, 'Avinguda del Portal de l''Àngel', 'LED', 200, 'Ciutat Vella', 'Barri Gòtic'),
(41.38600, 2.17200, 'Avinguda del Portal de l''Àngel', 'LED', 200, 'Ciutat Vella', 'Barri Gòtic'),
(41.38700, 2.17150, 'Avinguda del Portal de l''Àngel', 'LED', 200, 'Ciutat Vella', 'Barri Gòtic'),
(41.38720, 2.17100, 'Avinguda del Portal de l''Àngel', 'LED', 200, 'Ciutat Vella', 'Barri Gòtic');

-- Carrer de Ferran (zona Barri Gòtic, iluminación histórica)
INSERT INTO public.light_points (latitude, longitude, street_name, light_type, power_watts, district, neighborhood) VALUES
(41.38100, 2.17250, 'Carrer de Ferran', 'Halógeno', 100, 'Ciutat Vella', 'Barri Gòtic'),
(41.38110, 2.17350, 'Carrer de Ferran', 'Halógeno', 100, 'Ciutat Vella', 'Barri Gòtic'),
(41.38120, 2.17450, 'Carrer de Ferran', 'Halógeno', 100, 'Ciutat Vella', 'Barri Gòtic'),
(41.38130, 2.17550, 'Carrer de Ferran', 'Halógeno', 100, 'Ciutat Vella', 'Barri Gòtic'),
(41.38140, 2.17650, 'Carrer de Ferran', 'Halógeno', 100, 'Ciutat Vella', 'Barri Gòtic'),
(41.38150, 2.17700, 'Carrer de Ferran', 'Halógeno', 100, 'Ciutat Vella', 'Barri Gòtic');

-- Passeig del Born
INSERT INTO public.light_points (latitude, longitude, street_name, light_type, power_watts, district, neighborhood) VALUES
(41.38450, 2.18150, 'Passeig del Born', 'LED', 150, 'Ciutat Vella', 'El Born'),
(41.38400, 2.18200, 'Passeig del Born', 'LED', 150, 'Ciutat Vella', 'El Born'),
(41.38350, 2.18250, 'Passeig del Born', 'LED', 150, 'Ciutat Vella', 'El Born'),
(41.38300, 2.18300, 'Passeig del Born', 'LED', 150, 'Ciutat Vella', 'El Born');

-- Carrer de la Princesa
INSERT INTO public.light_points (latitude, longitude, street_name, light_type, power_watts, district, neighborhood) VALUES
(41.38400, 2.17900, 'Carrer de la Princesa', 'LED', 120, 'Ciutat Vella', 'El Born'),
(41.38450, 2.18000, 'Carrer de la Princesa', 'LED', 120, 'Ciutat Vella', 'El Born'),
(41.38500, 2.18100, 'Carrer de la Princesa', 'LED', 120, 'Ciutat Vella', 'El Born'),
(41.38550, 2.18150, 'Carrer de la Princesa', 'LED', 120, 'Ciutat Vella', 'El Born');

-- Passeig Marítim de la Barceloneta
INSERT INTO public.light_points (latitude, longitude, street_name, light_type, power_watts, district, neighborhood) VALUES
(41.37500, 2.18800, 'Passeig Marítim de la Barceloneta', 'LED', 200, 'Ciutat Vella', 'Barceloneta'),
(41.37600, 2.18900, 'Passeig Marítim de la Barceloneta', 'LED', 200, 'Ciutat Vella', 'Barceloneta'),
(41.37700, 2.19000, 'Passeig Marítim de la Barceloneta', 'LED', 200, 'Ciutat Vella', 'Barceloneta'),
(41.37800, 2.19100, 'Passeig Marítim de la Barceloneta', 'LED', 200, 'Ciutat Vella', 'Barceloneta'),
(41.37900, 2.19200, 'Passeig Marítim de la Barceloneta', 'LED', 200, 'Ciutat Vella', 'Barceloneta'),
(41.38000, 2.19300, 'Passeig Marítim de la Barceloneta', 'LED', 200, 'Ciutat Vella', 'Barceloneta'),
(41.38100, 2.19400, 'Passeig Marítim de la Barceloneta', 'LED', 200, 'Ciutat Vella', 'Barceloneta'),
(41.38200, 2.19500, 'Passeig Marítim de la Barceloneta', 'LED', 200, 'Ciutat Vella', 'Barceloneta'),
(41.38300, 2.19600, 'Passeig Marítim de la Barceloneta', 'LED', 200, 'Sant Martí', 'Vila Olímpica'),
(41.38400, 2.19700, 'Passeig Marítim de la Barceloneta', 'LED', 200, 'Sant Martí', 'Vila Olímpica');

-- Passeig de Joan de Borbó
INSERT INTO public.light_points (latitude, longitude, street_name, light_type, power_watts, district, neighborhood) VALUES
(41.37800, 2.18100, 'Passeig de Joan de Borbó', 'LED', 200, 'Ciutat Vella', 'Barceloneta'),
(41.37700, 2.18300, 'Passeig de Joan de Borbó', 'LED', 200, 'Ciutat Vella', 'Barceloneta'),
(41.37600, 2.18500, 'Passeig de Joan de Borbó', 'LED', 200, 'Ciutat Vella', 'Barceloneta'),
(41.37500, 2.18700, 'Passeig de Joan de Borbó', 'LED', 200, 'Ciutat Vella', 'Barceloneta'),
(41.37400, 2.18700, 'Passeig de Joan de Borbó', 'LED', 200, 'Ciutat Vella', 'Barceloneta');

-- ═══════════════════════════════════════════════════════════
-- GRÀCIA
-- ═══════════════════════════════════════════════════════════

-- Carrer Gran de Gràcia
INSERT INTO public.light_points (latitude, longitude, street_name, light_type, power_watts, district, neighborhood) VALUES
(41.39900, 2.15550, 'Carrer Gran de Gràcia', 'LED', 150, 'Gràcia', 'Vila de Gràcia'),
(41.40000, 2.15490, 'Carrer Gran de Gràcia', 'LED', 150, 'Gràcia', 'Vila de Gràcia'),
(41.40100, 2.15430, 'Carrer Gran de Gràcia', 'LED', 150, 'Gràcia', 'Vila de Gràcia'),
(41.40200, 2.15370, 'Carrer Gran de Gràcia', 'LED', 150, 'Gràcia', 'Vila de Gràcia'),
(41.40300, 2.15310, 'Carrer Gran de Gràcia', 'LED', 150, 'Gràcia', 'Vila de Gràcia'),
(41.40400, 2.15250, 'Carrer Gran de Gràcia', 'LED', 150, 'Gràcia', 'Vila de Gràcia'),
(41.40450, 2.15200, 'Carrer Gran de Gràcia', 'LED', 150, 'Gràcia', 'Vila de Gràcia');

-- Travessera de Gràcia
INSERT INTO public.light_points (latitude, longitude, street_name, light_type, power_watts, district, neighborhood) VALUES
(41.39980, 2.14500, 'Travessera de Gràcia', 'LED', 150, 'Gràcia', 'Vila de Gràcia'),
(41.39980, 2.14800, 'Travessera de Gràcia', 'LED', 150, 'Gràcia', 'Vila de Gràcia'),
(41.39980, 2.15100, 'Travessera de Gràcia', 'LED', 150, 'Gràcia', 'Vila de Gràcia'),
(41.39980, 2.15400, 'Travessera de Gràcia', 'LED', 150, 'Gràcia', 'Vila de Gràcia'),
(41.39980, 2.15700, 'Travessera de Gràcia', 'LED', 150, 'Gràcia', 'Vila de Gràcia'),
(41.39980, 2.16000, 'Travessera de Gràcia', 'LED', 150, 'Gràcia', 'Vila de Gràcia'),
(41.39980, 2.16300, 'Travessera de Gràcia', 'LED', 150, 'Gràcia', 'Vila de Gràcia'),
(41.39980, 2.16500, 'Travessera de Gràcia', 'LED', 150, 'Gràcia', 'Vila de Gràcia');

-- Plaça del Sol
INSERT INTO public.light_points (latitude, longitude, street_name, light_type, power_watts, district, neighborhood) VALUES
(41.40150, 2.15650, 'Plaça del Sol', 'LED', 120, 'Gràcia', 'Vila de Gràcia'),
(41.40180, 2.15680, 'Plaça del Sol', 'LED', 120, 'Gràcia', 'Vila de Gràcia'),
(41.40200, 2.15650, 'Plaça del Sol', 'LED', 120, 'Gràcia', 'Vila de Gràcia'),
(41.40180, 2.15620, 'Plaça del Sol', 'LED', 120, 'Gràcia', 'Vila de Gràcia');

-- Carrer de Verdi (zona popular Gràcia)
INSERT INTO public.light_points (latitude, longitude, street_name, light_type, power_watts, district, neighborhood) VALUES
(41.40200, 2.15700, 'Carrer de Verdi', 'LED', 120, 'Gràcia', 'Vila de Gràcia'),
(41.40300, 2.15720, 'Carrer de Verdi', 'LED', 120, 'Gràcia', 'Vila de Gràcia'),
(41.40400, 2.15740, 'Carrer de Verdi', 'LED', 120, 'Gràcia', 'Vila de Gràcia'),
(41.40500, 2.15760, 'Carrer de Verdi', 'LED', 120, 'Gràcia', 'Vila de Gràcia');

-- ═══════════════════════════════════════════════════════════
-- SANT MARTÍ
-- ═══════════════════════════════════════════════════════════

-- Avinguda Meridiana
INSERT INTO public.light_points (latitude, longitude, street_name, light_type, power_watts, district, neighborhood) VALUES
(41.38700, 2.18100, 'Avinguda Meridiana', 'LED', 250, 'Sant Martí', 'El Clot'),
(41.39200, 2.18300, 'Avinguda Meridiana', 'LED', 250, 'Sant Martí', 'El Clot'),
(41.39700, 2.18500, 'Avinguda Meridiana', 'LED', 250, 'Sant Martí', 'El Clot'),
(41.40200, 2.18700, 'Avinguda Meridiana', 'LED', 250, 'Sant Martí', 'El Clot'),
(41.40700, 2.18900, 'Avinguda Meridiana', 'LED', 250, 'Sant Martí', 'El Clot'),
(41.41200, 2.19100, 'Avinguda Meridiana', 'LED', 250, 'Sant Martí', 'El Clot'),
(41.41700, 2.19200, 'Avinguda Meridiana', 'LED', 250, 'Sant Martí', 'El Clot'),
(41.42000, 2.18700, 'Avinguda Meridiana', 'LED', 250, 'Sant Martí', 'El Clot');

-- Rambla del Poblenou
INSERT INTO public.light_points (latitude, longitude, street_name, light_type, power_watts, district, neighborhood) VALUES
(41.39500, 2.19800, 'Rambla del Poblenou', 'LED', 180, 'Sant Martí', 'Poblenou'),
(41.39650, 2.19850, 'Rambla del Poblenou', 'LED', 180, 'Sant Martí', 'Poblenou'),
(41.39800, 2.19900, 'Rambla del Poblenou', 'LED', 180, 'Sant Martí', 'Poblenou'),
(41.39950, 2.19950, 'Rambla del Poblenou', 'LED', 180, 'Sant Martí', 'Poblenou'),
(41.40100, 2.20000, 'Rambla del Poblenou', 'LED', 180, 'Sant Martí', 'Poblenou'),
(41.40250, 2.20050, 'Rambla del Poblenou', 'LED', 180, 'Sant Martí', 'Poblenou'),
(41.40500, 2.20200, 'Rambla del Poblenou', 'LED', 180, 'Sant Martí', 'Poblenou');

-- Carrer de Pere IV (Poblenou / 22@)
INSERT INTO public.light_points (latitude, longitude, street_name, light_type, power_watts, district, neighborhood) VALUES
(41.39900, 2.19000, 'Carrer de Pere IV', 'LED', 150, 'Sant Martí', 'Poblenou'),
(41.39950, 2.19400, 'Carrer de Pere IV', 'LED', 150, 'Sant Martí', 'Poblenou'),
(41.40000, 2.19800, 'Carrer de Pere IV', 'LED', 150, 'Sant Martí', 'Poblenou'),
(41.40050, 2.20200, 'Carrer de Pere IV', 'LED', 150, 'Sant Martí', 'Poblenou'),
(41.40100, 2.20600, 'Carrer de Pere IV', 'LED', 150, 'Sant Martí', 'Poblenou'),
(41.40150, 2.21000, 'Carrer de Pere IV', 'LED', 150, 'Sant Martí', 'Poblenou');

-- Plaça de les Glòries Catalanes
INSERT INTO public.light_points (latitude, longitude, street_name, light_type, power_watts, district, neighborhood) VALUES
(41.40300, 2.18650, 'Plaça de les Glòries Catalanes', 'LED', 250, 'Sant Martí', 'El Clot'),
(41.40400, 2.18700, 'Plaça de les Glòries Catalanes', 'LED', 250, 'Sant Martí', 'El Clot'),
(41.40350, 2.18750, 'Plaça de les Glòries Catalanes', 'LED', 250, 'Sant Martí', 'El Clot'),
(41.40350, 2.18650, 'Plaça de les Glòries Catalanes', 'LED', 250, 'Sant Martí', 'El Clot'),
(41.40250, 2.18700, 'Plaça de les Glòries Catalanes', 'LED', 250, 'Sant Martí', 'El Clot'),
(41.40450, 2.18700, 'Plaça de les Glòries Catalanes', 'LED', 250, 'Sant Martí', 'El Clot');

-- Port Olímpic y Vila Olímpica
INSERT INTO public.light_points (latitude, longitude, street_name, light_type, power_watts, district, neighborhood) VALUES
(41.38900, 2.19900, 'Port Olímpic', 'LED', 200, 'Sant Martí', 'Vila Olímpica'),
(41.38800, 2.19950, 'Port Olímpic', 'LED', 200, 'Sant Martí', 'Vila Olímpica'),
(41.38700, 2.20000, 'Port Olímpic', 'LED', 200, 'Sant Martí', 'Vila Olímpica'),
(41.38600, 2.20050, 'Port Olímpic', 'LED', 200, 'Sant Martí', 'Vila Olímpica'),
(41.38500, 2.20100, 'Port Olímpic', 'LED', 200, 'Sant Martí', 'Vila Olímpica');

-- Passeig Marítim Nova Icària
INSERT INTO public.light_points (latitude, longitude, street_name, light_type, power_watts, district, neighborhood) VALUES
(41.38700, 2.19700, 'Passeig Marítim Nova Icària', 'LED', 200, 'Sant Martí', 'Vila Olímpica'),
(41.38800, 2.19850, 'Passeig Marítim Nova Icària', 'LED', 200, 'Sant Martí', 'Vila Olímpica'),
(41.38900, 2.20000, 'Passeig Marítim Nova Icària', 'LED', 200, 'Sant Martí', 'Vila Olímpica'),
(41.39000, 2.20150, 'Passeig Marítim Nova Icària', 'LED', 200, 'Sant Martí', 'Vila Olímpica'),
(41.39100, 2.20300, 'Passeig Marítim Nova Icària', 'LED', 200, 'Sant Martí', 'Vila Olímpica'),
(41.39200, 2.20450, 'Passeig Marítim Nova Icària', 'LED', 200, 'Sant Martí', 'Vila Olímpica');

-- ═══════════════════════════════════════════════════════════
-- SANTS-MONTJUÏC
-- ═══════════════════════════════════════════════════════════

-- Carrer de Sants
INSERT INTO public.light_points (latitude, longitude, street_name, light_type, power_watts, district, neighborhood) VALUES
(41.37500, 2.13200, 'Carrer de Sants', 'LED', 150, 'Sants-Montjuïc', 'Sants'),
(41.37520, 2.13600, 'Carrer de Sants', 'LED', 150, 'Sants-Montjuïc', 'Sants'),
(41.37540, 2.14000, 'Carrer de Sants', 'LED', 150, 'Sants-Montjuïc', 'Sants'),
(41.37560, 2.14400, 'Carrer de Sants', 'LED', 150, 'Sants-Montjuïc', 'Sants'),
(41.37580, 2.14800, 'Carrer de Sants', 'LED', 150, 'Sants-Montjuïc', 'Sants'),
(41.37600, 2.14900, 'Carrer de Sants', 'LED', 150, 'Sants-Montjuïc', 'Sants');

-- Avinguda del Paral·lel
INSERT INTO public.light_points (latitude, longitude, street_name, light_type, power_watts, district, neighborhood) VALUES
(41.37200, 2.16200, 'Avinguda del Paral·lel', 'LED', 200, 'Sants-Montjuïc', 'Poble-sec'),
(41.37350, 2.16400, 'Avinguda del Paral·lel', 'LED', 200, 'Sants-Montjuïc', 'Poble-sec'),
(41.37500, 2.16600, 'Avinguda del Paral·lel', 'LED', 200, 'Sants-Montjuïc', 'Poble-sec'),
(41.37650, 2.16800, 'Avinguda del Paral·lel', 'LED', 200, 'Sants-Montjuïc', 'Poble-sec'),
(41.37800, 2.17000, 'Avinguda del Paral·lel', 'LED', 200, 'Sants-Montjuïc', 'Poble-sec'),
(41.37900, 2.17000, 'Avinguda del Paral·lel', 'LED', 200, 'Sants-Montjuïc', 'Poble-sec');

-- Plaça d'Espanya
INSERT INTO public.light_points (latitude, longitude, street_name, light_type, power_watts, district, neighborhood) VALUES
(41.37480, 2.14840, 'Plaça d''Espanya', 'LED', 250, 'Sants-Montjuïc', 'Hostafrancs'),
(41.37520, 2.14880, 'Plaça d''Espanya', 'LED', 250, 'Sants-Montjuïc', 'Hostafrancs'),
(41.37560, 2.14840, 'Plaça d''Espanya', 'LED', 250, 'Sants-Montjuïc', 'Hostafrancs'),
(41.37520, 2.14800, 'Plaça d''Espanya', 'LED', 250, 'Sants-Montjuïc', 'Hostafrancs'),
(41.37440, 2.14840, 'Plaça d''Espanya', 'LED', 250, 'Sants-Montjuïc', 'Hostafrancs'),
(41.37600, 2.14840, 'Plaça d''Espanya', 'LED', 250, 'Sants-Montjuïc', 'Hostafrancs');

-- Montjuïc (sodio + LED mixto)
INSERT INTO public.light_points (latitude, longitude, street_name, light_type, power_watts, district, neighborhood) VALUES
(41.36900, 2.15300, 'Passeig de l''Exposició', 'Sodio', 150, 'Sants-Montjuïc', 'Montjuïc'),
(41.36700, 2.15100, 'Passeig de l''Exposició', 'Sodio', 150, 'Sants-Montjuïc', 'Montjuïc'),
(41.36500, 2.14900, 'Passeig de l''Exposició', 'Sodio', 150, 'Sants-Montjuïc', 'Montjuïc'),
(41.36400, 2.14700, 'Passeig de l''Exposició', 'LED', 150, 'Sants-Montjuïc', 'Montjuïc'),
(41.36300, 2.14500, 'Passeig de l''Exposició', 'LED', 150, 'Sants-Montjuïc', 'Montjuïc');

-- Avinguda de Rius i Taulet (zona Expo / MNAC)
INSERT INTO public.light_points (latitude, longitude, street_name, light_type, power_watts, district, neighborhood) VALUES
(41.36900, 2.15400, 'Avinguda de Rius i Taulet', 'LED', 200, 'Sants-Montjuïc', 'Montjuïc'),
(41.37000, 2.15450, 'Avinguda de Rius i Taulet', 'LED', 200, 'Sants-Montjuïc', 'Montjuïc'),
(41.37100, 2.15500, 'Avinguda de Rius i Taulet', 'LED', 200, 'Sants-Montjuïc', 'Montjuïc');

-- ═══════════════════════════════════════════════════════════
-- SARRIÀ-SANT GERVASI
-- ═══════════════════════════════════════════════════════════

-- Via Augusta
INSERT INTO public.light_points (latitude, longitude, street_name, light_type, power_watts, district, neighborhood) VALUES
(41.40000, 2.14800, 'Via Augusta', 'LED', 180, 'Sarrià-Sant Gervasi', 'Sant Gervasi'),
(41.40200, 2.14600, 'Via Augusta', 'LED', 180, 'Sarrià-Sant Gervasi', 'Sant Gervasi'),
(41.40400, 2.14400, 'Via Augusta', 'LED', 180, 'Sarrià-Sant Gervasi', 'Sant Gervasi'),
(41.40600, 2.14200, 'Via Augusta', 'LED', 180, 'Sarrià-Sant Gervasi', 'Sant Gervasi'),
(41.40800, 2.14000, 'Via Augusta', 'LED', 180, 'Sarrià-Sant Gervasi', 'Sant Gervasi'),
(41.41000, 2.13800, 'Via Augusta', 'LED', 180, 'Sarrià-Sant Gervasi', 'Sant Gervasi');

-- Passeig de la Bonanova
INSERT INTO public.light_points (latitude, longitude, street_name, light_type, power_watts, district, neighborhood) VALUES
(41.40600, 2.12500, 'Passeig de la Bonanova', 'LED', 180, 'Sarrià-Sant Gervasi', 'Sarrià'),
(41.40600, 2.13000, 'Passeig de la Bonanova', 'LED', 180, 'Sarrià-Sant Gervasi', 'Sarrià'),
(41.40600, 2.13500, 'Passeig de la Bonanova', 'LED', 180, 'Sarrià-Sant Gervasi', 'Sarrià'),
(41.40600, 2.14000, 'Passeig de la Bonanova', 'LED', 180, 'Sarrià-Sant Gervasi', 'Sarrià'),
(41.40600, 2.14500, 'Passeig de la Bonanova', 'LED', 180, 'Sarrià-Sant Gervasi', 'Sarrià');

-- Avinguda de Sarrià
INSERT INTO public.light_points (latitude, longitude, street_name, light_type, power_watts, district, neighborhood) VALUES
(41.39200, 2.13800, 'Avinguda de Sarrià', 'LED', 180, 'Sarrià-Sant Gervasi', 'Les Tres Torres'),
(41.39400, 2.13600, 'Avinguda de Sarrià', 'LED', 180, 'Sarrià-Sant Gervasi', 'Les Tres Torres'),
(41.39600, 2.13400, 'Avinguda de Sarrià', 'LED', 180, 'Sarrià-Sant Gervasi', 'Les Tres Torres'),
(41.39800, 2.13200, 'Avinguda de Sarrià', 'LED', 180, 'Sarrià-Sant Gervasi', 'Les Tres Torres'),
(41.39600, 2.12800, 'Avinguda de Sarrià', 'LED', 180, 'Sarrià-Sant Gervasi', 'Les Tres Torres');

-- ═══════════════════════════════════════════════════════════
-- LES CORTS
-- ═══════════════════════════════════════════════════════════

-- Travessera de les Corts
INSERT INTO public.light_points (latitude, longitude, street_name, light_type, power_watts, district, neighborhood) VALUES
(41.38700, 2.12500, 'Travessera de les Corts', 'LED', 150, 'Les Corts', 'Les Corts'),
(41.38700, 2.13000, 'Travessera de les Corts', 'LED', 150, 'Les Corts', 'Les Corts'),
(41.38700, 2.13500, 'Travessera de les Corts', 'LED', 150, 'Les Corts', 'Les Corts'),
(41.38700, 2.14000, 'Travessera de les Corts', 'LED', 150, 'Les Corts', 'Les Corts');

-- Avinguda de Madrid
INSERT INTO public.light_points (latitude, longitude, street_name, light_type, power_watts, district, neighborhood) VALUES
(41.38300, 2.13000, 'Avinguda de Madrid', 'LED', 180, 'Les Corts', 'Les Corts'),
(41.38300, 2.13500, 'Avinguda de Madrid', 'LED', 180, 'Les Corts', 'Les Corts'),
(41.38300, 2.14000, 'Avinguda de Madrid', 'LED', 180, 'Les Corts', 'Les Corts');

-- Carrer de Numància (zona Camp Nou)
INSERT INTO public.light_points (latitude, longitude, street_name, light_type, power_watts, district, neighborhood) VALUES
(41.38000, 2.11600, 'Carrer de Numància', 'LED', 150, 'Les Corts', 'Les Corts'),
(41.38200, 2.11600, 'Carrer de Numància', 'LED', 150, 'Les Corts', 'Les Corts'),
(41.38400, 2.11600, 'Carrer de Numància', 'LED', 150, 'Les Corts', 'Les Corts'),
(41.38600, 2.11600, 'Carrer de Numància', 'LED', 150, 'Les Corts', 'Les Corts');

-- ═══════════════════════════════════════════════════════════
-- HORTA-GUINARDÓ
-- ═══════════════════════════════════════════════════════════

-- Ronda del Guinardó
INSERT INTO public.light_points (latitude, longitude, street_name, light_type, power_watts, district, neighborhood) VALUES
(41.41200, 2.16500, 'Ronda del Guinardó', 'LED', 180, 'Horta-Guinardó', 'El Guinardó'),
(41.41400, 2.16800, 'Ronda del Guinardó', 'LED', 180, 'Horta-Guinardó', 'El Guinardó'),
(41.41600, 2.17100, 'Ronda del Guinardó', 'LED', 180, 'Horta-Guinardó', 'El Guinardó'),
(41.41700, 2.17500, 'Ronda del Guinardó', 'LED', 180, 'Horta-Guinardó', 'El Guinardó');

-- Avinguda de Gaudí (Hospital de Sant Pau)
INSERT INTO public.light_points (latitude, longitude, street_name, light_type, power_watts, district, neighborhood) VALUES
(41.41200, 2.17300, 'Avinguda de Gaudí', 'LED', 200, 'Horta-Guinardó', 'El Guinardó'),
(41.41300, 2.17500, 'Avinguda de Gaudí', 'LED', 200, 'Horta-Guinardó', 'El Guinardó'),
(41.41400, 2.17700, 'Avinguda de Gaudí', 'LED', 200, 'Horta-Guinardó', 'El Guinardó');

-- Carrer d'Horta (calle comercial)
INSERT INTO public.light_points (latitude, longitude, street_name, light_type, power_watts, district, neighborhood) VALUES
(41.42200, 2.15900, 'Carrer d''Horta', 'LED', 150, 'Horta-Guinardó', 'Horta'),
(41.42300, 2.16100, 'Carrer d''Horta', 'LED', 150, 'Horta-Guinardó', 'Horta'),
(41.42400, 2.16300, 'Carrer d''Horta', 'LED', 150, 'Horta-Guinardó', 'Horta'),
(41.42500, 2.16500, 'Carrer d''Horta', 'LED', 150, 'Horta-Guinardó', 'Horta');

-- ═══════════════════════════════════════════════════════════
-- NOU BARRIS
-- ═══════════════════════════════════════════════════════════

-- Passeig de Fabra i Puig
INSERT INTO public.light_points (latitude, longitude, street_name, light_type, power_watts, district, neighborhood) VALUES
(41.42000, 2.17000, 'Passeig de Fabra i Puig', 'LED', 180, 'Nou Barris', 'Vilapicina'),
(41.42200, 2.17100, 'Passeig de Fabra i Puig', 'LED', 180, 'Nou Barris', 'Vilapicina'),
(41.42400, 2.17200, 'Passeig de Fabra i Puig', 'LED', 180, 'Nou Barris', 'Vilapicina'),
(41.42600, 2.17300, 'Passeig de Fabra i Puig', 'LED', 180, 'Nou Barris', 'Vilapicina'),
(41.42800, 2.17200, 'Passeig de Fabra i Puig', 'LED', 180, 'Nou Barris', 'Vilapicina');

-- Via Favència
INSERT INTO public.light_points (latitude, longitude, street_name, light_type, power_watts, district, neighborhood) VALUES
(41.43100, 2.15800, 'Via Favència', 'LED', 200, 'Nou Barris', 'Nou Barris'),
(41.43100, 2.16100, 'Via Favència', 'LED', 200, 'Nou Barris', 'Nou Barris'),
(41.43100, 2.16400, 'Via Favència', 'LED', 200, 'Nou Barris', 'Nou Barris'),
(41.43100, 2.16700, 'Via Favència', 'LED', 200, 'Nou Barris', 'Nou Barris'),
(41.43100, 2.17000, 'Via Favència', 'LED', 200, 'Nou Barris', 'Nou Barris'),
(41.43100, 2.17300, 'Via Favència', 'LED', 200, 'Nou Barris', 'Nou Barris'),
(41.43100, 2.17500, 'Via Favència', 'LED', 200, 'Nou Barris', 'Nou Barris');

-- Passeig de Valldaura
INSERT INTO public.light_points (latitude, longitude, street_name, light_type, power_watts, district, neighborhood) VALUES
(41.43500, 2.16400, 'Passeig de Valldaura', 'LED', 180, 'Nou Barris', 'Nou Barris'),
(41.43700, 2.16500, 'Passeig de Valldaura', 'LED', 180, 'Nou Barris', 'Nou Barris'),
(41.43900, 2.16600, 'Passeig de Valldaura', 'LED', 180, 'Nou Barris', 'Nou Barris'),
(41.44100, 2.16700, 'Passeig de Valldaura', 'LED', 180, 'Nou Barris', 'Nou Barris');

-- ═══════════════════════════════════════════════════════════
-- SANT ANDREU
-- ═══════════════════════════════════════════════════════════

-- Gran de Sant Andreu
INSERT INTO public.light_points (latitude, longitude, street_name, light_type, power_watts, district, neighborhood) VALUES
(41.42400, 2.18900, 'Gran de Sant Andreu', 'LED', 150, 'Sant Andreu', 'Sant Andreu'),
(41.42600, 2.18880, 'Gran de Sant Andreu', 'LED', 150, 'Sant Andreu', 'Sant Andreu'),
(41.42800, 2.18860, 'Gran de Sant Andreu', 'LED', 150, 'Sant Andreu', 'Sant Andreu'),
(41.43000, 2.18840, 'Gran de Sant Andreu', 'LED', 150, 'Sant Andreu', 'Sant Andreu'),
(41.43200, 2.18820, 'Gran de Sant Andreu', 'LED', 150, 'Sant Andreu', 'Sant Andreu');

-- Passeig de Santa Coloma
INSERT INTO public.light_points (latitude, longitude, street_name, light_type, power_watts, district, neighborhood) VALUES
(41.43000, 2.19500, 'Passeig de Santa Coloma', 'LED', 200, 'Sant Andreu', 'Sant Andreu'),
(41.43200, 2.19600, 'Passeig de Santa Coloma', 'LED', 200, 'Sant Andreu', 'Sant Andreu'),
(41.43400, 2.19700, 'Passeig de Santa Coloma', 'LED', 200, 'Sant Andreu', 'Sant Andreu'),
(41.43600, 2.19800, 'Passeig de Santa Coloma', 'LED', 200, 'Sant Andreu', 'Sant Andreu');

-- ═══════════════════════════════════════════════════════════
-- PORT VELL / MOLL DE LA FUSTA
-- ═══════════════════════════════════════════════════════════

INSERT INTO public.light_points (latitude, longitude, street_name, light_type, power_watts, district, neighborhood) VALUES
(41.37600, 2.17700, 'Moll de la Fusta', 'LED', 200, 'Ciutat Vella', 'Port Vell'),
(41.37500, 2.17900, 'Moll de la Fusta', 'LED', 200, 'Ciutat Vella', 'Port Vell'),
(41.37400, 2.18100, 'Moll de la Fusta', 'LED', 200, 'Ciutat Vella', 'Port Vell'),
(41.37350, 2.18300, 'Moll de la Fusta', 'LED', 200, 'Ciutat Vella', 'Port Vell'),
(41.37300, 2.18400, 'Moll de la Fusta', 'LED', 200, 'Ciutat Vella', 'Port Vell');
