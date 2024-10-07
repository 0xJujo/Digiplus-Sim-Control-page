-- Create the simDb table
CREATE TABLE simDb (
    "sim_number" SERIAL PRIMARY KEY,
    "phone_number" VARCHAR(15) NOT NULL UNIQUE,
    "status" VARCHAR(10) NOT NULL CHECK ("Status" IN ('active', 'inactive')),
    "activation_date" TIMESTAMP
);

-- dummy date for simDb
INSERT INTO simDb ("Phone Number", "Status", "Activation Date") VALUES
('1111111111', 'inactive', NULL),
('2222222222', 'inactive', NULL),
('3333333333', 'active', NOW()),
('4444444444', 'inactive', NULL),
('55555555555', 'inactive', NULL);

