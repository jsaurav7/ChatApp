create database chat;
use chat;

CREATE TABLE users
(
    id        INT AUTO_INCREMENT PRIMARY KEY,
    name      VARCHAR(100)        NOT NULL,
    email     VARCHAR(100) UNIQUE NOT NULL,
    password  VARCHAR(255)        NOT NULL,
    last_seen DATETIME DEFAULT NULL
);

CREATE TABLE contacts
(
    id              INT AUTO_INCREMENT PRIMARY KEY,
    user_id         INT NOT NULL,
    contact_user_id INT NOT NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (contact_user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE messages
(
    id          INT AUTO_INCREMENT PRIMARY KEY,
    sender_id   INT     NOT NULL,
    receiver_id INT     NOT NULL,
    content     TEXT    NOT NULL,
    delivered   BOOLEAN not null default (false),
    created_at  TIMESTAMP        DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users (id) ON DELETE CASCADE
);
