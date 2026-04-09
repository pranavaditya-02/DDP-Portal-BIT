# Users Table Structure & Join Patterns Analysis

## 1. Users Table DDL

**Location:** Database dump (Dump20260319.sql)

```sql
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(100) NOT NULL,
  `email` varchar(200) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `faculty_id` varchar(50) DEFAULT NULL COMMENT 'Optional link for faculty user accounts',
  `role_id` int NOT NULL COMMENT 'Assigned role for page/resource access',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `faculty_id` (`faculty_id`),
  KEY `fk_3` (`role_id`),
  CONSTRAINT `fk_1` FOREIGN KEY (`faculty_id`) REFERENCES `faculty` (`id`),
  CONSTRAINT `fk_3` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
```

### Users Table Columns
| Column | Type | Notes |
|--------|------|-------|
| `id` | INT (PK) | Auto-increment primary key |
| `username` | VARCHAR(100) UNIQUE | Login username |
| `email` | VARCHAR(200) UNIQUE | User email address |
| `password_hash` | VARCHAR(255) | Hashed password |
| `faculty_id` | VARCHAR(50) NULLABLE | **FK to faculty table** - Links to faculty records |
| `role_id` | INT | **FK to roles table** - User role assignment |
| `is_active` | TINYINT(1) | Active status (0/1) |
| `created_at` | TIMESTAMP | Record creation timestamp |
| `updated_at` | TIMESTAMP | Record update timestamp |

**Key Finding:** ⚠️ The `users` table does NOT have a `student_id` column. It only has `faculty_id`.

---

## 2. Related Table Structures

### 2.1 Faculty Table

```sql
CREATE TABLE `faculty` (
  `id` varchar(50) NOT NULL,  -- PK (format: like "AD10543", "CS10025")
  `salutation` varchar(10) NOT NULL,
  `name` varchar(200) NOT NULL,
  `designation_id` varchar(60) NOT NULL,
  `department_id` int DEFAULT NULL,
  `email` varchar(200) DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_1` (`department_id`),
  CONSTRAINT `fk_1` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
```

**Key:** `users.faculty_id` → `faculty.id` (VARCHAR matching)

---

### 2.2 Student Paper Presentations Table

**Location:** `backend/migrations/005_create_student_paper_presentations_table.sql`

```sql
CREATE TABLE IF NOT EXISTS student_paper_presentations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id VARCHAR(50) NOT NULL,           -- ← Links to student records
  student_name VARCHAR(255) NOT NULL,
  paper_title VARCHAR(500) NOT NULL,
  event_start_date DATE NOT NULL,
  event_end_date DATE NOT NULL,
  is_academic_project_outcome VARCHAR(10) NOT NULL,
  image_proof_path VARCHAR(500),
  abstract_proof_path VARCHAR(500),
  certificate_proof_path VARCHAR(500),
  attested_certificate_path VARCHAR(500),
  status VARCHAR(50) NOT NULL,
  iqac_verification VARCHAR(50) DEFAULT 'initiated',
  iqac_rejection_remarks TEXT,
  parental_department_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by VARCHAR(50),
  
  INDEX idx_student_id (student_id),
  INDEX idx_status (status),
  INDEX idx_iqac_verification (iqac_verification),
  INDEX idx_created_at (created_at),
  CONSTRAINT fk_student_paper_presentations_dept FOREIGN KEY (parental_department_id) 
    REFERENCES departments(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Important:** `student_id` is VARCHAR(50) - a string identifier (format: like "T193259", "DUMMY001")

---

### 2.3 Dummy Students Table

**Location:** `database/dummy_students.sql`

```sql
CREATE TABLE dummy_students (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id VARCHAR(50) NOT NULL UNIQUE,      -- ← Matches student_paper_presentations.student_id
  student_name VARCHAR(255) NOT NULL,
  student_email VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 2.4 Event Registrations Table

**Location:** `backend/migrations/002_create_event_registrations_table.sql`

```sql
CREATE TABLE IF NOT EXISTS event_registrations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  event_id INT NOT NULL,
  student_id INT NULL COMMENT 'User id from auth token when available',
  student_name VARCHAR(255) NOT NULL COMMENT 'Display name of student',
  student_email VARCHAR(255) NULL COMMENT 'Email from auth token when available',
  student_department VARCHAR(150) NULL COMMENT 'Department label if provided',
  -- ... other fields
  
  INDEX `idx_event_registrations_student_id` (`student_id`),
  -- Note: student_id here is INT, NOT VARCHAR like in other student tables!
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 3. Current Join Patterns Found in Codebase

### 3.1 Student Paper Presentation Service - Problematic Join

**File:** `backend/src/services/studentPaperPresentation.service.ts` (Line 194)

```typescript
const query = `
  SELECT spp.*, u.email as student_email
  FROM student_paper_presentations spp
  LEFT JOIN users u ON spp.student_id = u.student_id
  WHERE spp.id = ?
`;
```

**⚠️ PROBLEM:** This join is incorrect!
- `spp.student_id` is VARCHAR(50) (like "T193259")
- `users` table has NO `student_id` column
- `users` table only has `faculty_id` and `id` columns
- **This query will never return any matches**

---

### 3.2 Event Registrations Service - Correct Join Pattern

**File:** `backend/src/services/registration.service.ts` (Lines 271, 313)

```typescript
const query = `
  SELECT
    er.id, er.event_id, er.student_id, er.student_name, er.student_email,
    em.event_name, em.event_code, em.event_organizer, em.event_level
  FROM event_registrations er
  INNER JOIN event_master em ON em.id = er.event_id
  WHERE ${where}
`;
```

**Pattern:** Table-to-table join using foreign key relationship
- `event_registrations.event_id` (INT) → `event_master.id` (INT)

---

## 4. Key Issues Identified

### 4.1 Missing Student-to-Users Linking
The current schema has **no mechanism to link student records to the users table**.

**Current Architecture:**
```
users (faculty-focused)
  ├── faculty_id → faculty table
  ├── id (user ID)
  └── role_id → roles table

Student Records (not linked to users):
  ├── student_paper_presentations.student_id (VARCHAR "T193259")
  ├── event_registrations.student_id (INT)
  └── dummy_students.student_id (VARCHAR "DUMMY001")
```

### 4.2 Inconsistent student_id Types
- `student_paper_presentations.student_id` → VARCHAR(50)
- `event_registrations.student_id` → INT
- `dummy_students.student_id` → VARCHAR(50)
- No consistency across tables!

---

## 5. Recommended Join Patterns for Student Records

### 5.1 For Faculty Users (CURRENT - WORKS)
```sql
-- Get faculty with their user account
SELECT u.*, f.name, f.email
FROM users u
LEFT JOIN faculty f ON u.faculty_id = f.id
WHERE u.role_id = 2;  -- Faculty role
```

---

### 5.2 For Student Paper Presentations (NEEDS FIX)

**Current (BROKEN):**
```sql
SELECT spp.*, u.email as student_email
FROM student_paper_presentations spp
LEFT JOIN users u ON spp.student_id = u.student_id  -- ❌ NO student_id in users!
WHERE spp.id = ?;
```

**Corrected (if you create a student_id column in users):**
```sql
SELECT spp.*, u.email as student_email, u.role_id
FROM student_paper_presentations spp
LEFT JOIN users u ON spp.student_id = u.student_id  -- ✅ After adding column
WHERE spp.id = ?;
```

**Corrected (using dummy_students as intermediate):**
```sql
SELECT spp.*, ds.student_email, u.id as user_id, u.email
FROM student_paper_presentations spp
LEFT JOIN dummy_students ds ON spp.student_id = ds.student_id
LEFT JOIN users u ON ds.student_email = u.email  -- Join via email
WHERE spp.id = ?;
```

---

### 5.3 For Event Registrations (NO JOIN NEEDED)
```sql
-- Event registrations already contains student_id and student_email
SELECT er.*, em.event_name, em.event_code
FROM event_registrations er
INNER JOIN event_master em ON em.id = er.event_id
WHERE er.student_id = ? AND er.status = 'approved';
```

---

## 6. Migration Recommendation

To properly link students to users table, add a `student_id` column:

```sql
ALTER TABLE users ADD COLUMN student_id VARCHAR(50) UNIQUE DEFAULT NULL;

-- Add foreign key constraint (optional, depends on student table existence)
-- ALTER TABLE users ADD CONSTRAINT fk_users_student 
--   FOREIGN KEY (student_id) REFERENCES dummy_students(student_id);

-- Create index for faster lookups
CREATE INDEX idx_users_student_id ON users(student_id);
```

---

## 7. Summary Table: Column Mapping

| Component | Primary ID | Links To | Join Key | Type |
|-----------|-----------|----------|----------|------|
| **users** | `id` (INT) | Faculty | `faculty_id` → `faculty.id` | FK |
| **users** | *missing* | Students | *NO LINK* | ❌ |
| **faculty** | `id` (VARCHAR) | Users | ← `users.faculty_id` | FK |
| **student_paper_presentations** | `id` (INT) | Students | `student_id` (VARCHAR) | No FK |
| **event_registrations** | `id` (INT) | Students | `student_id` (INT) | No FK |
| **dummy_students** | `id` (INT) | Records | `student_id` (VARCHAR) | Unique |

---

## 8. Affected Service Files

Services attempting to join with users table:
- ✅ `studentPaperPresentation.service.ts` - **BROKEN JOIN** (needs fixing)
- ✅ `auth.service.ts` - Works for faculty only
- ✅ `registration.service.ts` - Doesn't use users table (correct)
- ✅ `departments.service.ts` - No joins with users
- ✅ `activity.service.ts` - No database queries (Prisma disabled)

---

## Conclusion

**Main Finding:** The database schema currently supports faculty-to-users linking but has NO mechanism for student-to-users linking. To properly join student records with user accounts, you need to either:

1. **Add `student_id` column to `users` table** (recommended)
2. **Use an intermediate table** (dummy_students or create a proper students table)
3. **Join via email** (fragile, not recommended)

