-- USERS
CREATE TYPE user_role AS ENUM ('customer', 'professional');
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
	name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    pass VARCHAR(255) NOT NULL,
    information TEXT,
    role user_role NOT NULL,
    location VARCHAR(255) 
);

-- PROFESSIONAL PROFILE
CREATE TABLE professional_profile (
    user_id INT PRIMARY KEY,
    rating INT,
    is_verified BOOLEAN,
    genre VARCHAR(100),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- CUSTOMER
CREATE TABLE customer (
    customer_id INT PRIMARY KEY,
    FOREIGN KEY (customer_id) REFERENCES users(id)
);

-- TAGS
CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    tag_name VARCHAR(100) UNIQUE
);

-- CUSTOMER PREFERENCES
CREATE TABLE customer_preferences (
    customer_id INT,
    tag_name VARCHAR(100),
    PRIMARY KEY (customer_id, tag_name),
    FOREIGN KEY (customer_id) REFERENCES customer(customer_id),
    FOREIGN KEY (tag_name) REFERENCES tags(tag_name)
);

-- EVENTS
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    publisher_id INT,
    title VARCHAR(255),
    event_type VARCHAR(100),
    venue VARCHAR(255),
    latitude NUMERIC(9,6) NOT NULL,
    longitude NUMERIC(9,6) NOT NULL,
    sdate DATE,
    edate DATE,
    event_time TIME,
    target VARCHAR(255),
    description TEXT,
    price VARCHAR(50),
    ticket_link VARCHAR(500),
    FOREIGN KEY (publisher_id) REFERENCES professional_profile(user_id)
);

CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE events
ADD CONSTRAINT uq_venue_no_overlap
EXCLUDE USING GIST (
    venue WITH =,
    daterange(sdate, edate, '[]') WITH &&
);

-- EVENTS TAGS
CREATE TABLE event_tags (
    event_id INT,
    tag_name VARCHAR(100),
    PRIMARY KEY (event_id, tag_name),
    FOREIGN KEY (event_id) REFERENCES events(id),
    FOREIGN KEY (tag_name) REFERENCES tags(tag_name)
);

-- FRIENDS
CREATE TABLE friends (
    user1_id INT,
    user2_id INT,
    PRIMARY KEY (user1_id, user2_id),
    FOREIGN KEY (user1_id) REFERENCES customer(customer_id),
    FOREIGN KEY (user2_id) REFERENCES customer(customer_id),
    CHECK (user1_id < user2_id)
);

-- FRIEND REQUESTS
CREATE TABLE friend_requests (
    id SERIAL PRIMARY KEY,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES customer(customer_id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES customer(customer_id) ON DELETE CASCADE,
    UNIQUE (sender_id, receiver_id)
);

-- FOLLOWS
CREATE TABLE follows (
    customer_id INT,
    professional_id INT,
    PRIMARY KEY (customer_id, professional_id),
    FOREIGN KEY (customer_id) REFERENCES customer(customer_id),
    FOREIGN KEY (professional_id) REFERENCES professional_profile(user_id)
);

-- CHAT
CREATE TABLE chat (
    id SERIAL PRIMARY KEY
);

-- CHAT PARTICIPANTS
CREATE TABLE chat_participants (
    chat_id INT,
    user_id INT,
    PRIMARY KEY (chat_id, user_id),
    FOREIGN KEY (chat_id) REFERENCES chat(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- MESSAGE
CREATE TABLE message (
    id SERIAL PRIMARY KEY,
    chat_id INT,
    sender_id INT,
    content TEXT,
    sent_at TIMESTAMP,
    FOREIGN KEY (chat_id) REFERENCES chat(id),
    FOREIGN KEY (sender_id) REFERENCES users(id)
);

-- PUBLICATION
CREATE TABLE publication (
    id SERIAL PRIMARY KEY,
    user_id INT,
    media VARCHAR(255),
    media_type VARCHAR(20) NOT NULL DEFAULT 'image',
    publish_date DATE,
    information TEXT,
    location VARCHAR(255),
    likes INT DEFAULT 0,
    favorites INT DEFAULT 0,
    shares INT DEFAULT 0,
    event_id INT,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (event_id) REFERENCES events(id)
);

-- COMMENTS
CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    publication_id INT NOT NULL,
    user_id INT NOT NULL,
    information TEXT,
    publish_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    likes INT DEFAULT 0,
    FOREIGN KEY (publication_id) REFERENCES publication(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- STORIES
CREATE TABLE stories (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    media VARCHAR(500) NOT NULL,
    label VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- PUBLICATION REACTIONS
CREATE TABLE publication_reactions (
    publication_id INT,
    user_id INT,
    liked BOOLEAN DEFAULT FALSE,
    favorited BOOLEAN DEFAULT FALSE,
    shared BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (publication_id, user_id),
    FOREIGN KEY (publication_id) REFERENCES publication(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- SOCIAL NOTIFICATIONS
CREATE TYPE notification_kind AS ENUM ('follow', 'like', 'comment', 'share', 'favorite');
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    recipient_user_id INT NOT NULL,
    actor_user_id INT,
    kind notification_kind NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    publication_id INT,
    event_id INT,
    FOREIGN KEY (recipient_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (actor_user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (publication_id) REFERENCES publication(id) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- ATTENDED EVENTS
CREATE TABLE attended_events (
    user_id INT NOT NULL,
    event_id INT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Attended',
    attended_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, event_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- APPLICATION
CREATE TABLE application (
    id SERIAL PRIMARY KEY,
    publisher_id INT,
    event_id INT,
    information TEXT,
    contact VARCHAR(255),
    FOREIGN KEY (publisher_id) REFERENCES professional_profile(user_id),
    FOREIGN KEY (event_id) REFERENCES events(id)
);

-- PROFESSIONAL REVIEW
CREATE TABLE professional_review (
    user_id INT,
    professional_id INT,
    rating INT,
    sent_date DATE,
    information TEXT,
    PRIMARY KEY (user_id, professional_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (professional_id) REFERENCES professional_profile(user_id)
);

-- EVENTS REVIEW
CREATE TABLE event_review (
    user_id INT,
    event_id INT,
    rating INT,
    sent_date DATE,
    information TEXT,
    PRIMARY KEY (user_id, event_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (event_id) REFERENCES events(id)
);

-- PROFESSIONAL HISTORY
CREATE TABLE professional_history (
    professional_id INT,
    event_id INT,
    PRIMARY KEY (professional_id, event_id),
    FOREIGN KEY (professional_id) REFERENCES professional_profile(user_id),
    FOREIGN KEY (event_id) REFERENCES events(id)
);

-- WORK OPPORTUNITIES
CREATE TYPE work_mode AS ENUM ('remote', 'hybrid', 'onsite');
CREATE TYPE work_duration AS ENUM ('week', 'month', 'contract', 'ongoing');
CREATE TYPE employment_type AS ENUM ('part-time', 'full-time');
CREATE TABLE work_opportunities (
    id SERIAL PRIMARY KEY,
    poster_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    position VARCHAR(255) NOT NULL,
    mode work_mode NOT NULL,
    duration work_duration NOT NULL,
    employment employment_type NOT NULL,
    pay VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (poster_id) REFERENCES professional_profile(user_id) ON DELETE CASCADE
);

-- PROFESSIONAL INVITE
CREATE TYPE invite_answer AS ENUM ('pending', 'accepted', 'rejected');
CREATE TABLE professional_invite (
    sender_id INT,
    receiver_id INT,
    event_id INT NOT NULL,
    invite TEXT,
    answer invite_answer DEFAULT 'pending',
    PRIMARY KEY (sender_id, receiver_id),
    FOREIGN KEY (sender_id) REFERENCES professional_profile(user_id),
    FOREIGN KEY (receiver_id) REFERENCES professional_profile(user_id),
    FOREIGN KEY (event_id) REFERENCES events(id)
);

-- IMAGES
CREATE TABLE images (
    id SERIAL PRIMARY KEY,
    url VARCHAR(500) NOT NULL,
    alt_text VARCHAR(255),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- EVENT IMAGES
CREATE TABLE event_images (
    event_id INT REFERENCES events(id) ON DELETE CASCADE,
    image_id INT REFERENCES images(id) ON DELETE CASCADE,
    is_cover BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (event_id, image_id)
);

-- add images table for each entity that needs an image
