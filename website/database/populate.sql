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
INSERT INTO users (id, username, name, email, pass, role) VALUES
(1, 'jazzmaster', 'Jazz Master', 'jazz@example.com', '$2b$10$E09O2hjRiZ1DdUxSrDHA2ubjg8JWJ2NFeCUIP2W3Xbv8.l/epaJRa', 'professional'),
(2, 'artcurator', 'Art Curator', 'art@example.com', '$2b$10$E09O2hjRiZ1DdUxSrDHA2ubjg8JWJ2NFeCUIP2W3Xbv8.l/epaJRa', 'professional'),
(3, 'orchestral', 'Orchestral Pro', 'orchestra@example.com', '$2b$10$E09O2hjRiZ1DdUxSrDHA2ubjg8JWJ2NFeCUIP2W3Xbv8.l/epaJRa', 'professional'),
(4, 'photopro', 'Photo Pro', 'photo@example.com', '$2b$10$E09O2hjRiZ1DdUxSrDHA2ubjg8JWJ2NFeCUIP2W3Xbv8.l/epaJRa', 'professional'),
(5, 'festivalpro', 'Festival Pro', 'festival@example.com', '$2b$10$E09O2hjRiZ1DdUxSrDHA2ubjg8JWJ2NFeCUIP2W3Xbv8.l/epaJRa', 'professional'),
(6, 'bizpro', 'Biz Pro', 'biz@example.com', '$2b$10$E09O2hjRiZ1DdUxSrDHA2ubjg8JWJ2NFeCUIP2W3Xbv8.l/epaJRa', 'professional'),
(7, 'artworkshop', 'Art Workshop', 'workshop@example.com', '$2b$10$E09O2hjRiZ1DdUxSrDHA2ubjg8JWJ2NFeCUIP2W3Xbv8.l/epaJRa', 'professional'),
(8, 'startuppro', 'Startup Pro', 'startup@example.com', '$2b$10$E09O2hjRiZ1DdUxSrDHA2ubjg8JWJ2NFeCUIP2W3Xbv8.l/epaJRa', 'professional'),
(9, 'concertpro', 'Concert Pro', 'concert@example.com', '$2b$10$E09O2hjRiZ1DdUxSrDHA2ubjg8JWJ2NFeCUIP2W3Xbv8.l/epaJRa', 'professional'),
(10, 'esportspro', 'Esports Pro', 'esports@example.com', '$2b$10$E09O2hjRiZ1DdUxSrDHA2ubjg8JWJ2NFeCUIP2W3Xbv8.l/epaJRa', 'professional')
ON CONFLICT DO NOTHING;

INSERT INTO professional_profile (user_id) VALUES
(1), (2), (3), (4), (5), (6), (7), (8), (9), (10)
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

-- EVENTS
INSERT INTO events (publisher_id, venue, latitude, longitude, sdate, edate, target, description) VALUES
(1, 'Madison Square Garden, New York', 40.750500, -73.993400, '2026-05-10', '2026-05-10', 'Music lovers', 'An unforgettable night of live jazz featuring world-renowned artists.'),
(2, 'Royal Albert Hall, London', 51.500900, -0.177400, '2026-06-01', '2026-06-03', 'Art enthusiasts', 'A three-day contemporary art exhibition showcasing emerging European artists.'),
(3, 'Sydney Opera House, Sydney', -33.856800, 151.215300, '2026-06-15', '2026-06-15', 'Families', 'A magical orchestral performance of classic fairy tale soundtracks.'),
(1, 'Palais des Congres, Paris', 48.878500, 2.282600, '2026-07-04', '2026-07-06', 'Tech professionals', 'Annual technology summit covering AI, blockchain, and the future of work.'),
(4, 'Tokyo International Forum, Tokyo', 35.676400, 139.763000, '2026-07-20', '2026-07-21', 'Photographers', 'A two-day workshop on landscape and street photography techniques.'),
(2, 'Colosseum, Rome', 41.890200, 12.492200, '2026-08-01', '2026-08-01', 'History buffs', 'A guided night tour through ancient Rome with live historical reenactments.'),
(5, 'Central Park, New York', 40.785100, -73.968300, '2026-08-14', '2026-08-16', 'General public', 'An outdoor summer festival featuring food, music, and cultural performances.'),
(3, 'Elbphilharmonie, Hamburg', 53.541300, 9.984100, '2026-08-22', '2026-08-22', 'Classical music fans', 'An evening of Beethoven performed by the Hamburg Philharmonic Orchestra.'),
(6, 'Marina Bay Sands, Singapore', 1.283400, 103.860700, '2026-09-05', '2026-09-07', 'Business professionals', 'A global finance and investment conference with keynote speakers from top firms.'),
(4, 'Hollywood Bowl, Los Angeles', 34.112200, -118.339100, '2026-09-12', '2026-09-12', 'Film enthusiasts', 'An open-air cinema night screening classic Hollywood films under the stars.'),
(7, 'Tate Modern, London', 51.507600, -0.099400, '2026-09-20', '2026-09-22', 'Art students', 'A hands-on sculpture workshop led by internationally recognized artists.'),
(5, 'Fira de Barcelona, Barcelona', 41.374000, 2.148300, '2026-10-03', '2026-10-05', 'Game developers', 'The largest independent game development conference in Southern Europe.'),
(8, 'Dubai World Trade Centre, Dubai', 25.225100, 55.288600, '2026-10-15', '2026-10-17', 'Entrepreneurs', 'A startup expo connecting founders with investors from across the Middle East.'),
(6, 'Grand Palais, Paris', 48.866100, 2.312500, '2026-10-28', '2026-10-30', 'Fashion professionals', 'An exclusive fashion week event featuring collections from top designers.'),
(9, 'National Mall, Washington D.C.', 38.889500, -77.035300, '2026-11-05', '2026-11-05', 'General public', 'A free outdoor concert celebrating cultural diversity with artists from 20 countries.'),
(7, 'Carrousel du Louvre, Paris', 48.861000, 2.335800, '2026-11-12', '2026-11-14', 'Culinary professionals', 'An international gastronomy fair with live cooking demonstrations and tastings.'),
(10, 'O2 Arena, London', 51.503000, 0.003200, '2026-11-20', '2026-11-20', 'Sports fans', 'A live esports championship featuring the top 16 teams from around the world.'),
(8, 'Parc del Forum, Barcelona', 41.411000, 2.219600, '2026-12-01', '2026-12-03', 'Music producers', 'A three-day electronic music festival with over 50 international DJs.'),
(9, 'Yas Island, Abu Dhabi', 24.488300, 54.616600, '2026-12-10', '2026-12-12', 'Families', 'A winter wonderland theme park experience with ice skating and live shows.'),
(10, 'Alte Oper, Frankfurt', 50.115500, 8.671000, '2026-12-20', '2026-12-20', 'General public', 'A Christmas Eve special concert blending classical and contemporary holiday music.')
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

INSERT INTO images (id, url, alt_text) VALUES
(1, 'https://picsum.photos/seed/event1/1600/900', 'Jazz Under the Garden Lights'),
(2, 'https://picsum.photos/seed/event2/1600/900', 'Modern Forms'),
(3, 'https://picsum.photos/seed/event3/1600/900', 'Fairy Tale Symphony'),
(4, 'https://picsum.photos/seed/event4/1600/900', 'Future Work Summit'),
(5, 'https://picsum.photos/seed/event5/1600/900', 'Lens Craft Workshop'),
(6, 'https://picsum.photos/seed/event6/1600/900', 'Night at the Colosseum'),
(7, 'https://picsum.photos/seed/event7/1600/900', 'Summer Culture Fest'),
(8, 'https://picsum.photos/seed/event8/1600/900', 'Beethoven by the Bay'),
(9, 'https://picsum.photos/seed/event9/1600/900', 'Finance Forward'),
(10, 'https://picsum.photos/seed/event10/1600/900', 'Open Air Cinema Classics'),
(11, 'https://picsum.photos/seed/event11/1600/900', 'Hands On Sculpture Lab'),
(12, 'https://picsum.photos/seed/event12/1600/900', 'Indie Dev Expo'),
(13, 'https://picsum.photos/seed/event13/1600/900', 'Founder Launch Day'),
(14, 'https://picsum.photos/seed/event14/1600/900', 'Runway Dispatch'),
(15, 'https://picsum.photos/seed/event15/1600/900', 'Global Sound Stage'),
(16, 'https://picsum.photos/seed/event16/1600/900', 'Gastronomy at the Louvre'),
(17, 'https://picsum.photos/seed/event17/1600/900', 'Championship Finals'),
(18, 'https://picsum.photos/seed/event18/1600/900', 'Electronic Summer'),
(19, 'https://picsum.photos/seed/event19/1600/900', 'Winter Lights Park'),
(20, 'https://picsum.photos/seed/event20/1600/900', 'Holiday Classics')
ON CONFLICT DO NOTHING;

INSERT INTO event_images (event_id, image_id, is_cover) VALUES
(1, 1, TRUE),
(2, 2, TRUE),
(3, 3, TRUE),
(4, 4, TRUE),
(5, 5, TRUE),
(6, 6, TRUE),
(7, 7, TRUE),
(8, 8, TRUE),
(9, 9, TRUE),
(10, 10, TRUE),
(11, 11, TRUE),
(12, 12, TRUE),
(13, 13, TRUE),
(14, 14, TRUE),
(15, 15, TRUE),
(16, 16, TRUE),
(17, 17, TRUE),
(18, 18, TRUE),
(19, 19, TRUE),
(20, 20, TRUE)
ON CONFLICT DO NOTHING;

INSERT INTO images (id, url, alt_text) VALUES
(21, 'https://picsum.photos/seed/event1-gallery/1600/900', 'Jazz Under the Garden Lights - Gallery'),
(22, 'https://picsum.photos/seed/event2-gallery/1600/900', 'Modern Forms - Gallery'),
(23, 'https://picsum.photos/seed/event3-gallery/1600/900', 'Fairy Tale Symphony - Gallery'),
(24, 'https://picsum.photos/seed/event4-gallery/1600/900', 'Future Work Summit - Gallery'),
(25, 'https://picsum.photos/seed/event5-gallery/1600/900', 'Lens Craft Workshop - Gallery'),
(26, 'https://picsum.photos/seed/event6-gallery/1600/900', 'Night at the Colosseum - Gallery'),
(27, 'https://picsum.photos/seed/event7-gallery/1600/900', 'Summer Culture Fest - Gallery'),
(28, 'https://picsum.photos/seed/event8-gallery/1600/900', 'Beethoven by the Bay - Gallery'),
(29, 'https://picsum.photos/seed/event9-gallery/1600/900', 'Finance Forward - Gallery'),
(30, 'https://picsum.photos/seed/event10-gallery/1600/900', 'Open Air Cinema Classics - Gallery'),
(31, 'https://picsum.photos/seed/event11-gallery/1600/900', 'Hands On Sculpture Lab - Gallery'),
(32, 'https://picsum.photos/seed/event12-gallery/1600/900', 'Indie Dev Expo - Gallery'),
(33, 'https://picsum.photos/seed/event13-gallery/1600/900', 'Founder Launch Day - Gallery'),
(34, 'https://picsum.photos/seed/event14-gallery/1600/900', 'Runway Dispatch - Gallery'),
(35, 'https://picsum.photos/seed/event15-gallery/1600/900', 'Global Sound Stage - Gallery'),
(36, 'https://picsum.photos/seed/event16-gallery/1600/900', 'Gastronomy at the Louvre - Gallery'),
(37, 'https://picsum.photos/seed/event17-gallery/1600/900', 'Championship Finals - Gallery'),
(38, 'https://picsum.photos/seed/event18-gallery/1600/900', 'Electronic Summer - Gallery'),
(39, 'https://picsum.photos/seed/event19-gallery/1600/900', 'Winter Lights Park - Gallery'),
(40, 'https://picsum.photos/seed/event20-gallery/1600/900', 'Holiday Classics - Gallery')
ON CONFLICT DO NOTHING;

INSERT INTO event_images (event_id, image_id, is_cover) VALUES
(1, 21, FALSE),
(2, 22, FALSE),
(3, 23, FALSE),
(4, 24, FALSE),
(5, 25, FALSE),
(6, 26, FALSE),
(7, 27, FALSE),
(8, 28, FALSE),
(9, 29, FALSE),
(10, 30, FALSE),
(11, 31, FALSE),
(12, 32, FALSE),
(13, 33, FALSE),
(14, 34, FALSE),
(15, 35, FALSE),
(16, 36, FALSE),
(17, 37, FALSE),
(18, 38, FALSE),
(19, 39, FALSE),
(20, 40, FALSE)
ON CONFLICT DO NOTHING;

-- WORK OPPORTUNITIES
INSERT INTO work_opportunities (id, poster_id, title, position, mode, duration, employment, pay, description, location) VALUES
(1, 1, 'Summer Festival Stage Crew', 'Stage Technician', 'onsite', 'month', 'full-time', 'EUR 1,800 / month', 'Help set up, manage, and strike the main stage for a month-long cultural festival circuit.', 'Porto, Portugal'),
(2, 2, 'Remote Social Media Consultant', 'Content Strategist', 'remote', 'ongoing', 'part-time', 'EUR 25 / hour', 'Create social campaigns, schedule posts, and shape the digital voice of an arts venue.', 'Remote'),
(3, 3, 'Hybrid Exhibition Assistant', 'Gallery Assistant', 'hybrid', 'week', 'part-time', 'EUR 900 / week', 'Support a contemporary exhibition with visitor care, setup tasks, and weekend coverage.', 'Lisbon, Portugal')
ON CONFLICT DO NOTHING;

-- CUSTOMER USERS (for chat and social features)
INSERT INTO users (id, username, name, email, pass, role) VALUES
(11, 'anaribeiro', 'Ana Ribeiro', 'ana@example.com', '$2b$10$E09O2hjRiZ1DdUxSrDHA2ubjg8JWJ2NFeCUIP2W3Xbv8.l/epaJRa', 'customer'),
(12, 'miguelcosta', 'Miguel Costa', 'miguel@example.com', '$2b$10$E09O2hjRiZ1DdUxSrDHA2ubjg8JWJ2NFeCUIP2W3Xbv8.l/epaJRa', 'customer'),
(13, 'sofiamartins', 'Sofia Martins', 'sofia@example.com', '$2b$10$E09O2hjRiZ1DdUxSrDHA2ubjg8JWJ2NFeCUIP2W3Xbv8.l/epaJRa', 'customer'),
(14, 'tiagosimoes', 'Tiago Simões', 'tiago@example.com', '$2b$10$E09O2hjRiZ1DdUxSrDHA2ubjg8JWJ2NFeCUIP2W3Xbv8.l/epaJRa', 'customer'),
(15, 'inescarvalho', 'Inês Carvalho', 'ines@example.com', '$2b$10$E09O2hjRiZ1DdUxSrDHA2ubjg8JWJ2NFeCUIP2W3Xbv8.l/epaJRa', 'customer'),
(16, 'joaoferreira', 'João Ferreira', 'joao@example.com', '$2b$10$E09O2hjRiZ1DdUxSrDHA2ubjg8JWJ2NFeCUIP2W3Xbv8.l/epaJRa', 'customer'),
(17, 'martalopes', 'Marta Lopes', 'marta@example.com', '$2b$10$E09O2hjRiZ1DdUxSrDHA2ubjg8JWJ2NFeCUIP2W3Xbv8.l/epaJRa', 'customer'),
(18, 'ruioliveira', 'Rui Oliveira', 'rui@example.com', '$2b$10$E09O2hjRiZ1DdUxSrDHA2ubjg8JWJ2NFeCUIP2W3Xbv8.l/epaJRa', 'customer'),
(19, 'carlasantos', 'Carla Santos', 'carla@example.com', '$2b$10$E09O2hjRiZ1DdUxSrDHA2ubjg8JWJ2NFeCUIP2W3Xbv8.l/epaJRa', 'customer'),
(20, 'brunopires', 'Bruno Pires', 'bruno@example.com', '$2b$10$E09O2hjRiZ1DdUxSrDHA2ubjg8JWJ2NFeCUIP2W3Xbv8.l/epaJRa', 'customer'),
(21, 'lauranunes', 'Laura Nunes', 'laura@example.com', '$2b$10$E09O2hjRiZ1DdUxSrDHA2ubjg8JWJ2NFeCUIP2W3Xbv8.l/epaJRa', 'customer'),
(22, 'andregomes', 'André Gomes', 'andre@example.com', '$2b$10$E09O2hjRiZ1DdUxSrDHA2ubjg8JWJ2NFeCUIP2W3Xbv8.l/epaJRa', 'customer'),
(23, 'patriciarocha', 'Patricia Rocha', 'patricia@example.com', '$2b$10$E09O2hjRiZ1DdUxSrDHA2ubjg8JWJ2NFeCUIP2W3Xbv8.l/epaJRa', 'customer'),
(24, 'diogocardoso', 'Diogo Cardoso', 'diogo@example.com', '$2b$10$E09O2hjRiZ1DdUxSrDHA2ubjg8JWJ2NFeCUIP2W3Xbv8.l/epaJRa', 'customer'),
(25, 'helenapinto', 'Helena Pinto', 'helena@example.com', '$2b$10$E09O2hjRiZ1DdUxSrDHA2ubjg8JWJ2NFeCUIP2W3Xbv8.l/epaJRa', 'customer'),
(26, 'nunsteixeira', 'Nuno Teixeira', 'nuno@example.com', '$2b$10$E09O2hjRiZ1DdUxSrDHA2ubjg8JWJ2NFeCUIP2W3Xbv8.l/epaJRa', 'customer')
ON CONFLICT DO NOTHING;

-- CUSTOMER PROFILES
INSERT INTO customer (customer_id) VALUES
(11), (12), (13), (14), (15), (16), (17), (18), (19), (20), 
(21), (22), (23), (24), (25), (26)
ON CONFLICT DO NOTHING;

-- SOCIAL CONTENT
INSERT INTO stories (id, user_id, media, label) VALUES
(1, 11, 'https://picsum.photos/seed/story-seed-1/600/900', 'Opening night'),
(2, 12, 'https://picsum.photos/seed/story-seed-2/600/900', 'Backstage'),
(3, 13, 'https://picsum.photos/seed/story-seed-3/600/900', 'My night out')
ON CONFLICT DO NOTHING;

INSERT INTO publication (id, user_id, media, publish_date, information, location, likes, favorites, shares, event_id) VALUES
(1, 11, 'https://picsum.photos/seed/pub-1/900/800', '2026-05-25', 'Golden lights, loud drums, and the best crowd I have seen all year.', 'Porto, Portugal', 142, 28, 14, 7),
(2, 12, 'https://picsum.photos/seed/pub-2/900/800', '2026-05-26', 'Soundcheck finished. The crowd is in for a long night.', 'Lisbon, Portugal', 87, 19, 10, 18),
(3, 13, 'https://picsum.photos/seed/pub-3/900/800', '2026-05-27', 'New mural, new music, same old city magic.', 'Coimbra, Portugal', 64, 9, 5, 10)
ON CONFLICT DO NOTHING;

INSERT INTO publication (id, user_id, media, publish_date, information, location, likes, favorites, shares, event_id) VALUES
(4, 14, 'https://picsum.photos/seed/pub-4/900/800', '2026-05-28', 'The venue felt electric from the first note.', 'Braga, Portugal', 178, 41, 22, 1),
(5, 15, 'https://picsum.photos/seed/pub-5/900/800', '2026-05-29', 'Street art, live beats, and an unreal sunset.', 'Porto, Portugal', 131, 24, 17, 7),
(6, 16, 'https://picsum.photos/seed/pub-6/900/800', '2026-05-30', 'Tonight was all about the little moments.', 'Faro, Portugal', 96, 14, 8, 3),
(7, 17, 'https://picsum.photos/seed/pub-7/900/800', '2026-06-01', 'Gallery opening with a crowd that actually stayed for the talk.', 'Lisbon, Portugal', 154, 33, 12, 2),
(8, 18, 'https://picsum.photos/seed/pub-8/900/800', '2026-06-02', 'Nothing beats a packed outdoor screening.', 'Aveiro, Portugal', 121, 27, 11, 10),
(9, 19, 'https://picsum.photos/seed/pub-9/900/800', '2026-06-03', 'Weekend recap: too many great sets to count.', 'Porto, Portugal', 209, 52, 31, 18)
ON CONFLICT DO NOTHING;

INSERT INTO comments (id, publication_id, user_id, information, publish_date, likes) VALUES
(1, 1, 12, 'This looks unforgettable.', '2026-05-25 20:00:00', 4),
(2, 3, 11, 'This color palette is stunning.', '2026-05-27 21:15:00', 2)
ON CONFLICT DO NOTHING;

INSERT INTO comments (id, publication_id, user_id, information, publish_date, likes) VALUES
(3, 4, 11, 'I would have loved to be there.', '2026-05-28 22:00:00', 7),
(4, 5, 12, 'The lighting in this shot is incredible.', '2026-05-29 19:35:00', 5),
(5, 7, 13, 'This looks like a packed house.', '2026-06-01 23:10:00', 3),
(6, 9, 15, 'Saving this for inspiration.', '2026-06-03 18:25:00', 6)
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
(9, 11, TRUE, TRUE, TRUE)
ON CONFLICT DO NOTHING;

INSERT INTO notifications (id, recipient_user_id, actor_user_id, kind, title, message, is_read, created_at, publication_id, event_id) VALUES
(1, 11, 12, 'follow', 'New follower', 'Sofia Martins started following you.', FALSE, '2026-05-29 10:00:00', NULL, NULL),
(2, 11, 13, 'like', 'New like', 'Ana Ribeiro liked "Golden lights, loud drums, and the best crowd I have seen all year.".', FALSE, '2026-05-30 12:00:00', 1, NULL)
ON CONFLICT DO NOTHING;

INSERT INTO attended_events (user_id, event_id, status, attended_at) VALUES
(11, 1, 'Attended', '2026-05-12 20:00:00'),
(11, 7, 'Attended', '2026-05-18 21:00:00'),
(11, 10, 'Saved for later', '2026-05-24 18:00:00')
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
(1), (2), (3), (4), (5), (6), (7), (8), (9), (10)
ON CONFLICT DO NOTHING;

-- CHAT PARTICIPANTS
INSERT INTO chat_participants (chat_id, user_id) VALUES
-- Chat 1: Ana and Miguel
(1, 11), (1, 12),
-- Chat 2: Ana and Sofia
(2, 11), (2, 13),
-- Chat 3: Miguel and Sofia
(3, 12), (3, 13),
-- Chat 4: Sofia and Tiago
(4, 13), (4, 14),
-- Chat 5: Tiago and Inês
(5, 14), (5, 15),
-- Chat 6: Inês and João
(6, 15), (6, 16),
-- Chat 7: João and Marta
(7, 16), (7, 17),
-- Chat 8: Marta and Rui
(8, 17), (8, 18),
-- Chat 9: Rui and Carla
(9, 18), (9, 19),
-- Chat 10: Carla and Bruno
(10, 19), (10, 20)
ON CONFLICT DO NOTHING;

-- MESSAGES
INSERT INTO message (chat_id, sender_id, content, sent_at) VALUES
-- Chat 1: Ana and Miguel
(1, 11, 'Hey Miguel! How was the event yesterday?', '2026-05-01 10:30:00'),
(1, 12, 'It was amazing! The live performance was incredible.', '2026-05-01 10:35:00'),
(1, 11, 'I heard! I wish I could have gone. Maybe next time?', '2026-05-01 10:40:00'),
(1, 12, 'Definitely! Let me know when you''re free.', '2026-05-01 10:45:00'),
-- Chat 2: Ana and Sofia
(2, 11, 'Sofia, are you going to the summer festival?', '2026-05-02 14:20:00'),
(2, 13, 'I was thinking about it! Are you interested?', '2026-05-02 14:25:00'),
(2, 11, 'Yes! Let''s go together. It would be fun!', '2026-05-02 14:30:00'),
(2, 13, 'Great idea! I''ll check the dates and let you know.', '2026-05-02 14:35:00'),
-- Chat 3: Miguel and Sofia
(3, 12, 'Sofia, I saw you liked my photo!', '2026-05-03 11:15:00'),
(3, 13, 'Yes! It was from the concert, really nice shot.', '2026-05-03 11:20:00'),
(3, 12, 'Thanks! Are you going to the gallery opening next week?', '2026-05-03 11:25:00'),
(3, 13, 'I might! Do you have the details?', '2026-05-03 11:30:00'),
-- Chat 4: Sofia and Tiago
(4, 13, 'Hey Tiago, how have you been?', '2026-05-04 09:00:00'),
(4, 14, 'All good! Just been busy with work. How about you?', '2026-05-04 09:10:00'),
(4, 13, 'Same here! But I miss hanging out. Wanna grab coffee?', '2026-05-04 09:15:00'),
(4, 14, 'I''d love to! How about this weekend?', '2026-05-04 09:20:00'),
-- Chat 5: Tiago and Inês
(5, 14, 'Inês, I found that band you recommended!', '2026-05-05 16:45:00'),
(5, 15, 'Really?! What do you think?', '2026-05-05 16:50:00'),
(5, 14, 'They''re fantastic! Thanks for the recommendation.', '2026-05-05 16:55:00'),
(5, 15, 'Awesome! I''m glad you like them. Check out their new album!', '2026-05-05 17:00:00'),
-- Chat 6: Inês and João
(6, 15, 'João, are you coming to the cinema night?', '2026-05-06 13:30:00'),
(6, 16, 'I didn''t know about it! When is it?', '2026-05-06 13:35:00'),
(6, 15, 'Next Friday at 8 PM. Do you want to join?', '2026-05-06 13:40:00'),
(6, 16, 'Count me in! Sounds fun.', '2026-05-06 13:45:00'),
-- Chat 7: João and Marta
(7, 16, 'Marta, I loved your last post about the exhibition!', '2026-04-30 15:00:00'),
(7, 17, 'Thank you! I''m so passionate about contemporary art.', '2026-04-30 15:05:00'),
(7, 16, 'It shows! Have you been to the new gallery downtown?', '2026-04-30 15:10:00'),
(7, 17, 'Not yet, but I''ve heard great things about it!', '2026-04-30 15:15:00'),
-- Chat 8: Marta and Rui
(8, 17, 'Rui, want to check out that new restaurant?', '2026-04-29 12:20:00'),
(8, 18, 'Absolutely! When were you thinking?', '2026-04-29 12:25:00'),
(8, 17, 'How about tomorrow evening?', '2026-04-29 12:30:00'),
(8, 18, 'Perfect! I''ll make a reservation.', '2026-04-29 12:35:00'),
-- Chat 9: Rui and Carla
(9, 18, 'Carla, thanks for the event recommendation!', '2026-04-28 10:50:00'),
(9, 19, 'No problem! Did you end up going?', '2026-04-28 10:55:00'),
(9, 18, 'Yes! It was better than I expected.', '2026-04-28 11:00:00'),
(9, 19, 'Glad you enjoyed it! Let me know if you need more recommendations.', '2026-04-28 11:05:00'),
-- Chat 10: Carla and Bruno
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
