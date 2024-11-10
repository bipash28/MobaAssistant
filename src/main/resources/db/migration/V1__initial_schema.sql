CREATE TABLE hero (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL
);

CREATE TABLE hero_stats (
    hero_id BIGINT PRIMARY KEY,
    damage INT NOT NULL,
    durability INT NOT NULL,
    difficulty INT NOT NULL,
    physical_damage INT NOT NULL DEFAULT 0,
    magical_damage INT NOT NULL DEFAULT 0,
    mobility INT NOT NULL DEFAULT 0,
    crowd_control INT NOT NULL DEFAULT 0,
    FOREIGN KEY (hero_id) REFERENCES hero(id)
);

CREATE TABLE skill (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    hero_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    cooldown DOUBLE NOT NULL,
    FOREIGN KEY (hero_id) REFERENCES hero(id)
);

CREATE TABLE build (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    hero_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    playstyle TEXT NOT NULL,
    FOREIGN KEY (hero_id) REFERENCES hero(id)
);

CREATE TABLE build_items (
    build_id BIGINT NOT NULL,
    item VARCHAR(255) NOT NULL,
    FOREIGN KEY (build_id) REFERENCES build(id)
);

CREATE TABLE hero_counters (
    hero_id BIGINT NOT NULL,
    counter_name VARCHAR(255) NOT NULL,
    FOREIGN KEY (hero_id) REFERENCES hero(id)
);