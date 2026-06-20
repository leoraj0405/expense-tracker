-- Mock data for Expense Tracker (matches 001_create_tables.sql)
-- Run after 001: mysql -u root -p expenseTracker < migrations/002_seed_mock_data.sql
--
-- Demo logins (bcrypt-hashed passwords):
--   leo@example.com      / password123
--   jane@example.com     / 12345678
--   bob@example.com      / 12345678
--   parent@example.com   / 12345678  (parent account for child monitoring)

SET NAMES utf8mb4;
USE expenseTracker;

SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE group_expense_splits;
TRUNCATE TABLE group_expenses;
TRUNCATE TABLE group_members;
TRUNCATE TABLE expenses;
TRUNCATE TABLE `groups`;
TRUNCATE TABLE categories;
TRUNCATE TABLE users;

SET FOREIGN_KEY_CHECKS = 1;

-- Fixed UUIDs keep foreign keys stable across re-seeds
SET @now = NOW();

-- ---------------------------------------------------------------------------
-- users
-- password123  -> $2b$10$UY1cL9ACcbyT6C4i7G6cWuFw/4bzwWeGqmV7ZlTCxP7zbfxJ5wCHi
-- 12345678     -> $2b$10$Qd8Lq0CCtfgTh5rSdaccB.zVoRgxWScP5t.DXbqDp5fjwXHk/ayXG
-- ---------------------------------------------------------------------------
INSERT INTO users (
  id, name, email, password, parentOtp, parentEmail, otp,
  otpAttempt, blockTime, profileImage, createdAt, updatedAt, deletedAt
) VALUES
(
  'a1000000-0000-4000-8000-000000000001',
  'Leo Demo',
  'leo@example.com',
  '$2b$10$UY1cL9ACcbyT6C4i7G6cWuFw/4bzwWeGqmV7ZlTCxP7zbfxJ5wCHi',
  NULL, 'parent@example.com', NULL,
  NULL, NULL, NULL, @now, NULL, NULL
),
(
  'a1000000-0000-4000-8000-000000000002',
  'Jane Smith',
  'jane@example.com',
  '$2b$10$Qd8Lq0CCtfgTh5rSdaccB.zVoRgxWScP5t.DXbqDp5fjwXHk/ayXG',
  NULL, NULL, NULL,
  NULL, NULL, NULL, @now, NULL, NULL
),
(
  'a1000000-0000-4000-8000-000000000003',
  'Bob Wilson',
  'bob@example.com',
  '$2b$10$Qd8Lq0CCtfgTh5rSdaccB.zVoRgxWScP5t.DXbqDp5fjwXHk/ayXG',
  NULL, NULL, NULL,
  NULL, NULL, NULL, @now, NULL, NULL
),
(
  'a1000000-0000-4000-8000-000000000004',
  'Parent User',
  'parent@example.com',
  '$2b$10$Qd8Lq0CCtfgTh5rSdaccB.zVoRgxWScP5t.DXbqDp5fjwXHk/ayXG',
  'MOCK01', NULL, NULL,
  NULL, NULL, NULL, @now, NULL, NULL
);

-- ---------------------------------------------------------------------------
-- categories
-- ---------------------------------------------------------------------------
INSERT INTO categories (id, name, createdAt, updatedAt, deletedAt) VALUES
('c1000000-0000-4000-8000-000000000001', 'Food',         @now, NULL, NULL),
('c1000000-0000-4000-8000-000000000002', 'Transport',    @now, NULL, NULL),
('c1000000-0000-4000-8000-000000000003', 'Entertainment',@now, NULL, NULL),
('c1000000-0000-4000-8000-000000000004', 'Utilities',    @now, NULL, NULL),
('c1000000-0000-4000-8000-000000000005', 'Shopping',     @now, NULL, NULL);

-- ---------------------------------------------------------------------------
-- groups
-- ---------------------------------------------------------------------------
INSERT INTO `groups` (id, name, createdBy, createdAt, updatedAt, deletedAt) VALUES
(
  'g1000000-0000-4000-8000-000000000001',
  'Roommates',
  'a1000000-0000-4000-8000-000000000001',
  @now, NULL, NULL
),
(
  'g1000000-0000-4000-8000-000000000002',
  'Weekend Trip',
  'a1000000-0000-4000-8000-000000000002',
  @now, NULL, NULL
);

-- ---------------------------------------------------------------------------
-- group_members
-- ---------------------------------------------------------------------------
INSERT INTO group_members (id, groupId, userId, createdAt, updatedAt, deletedAt) VALUES
('m1000000-0000-4000-8000-000000000001', 'g1000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000001', @now, NULL, NULL),
('m1000000-0000-4000-8000-000000000002', 'g1000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000002', @now, NULL, NULL),
('m1000000-0000-4000-8000-000000000003', 'g1000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000003', @now, NULL, NULL),
('m1000000-0000-4000-8000-000000000004', 'g1000000-0000-4000-8000-000000000002', 'a1000000-0000-4000-8000-000000000002', @now, NULL, NULL),
('m1000000-0000-4000-8000-000000000005', 'g1000000-0000-4000-8000-000000000002', 'a1000000-0000-4000-8000-000000000003', @now, NULL, NULL);

-- ---------------------------------------------------------------------------
-- personal expenses
-- ---------------------------------------------------------------------------
INSERT INTO expenses (
  id, description, userId, categoryId, amount, date, createdAt, updatedAt, deletedAt
) VALUES
(
  'e1000000-0000-4000-8000-000000000001',
  'Grocery run',
  'a1000000-0000-4000-8000-000000000001',
  'c1000000-0000-4000-8000-000000000001',
  85.50,
  DATE_SUB(@now, INTERVAL 3 DAY),
  @now, NULL, NULL
),
(
  'e1000000-0000-4000-8000-000000000002',
  'Bus pass',
  'a1000000-0000-4000-8000-000000000001',
  'c1000000-0000-4000-8000-000000000002',
  45.00,
  DATE_SUB(@now, INTERVAL 10 DAY),
  @now, NULL, NULL
),
(
  'e1000000-0000-4000-8000-000000000003',
  'Movie night',
  'a1000000-0000-4000-8000-000000000002',
  'c1000000-0000-4000-8000-000000000003',
  32.00,
  DATE_SUB(@now, INTERVAL 1 DAY),
  @now, NULL, NULL
),
(
  'e1000000-0000-4000-8000-000000000004',
  'Electric bill',
  'a1000000-0000-4000-8000-000000000003',
  'c1000000-0000-4000-8000-000000000004',
  120.00,
  DATE_SUB(@now, INTERVAL 5 DAY),
  @now, NULL, NULL
);

-- ---------------------------------------------------------------------------
-- group expenses
-- ---------------------------------------------------------------------------
INSERT INTO group_expenses (
  id, groupId, description, amount, userId, categoryId, createdAt, updatedAt, deletedAt
) VALUES
(
  'ge100000-0000-4000-8000-000000000001',
  'g1000000-0000-4000-8000-000000000001',
  'Shared dinner',
  90.00,
  'a1000000-0000-4000-8000-000000000001',
  'c1000000-0000-4000-8000-000000000001',
  @now, NULL, NULL
),
(
  'ge100000-0000-4000-8000-000000000002',
  'g1000000-0000-4000-8000-000000000001',
  'Internet bill',
  60.00,
  'a1000000-0000-4000-8000-000000000002',
  'c1000000-0000-4000-8000-000000000004',
  @now, NULL, NULL
),
(
  'ge100000-0000-4000-8000-000000000003',
  'g1000000-0000-4000-8000-000000000002',
  'Hotel booking',
  240.00,
  'a1000000-0000-4000-8000-000000000002',
  'c1000000-0000-4000-8000-000000000005',
  @now, NULL, NULL
);

-- ---------------------------------------------------------------------------
-- group expense splits
-- equal split: Shared dinner 90 / 3 = 30 each
-- equal split: Internet bill 60 / 3 = 20 each
-- unequal split: Hotel 140 + 100 between Jane and Bob
-- ---------------------------------------------------------------------------
INSERT INTO group_expense_splits (
  id, groupExpenseId, memberId, share, splitType, isSettle, createdAt, updatedAt, deletedAt
) VALUES
-- Shared dinner (equal)
('s1000000-0000-4000-8000-000000000001', 'ge100000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000001', 30.00, 'equal', 0, @now, NULL, NULL),
('s1000000-0000-4000-8000-000000000002', 'ge100000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000002', 30.00, 'equal', 0, @now, NULL, NULL),
('s1000000-0000-4000-8000-000000000003', 'ge100000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000003', 30.00, 'equal', 0, @now, NULL, NULL),
-- Internet bill (equal)
('s1000000-0000-4000-8000-000000000004', 'ge100000-0000-4000-8000-000000000002', 'a1000000-0000-4000-8000-000000000001', 20.00, 'equal', 0, @now, NULL, NULL),
('s1000000-0000-4000-8000-000000000005', 'ge100000-0000-4000-8000-000000000002', 'a1000000-0000-4000-8000-000000000002', 20.00, 'equal', 1, @now, NULL, NULL),
('s1000000-0000-4000-8000-000000000006', 'ge100000-0000-4000-8000-000000000002', 'a1000000-0000-4000-8000-000000000003', 20.00, 'equal', 0, @now, NULL, NULL),
-- Hotel booking (unequal)
('s1000000-0000-4000-8000-000000000007', 'ge100000-0000-4000-8000-000000000003', 'a1000000-0000-4000-8000-000000000002', 140.00, 'unequal', 0, @now, NULL, NULL),
('s1000000-0000-4000-8000-000000000008', 'ge100000-0000-4000-8000-000000000003', 'a1000000-0000-4000-8000-000000000003', 100.00, 'unequal', 0, @now, NULL, NULL);
