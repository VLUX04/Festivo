TRUNCATE TABLE
    professional_history, professional_invite,
    event_review, professional_review,
    application, comments, publication,
    message, chat_participants, chat,
    follows, friends,
    event_tags, event_images, images,
    events,
    professional_profile,
    users
RESTART IDENTITY CASCADE;

-- USERS
INSERT INTO users (id, username, email, pass, role) VALUES
(1, 'jazzmaster', 'jazz@example.com', 'hashedpass', 'professional'),
(2, 'artcurator', 'art@example.com', 'hashedpass', 'professional'),
(3, 'orchestral', 'orchestra@example.com', 'hashedpass', 'professional'),
(4, 'photopro', 'photo@example.com', 'hashedpass', 'professional'),
(5, 'festivalpro', 'festival@example.com', 'hashedpass', 'professional'),
(6, 'bizpro', 'biz@example.com', 'hashedpass', 'professional'),
(7, 'artworkshop', 'workshop@example.com', 'hashedpass', 'professional'),
(8, 'startuppro', 'startup@example.com', 'hashedpass', 'professional'),
(9, 'concertpro', 'concert@example.com', 'hashedpass', 'professional'),
(10, 'esportspro', 'esports@example.com', 'hashedpass', 'professional')
ON CONFLICT DO NOTHING;

INSERT INTO professional_profile (user_id) VALUES
(1), (2), (3), (4), (5), (6), (7), (8), (9), (10)
ON CONFLICT DO NOTHING;

-- EVENTS
INSERT INTO events (publisher_id, venue, sdate, edate, target, description) VALUES
(1, 'Madison Square Garden, New York', '2026-05-10', '2026-05-10', 'Music lovers', 'An unforgettable night of live jazz featuring world-renowned artists.'),
(2, 'Royal Albert Hall, London', '2026-06-01', '2026-06-03', 'Art enthusiasts', 'A three-day contemporary art exhibition showcasing emerging European artists.'),
(3, 'Sydney Opera House, Sydney', '2026-06-15', '2026-06-15', 'Families', 'A magical orchestral performance of classic fairy tale soundtracks.'),
(1, 'Palais des Congrès, Paris', '2026-07-04', '2026-07-06', 'Tech professionals', 'Annual technology summit covering AI, blockchain, and the future of work.'),
(4, 'Tokyo International Forum, Tokyo', '2026-07-20', '2026-07-21', 'Photographers', 'A two-day workshop on landscape and street photography techniques.'),
(2, 'Colosseum, Rome', '2026-08-01', '2026-08-01', 'History buffs', 'A guided night tour through ancient Rome with live historical reenactments.'),
(5, 'Central Park, New York', '2026-08-14', '2026-08-16', 'General public', 'An outdoor summer festival featuring food, music, and cultural performances.'),
(3, 'Elbphilharmonie, Hamburg', '2026-08-22', '2026-08-22', 'Classical music fans', 'An evening of Beethoven performed by the Hamburg Philharmonic Orchestra.'),
(6, 'Marina Bay Sands, Singapore', '2026-09-05', '2026-09-07', 'Business professionals', 'A global finance and investment conference with keynote speakers from top firms.'),
(4, 'Hollywood Bowl, Los Angeles', '2026-09-12', '2026-09-12', 'Film enthusiasts', 'An open-air cinema night screening classic Hollywood films under the stars.'),
(7, 'Tate Modern, London', '2026-09-20', '2026-09-22', 'Art students', 'A hands-on sculpture workshop led by internationally recognized artists.'),
(5, 'Fira de Barcelona, Barcelona', '2026-10-03', '2026-10-05', 'Game developers', 'The largest independent game development conference in Southern Europe.'),
(8, 'Dubai World Trade Centre, Dubai', '2026-10-15', '2026-10-17', 'Entrepreneurs', 'A startup expo connecting founders with investors from across the Middle East.'),
(6, 'Grand Palais, Paris', '2026-10-28', '2026-10-30', 'Fashion professionals', 'An exclusive fashion week event featuring collections from top designers.'),
(9, 'National Mall, Washington D.C.', '2026-11-05', '2026-11-05', 'General public', 'A free outdoor concert celebrating cultural diversity with artists from 20 countries.'),
(7, 'Carrousel du Louvre, Paris', '2026-11-12', '2026-11-14', 'Culinary professionals', 'An international gastronomy fair with live cooking demonstrations and tastings.'),
(10, 'O2 Arena, London', '2026-11-20', '2026-11-20', 'Sports fans', 'A live esports championship featuring the top 16 teams from around the world.'),
(8, 'Parc del Fòrum, Barcelona', '2026-12-01', '2026-12-03', 'Music producers', 'A three-day electronic music festival with over 50 international DJs.'),
(9, 'Yas Island, Abu Dhabi', '2026-12-10', '2026-12-12', 'Families', 'A winter wonderland theme park experience with ice skating and live shows.'),
(10, 'Alte Oper, Frankfurt', '2026-12-20', '2026-12-20', 'General public', 'A Christmas Eve special concert blending classical and contemporary holiday music.')
