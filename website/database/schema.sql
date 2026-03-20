-- USERS
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    description TEXT,
    role ENUM('customer', 'professional') NOT NULL
);

-- PROFESSIONAL PROFILE
CREATE TABLE professional_profile (
    user_id INT PRIMARY KEY,
    rating INT,
    is_verified BOOLEAN,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- CUSTOMER
CREATE TABLE customer(
    customer_id INT PRIMARY KEY,
    FOREIGN KEY (customer_id) REFERENCES users(id)
);

-- TAGS
CREATE TABLE tags (
    name VARCHAR(100) PRIMARY KEY
);

-- CUSTOMER PREFERENCES
CREATE TABLE customer_preferences (
    customer_id INT,
    tag_name VARCHAR(100),
    PRIMARY KEY (customer_id, tag_name),
    FOREIGN KEY (customer_id) REFERENCES users(id),
    FOREIGN KEY (tag_name) REFERENCES tags(name)
);

-- EVENT
CREATE TABLE event (
    id INT PRIMARY KEY AUTO_INCREMENT,
    publisher_id INT,
    venue VARCHAR(255),
    start_date DATE,
    end_date DATE,
    target VARCHAR(255),
    description TEXT,
    FOREIGN KEY (publisher_id) REFERENCES professional_profile(user_id)
);


-- EVENT TAGS
CREATE TABLE event_tags (
    event_id INT ,
    tag_name VARCHAR(100),
    PRIMARY KEY (event_id, tag_name),
    FOREIGN KEY (event_id) REFERENCES event(id),
    FOREIGN KEY (tag_name) REFERENCES tags(name)
);

-- FRIENDS
CREATE TABLE friends (
    user1_id INT,
    user2_id INT,
    PRIMARY KEY (user1_id, user2_id),
    FOREIGN KEY (user1_id) REFERENCES customer(customer_id),
    FOREIGN KEY (user2_id) REFERENCES customer(customer_id)
);

-- FOLLOWS
CREATE TABLE follows (
    customer_id INT,
    professional_id INT,
    PRIMARY KEY (customer_id, professional_id),
    FOREIGN KEY (customer_id) REFERENCES users(id),
    FOREIGN KEY (professional_id) REFERENCES professional_profile(user_id)
);

-- CHAT
CREATE TABLE chat (
    id INT PRIMARY KEY AUTO_INCREMENT
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
    id INT PRIMARY KEY AUTO_INCREMENT,
    chat_id INT,
    sender_id INT,
    content TEXT,
    sent_at DATETIME,
    FOREIGN KEY (chat_id) REFERENCES chat(id),
    FOREIGN KEY (sender_id) REFERENCES users(id)
);

-- PUBLICATION
CREATE TABLE publication (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    media VARCHAR(255),
    publish_date DATE,
    description TEXT,
    likes INT DEFAULT 0,
    event_id INT,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (event_id) REFERENCES event(id)
);

-- COMMENT 
CREATE TABLE comment (
    publication_id INT,
    user_id INT,
    text TEXT,
    publish_date DATE,
    likes INT DEFAULT 0,
    PRIMARY KEY (user_id, publication_id),
    FOREIGN KEY (publication_id) REFERENCES publication(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- APPLICATION 
CREATE TABLE application (
    id INT AUTO_INCREMENT,
    publisher_id INT, 
    event_id INT,
    information TEXT,
    contact VARCHAR(255),
    FOREIGN KEY (publisher_id) REFERENCES professional_profile(user_id),
    FOREIGN KEY (event_id) REFERENCES event(id)
);

-- PROFESSIONAL REVIEW
CREATE TABLE professional_review (
    user_id INT,
    professional_id INT,
    rating INT,
    sent_date DATE,
    text TEXT,
    PRIMARY KEY (user_id, professional_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (professional_id) REFERENCES professional_profile(user_id)
);


-- EVENT REVIEW
CREATE TABLE event_review (
    user_id INT,
    event_id INT,
    rating INT,
    sent_date DATE,
    text TEXT,
    PRIMARY KEY (user_id, event_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (event_id) REFERENCES event(id)
);

-- PROFESSIONAL HISTORY
CREATE TABLE professional_history (
    professional_id INT,
    event_id INT,
    PRIMARY KEY (professional_id, event_id),
    FOREIGN KEY (professional_id) REFERENCES professional_profile(user_id),
    FOREIGN KEY (event_id) REFERENCES event(id)
);

CREATE TABLE professional_invite(
    sender_id INT,
    receiver_id INT,
    invite TEXT,
    status ENUM("pending","accepted", "rejected") DEFAULT "pending",
    PRIMARY KEY (sender_id, receiver_id),
    FOREIGN KEY (sender_id) REFERENCES professional_profile(user_id),
    FOREIGN KEY (receiver_id) REFERENCES professional_profile(user_id)
);