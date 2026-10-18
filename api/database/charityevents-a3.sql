-- Import into a NEW empty selected database. No DROP, CREATE DATABASE or USE statements.
-- All event, registration and contact data are fictional. Registration times are UTC.
SET NAMES utf8mb4;
SET time_zone = '+00:00';
CREATE TABLE organisations (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE categories (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(80) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE events (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  organisation_id INT UNSIGNED NOT NULL,
  category_id INT UNSIGNED NOT NULL,
  name VARCHAR(160) NOT NULL,
  start_at_utc DATETIME NOT NULL,
  end_at_utc DATETIME NOT NULL,
  start_local_date DATE NOT NULL DEFAULT '2000-01-01' COMMENT 'Australia/Sydney calendar date of start_at_utc',
  venue VARCHAR(160) NOT NULL,
  city VARCHAR(100) NOT NULL,
  purpose VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  ticket_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  fundraising_goal DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  amount_raised DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  image_path VARCHAR(255) NULL DEFAULT 'assets/community.svg',
  latitude DECIMAL(9,6) NOT NULL DEFAULT -33.868800,
  longitude DECIMAL(9,6) NOT NULL DEFAULT 151.209300,
  is_suspended BOOLEAN NOT NULL DEFAULT FALSE,
  CONSTRAINT fk_events_organisation FOREIGN KEY (organisation_id) REFERENCES organisations(id),
  CONSTRAINT fk_events_category FOREIGN KEY (category_id) REFERENCES categories(id),
  CONSTRAINT chk_events_time CHECK (end_at_utc > start_at_utc),
  CONSTRAINT chk_events_money CHECK (ticket_price >= 0 AND fundraising_goal >= 0 AND amount_raised >= 0),
  INDEX idx_events_public (is_suspended, end_at_utc, start_at_utc),
  INDEX idx_events_filters (start_local_date, category_id, city)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE registrations (
 id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
 event_id INT UNSIGNED NOT NULL,
 full_name VARCHAR(120) NOT NULL,
 email VARCHAR(254) NOT NULL,
 phone VARCHAR(30) NOT NULL,
 ticket_quantity DECIMAL(10,6) NOT NULL,
 registered_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT fk_registration_event FOREIGN KEY(event_id) REFERENCES events(id) ON DELETE RESTRICT,
 email_normalized VARCHAR(254) GENERATED ALWAYS AS (LOWER(TRIM(email))) STORED,
 UNIQUE KEY uq_event_email(event_id,email_normalized),
 INDEX idx_registration_order(event_id,registered_at,id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- All names, places in context, campaign details, and figures are fictional sample data.
-- UTC times below correspond to Australia/Sydney local times (AEDT, UTC+11).
INSERT INTO organisations (id, name) VALUES
  (1, 'Harbourlight Community Collective');

INSERT INTO categories (id, name) VALUES
  (1, 'Community & Family'),
  (2, 'Environment'),
  (3, 'Arts & Culture'),
  (4, 'Health & Wellbeing'),
  (5, 'Food Relief');

INSERT INTO events
  (id, organisation_id, category_id, name, start_at_utc, end_at_utc,
   start_local_date, venue, city, purpose, description, ticket_price,
   fundraising_goal, amount_raised, image_path, is_suspended)
VALUES
  (1, 1, 1, 'Neighbourhood Lantern Walk', '2026-10-22 23:00:00', '2026-10-23 02:00:00',
   '2026-10-23', 'Harbourview Community Hall', 'Sydney',
   'Bring neighbours together and fund free family activities.',
   'An accessible morning walk with craft tables, refreshments and a community welcome. Proceeds support free family activity sessions.',
   8.00, 2500.00, 840.00, NULL, FALSE),
  (2, 1, 2, 'Coast Care Planting Day', '2026-10-30 22:30:00', '2026-10-31 02:30:00',
   '2026-10-31', 'Seabreeze Reserve', 'Wollongong',
   'Restore native habitat along a local coastal reserve.',
   'Join a guided planting session with equipment and light refreshments supplied. Donations help purchase native seedlings and tools.',
   0.00, 4000.00, 1260.00, NULL, FALSE),
  (3, 1, 5, 'Shared Table Community Lunch', '2026-11-13 01:00:00', '2026-11-13 04:00:00',
   '2026-11-13', 'Riverside Neighbourhood Kitchen', 'Parramatta',
   'Support community meals for households facing food insecurity.',
   'Enjoy a locally prepared lunch, meet community cooks and learn how weekly meal support works. Vegetarian options are available.',
   22.00, 6000.00, 2150.00, NULL, FALSE),
  (4, 1, 3, 'Art for All Studio Afternoon', '2026-11-28 02:00:00', '2026-11-28 05:00:00',
   '2026-11-28', 'West End Makers Space', 'Newcastle',
   'Fund accessible creative workshops for young people.',
   'Try printmaking and collaborative art activities led by volunteer artists. All materials are included and beginners are welcome.',
   15.00, 3200.00, 970.00, NULL, FALSE),
  (5, 1, 4, 'Steps for Wellbeing', '2026-12-04 21:00:00', '2026-12-05 01:00:00',
   '2026-12-05', 'Lakeview Park', 'Gosford',
   'Raise funds for inclusive community wellbeing sessions.',
   'Choose a gentle or energetic walking loop, then join a short wellbeing workshop. The route includes a step-free option.',
   12.00, 5000.00, 1780.00, NULL, FALSE),
  (6, 1, 1, 'Summer Skills Swap', '2026-12-11 23:00:00', '2026-12-12 03:00:00',
   '2026-12-12', 'Central Community Hub', 'Sydney',
   'Connect volunteers and share practical skills across generations.',
   'Short peer-led sessions cover repairs, gardening and digital basics. Entry donations support free follow-up workshops.',
   5.00, 2800.00, 640.00, NULL, FALSE),
  (7, 1, 5, 'Pantry Partners Market', '2027-01-15 22:00:00', '2027-01-16 03:00:00',
   '2027-01-16', 'Northbank Civic Square', 'Penrith',
   'Stock a community pantry with everyday essentials.',
   'Browse local maker stalls and drop off unopened pantry items. Stall contributions go toward staple food purchases.',
   0.00, 7500.00, 2280.00, NULL, FALSE),
  (8, 1, 2, 'Creek Discovery and Clean-up', '2027-01-29 21:30:00', '2027-01-30 01:30:00',
   '2027-01-30', 'Greenbank Creek Reserve', 'Campbelltown',
   'Protect local waterways and teach practical conservation.',
   'A guided creek walk is followed by a supervised clean-up. Gloves and collection equipment are provided.',
   0.00, 3600.00, 1020.00, NULL, FALSE),
  (9, 1, 3, 'Community Voices Music Night', '2027-02-20 07:00:00', '2027-02-20 10:00:00',
   '2027-02-20', 'Civic Arts Room', 'Liverpool',
   'Create affordable local music opportunities.',
   'A relaxed evening of community performances with seating and a quiet space. Ticket proceeds fund beginner music sessions.',
   18.00, 4500.00, 1190.00, NULL, FALSE),
  (10, 1, 4, 'Mindful Morning in the Garden', '2027-03-12 22:00:00', '2027-03-13 01:00:00',
   '2027-03-13', 'Willow Community Garden', 'Blacktown',
   'Make low-cost wellbeing activities available locally.',
   'Take part in gentle movement, gardening and a guided reflection. The activities can be adapted for different mobility needs.',
   10.00, 3000.00, 560.00, NULL, FALSE),
  (11, 1, 1, 'Planning Session Sample', '2027-03-19 23:00:00', '2027-03-20 01:00:00',
   '2027-03-20', 'Harbourview Community Hall', 'Sydney',
   'Internal draft event.',
   'This suspended sample must never appear through the public API.',
   0.00, 0.00, 0.00, NULL, TRUE);

UPDATE events SET image_path=CASE category_id WHEN 2 THEN 'assets/coast.svg' WHEN 3 THEN 'assets/arts.svg' WHEN 4 THEN 'assets/walk.svg' WHEN 5 THEN 'assets/table.svg' ELSE 'assets/community.svg' END;
UPDATE events SET latitude=-34.4278,longitude=150.8931 WHERE city='Wollongong';
UPDATE events SET latitude=-33.8150,longitude=151.0011 WHERE city='Parramatta';
UPDATE events SET latitude=-32.9283,longitude=151.7817 WHERE city='Newcastle';
UPDATE events SET latitude=-33.4263,longitude=151.3410 WHERE city='Gosford';
INSERT INTO events(organisation_id,category_id,name,start_at_utc,end_at_utc,start_local_date,venue,city,purpose,description,ticket_price,fundraising_goal,amount_raised,image_path,is_suspended,latitude,longitude) VALUES
(1,1,'Autumn Neighbour Day','2026-04-18 23:00:00','2026-04-19 03:00:00','2026-04-19','Community Gardens','Sydney','Celebrate the volunteers who make our neighbourhood stronger.','A completed fictional event, retained to demonstrate administrative access to past events.',0,1500,1680,'assets/community.svg',0,-33.8688,151.2093);
INSERT INTO registrations(event_id,full_name,email,phone,ticket_quantity,registered_at) VALUES (1,'Avery Lee','guest1@example.invalid','0400000000',1,'2026-10-10 09:00:00');
INSERT INTO registrations(event_id,full_name,email,phone,ticket_quantity,registered_at) VALUES (1,'Jordan Chen','guest2@example.invalid','0400000001',2,'2026-10-10 10:00:00');
INSERT INTO registrations(event_id,full_name,email,phone,ticket_quantity,registered_at) VALUES (1,'Morgan Taylor','guest3@example.invalid','0400000002',3,'2026-10-10 11:00:00');
INSERT INTO registrations(event_id,full_name,email,phone,ticket_quantity,registered_at) VALUES (1,'Riley Smith','guest4@example.invalid','0400000003',1,'2026-10-11 09:00:00');
INSERT INTO registrations(event_id,full_name,email,phone,ticket_quantity,registered_at) VALUES (1,'Casey Brown','guest5@example.invalid','0400000004',2,'2026-10-11 10:00:00');
INSERT INTO registrations(event_id,full_name,email,phone,ticket_quantity,registered_at) VALUES (2,'Alex Green','guest6@example.invalid','0400000005',3,'2026-10-11 11:00:00');
INSERT INTO registrations(event_id,full_name,email,phone,ticket_quantity,registered_at) VALUES (2,'Avery Lee','guest7@example.invalid','0400000006',1,'2026-10-12 09:00:00');
INSERT INTO registrations(event_id,full_name,email,phone,ticket_quantity,registered_at) VALUES (2,'Jordan Chen','guest8@example.invalid','0400000007',2,'2026-10-12 10:00:00');
INSERT INTO registrations(event_id,full_name,email,phone,ticket_quantity,registered_at) VALUES (2,'Morgan Taylor','guest9@example.invalid','0400000008',3,'2026-10-12 11:00:00');
INSERT INTO registrations(event_id,full_name,email,phone,ticket_quantity,registered_at) VALUES (3,'Riley Smith','guest10@example.invalid','0400000009',1,'2026-10-13 09:00:00');
INSERT INTO registrations(event_id,full_name,email,phone,ticket_quantity,registered_at) VALUES (3,'Casey Brown','guest11@example.invalid','0400000010',2,'2026-10-13 10:00:00');
INSERT INTO registrations(event_id,full_name,email,phone,ticket_quantity,registered_at) VALUES (3,'Alex Green','guest12@example.invalid','0400000011',3,'2026-10-13 11:00:00');

DELIMITER $$
CREATE TRIGGER events_before_insert BEFORE INSERT ON events FOR EACH ROW
BEGIN

  DECLARE oct_first DATE;
  DECLARE apr_first DATE;
  DECLARE dst_start DATETIME;
  DECLARE dst_end DATETIME;
  IF CHAR_LENGTH(TRIM(NEW.name)) = 0 OR CHAR_LENGTH(TRIM(NEW.venue)) = 0 OR CHAR_LENGTH(TRIM(NEW.city)) = 0 OR CHAR_LENGTH(TRIM(NEW.purpose)) = 0 OR CHAR_LENGTH(TRIM(NEW.description)) = 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Event fields cannot be empty';
  END IF;
  IF NEW.end_at_utc <= NEW.start_at_utc THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Event end must be after start';
  END IF;
  IF NEW.ticket_price < 0 OR NEW.fundraising_goal < 0 OR NEW.amount_raised < 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Amounts cannot be negative';
  END IF;
  IF ABS(NEW.latitude) > 90 OR ABS(NEW.longitude) > 180 OR NEW.is_suspended NOT IN (0,1) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid coordinates or status';
  END IF;
  SET oct_first = STR_TO_DATE(CONCAT(YEAR(NEW.start_at_utc), '-10-01'), '%Y-%m-%d');
  SET apr_first = STR_TO_DATE(CONCAT(YEAR(NEW.start_at_utc), '-04-01'), '%Y-%m-%d');
  -- Sydney transitions at 16:00 UTC on the day before the first Sunday.
  SET dst_start = DATE_SUB(DATE_ADD(oct_first, INTERVAL MOD(8-DAYOFWEEK(oct_first),7) DAY), INTERVAL 8 HOUR);
  SET dst_end = DATE_SUB(DATE_ADD(apr_first, INTERVAL MOD(8-DAYOFWEEK(apr_first),7) DAY), INTERVAL 8 HOUR);
  SET NEW.start_local_date = DATE(DATE_ADD(NEW.start_at_utc, INTERVAL IF(NEW.start_at_utc < dst_end OR NEW.start_at_utc >= dst_start,11,10) HOUR));
END$$
DELIMITER ;

DELIMITER $$
CREATE TRIGGER events_before_update BEFORE UPDATE ON events FOR EACH ROW
BEGIN

  DECLARE oct_first DATE;
  DECLARE apr_first DATE;
  DECLARE dst_start DATETIME;
  DECLARE dst_end DATETIME;
  IF CHAR_LENGTH(TRIM(NEW.name)) = 0 OR CHAR_LENGTH(TRIM(NEW.venue)) = 0 OR CHAR_LENGTH(TRIM(NEW.city)) = 0 OR CHAR_LENGTH(TRIM(NEW.purpose)) = 0 OR CHAR_LENGTH(TRIM(NEW.description)) = 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Event fields cannot be empty';
  END IF;
  IF NEW.end_at_utc <= NEW.start_at_utc THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Event end must be after start';
  END IF;
  IF NEW.ticket_price < 0 OR NEW.fundraising_goal < 0 OR NEW.amount_raised < 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Amounts cannot be negative';
  END IF;
  IF ABS(NEW.latitude) > 90 OR ABS(NEW.longitude) > 180 OR NEW.is_suspended NOT IN (0,1) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid coordinates or status';
  END IF;
  SET oct_first = STR_TO_DATE(CONCAT(YEAR(NEW.start_at_utc), '-10-01'), '%Y-%m-%d');
  SET apr_first = STR_TO_DATE(CONCAT(YEAR(NEW.start_at_utc), '-04-01'), '%Y-%m-%d');
  -- Sydney transitions at 16:00 UTC on the day before the first Sunday.
  SET dst_start = DATE_SUB(DATE_ADD(oct_first, INTERVAL MOD(8-DAYOFWEEK(oct_first),7) DAY), INTERVAL 8 HOUR);
  SET dst_end = DATE_SUB(DATE_ADD(apr_first, INTERVAL MOD(8-DAYOFWEEK(apr_first),7) DAY), INTERVAL 8 HOUR);
  SET NEW.start_local_date = DATE(DATE_ADD(NEW.start_at_utc, INTERVAL IF(NEW.start_at_utc < dst_end OR NEW.start_at_utc >= dst_start,11,10) HOUR));
END$$
DELIMITER ;

DELIMITER $$
CREATE TRIGGER registrations_before_insert BEFORE INSERT ON registrations FOR EACH ROW
BEGIN

  SET NEW.email = LOWER(TRIM(NEW.email));
  SET NEW.full_name = TRIM(NEW.full_name);
  SET NEW.phone = TRIM(NEW.phone);
  IF CHAR_LENGTH(NEW.full_name) < 2 OR NEW.email NOT REGEXP '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$' OR CHAR_LENGTH(NEW.phone) < 6 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Valid name, email and phone are required';
  END IF;
  IF NEW.ticket_quantity < 1 OR NEW.ticket_quantity > 20 OR NEW.ticket_quantity <> FLOOR(NEW.ticket_quantity) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Ticket quantity must be a whole number from 1 to 20';
  END IF;
  SET NEW.registered_at = UTC_TIMESTAMP();
END$$
DELIMITER ;

DELIMITER $$
CREATE TRIGGER registrations_before_update BEFORE UPDATE ON registrations FOR EACH ROW
BEGIN

  SET NEW.email = LOWER(TRIM(NEW.email));
  SET NEW.full_name = TRIM(NEW.full_name);
  SET NEW.phone = TRIM(NEW.phone);
  IF CHAR_LENGTH(NEW.full_name) < 2 OR NEW.email NOT REGEXP '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$' OR CHAR_LENGTH(NEW.phone) < 6 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Valid name, email and phone are required';
  END IF;
  IF NEW.ticket_quantity < 1 OR NEW.ticket_quantity > 20 OR NEW.ticket_quantity <> FLOOR(NEW.ticket_quantity) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Ticket quantity must be a whole number from 1 to 20';
  END IF;
  SET NEW.registered_at = OLD.registered_at;
END$$
DELIMITER ;

-- Real stock photographs, not actual event documentation. See clientside/PHOTO-SOURCES.md.
UPDATE events SET image_path=CASE id
 WHEN 1 THEN 'assets/photos/lantern-walk.jpg'
 WHEN 2 THEN 'assets/photos/coast-planting.jpg'
 WHEN 3 THEN 'assets/photos/shared-table.jpg'
 WHEN 4 THEN 'assets/photos/art-workshop.jpg'
 WHEN 5 THEN 'assets/photos/wellbeing-walk.jpg'
 WHEN 6 THEN 'assets/photos/skills-swap.jpg'
 WHEN 7 THEN 'assets/photos/pantry-market.jpg'
 WHEN 8 THEN 'assets/photos/creek-cleanup.jpg'
 WHEN 9 THEN 'assets/photos/community-music.jpg'
 WHEN 10 THEN 'assets/photos/mindful-garden.jpg'
 WHEN 11 THEN 'assets/photos/volunteer-planning.jpg'
 WHEN 12 THEN 'assets/photos/neighbour-day.jpg'
 ELSE image_path END WHERE id BETWEEN 1 AND 12;
