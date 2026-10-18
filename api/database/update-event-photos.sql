-- Optional migration for an existing seeded A3 database. Back up first.

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
