-- Expense Tracker schema (matches TypeORM entities in src/entities)
-- Run: mysql -u root -p expenseTracker < migrations/001_create_tables.sql

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE DATABASE IF NOT EXISTS expenseTracker
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE expenseTracker;

DROP TABLE IF EXISTS group_expense_splits;
DROP TABLE IF EXISTS group_expenses;
DROP TABLE IF EXISTS group_members;
DROP TABLE IF EXISTS expenses;
DROP TABLE IF EXISTS `groups`;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;

-- ---------------------------------------------------------------------------
-- users
-- ---------------------------------------------------------------------------
CREATE TABLE users (
  id            VARCHAR(36)  NOT NULL,
  name          VARCHAR(255) NULL,
  email         VARCHAR(255) NOT NULL,
  password      VARCHAR(255) NOT NULL,
  parentOtp     VARCHAR(255) NULL,
  parentEmail   VARCHAR(255) NULL,
  otp           VARCHAR(255) NULL,
  otpAttempt    INT          NULL,
  blockTime     DATETIME     NULL,
  profileImage  VARCHAR(255) NULL,
  createdAt     DATETIME     NULL,
  updatedAt     DATETIME     NULL,
  deletedAt     DATETIME     NULL,
  PRIMARY KEY (id),
  UNIQUE KEY UQ_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- categories
-- ---------------------------------------------------------------------------
CREATE TABLE categories (
  id         VARCHAR(36)  NOT NULL,
  name       VARCHAR(255) NOT NULL,
  createdAt  DATETIME     NULL,
  updatedAt  DATETIME     NULL,
  deletedAt  DATETIME     NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- groups
-- ---------------------------------------------------------------------------
CREATE TABLE `groups` (
  id         VARCHAR(36)  NOT NULL,
  name       VARCHAR(255) NOT NULL,
  createdBy  VARCHAR(36)  NOT NULL,
  createdAt  DATETIME     NULL,
  updatedAt  DATETIME     NULL,
  deletedAt  DATETIME     NULL,
  PRIMARY KEY (id),
  KEY IDX_groups_createdBy (createdBy),
  CONSTRAINT FK_groups_createdBy
    FOREIGN KEY (createdBy) REFERENCES users (id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- expenses
-- ---------------------------------------------------------------------------
CREATE TABLE expenses (
  id          VARCHAR(36)     NOT NULL,
  description VARCHAR(255)    NOT NULL,
  userId      VARCHAR(36)     NOT NULL,
  categoryId  VARCHAR(36)     NOT NULL,
  amount      DECIMAL(12, 2)  NOT NULL,
  date        DATETIME        NOT NULL,
  createdAt   DATETIME        NULL,
  updatedAt   DATETIME        NULL,
  deletedAt   DATETIME        NULL,
  PRIMARY KEY (id),
  KEY IDX_expenses_userId (userId),
  KEY IDX_expenses_categoryId (categoryId),
  KEY IDX_expenses_date (date),
  CONSTRAINT FK_expenses_userId
    FOREIGN KEY (userId) REFERENCES users (id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT FK_expenses_categoryId
    FOREIGN KEY (categoryId) REFERENCES categories (id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- group_members
-- ---------------------------------------------------------------------------
CREATE TABLE group_members (
  id         VARCHAR(36) NOT NULL,
  groupId    VARCHAR(36) NOT NULL,
  userId     VARCHAR(36) NOT NULL,
  createdAt  DATETIME    NULL,
  updatedAt  DATETIME    NULL,
  deletedAt  DATETIME    NULL,
  PRIMARY KEY (id),
  UNIQUE KEY UQ_group_members_group_user (groupId, userId),
  KEY IDX_group_members_userId (userId),
  CONSTRAINT FK_group_members_groupId
    FOREIGN KEY (groupId) REFERENCES `groups` (id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT FK_group_members_userId
    FOREIGN KEY (userId) REFERENCES users (id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- group_expenses
-- ---------------------------------------------------------------------------
CREATE TABLE group_expenses (
  id          VARCHAR(36)     NOT NULL,
  groupId     VARCHAR(36)     NOT NULL,
  description VARCHAR(255)    NOT NULL,
  amount      DECIMAL(12, 2)  NOT NULL,
  userId      VARCHAR(36)     NOT NULL,
  categoryId  VARCHAR(36)     NOT NULL,
  createdAt   DATETIME        NULL,
  updatedAt   DATETIME        NULL,
  deletedAt   DATETIME        NULL,
  PRIMARY KEY (id),
  KEY IDX_group_expenses_groupId (groupId),
  KEY IDX_group_expenses_userId (userId),
  KEY IDX_group_expenses_categoryId (categoryId),
  CONSTRAINT FK_group_expenses_groupId
    FOREIGN KEY (groupId) REFERENCES `groups` (id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT FK_group_expenses_userId
    FOREIGN KEY (userId) REFERENCES users (id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT FK_group_expenses_categoryId
    FOREIGN KEY (categoryId) REFERENCES categories (id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- group_expense_splits
-- ---------------------------------------------------------------------------
CREATE TABLE group_expense_splits (
  id              VARCHAR(36)     NOT NULL,
  groupExpenseId  VARCHAR(36)     NOT NULL,
  memberId        VARCHAR(36)     NOT NULL,
  share           DECIMAL(12, 2)  NOT NULL,
  splitType       ENUM('equal', 'unequal') NOT NULL,
  isSettle        TINYINT(1)      NOT NULL DEFAULT 0,
  createdAt       DATETIME        NULL,
  updatedAt       DATETIME        NULL,
  deletedAt       DATETIME        NULL,
  PRIMARY KEY (id),
  KEY IDX_group_expense_splits_groupExpenseId (groupExpenseId),
  KEY IDX_group_expense_splits_memberId (memberId),
  CONSTRAINT FK_group_expense_splits_groupExpenseId
    FOREIGN KEY (groupExpenseId) REFERENCES group_expenses (id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT FK_group_expense_splits_memberId
    FOREIGN KEY (memberId) REFERENCES users (id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
