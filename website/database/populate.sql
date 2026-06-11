TRUNCATE TABLE
    professional_history, professional_invite,
    event_review, professional_review,
    application, comments, publication_reactions,
    notifications, stories, attended_events,
    publication,
    message, chat_participants, chat,
    friend_requests,
    follows, friends,
    event_tags, event_images, images,
    events,
    professional_profile,
    users
RESTART IDENTITY CASCADE;

-- USERS
-- All seeded accounts share the password festivo123.
INSERT INTO users (id, username, name, email, pass, role, information, location) VALUES
(1, 'jazzmaster', 'Jazz Master', 'jazz@example.com', '$2b$10$E09O2hjRiZ1DdUxSrDHA2ubjg8JWJ2NFeCUIP2W3Xbv8.l/epaJRa', 'professional', 'Award-winning jazz musician and event producer with 15 years of experience crafting unforgettable live music experiences across three continents.', 'New York, USA'),
(2, 'artcurator', 'Art Curator', 'art@example.com', '$2b$10$E09O2hjRiZ1DdUxSrDHA2ubjg8JWJ2NFeCUIP2W3Xbv8.l/epaJRa', 'professional', 'Contemporary art curator specialising in emerging European artists. Co-founder of three acclaimed gallery spaces and a TEDx speaker on the future of art curation.', 'London, UK'),
(3, 'orchestral', 'Orchestral Pro', 'orchestra@example.com', '$2b$10$E09O2hjRiZ1DdUxSrDHA2ubjg8JWJ2NFeCUIP2W3Xbv8.l/epaJRa', 'professional', 'Classical music director and composer. Conductor of the Hamburg Chamber Orchestra with over 200 international performances to his name.', 'Hamburg, Germany'),
(4, 'photopro', 'Photo Pro', 'photo@example.com', '$2b$10$E09O2hjRiZ1DdUxSrDHA2ubjg8JWJ2NFeCUIP2W3Xbv8.l/epaJRa', 'professional', 'Professional photographer and visual storyteller. Published in National Geographic, Time, and over 40 international magazines.', 'Tokyo, Japan'),
(5, 'festivalpro', 'Festival Pro', 'festival@example.com', '$2b$10$E09O2hjRiZ1DdUxSrDHA2ubjg8JWJ2NFeCUIP2W3Xbv8.l/epaJRa', 'professional', 'Festival organiser with 20+ events under her belt across Europe and South America. Passionate about creating inclusive cultural spaces.', 'Barcelona, Spain'),
(6, 'bizpro', 'Biz Pro', 'biz@example.com', '$2b$10$E09O2hjRiZ1DdUxSrDHA2ubjg8JWJ2NFeCUIP2W3Xbv8.l/epaJRa', 'professional', 'Business event specialist and keynote speaker. Connects global finance and innovation leaders through high-impact summits and conferences.', 'Singapore'),
(7, 'artworkshop', 'Art Workshop', 'workshop@example.com', '$2b$10$E09O2hjRiZ1DdUxSrDHA2ubjg8JWJ2NFeCUIP2W3Xbv8.l/epaJRa', 'professional', 'Sculptor and workshop facilitator. Trained at the Royal College of Art, now running immersive workshops for both beginners and advanced artists.', 'Paris, France'),
(8, 'startuppro', 'Startup Pro', 'startup@example.com', '$2b$10$E09O2hjRiZ1DdUxSrDHA2ubjg8JWJ2NFeCUIP2W3Xbv8.l/epaJRa', 'professional', 'Startup ecosystem builder and investor. Has mentored over 150 founders and helped raise EUR 40M in early-stage funding across the MENA region.', 'Dubai, UAE'),
(9, 'concertpro', 'Concert Pro', 'concert@example.com', '$2b$10$E09O2hjRiZ1DdUxSrDHA2ubjg8JWJ2NFeCUIP2W3Xbv8.l/epaJRa', 'professional', 'Concert promoter and talent manager. Specialises in diverse world-music lineups and large-scale outdoor productions.', 'Washington D.C., USA'),
(10, 'esportspro', 'Esports Pro', 'esports@example.com', '$2b$10$E09O2hjRiZ1DdUxSrDHA2ubjg8JWJ2NFeCUIP2W3Xbv8.l/epaJRa', 'professional', 'Esports tournament director and gaming industry veteran. Produced 30+ national and international championships with audiences exceeding 50,000.', 'London, UK')
ON CONFLICT DO NOTHING;

INSERT INTO professional_profile (user_id, genre, is_verified) VALUES
(1, 'Jazz', TRUE),
(2, 'Visual Arts', TRUE),
(3, 'Classical Music', TRUE),
(4, 'Photography', FALSE),
(5, 'Events & Festivals', TRUE),
(6, 'Business Events', FALSE),
(7, 'Fine Arts', FALSE),
(8, 'Entrepreneurship', FALSE),
(9, 'World Music', FALSE),
(10, 'Esports', TRUE)
ON CONFLICT DO NOTHING;

INSERT INTO tags (tag_name) VALUES
    ('Techno'),
    ('House'),
    ('Jazz'),
    ('Rock'),
    ('Hip Hop'),
    ('Electronic'),
    ('Theatre'),
    ('Art'),
    ('Cinema'),
    ('Dance'),
    ('Comedy'),
    ('Classical'),
    ('Technology'),
    ('Business'),
    ('Fashion'),
    ('Food'),
    ('Photography'),
    ('Gaming'),
    ('Music')
ON CONFLICT DO NOTHING;

-- EVENTS (sdate/edate relative to today 2026-06-11)
-- Events 1-2: PAST; Event 3: in a few days; Events 4-20: future; Event 21: TODAY; Event 22: ONGOING (started 3 days ago)
INSERT INTO events (publisher_id, venue, latitude, longitude, sdate, edate, target, description) VALUES
(1, 'Madison Square Garden, New York', 40.750500, -73.993400, '2026-05-10', '2026-05-10', 'Music lovers', 'An unforgettable night of live jazz featuring world-renowned artists performing across four stages. From bebop classics to modern fusion, this sold-out evening brought together the best talent from New York, New Orleans, and beyond.'),
(2, 'Royal Albert Hall, London', 51.500900, -0.177400, '2026-06-01', '2026-06-03', 'Art enthusiasts', 'A three-day contemporary art exhibition showcasing emerging European artists. Over 120 works across painting, sculpture, and digital media explored themes of memory, identity, and urban life.'),
(3, 'Sydney Opera House, Sydney', -33.856800, 151.215300, '2026-06-15', '2026-06-15', 'Families', 'A magical orchestral performance of classic fairy tale soundtracks performed by a 90-piece orchestra. Suitable for all ages, this evening promises to transport audiences into a world of wonder and melody.'),
(1, 'Palais des Congres, Paris', 48.878500, 2.282600, '2026-07-04', '2026-07-06', 'Tech professionals', 'Annual technology summit covering AI, blockchain, and the future of work. Over 80 speakers, 200 sessions, and a startup showcase featuring the most innovative companies of the year.'),
(4, 'Tokyo International Forum, Tokyo', 35.676400, 139.763000, '2026-07-20', '2026-07-21', 'Photographers', 'A two-day workshop on landscape and street photography techniques led by internationally published photographers. Includes field sessions, portfolio reviews, and gear demonstrations.'),
(2, 'Colosseum, Rome', 41.890200, 12.492200, '2026-08-01', '2026-08-01', 'History buffs', 'A guided night tour through ancient Rome with live historical reenactments performed by professional actors. Witness gladiatorial scenes, Roman feasts, and the secrets of the Eternal City after dark.'),
(5, 'Central Park, New York', 40.785100, -73.968300, '2026-08-14', '2026-08-16', 'General public', 'An outdoor summer festival featuring food stalls from 30 countries, live music across five stages, and cultural performances representing communities from every corner of the globe.'),
(3, 'Elbphilharmonie, Hamburg', 53.541300, 9.984100, '2026-08-22', '2026-08-22', 'Classical music fans', 'An evening of Beethoven performed by the Hamburg Philharmonic Orchestra in one of Europe''s most acoustically perfect concert halls. Featuring the Fifth Symphony and the Moonlight Sonata.'),
(6, 'Marina Bay Sands, Singapore', 1.283400, 103.860700, '2026-09-05', '2026-09-07', 'Business professionals', 'A global finance and investment conference with keynote speakers from the world''s top investment firms, central banks, and fintech disruptors. Includes exclusive networking dinners and deal-flow sessions.'),
(4, 'Hollywood Bowl, Los Angeles', 34.112200, -118.339100, '2026-09-12', '2026-09-12', 'Film enthusiasts', 'An open-air cinema night screening classic Hollywood films under the stars with a live orchestra performing the original scores. Bring a blanket and enjoy cinema as it was meant to be experienced.'),
(7, 'Tate Modern, London', 51.507600, -0.099400, '2026-09-20', '2026-09-22', 'Art students', 'A hands-on sculpture workshop led by internationally recognised artists. Participants will create their own piece using clay, bronze casting, and mixed media over three immersive days.'),
(5, 'Fira de Barcelona, Barcelona', 41.374000, 2.148300, '2026-10-03', '2026-10-05', 'Game developers', 'The largest independent game development conference in Southern Europe. Featuring 60 talks, a game jam, publisher speed-dating sessions, and the Indie Awards ceremony.'),
(8, 'Dubai World Trade Centre, Dubai', 25.225100, 55.288600, '2026-10-15', '2026-10-17', 'Entrepreneurs', 'A startup expo connecting founders with investors from across the Middle East, North Africa, and South Asia. Includes pitch competitions with EUR 500K in prizes and investor office hours.'),
(6, 'Grand Palais, Paris', 48.866100, 2.312500, '2026-10-28', '2026-10-30', 'Fashion professionals', 'An exclusive fashion week event featuring collections from 40 top designers. Includes runway shows, press previews, and a sustainable fashion panel with leading voices in the industry.'),
(9, 'National Mall, Washington D.C.', 38.889500, -77.035300, '2026-11-05', '2026-11-05', 'General public', 'A free outdoor concert celebrating cultural diversity with artists from 20 countries performing across three stages. One of Washington''s most beloved annual traditions returns bigger than ever.'),
(7, 'Carrousel du Louvre, Paris', 48.861000, 2.335800, '2026-11-12', '2026-11-14', 'Culinary professionals', 'An international gastronomy fair with live cooking demonstrations, tastings, and master classes led by Michelin-starred chefs from across Europe and Asia.'),
(10, 'O2 Arena, London', 51.503000, 0.003200, '2026-11-20', '2026-11-20', 'Sports fans', 'A live esports championship featuring the top 16 teams from around the world competing in three titles. The grand finale will be broadcast live to over 2 million viewers globally.'),
(8, 'Parc del Forum, Barcelona', 41.411000, 2.219600, '2026-12-01', '2026-12-03', 'Music producers', 'A three-day electronic music festival with over 50 international DJs performing across six stages. Featuring headline sets from artists who have topped the charts across Europe.'),
(9, 'Yas Island, Abu Dhabi', 24.488300, 54.616600, '2026-12-10', '2026-12-12', 'Families', 'A winter wonderland theme park experience with ice skating, live shows, a Christmas market, and nightly light installations across a stunning waterfront setting.'),
(10, 'Alte Oper, Frankfurt', 50.115500, 8.671000, '2026-12-20', '2026-12-20', 'General public', 'A Christmas Eve special concert blending classical and contemporary holiday music. Featuring a 120-piece orchestra, a 60-voice choir, and special guest soloists from across Europe.'),
-- Event 21: Happening TODAY (2026-06-11)
(1, 'Casa da Música, Porto', 41.157954, -8.629105, '2026-06-11', '2026-06-11', 'Jazz lovers', 'An intimate evening of contemporary jazz in one of Porto''s most iconic venues. Local and international artists share the stage in a night of improvisation, soul, and rhythm. Gates open at 20:00.'),
-- Event 22: ONGOING — started 3 days ago, ends in 3 days (2026-06-08 to 2026-06-14)
(5, 'Parque das Nações, Lisbon', 38.757092, -9.098186, '2026-06-08', '2026-06-14', 'General public', 'A week-long celebration of Mediterranean culture featuring art installations, live music, dance performances, cinema screenings, and a food market with dishes from 20 coastal nations. Free entry every day.')
ON CONFLICT DO NOTHING;

UPDATE events SET title = 'Jazz Under the Garden Lights', event_type = 'Music', event_time = '20:30', price = 'EUR 18' WHERE id = 1;
UPDATE events SET title = 'Modern Forms', event_type = 'Art', event_time = '18:00', price = 'EUR 22' WHERE id = 2;
UPDATE events SET title = 'Fairy Tale Symphony', event_type = 'Live', event_time = '19:30', price = 'EUR 15' WHERE id = 3;
UPDATE events SET title = 'Future Work Summit', event_type = 'Conference', event_time = '09:00', price = 'EUR 40' WHERE id = 4;
UPDATE events SET title = 'Lens Craft Workshop', event_type = 'Workshop', event_time = '16:00', price = 'EUR 12' WHERE id = 5;
UPDATE events SET title = 'Night at the Colosseum', event_type = 'History', event_time = '21:00', price = 'EUR 20' WHERE id = 6;
UPDATE events SET title = 'Summer Culture Fest', event_type = 'Festival', event_time = '12:00', price = 'Free Entry' WHERE id = 7;
UPDATE events SET title = 'Beethoven by the Bay', event_type = 'Music', event_time = '19:00', price = 'EUR 16' WHERE id = 8;
UPDATE events SET title = 'Finance Forward', event_type = 'Business', event_time = '08:30', price = 'EUR 55' WHERE id = 9;
UPDATE events SET title = 'Open Air Cinema Classics', event_type = 'Cinema', event_time = '21:30', price = 'EUR 9' WHERE id = 10;
UPDATE events SET title = 'Hands On Sculpture Lab', event_type = 'Workshop', event_time = '10:00', price = 'EUR 14' WHERE id = 11;
UPDATE events SET title = 'Indie Dev Expo', event_type = 'Conference', event_time = '10:30', price = 'EUR 35' WHERE id = 12;
UPDATE events SET title = 'Founder Launch Day', event_type = 'Startup', event_time = '09:30', price = 'EUR 28' WHERE id = 13;
UPDATE events SET title = 'Runway Dispatch', event_type = 'Fashion', event_time = '17:00', price = 'EUR 30' WHERE id = 14;
UPDATE events SET title = 'Global Sound Stage', event_type = 'Music', event_time = '20:00', price = 'Free Entry' WHERE id = 15;
UPDATE events SET title = 'Gastronomy at the Louvre', event_type = 'Food', event_time = '11:00', price = 'EUR 24' WHERE id = 16;
UPDATE events SET title = 'Championship Finals', event_type = 'Sport', event_time = '22:00', price = 'EUR 26' WHERE id = 17;
UPDATE events SET title = 'Electronic Summer', event_type = 'Music', event_time = '18:30', price = 'EUR 19' WHERE id = 18;
UPDATE events SET title = 'Winter Lights Park', event_type = 'Festival', event_time = '15:00', price = 'EUR 17' WHERE id = 19;
UPDATE events SET title = 'Holiday Classics', event_type = 'Music', event_time = '19:45', price = 'EUR 21' WHERE id = 20;
UPDATE events SET title = 'Porto Jazz Night', event_type = 'Music', event_time = '21:30', price = 'EUR 15' WHERE id = 21;
UPDATE events SET title = 'Mediterranean Culture Week', event_type = 'Festival', event_time = '11:00', price = 'Free Entry' WHERE id = 22;

INSERT INTO event_tags (event_id, tag_name) VALUES (1, 'Jazz');
INSERT INTO event_tags (event_id, tag_name) VALUES (2, 'Art');
INSERT INTO event_tags (event_id, tag_name) VALUES (3, 'Classical');
INSERT INTO event_tags (event_id, tag_name) VALUES (4, 'Technology');
INSERT INTO event_tags (event_id, tag_name) VALUES (4, 'Business');
INSERT INTO event_tags (event_id, tag_name) VALUES (5, 'Photography');
INSERT INTO event_tags (event_id, tag_name) VALUES (6, 'Art');
INSERT INTO event_tags (event_id, tag_name) VALUES (6, 'Theatre');
INSERT INTO event_tags (event_id, tag_name) VALUES (7, 'Dance');
INSERT INTO event_tags (event_id, tag_name) VALUES (7, 'Jazz');
INSERT INTO event_tags (event_id, tag_name) VALUES (8, 'Classical');
INSERT INTO event_tags (event_id, tag_name) VALUES (9, 'Business');
INSERT INTO event_tags (event_id, tag_name) VALUES (10, 'Cinema');
INSERT INTO event_tags (event_id, tag_name) VALUES (11, 'Art');
INSERT INTO event_tags (event_id, tag_name) VALUES (12, 'Gaming');
INSERT INTO event_tags (event_id, tag_name) VALUES (12, 'Technology');
INSERT INTO event_tags (event_id, tag_name) VALUES (13, 'Business');
INSERT INTO event_tags (event_id, tag_name) VALUES (13, 'Technology');
INSERT INTO event_tags (event_id, tag_name) VALUES (14, 'Fashion');
INSERT INTO event_tags (event_id, tag_name) VALUES (15, 'Music');
INSERT INTO event_tags (event_id, tag_name) VALUES (15, 'Dance');
INSERT INTO event_tags (event_id, tag_name) VALUES (16, 'Food');
INSERT INTO event_tags (event_id, tag_name) VALUES (17, 'Gaming');
INSERT INTO event_tags (event_id, tag_name) VALUES (18, 'Electronic');
INSERT INTO event_tags (event_id, tag_name) VALUES (18, 'House');
INSERT INTO event_tags (event_id, tag_name) VALUES (18, 'Techno');
INSERT INTO event_tags (event_id, tag_name) VALUES (19, 'Dance');
INSERT INTO event_tags (event_id, tag_name) VALUES (20, 'Classical');
INSERT INTO event_tags (event_id, tag_name) VALUES (21, 'Jazz');
INSERT INTO event_tags (event_id, tag_name) VALUES (21, 'Music');
INSERT INTO event_tags (event_id, tag_name) VALUES (22, 'Dance');
INSERT INTO event_tags (event_id, tag_name) VALUES (22, 'Music');
INSERT INTO event_tags (event_id, tag_name) VALUES (22, 'Art');

-- PROFESSIONAL HISTORY (past events where professionals participated)
INSERT INTO professional_history (professional_id, event_id) VALUES
(1, 1), (1, 21),
(2, 2),
(3, 3),
(4, 5),
(5, 7), (5, 22),
(9, 15)
ON CONFLICT DO NOTHING;

-- EVENT COVER IMAGES (varied picsum seeds per topic)
INSERT INTO images (id, url, alt_text) VALUES
(1,  'https://picsum.photos/seed/jazz-garden-1/1600/900',    'Jazz Under the Garden Lights'),
(2,  'https://picsum.photos/seed/art-gallery-22/1600/900',   'Modern Forms'),
(3,  'https://picsum.photos/seed/orchestra-fairy/1600/900',  'Fairy Tale Symphony'),
(4,  'https://picsum.photos/seed/tech-summit-404/1600/900',  'Future Work Summit'),
(5,  'https://picsum.photos/seed/photo-workshop/1600/900',   'Lens Craft Workshop'),
(6,  'https://picsum.photos/seed/rome-night-6/1600/900',     'Night at the Colosseum'),
(7,  'https://picsum.photos/seed/fest-summer-77/1600/900',   'Summer Culture Fest'),
(8,  'https://picsum.photos/seed/beethoven-88/1600/900',     'Beethoven by the Bay'),
(9,  'https://picsum.photos/seed/finance-fwd/1600/900',      'Finance Forward'),
(10, 'https://picsum.photos/seed/cinema-open-10/1600/900',   'Open Air Cinema Classics'),
(11, 'https://picsum.photos/seed/sculpture-lab/1600/900',    'Hands On Sculpture Lab'),
(12, 'https://picsum.photos/seed/indie-dev-12/1600/900',     'Indie Dev Expo'),
(13, 'https://picsum.photos/seed/founder-launch/1600/900',   'Founder Launch Day'),
(14, 'https://picsum.photos/seed/runway-fashion/1600/900',   'Runway Dispatch'),
(15, 'https://picsum.photos/seed/global-sound/1600/900',     'Global Sound Stage'),
(16, 'https://picsum.photos/seed/gastronomy-16/1600/900',    'Gastronomy at the Louvre'),
(17, 'https://picsum.photos/seed/esports-champ/1600/900',    'Championship Finals'),
(18, 'https://picsum.photos/seed/electronic-dj/1600/900',    'Electronic Summer'),
(19, 'https://picsum.photos/seed/winter-lights/1600/900',    'Winter Lights Park'),
(20, 'https://picsum.photos/seed/holiday-xmas/1600/900',     'Holiday Classics'),
(21, 'https://picsum.photos/seed/porto-jazz-21/1600/900',    'Porto Jazz Night'),
(22, 'https://picsum.photos/seed/med-culture-22/1600/900',   'Mediterranean Culture Week')
ON CONFLICT DO NOTHING;

INSERT INTO event_images (event_id, image_id, is_cover) VALUES
(1,1,TRUE),(2,2,TRUE),(3,3,TRUE),(4,4,TRUE),(5,5,TRUE),
(6,6,TRUE),(7,7,TRUE),(8,8,TRUE),(9,9,TRUE),(10,10,TRUE),
(11,11,TRUE),(12,12,TRUE),(13,13,TRUE),(14,14,TRUE),(15,15,TRUE),
(16,16,TRUE),(17,17,TRUE),(18,18,TRUE),(19,19,TRUE),(20,20,TRUE),
(21,21,TRUE),(22,22,TRUE)
ON CONFLICT DO NOTHING;

-- EVENT GALLERY IMAGES
INSERT INTO images (id, url, alt_text) VALUES
(23, 'https://picsum.photos/seed/jazz-gal-23/1600/900',    'Jazz Under the Garden Lights - Gallery'),
(24, 'https://picsum.photos/seed/art-gal-24/1600/900',     'Modern Forms - Gallery'),
(25, 'https://picsum.photos/seed/orch-gal-25/1600/900',    'Fairy Tale Symphony - Gallery'),
(26, 'https://picsum.photos/seed/tech-gal-26/1600/900',    'Future Work Summit - Gallery'),
(27, 'https://picsum.photos/seed/photo-gal-27/1600/900',   'Lens Craft Workshop - Gallery'),
(28, 'https://picsum.photos/seed/rome-gal-28/1600/900',    'Night at the Colosseum - Gallery'),
(29, 'https://picsum.photos/seed/fest-gal-29/1600/900',    'Summer Culture Fest - Gallery'),
(30, 'https://picsum.photos/seed/beet-gal-30/1600/900',    'Beethoven by the Bay - Gallery'),
(31, 'https://picsum.photos/seed/biz-gal-31/1600/900',     'Finance Forward - Gallery'),
(32, 'https://picsum.photos/seed/cine-gal-32/1600/900',    'Open Air Cinema Classics - Gallery'),
(33, 'https://picsum.photos/seed/sculp-gal-33/1600/900',   'Hands On Sculpture Lab - Gallery'),
(34, 'https://picsum.photos/seed/game-gal-34/1600/900',    'Indie Dev Expo - Gallery'),
(35, 'https://picsum.photos/seed/start-gal-35/1600/900',   'Founder Launch Day - Gallery'),
(36, 'https://picsum.photos/seed/fash-gal-36/1600/900',    'Runway Dispatch - Gallery'),
(37, 'https://picsum.photos/seed/music-gal-37/1600/900',   'Global Sound Stage - Gallery'),
(38, 'https://picsum.photos/seed/food-gal-38/1600/900',    'Gastronomy at the Louvre - Gallery'),
(39, 'https://picsum.photos/seed/esport-gal-39/1600/900',  'Championship Finals - Gallery'),
(40, 'https://picsum.photos/seed/dj-gal-40/1600/900',      'Electronic Summer - Gallery'),
(41, 'https://picsum.photos/seed/winter-gal-41/1600/900',  'Winter Lights Park - Gallery'),
(42, 'https://picsum.photos/seed/xmas-gal-42/1600/900',    'Holiday Classics - Gallery'),
(43, 'https://picsum.photos/seed/porto-gal-43/1600/900',   'Porto Jazz Night - Gallery'),
(44, 'https://picsum.photos/seed/med-gal-44/1600/900',     'Mediterranean Culture Week - Gallery')
ON CONFLICT DO NOTHING;

INSERT INTO event_images (event_id, image_id, is_cover) VALUES
(1,23,FALSE),(2,24,FALSE),(3,25,FALSE),(4,26,FALSE),(5,27,FALSE),
(6,28,FALSE),(7,29,FALSE),(8,30,FALSE),(9,31,FALSE),(10,32,FALSE),
(11,33,FALSE),(12,34,FALSE),(13,35,FALSE),(14,36,FALSE),(15,37,FALSE),
(16,38,FALSE),(17,39,FALSE),(18,40,FALSE),(19,41,FALSE),(20,42,FALSE),
(21,43,FALSE),(22,44,FALSE)
ON CONFLICT DO NOTHING;

-- WORK OPPORTUNITIES
INSERT INTO work_opportunities (id, poster_id, title, position, mode, duration, employment, pay, description, location) VALUES
(1, 1, 'Summer Festival Stage Crew', 'Stage Technician', 'onsite', 'month', 'full-time', 'EUR 1,800 / month', 'Help set up, manage, and strike the main stage for a month-long cultural festival circuit.', 'Porto, Portugal'),
(2, 2, 'Remote Social Media Consultant', 'Content Strategist', 'remote', 'ongoing', 'part-time', 'EUR 25 / hour', 'Create social campaigns, schedule posts, and shape the digital voice of an arts venue.', 'Remote'),
(3, 3, 'Hybrid Exhibition Assistant', 'Gallery Assistant', 'hybrid', 'week', 'part-time', 'EUR 900 / week', 'Support a contemporary exhibition with visitor care, setup tasks, and weekend coverage.', 'Lisbon, Portugal')
ON CONFLICT DO NOTHING;

-- CUSTOMER USERS
INSERT INTO users (id, username, name, email, pass, role, information, location) VALUES
(11, 'anaribeiro',   'Ana Ribeiro',   'ana@example.com',      '$2b$10$E09O2hjRiZ1DdUxSrDHA2ubjg8JWJ2NFeCUIP2W3Xbv8.l/epaJRa', 'customer', 'Music addict and weekend festival explorer. Always looking for the next great live experience.', 'Porto, Portugal'),
(12, 'miguelcosta',  'Miguel Costa',  'miguel@example.com',   '$2b$10$E09O2hjRiZ1DdUxSrDHA2ubjg8JWJ2NFeCUIP2W3Xbv8.l/epaJRa', 'customer', 'Jazz enthusiast and amateur photographer. If there is live music happening, I will be there.', 'Lisbon, Portugal'),
(13, 'sofiamartins', 'Sofia Martins', 'sofia@example.com',    '$2b$10$E09O2hjRiZ1DdUxSrDHA2ubjg8JWJ2NFeCUIP2W3Xbv8.l/epaJRa', 'customer', 'Contemporary art lover and gallery regular. Passionate about street art, installations and cultural happenings.', 'Coimbra, Portugal'),
(14, 'tiagosimoes',  'Tiago Simões',  'tiago@example.com',    '$2b$10$E09O2hjRiZ1DdUxSrDHA2ubjg8JWJ2NFeCUIP2W3Xbv8.l/epaJRa', 'customer', 'Tech professional by day, electronic music fan by night. Always at the front row for techno and house events.', 'Braga, Portugal'),
(15, 'inescarvalho', 'Inês Carvalho', 'ines@example.com',     '$2b$10$E09O2hjRiZ1DdUxSrDHA2ubjg8JWJ2NFeCUIP2W3Xbv8.l/epaJRa', 'customer', 'Classical music fan and literature lover. I find peace in concert halls and art galleries.', 'Porto, Portugal'),
(16, 'joaoferreira', 'João Ferreira', 'joao@example.com',     '$2b$10$E09O2hjRiZ1DdUxSrDHA2ubjg8JWJ2NFeCUIP2W3Xbv8.l/epaJRa', 'customer', 'Cinema buff and outdoor cinema regular. I believe every story is better told under the stars.', 'Faro, Portugal'),
(17, 'martalopes',   'Marta Lopes',   'marta@example.com',    '$2b$10$E09O2hjRiZ1DdUxSrDHA2ubjg8JWJ2NFeCUIP2W3Xbv8.l/epaJRa', 'customer', 'Artist and art-world regular. I attend every gallery opening I can find and document them all.', 'Lisbon, Portugal'),
(18, 'ruioliveira',  'Rui Oliveira',  'rui@example.com',      '$2b$10$E09O2hjRiZ1DdUxSrDHA2ubjg8JWJ2NFeCUIP2W3Xbv8.l/epaJRa', 'customer', 'Food and gastronomy explorer. I travel for Michelin restaurants and food festivals.', 'Aveiro, Portugal'),
(19, 'carlasantos',  'Carla Santos',  'carla@example.com',    '$2b$10$E09O2hjRiZ1DdUxSrDHA2ubjg8JWJ2NFeCUIP2W3Xbv8.l/epaJRa', 'customer', 'Dance and electronic music devotee. I have been to festivals across five countries in the last two years.', 'Porto, Portugal'),
(20, 'brunopires',   'Bruno Pires',   'bruno@example.com',    '$2b$10$E09O2hjRiZ1DdUxSrDHA2ubjg8JWJ2NFeCUIP2W3Xbv8.l/epaJRa', 'customer', 'Travel photographer and concert-goer. Capturing live music moments is my favourite hobby.', 'Setúbal, Portugal'),
(21, 'lauranunes',   'Laura Nunes',   'laura@example.com',    '$2b$10$E09O2hjRiZ1DdUxSrDHA2ubjg8JWJ2NFeCUIP2W3Xbv8.l/epaJRa', 'customer', 'Theatre and performance arts lover. I believe in the power of live storytelling.', 'Braga, Portugal'),
(22, 'andregomes',   'André Gomes',   'andre@example.com',    '$2b$10$E09O2hjRiZ1DdUxSrDHA2ubjg8JWJ2NFeCUIP2W3Xbv8.l/epaJRa', 'customer', 'Esports fan and gaming culture enthusiast. Tournaments and gaming conventions are my happy place.', 'Porto, Portugal'),
(23, 'patriciarocha','Patricia Rocha','patricia@example.com', '$2b$10$E09O2hjRiZ1DdUxSrDHA2ubjg8JWJ2NFeCUIP2W3Xbv8.l/epaJRa', 'customer', 'Fashion week regular and design aficionado. I live for runway shows and creative showcases.', 'Lisbon, Portugal'),
(24, 'diogocardoso', 'Diogo Cardoso', 'diogo@example.com',    '$2b$10$E09O2hjRiZ1DdUxSrDHA2ubjg8JWJ2NFeCUIP2W3Xbv8.l/epaJRa', 'customer', 'Entrepreneur and startup ecosystem follower. I attend every pitch event and innovation summit I can.', 'Porto, Portugal'),
(25, 'helenapinto',  'Helena Pinto',  'helena@example.com',   '$2b$10$E09O2hjRiZ1DdUxSrDHA2ubjg8JWJ2NFeCUIP2W3Xbv8.l/epaJRa', 'customer', 'Hip-hop and urban culture fan. Street art tours, rap concerts, and cultural festivals are my thing.', 'Coimbra, Portugal'),
(26, 'nunoteixeira', 'Nuno Teixeira', 'nuno@example.com',     '$2b$10$E09O2hjRiZ1DdUxSrDHA2ubjg8JWJ2NFeCUIP2W3Xbv8.l/epaJRa', 'customer', 'Rock music fan and live concert regular. I have attended over 80 concerts in the past three years.', 'Braga, Portugal')
ON CONFLICT DO NOTHING;

INSERT INTO customer (customer_id) VALUES
(11),(12),(13),(14),(15),(16),(17),(18),(19),(20),(21),(22),(23),(24),(25),(26)
ON CONFLICT DO NOTHING;

-- CUSTOMER PREFERENCES
INSERT INTO customer_preferences (customer_id, tag_name) VALUES
(11, 'Jazz'), (11, 'Music'), (11, 'Dance'), (11, 'Art'),
(12, 'Jazz'), (12, 'Photography'), (12, 'Music'),
(13, 'Art'), (13, 'Theatre'), (13, 'Cinema'),
(14, 'Techno'), (14, 'House'), (14, 'Electronic'), (14, 'Technology'),
(15, 'Classical'), (15, 'Art'), (15, 'Theatre'),
(16, 'Cinema'), (16, 'Art'), (16, 'Music'),
(17, 'Art'), (17, 'Photography'), (17, 'Theatre'),
(18, 'Food'), (18, 'Art'), (18, 'Dance'),
(19, 'Electronic'), (19, 'Dance'), (19, 'Techno'), (19, 'House'),
(20, 'Photography'), (20, 'Music'), (20, 'Jazz'),
(21, 'Theatre'), (21, 'Dance'), (21, 'Classical'),
(22, 'Gaming'), (22, 'Technology'), (22, 'Electronic'),
(23, 'Fashion'), (23, 'Art'), (23, 'Photography'),
(24, 'Business'), (24, 'Technology'), (24, 'Music'),
(25, 'Hip Hop'), (25, 'Dance'), (25, 'Art'),
(26, 'Rock'), (26, 'Music'), (26, 'Jazz')
ON CONFLICT DO NOTHING;

-- STORIES
INSERT INTO stories (id, user_id, media, label) VALUES
(1, 11, 'https://loremflickr.com/600/900/concert,night/all?lock=301', 'Opening night'),
(2, 12, 'https://loremflickr.com/600/900/backstage,music/all?lock=302', 'Backstage'),
(3, 13, 'https://loremflickr.com/600/900/festival,night/all?lock=303', 'My night out')
ON CONFLICT DO NOTHING;

-- PUBLICATIONS (all must have event_id)
INSERT INTO publication (id, user_id, media, publish_date, information, location, likes, favorites, shares, event_id) VALUES
(1,  11, 'https://loremflickr.com/900/800/concert,crowd/all?lock=201',   '2026-05-25', 'Golden lights, loud drums, and the best crowd I have seen all year. Jazz Master delivered something truly special tonight.', 'Porto, Portugal', 142, 28, 14, 7),
(2,  12, 'https://loremflickr.com/900/800/music,backstage/all?lock=202', '2026-05-26', 'Soundcheck finished. The crowd is in for a long night — this lineup is insane.', 'Lisbon, Portugal', 87, 19, 10, 18),
(3,  13, 'https://loremflickr.com/900/800/art,street/all?lock=203',      '2026-05-27', 'New mural, new music, same old city magic. Cinema under the stars hits different.', 'Coimbra, Portugal', 64, 9, 5, 10)
ON CONFLICT DO NOTHING;

INSERT INTO publication (id, user_id, media, publish_date, information, location, likes, favorites, shares, event_id) VALUES
(4,  14, 'https://loremflickr.com/900/800/jazz,venue/all?lock=204',      '2026-05-28', 'The venue felt electric from the first note. Jazz Under the Garden Lights was everything I hoped for.', 'Braga, Portugal', 178, 41, 22, 1),
(5,  15, 'https://loremflickr.com/900/800/festival,street/all?lock=205', '2026-05-29', 'Street art, live beats, and an unreal sunset. Summer Culture Fest never disappoints.', 'Porto, Portugal', 131, 24, 17, 7),
(6,  16, 'https://loremflickr.com/900/800/concert,lights/all?lock=206',  '2026-05-30', 'Tonight was all about the little moments — the Fairy Tale Symphony moved me to tears.', 'Faro, Portugal', 96, 14, 8, 3),
(7,  17, 'https://loremflickr.com/900/800/gallery,art/all?lock=207',     '2026-06-01', 'Gallery opening with a crowd that actually stayed for the talk. Modern Forms is unmissable.', 'Lisbon, Portugal', 154, 33, 12, 2),
(8,  18, 'https://loremflickr.com/900/800/cinema,outdoor/all?lock=208',  '2026-06-02', 'Nothing beats a packed outdoor screening. Open Air Cinema Classics did it again.', 'Aveiro, Portugal', 121, 27, 11, 10),
(9,  19, 'https://loremflickr.com/900/800/music,festival/all?lock=209',  '2026-06-03', 'Weekend recap: too many great sets to count. Electronic Summer is already legendary.', 'Porto, Portugal', 209, 52, 31, 18),
(10, 20, 'https://loremflickr.com/900/800/jazz,night/all?lock=210',      '2026-06-11', 'Just arrived at Porto Jazz Night — the atmosphere is already unreal. Casa da Música looks stunning at night.', 'Porto, Portugal', 43, 11, 7, 21),
(11, 21, 'https://loremflickr.com/900/800/culture,lisbon/all?lock=211',  '2026-06-09', 'Day two of Mediterranean Culture Week and I still cannot believe this is free. The food market alone is worth the trip.', 'Lisbon, Portugal', 88, 22, 15, 22)
ON CONFLICT DO NOTHING;

INSERT INTO comments (id, publication_id, user_id, information, publish_date, likes) VALUES
(1, 1, 12, 'This looks unforgettable.', '2026-05-25 20:00:00', 4),
(2, 3, 11, 'This color palette is stunning.', '2026-05-27 21:15:00', 2)
ON CONFLICT DO NOTHING;

INSERT INTO comments (id, publication_id, user_id, information, publish_date, likes) VALUES
(3, 4, 11, 'I would have loved to be there — Jazz Master is iconic.', '2026-05-28 22:00:00', 7),
(4, 5, 12, 'The lighting in this shot is incredible.', '2026-05-29 19:35:00', 5),
(5, 7, 13, 'Modern Forms was the highlight of my week.', '2026-06-01 23:10:00', 3),
(6, 9, 15, 'Saving this for inspiration. Electronic Summer is next on my list.', '2026-06-03 18:25:00', 6),
(7, 10, 11, 'Have a great night! Wish I was there.', '2026-06-11 21:05:00', 2),
(8, 11, 12, 'The food market sounds incredible. Going tomorrow!', '2026-06-09 14:30:00', 4)
ON CONFLICT DO NOTHING;

INSERT INTO publication_reactions (publication_id, user_id, liked, favorited, shared) VALUES
(1, 11, TRUE, TRUE, TRUE),
(2, 11, FALSE, FALSE, FALSE),
(3, 11, FALSE, FALSE, FALSE)
ON CONFLICT DO NOTHING;

INSERT INTO publication_reactions (publication_id, user_id, liked, favorited, shared) VALUES
(4, 11, TRUE, FALSE, FALSE),
(5, 11, TRUE, TRUE, FALSE),
(6, 11, FALSE, FALSE, FALSE),
(7, 11, TRUE, FALSE, FALSE),
(8, 11, FALSE, TRUE, FALSE),
(9, 11, TRUE, TRUE, TRUE),
(10, 11, TRUE, FALSE, FALSE),
(11, 11, TRUE, TRUE, FALSE)
ON CONFLICT DO NOTHING;

-- ATTENDED EVENTS (past + current RSVPs)
INSERT INTO attended_events (user_id, event_id, status, attended_at) VALUES
-- Past event 1 attendees (needed for reviews)
(11, 1, 'Attended', '2026-05-10 22:00:00'),
(12, 1, 'Attended', '2026-05-10 22:30:00'),
(13, 1, 'Attended', '2026-05-10 21:45:00'),
(14, 1, 'Attended', '2026-05-10 22:15:00'),
-- Past event 2 attendees (needed for reviews)
(11, 2, 'Attended', '2026-06-01 19:00:00'),
(12, 2, 'Attended', '2026-06-02 18:30:00'),
(15, 2, 'Attended', '2026-06-03 19:30:00'),
(17, 2, 'Attended', '2026-06-01 18:00:00'),
-- Today''s event RSVPs
(11, 21, 'Attending', '2026-06-10 14:00:00'),
(12, 21, 'Attending', '2026-06-10 15:00:00'),
(20, 21, 'Attending', '2026-06-09 10:00:00'),
-- Ongoing event (22) RSVPs
(11, 22, 'Attending', '2026-06-07 09:00:00'),
(21, 22, 'Attending', '2026-06-07 10:00:00'),
-- Saved events
(11, 7,  'Saved for later', '2026-05-18 21:00:00'),
(11, 10, 'Saved for later', '2026-05-24 18:00:00')
ON CONFLICT DO NOTHING;

-- EVENT REVIEWS (for past events only: 1 and 2)
INSERT INTO event_review (user_id, event_id, rating, sent_date, information) VALUES
(11, 1, 5, '2026-05-11', 'Absolutely magical. The lighting, the music, the atmosphere — everything was perfect. Jazz Master never disappoints and this was his best night yet.'),
(12, 1, 4, '2026-05-11', 'Great performance, though the venue felt a bit crowded at peak hours. The music itself was outstanding — the closing set was unforgettable.'),
(14, 1, 5, '2026-05-12', 'Best jazz night of my life. The headliner played for three hours straight and kept the energy going the whole time. Already booked for next year.'),
(13, 1, 4, '2026-05-12', 'Really solid event. Great sound quality and a well-curated lineup. A few organisational hiccups at entry but nothing that spoiled the night.'),
(11, 2, 4, '2026-06-02', 'Impressive collection with a real focus on emerging talent. The installation art pieces were especially striking — I spent most of my time in room three.'),
(15, 2, 5, '2026-06-03', 'A truly inspiring exhibition. I came back twice in the three days and discovered something new each time. Art Curator has an incredible vision.')
ON CONFLICT DO NOTHING;

-- PROFESSIONAL REVIEWS
INSERT INTO professional_review (user_id, professional_id, rating, sent_date, information) VALUES
(11, 1, 5, '2026-05-12', 'Incredible event curator. Jazz Master put together a lineup that felt timeless yet fresh. The production quality, artist selection, and energy were all world-class.'),
(12, 1, 5, '2026-05-13', 'I have been to dozens of jazz events and this was easily in my top three. Everything from the sound to the lighting was immaculate. A true professional.'),
(14, 1, 4, '2026-05-14', 'Very well organised with an excellent artist selection. Minor delay in the second set, but the team handled it gracefully. Would absolutely attend another of his events.'),
(13, 2, 4, '2026-06-02', 'Art Curator has an incredible eye for contemporary work. I loved how the exhibition told a visual story from room to room. Looking forward to the next one.'),
(15, 2, 5, '2026-06-03', 'Stunning curation. The way the pieces were placed created a journey through the space. The catalogue essay alone was worth the visit. Truly memorable.')
ON CONFLICT DO NOTHING;

-- NOTIFICATIONS
INSERT INTO notifications (id, recipient_user_id, actor_user_id, kind, title, message, is_read, created_at, publication_id, event_id) VALUES
(1, 11, 12, 'follow', 'New follower', 'Miguel Costa started following you.', FALSE, '2026-05-29 10:00:00', NULL, NULL),
(2, 11, 13, 'like', 'New like', 'Sofia Martins liked your publication.', FALSE, '2026-05-30 12:00:00', 1, NULL)
ON CONFLICT DO NOTHING;

-- FRIENDS RELATIONSHIPS
INSERT INTO friends (user1_id, user2_id) VALUES
(11, 12), (11, 13), (11, 14), (11, 15),
(12, 13), (12, 14), (12, 16),
(13, 14), (13, 15), (13, 17),
(14, 15), (14, 18),
(15, 16), (15, 17), (15, 19),
(16, 17), (16, 20),
(17, 18), (17, 19), (17, 21),
(18, 19), (18, 22),
(19, 20), (19, 21), (19, 23),
(20, 21), (20, 24),
(21, 22), (21, 23), (21, 25),
(22, 23), (22, 26),
(23, 24), (23, 25),
(24, 25), (24, 26),
(25, 26)
ON CONFLICT DO NOTHING;

-- CHAT SESSIONS
INSERT INTO chat (id) VALUES
(1),(2),(3),(4),(5),(6),(7),(8),(9),(10)
ON CONFLICT DO NOTHING;

INSERT INTO chat_participants (chat_id, user_id) VALUES
(1,11),(1,12),(2,11),(2,13),(3,12),(3,13),(4,13),(4,14),
(5,14),(5,15),(6,15),(6,16),(7,16),(7,17),(8,17),(8,18),
(9,18),(9,19),(10,19),(10,20)
ON CONFLICT DO NOTHING;

INSERT INTO message (chat_id, sender_id, content, sent_at) VALUES
(1, 11, 'Hey Miguel! How was the event yesterday?', '2026-05-01 10:30:00'),
(1, 12, 'It was amazing! The live performance was incredible.', '2026-05-01 10:35:00'),
(1, 11, 'I heard! I wish I could have gone. Maybe next time?', '2026-05-01 10:40:00'),
(1, 12, 'Definitely! Let me know when you''re free.', '2026-05-01 10:45:00'),
(2, 11, 'Sofia, are you going to the summer festival?', '2026-05-02 14:20:00'),
(2, 13, 'I was thinking about it! Are you interested?', '2026-05-02 14:25:00'),
(2, 11, 'Yes! Let''s go together. It would be fun!', '2026-05-02 14:30:00'),
(2, 13, 'Great idea! I''ll check the dates and let you know.', '2026-05-02 14:35:00'),
(3, 12, 'Sofia, I saw you liked my photo!', '2026-05-03 11:15:00'),
(3, 13, 'Yes! It was from the concert, really nice shot.', '2026-05-03 11:20:00'),
(3, 12, 'Thanks! Are you going to the gallery opening next week?', '2026-05-03 11:25:00'),
(3, 13, 'I might! Do you have the details?', '2026-05-03 11:30:00'),
(4, 13, 'Hey Tiago, how have you been?', '2026-05-04 09:00:00'),
(4, 14, 'All good! Just been busy with work. How about you?', '2026-05-04 09:10:00'),
(4, 13, 'Same here! But I miss hanging out. Wanna grab coffee?', '2026-05-04 09:15:00'),
(4, 14, 'I''d love to! How about this weekend?', '2026-05-04 09:20:00'),
(5, 14, 'Inês, I found that band you recommended!', '2026-05-05 16:45:00'),
(5, 15, 'Really?! What do you think?', '2026-05-05 16:50:00'),
(5, 14, 'They''re fantastic! Thanks for the recommendation.', '2026-05-05 16:55:00'),
(5, 15, 'Awesome! I''m glad you like them. Check out their new album!', '2026-05-05 17:00:00'),
(6, 15, 'João, are you coming to the cinema night?', '2026-05-06 13:30:00'),
(6, 16, 'I didn''t know about it! When is it?', '2026-05-06 13:35:00'),
(6, 15, 'Next Friday at 8 PM. Do you want to join?', '2026-05-06 13:40:00'),
(6, 16, 'Count me in! Sounds fun.', '2026-05-06 13:45:00'),
(7, 16, 'Marta, I loved your last post about the exhibition!', '2026-04-30 15:00:00'),
(7, 17, 'Thank you! I''m so passionate about contemporary art.', '2026-04-30 15:05:00'),
(7, 16, 'It shows! Have you been to the new gallery downtown?', '2026-04-30 15:10:00'),
(7, 17, 'Not yet, but I''ve heard great things about it!', '2026-04-30 15:15:00'),
(8, 17, 'Rui, want to check out that new restaurant?', '2026-04-29 12:20:00'),
(8, 18, 'Absolutely! When were you thinking?', '2026-04-29 12:25:00'),
(8, 17, 'How about tomorrow evening?', '2026-04-29 12:30:00'),
(8, 18, 'Perfect! I''ll make a reservation.', '2026-04-29 12:35:00'),
(9, 18, 'Carla, thanks for the event recommendation!', '2026-04-28 10:50:00'),
(9, 19, 'No problem! Did you end up going?', '2026-04-28 10:55:00'),
(9, 18, 'Yes! It was better than I expected.', '2026-04-28 11:00:00'),
(9, 19, 'Glad you enjoyed it! Let me know if you need more recommendations.', '2026-04-28 11:05:00'),
(10, 19, 'Bruno, how was your trip?', '2026-04-27 18:30:00'),
(10, 20, 'Amazing! I''ll show you the photos soon.', '2026-04-27 18:35:00'),
(10, 19, 'Can''t wait! We should plan a group hangout.', '2026-04-27 18:40:00'),
(10, 20, 'Great idea! I''ll check with the others.', '2026-04-27 18:45:00')
ON CONFLICT DO NOTHING;

SELECT setval(pg_get_serial_sequence('users', 'id'), COALESCE(MAX(id), 0) + 1, false) FROM users;
SELECT setval(pg_get_serial_sequence('events', 'id'), COALESCE(MAX(id), 0) + 1, false) FROM events;
SELECT setval(pg_get_serial_sequence('images', 'id'), COALESCE(MAX(id), 0) + 1, false) FROM images;
SELECT setval(pg_get_serial_sequence('chat', 'id'), COALESCE(MAX(id), 0) + 1, false) FROM chat;
SELECT setval(pg_get_serial_sequence('message', 'id'), COALESCE(MAX(id), 0) + 1, false) FROM message;
SELECT setval(pg_get_serial_sequence('publication', 'id'), COALESCE(MAX(id), 0) + 1, false) FROM publication;
SELECT setval(pg_get_serial_sequence('comments', 'id'), COALESCE(MAX(id), 0) + 1, false) FROM comments;
SELECT setval(pg_get_serial_sequence('stories', 'id'), COALESCE(MAX(id), 0) + 1, false) FROM stories;
SELECT setval(pg_get_serial_sequence('notifications', 'id'), COALESCE(MAX(id), 0) + 1, false) FROM notifications;
SELECT setval(pg_get_serial_sequence('work_opportunities', 'id'), COALESCE(MAX(id), 0) + 1, false) FROM work_opportunities;
