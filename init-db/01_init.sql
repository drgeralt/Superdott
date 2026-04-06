INSERT INTO schools (id, name) VALUES (gen_random_uuid(), 'Escola Primária Tech');

INSERT INTO students (id, full_name, email, school_id) 
VALUES 
(gen_random_uuid(), 'Ana Beatriz Silva', 'ana@escola.com', (SELECT id FROM schools LIMIT 1)),
(gen_random_uuid(), 'Carlos Eduardo', 'carlos@escola.com', (SELECT id FROM schools LIMIT 1));