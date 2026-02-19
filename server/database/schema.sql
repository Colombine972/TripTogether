CREATE TABLE user (
  id INT PRIMARY KEY AUTO_INCREMENT,
  firstname VARCHAR(50) DEFAULT NULL,
  lastname VARCHAR(75) DEFAULT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL
);


CREATE TABLE trip (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(100) NOT NULL,
  description VARCHAR(255),
  city VARCHAR(100) NOT NULL,
  country VARCHAR(100) NOT NULL,
  start_at DATE,
  end_at DATE,
  user_id INT NOT NULL,
  image_url TEXT,
  CONSTRAINT fk_trip_user
    FOREIGN KEY (user_id) REFERENCES user(id)
);

CREATE TABLE step (
  id INT PRIMARY KEY AUTO_INCREMENT,
  city VARCHAR(255) NOT NULL,
  country VARCHAR(255) NOT NULL,
  trip_id INT NOT NULL,
  user_id INT NOT NULL,
  is_initial BOOLEAN DEFAULT false,
  image_url TEXT,
  CONSTRAINT fk_step_trip
    FOREIGN KEY (trip_id) REFERENCES trip(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_step_user
    FOREIGN KEY (user_id) REFERENCES user(id)
    ON DELETE CASCADE
);

CREATE TABLE category (
  id INT PRIMARY KEY AUTO_INCREMENT,
  label VARCHAR(80) NOT NULL
);


CREATE TABLE budget (
  id INT PRIMARY KEY AUTO_INCREMENT,
  amount DECIMAL(6,2) NOT NULL,
  is_mandatory BOOLEAN NOT NULL,
  trip_id INT NOT NULL,
  category_id INT NOT NULL,
  CONSTRAINT fk_budget_trip
    FOREIGN KEY (trip_id) REFERENCES trip(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_budget_category
    FOREIGN KEY (category_id) REFERENCES category(id)
    ON DELETE RESTRICT
);

CREATE TABLE invitation (
  id INT PRIMARY KEY AUTO_INCREMENT,
  status VARCHAR(10) NOT NULL,
  email VARCHAR(100) NOT NULL,
  message TEXT NOT NULL,
  user_id INT DEFAULT NULL,
  trip_id INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  trip_status ENUM('futur', 'current', 'past') DEFAULT 'futur',
  CONSTRAINT fk_invitation_user
    FOREIGN KEY (user_id) REFERENCES user(id)
    ON DELETE SET NULL,
  CONSTRAINT fk_invitation_trip
    FOREIGN KEY (trip_id) REFERENCES trip(id)
);

CREATE TABLE vote (
  id INT PRIMARY KEY AUTO_INCREMENT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  user_id INT NOT NULL,
  step_id INT NOT NULL,
  vote BOOLEAN NOT NULL,
  comment VARCHAR(500) NULL,
  CONSTRAINT fk_vote_user
    FOREIGN KEY (user_id) REFERENCES user(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_vote_step
    FOREIGN KEY (step_id) REFERENCES step(id)
    ON DELETE CASCADE,
  CONSTRAINT unique_user_vote_step
    UNIQUE (user_id, step_id)
);

CREATE TABLE expense_category (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL UNIQUE
);


CREATE TABLE expense (
  id INT PRIMARY KEY AUTO_INCREMENT,
  trip_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  date DATE DEFAULT (CURRENT_DATE),
  paid_by INT NOT NULL,
  category_id INT NOT NULL,
  
  FOREIGN KEY (trip_id) REFERENCES trip(id) ON DELETE CASCADE,
  FOREIGN KEY (paid_by) REFERENCES user(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES expense_category(id)
);


CREATE TABLE expense_share (
  id INT AUTO_INCREMENT PRIMARY KEY,
  expense_id INT NOT NULL,
  user_id INT NOT NULL, 
  share_amount DECIMAL (10,2) NOT NULL,
  FOREIGN KEY (expense_id) REFERENCES expense(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);
