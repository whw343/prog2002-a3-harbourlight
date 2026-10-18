-- Read-only inspection queries. Select the intended A3 database before running.
-- UTC storage; start_local_date is the Australia/Sydney event start date.

SELECT e.id, e.name, c.name AS category, e.start_at_utc, e.end_at_utc,
       CASE WHEN e.is_suspended = 1 THEN 'Suspended'
            WHEN e.end_at_utc <= UTC_TIMESTAMP() THEN 'Past'
            ELSE 'Active' END AS status,
       (SELECT COUNT(*) FROM registrations r WHERE r.event_id=e.id) AS registration_count
FROM events e
JOIN categories c ON c.id=e.category_id
ORDER BY e.start_at_utc, e.id;

SELECT r.id, r.event_id, e.name AS event_name, r.full_name,
       r.ticket_quantity, r.registered_at
FROM registrations r
JOIN events e ON e.id=r.event_id
ORDER BY r.event_id, r.registered_at DESC, r.id DESC;

SELECT COUNT(*) AS total_registrations FROM registrations;

-- Each query below should return zero rows in a valid database.
SELECT event_id, LOWER(TRIM(email)) AS normalized_email, COUNT(*) AS duplicate_count
FROM registrations
GROUP BY event_id, LOWER(TRIM(email))
HAVING COUNT(*) > 1;

SELECT r.id FROM registrations r
LEFT JOIN events e ON e.id=r.event_id
WHERE e.id IS NULL;

SELECT id, name FROM events
WHERE end_at_utc <= start_at_utc
   OR ticket_price < 0 OR fundraising_goal < 0 OR amount_raised < 0;

SELECT id, ticket_quantity FROM registrations
WHERE ticket_quantity < 1 OR ticket_quantity > 20;
