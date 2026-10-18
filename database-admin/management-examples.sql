-- Examples for use in Navicat against your own TEST database.
-- The actual write statements are commented out to prevent accidental changes.

-- List every event, including past and suspended entries.
SELECT id,name,start_at_utc,end_at_utc,is_suspended FROM events ORDER BY id;

-- Example CREATE (UTC times; start_local_date is derived by the trigger):
-- INSERT INTO events (organisation_id,category_id,name,start_at_utc,end_at_utc,
-- venue,city,purpose,description,ticket_price,fundraising_goal,amount_raised,latitude,longitude)
-- VALUES (1,1,'Community Welcome','2026-10-24 23:00:00','2026-10-25 02:00:00',
-- 'Community Hall','Sydney','Bring neighbours together','A fictional community gathering.',
-- 0,1000,0,-33.8688,151.2093);

-- Example UPDATE: replace EVENT_ID with the ID you created, then uncomment.
-- UPDATE events SET name='Community Welcome - updated' WHERE id=EVENT_ID;
-- UPDATE events SET is_suspended=1 WHERE id=EVENT_ID;

-- Inspect associated registrations before considering deletion.
-- SELECT id,full_name,email,ticket_quantity,registered_at FROM registrations
-- WHERE event_id=EVENT_ID ORDER BY registered_at DESC,id DESC;

-- Example DELETE: should succeed only when there are no associated registrations.
-- DELETE FROM events WHERE id=EVENT_ID;
-- Do not disable FOREIGN_KEY_CHECKS to bypass protection.
