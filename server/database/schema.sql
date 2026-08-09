CREATE TABLE user (
  id INT PRIMARY KEY AUTO_INCREMENT,
  firstname VARCHAR(50) DEFAULT NULL,
  lastname VARCHAR(75) DEFAULT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  avatar_url LONGTEXT
);


CREATE TABLE trip (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(100) NOT NULL,
  description VARCHAR(255),
  city VARCHAR(100) NOT NULL,
  country VARCHAR(100) NOT NULL,
  country_code VARCHAR(2),
  local_currency VARCHAR(3),
  base_currency VARCHAR(3) DEFAULT 'EUR',
  start_at DATE,
  end_at DATE,
  user_id INT NOT NULL,
  place_id VARCHAR(255),
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
  place_id VARCHAR(255),
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
    ON DELETE CASCADE
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
  emoji VARCHAR(10) NULL,

  amount DECIMAL(10,2) NOT NULL,

  original_amount DECIMAL(10,2) NULL,
  original_currency VARCHAR(3) NULL,

  converted_amount DECIMAL(10,2) NULL,
  converted_currency VARCHAR(3) NULL,

  exchange_rate DECIMAL(10,6) NULL,

  date DATE DEFAULT (CURRENT_DATE),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

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

  share_amount DECIMAL(10,2) NOT NULL,

  split_type ENUM('equal', 'exact') DEFAULT 'equal',

  FOREIGN KEY (expense_id) REFERENCES expense(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);

CREATE TABLE user_preferences (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL UNIQUE,
  email_trip_notifications BOOLEAN NOT NULL DEFAULT TRUE,
  default_currency VARCHAR(3) NOT NULL DEFAULT 'EUR',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  uptaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_user_preferences_user
  FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);

CREATE TABLE user_payment_preference (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,

  preferred_method ENUM(
    'wero',
    'bank_transfer'
  ) DEFAULT NULL,

  wero_phone VARCHAR(20) DEFAULT NULL,
  iban VARCHAR(34) DEFAULT NULL,
  iban_holder_name VARCHAR(120) DEFAULT NULL,

  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_user_payment_preference_user
    FOREIGN KEY (user_id)
    REFERENCES user(id)
    ON DELETE CASCADE
);

CREATE TABLE reimbursement (
  id INT AUTO_INCREMENT PRIMARY KEY,

  trip_id INT NOT NULL,
  from_user_id INT NOT NULL,
  to_user_id INT NOT NULL,

  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) NOT NULL,

  payment_method ENUM(
    'wero',
    'bank_transfer',
    'other'
  ) DEFAULT NULL,

  status ENUM(
    'pending',
    'confirmed',
    'rejected',
    'cancelled'
  ) NOT NULL DEFAULT 'pending',

  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,

  confirmed_at DATETIME DEFAULT NULL,
  rejected_at DATETIME DEFAULT NULL,

  CONSTRAINT fk_reimbursement_trip
    FOREIGN KEY (trip_id)
    REFERENCES trip(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_reimbursement_from_user
    FOREIGN KEY (from_user_id)
    REFERENCES user(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_reimbursement_to_user
    FOREIGN KEY (to_user_id)
    REFERENCES user(id)
    ON DELETE CASCADE,

  CONSTRAINT chk_reimbursement_different_users
    CHECK (from_user_id <> to_user_id),

  CONSTRAINT chk_reimbursement_positive_amount
    CHECK (amount > 0)
);

CREATE TABLE notification (
  id INT AUTO_INCREMENT PRIMARY KEY,

  user_id INT NOT NULL,
  trip_id INT NULL,

  type VARCHAR(50) NOT NULL,

  title VARCHAR(150) NOT NULL,
  message TEXT NOT NULL,

  emoji VARCHAR(10) NULL,

  context_label VARCHAR(255) NULL,

  reference_type VARCHAR(50) NULL,
  reference_id INT NULL,

  is_read BOOLEAN NOT NULL DEFAULT FALSE,

  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_notification_user
    FOREIGN KEY (user_id)
    REFERENCES user(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_notification_trip
    FOREIGN KEY (trip_id)
    REFERENCES trip(id)
    ON DELETE CASCADE,

  INDEX idx_notification_user_created_at (user_id, created_at),
  INDEX idx_notification_user_is_read (user_id, is_read)
);

CREATE TABLE password_reset_token (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token_hash VARCHAR(64) NOT NULL UNIQUE,
  expires_at DATETIME NOT NULL,
  used_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_password_reset_user
    FOREIGN KEY (user_id)
    REFERENCES user(id)
    ON DELETE CASCADE
);