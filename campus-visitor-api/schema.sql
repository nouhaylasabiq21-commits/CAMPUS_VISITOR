CREATE DATABASE IF NOT EXISTS campus_visitor_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE campus_visitor_db;

CREATE TABLE visitors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  phone VARCHAR(20),
  id_document VARCHAR(50),
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('visitor','agent','admin') DEFAULT 'visitor',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE hosts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  phone VARCHAR(20),
  department VARCHAR(100),
  role ENUM('host','admin') DEFAULT 'host',
  password_hash VARCHAR(255) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE visits (
  id INT AUTO_INCREMENT PRIMARY KEY,
  visitor_id INT NOT NULL,
  host_id INT NOT NULL,
  purpose VARCHAR(255),
  scheduled_at DATETIME NOT NULL,
  status ENUM('pending','approved','refused','ongoing','completed','cancelled') DEFAULT 'pending',
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (visitor_id) REFERENCES visitors(id) ON DELETE CASCADE,
  FOREIGN KEY (host_id) REFERENCES hosts(id) ON DELETE CASCADE
);

CREATE TABLE visit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  visit_id INT NOT NULL,
  agent_id INT,
  event_type ENUM('CHECK_IN','CHECK_OUT') NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  FOREIGN KEY (visit_id) REFERENCES visits(id) ON DELETE CASCADE,
  FOREIGN KEY (agent_id) REFERENCES visitors(id) ON DELETE SET NULL
);

-- Données de test
INSERT INTO visitors (name, email, phone, id_document, password_hash, role) VALUES
('Karim Idrissi', 'karim@test.com', '0612345678', 'CIN-A123456', '$2a$10$placeholder_hash_visiteur', 'visitor'),
('Sara Bouzidi', 'sara@test.com', '0698765432', 'CIN-B654321', '$2a$10$placeholder_hash_sara', 'visitor'),
('Agent Hassan', 'agent@ens.ma', '0611111111', 'CIN-C000001', '$2a$10$placeholder_hash_agent', 'agent');

INSERT INTO hosts (name, email, phone, department, role, password_hash) VALUES
('Prof. Alami', 'alami@ens.ma', '0522001001', 'Informatique', 'host', '$2a$10$placeholder_hash_alami'),
('Dr. Benali', 'benali@ens.ma', '0522001002', 'Mathématiques', 'host', '$2a$10$placeholder_hash_benali');

INSERT INTO visits (visitor_id, host_id, purpose, scheduled_at, status) VALUES
(1, 1, 'Entretien stage', '2026-04-25 10:00:00', 'approved'),
(2, 2, 'Réunion projet', '2026-04-25 14:30:00', 'pending'),
(1, 2, 'Dépôt dossier', '2026-04-26 09:00:00', 'refused');