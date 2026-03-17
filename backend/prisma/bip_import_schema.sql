-- BIP CSV import schema aligned to the approved activity sheets in /assets.
-- This is an import-oriented schema for raw and normalized ingestion.

-- =========================
-- 1) MASTER TABLES
-- =========================

CREATE TABLE departments (
  id                  BIGSERIAL PRIMARY KEY,
  code                VARCHAR(20) UNIQUE NOT NULL,
  name                VARCHAR(120) NOT NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE special_labs (
  id                  BIGSERIAL PRIMARY KEY,
  lab_code            VARCHAR(50) UNIQUE,
  lab_name            VARCHAR(200) NOT NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE roles (
  id                  BIGSERIAL PRIMARY KEY,
  role_code           VARCHAR(50) UNIQUE NOT NULL,
  role_name           VARCHAR(100) NOT NULL,
  description         TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE faculty (
  id                  BIGSERIAL PRIMARY KEY,
  faculty_code        VARCHAR(50) UNIQUE NOT NULL,
  full_name           VARCHAR(150) NOT NULL,
  department_id       BIGINT REFERENCES departments(id),
  source_department_text VARCHAR(150),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_faculty_department ON faculty(department_id);

CREATE TABLE faculty_roles (
  id                  BIGSERIAL PRIMARY KEY,
  faculty_id          BIGINT NOT NULL REFERENCES faculty(id) ON DELETE CASCADE,
  role_id             BIGINT NOT NULL REFERENCES roles(id),
  department_id       BIGINT REFERENCES departments(id),
  is_primary          BOOLEAN NOT NULL DEFAULT false,
  assigned_at         TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT uq_faculty_roles UNIQUE (faculty_id, role_id, department_id)
);

CREATE INDEX idx_faculty_roles_faculty     ON faculty_roles(faculty_id);
CREATE INDEX idx_faculty_roles_role        ON faculty_roles(role_id);
CREATE INDEX idx_faculty_roles_department  ON faculty_roles(department_id);

-- =========================
-- 2) COMMON SUBMISSION TABLE
-- =========================

CREATE TABLE submissions (
  id                      BIGSERIAL PRIMARY KEY,
  bip_id                  BIGINT NOT NULL,
  source_sheet            VARCHAR(80) NOT NULL,
  activity_type           VARCHAR(40) NOT NULL,
  faculty_id              BIGINT NOT NULL REFERENCES faculty(id),
  department_id           BIGINT REFERENCES departments(id),
  source_department_text  VARCHAR(150),
  claimed_department_id   BIGINT REFERENCES departments(id),
  claimed_department_text VARCHAR(150),
  apply_from              VARCHAR(40),
  task_id                 VARCHAR(80),
  iqac_status             VARCHAR(40),
  special_lab_involved    BOOLEAN,
  special_lab_id          BIGINT REFERENCES special_labs(id),
  special_lab_code        VARCHAR(50),
  special_lab_name        VARCHAR(200),
  start_date              DATE,
  end_date                DATE,
  duration_days           INT,
  duration_text           VARCHAR(80),
  level                   VARCHAR(80),
  mode                    VARCHAR(40),
  location                VARCHAR(200),
  event_organizer         VARCHAR(200),
  organizer_type          VARCHAR(120),
  industry                VARCHAR(200),
  claimed_for             VARCHAR(120),
  amount_rs               NUMERIC(12,2),
  sponsorship_type        VARCHAR(80),
  funding_agency          VARCHAR(200),
  management_funding_received BOOLEAN,
  management_amount_received NUMERIC(12,2),
  raw_payload             JSONB,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT uq_submissions_type_bip UNIQUE (activity_type, bip_id)
);

CREATE INDEX idx_submissions_faculty          ON submissions(faculty_id);
CREATE INDEX idx_submissions_department       ON submissions(department_id);
CREATE INDEX idx_submissions_claimed_dept     ON submissions(claimed_department_id);
CREATE INDEX idx_submissions_special_lab      ON submissions(special_lab_id);
CREATE INDEX idx_submissions_type             ON submissions(activity_type);
CREATE INDEX idx_submissions_iqac             ON submissions(iqac_status);
CREATE INDEX idx_submissions_dates            ON submissions(start_date, end_date);
CREATE INDEX idx_submissions_source_sheet     ON submissions(source_sheet);

-- =========================
-- 3) SHARED CHILD TABLES
-- =========================

CREATE TABLE submission_proofs (
  id                  BIGSERIAL PRIMARY KEY,
  submission_id       BIGINT NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  proof_type          VARCHAR(40) NOT NULL,
  source_column       VARCHAR(120) NOT NULL,
  proof_name          TEXT,
  proof_url           TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_submission_proofs_submission ON submission_proofs(submission_id);

CREATE TABLE submission_participants (
  id                  BIGSERIAL PRIMARY KEY,
  submission_id       BIGINT NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  participant_type    VARCHAR(40) NOT NULL,
  seq_no              SMALLINT,
  participant_code    VARCHAR(80),
  participant_name    VARCHAR(200),
  role_name           VARCHAR(80),
  organization        VARCHAR(200),
  organization_address TEXT,
  designation         VARCHAR(120),
  email               VARCHAR(150),
  contact_no          VARCHAR(30),
  year_of_study       VARCHAR(30),
  is_internal         BOOLEAN,
  additional_data     JSONB
);

CREATE INDEX idx_submission_participants_submission ON submission_participants(submission_id);
CREATE INDEX idx_submission_participants_type       ON submission_participants(participant_type);

-- =========================
-- 4) DETAIL TABLES
-- =========================

CREATE TABLE event_attended_details (
  id                      BIGSERIAL PRIMARY KEY,
  submission_id           BIGINT NOT NULL UNIQUE REFERENCES submissions(id) ON DELETE CASCADE,
  event_type              VARCHAR(80),
  event_type_other        VARCHAR(200),
  event_title             TEXT,
  event_organizer         VARCHAR(200),
  organizer_type          VARCHAR(120),
  other_organizer_name    VARCHAR(200),
  industry                VARCHAR(200),
  claimed_for             VARCHAR(120)
);

CREATE TABLE event_organized_details (
  id                                      BIGSERIAL PRIMARY KEY,
  submission_id                           BIGINT NOT NULL UNIQUE REFERENCES submissions(id) ON DELETE CASCADE,
  iic_flag                                BOOLEAN,
  iic_upload_flag                         BOOLEAN,
  iic_bip_id                              BIGINT,
  rnd_flag                                BOOLEAN,
  technical_society_flag                  BOOLEAN,
  technical_society_chapter               VARCHAR(200),
  event_name                              TEXT,
  program_type                            VARCHAR(80),
  club_or_society_name                    VARCHAR(200),
  event_type                              VARCHAR(120),
  event_category                          VARCHAR(120),
  event_description                       TEXT,
  jointly_organized_with                  VARCHAR(200),
  joint_organization_name                 VARCHAR(200),
  joint_organization_address              TEXT,
  internal_participants_student_count     INT,
  internal_participants_faculty_count     INT,
  external_participants_student_count     INT,
  external_participants_faculty_count     INT,
  invited_guest_details                   TEXT,
  resource_person_is_bit_alumni           BOOLEAN,
  registration_amount_collected_rs        NUMERIC(12,2),
  sponsored_amount_rs                     NUMERIC(12,2),
  revenue_generated_rs                    NUMERIC(12,2),
  conference_proceedings_available        BOOLEAN,
  proceedings_publisher_detail            VARCHAR(200),
  proceedings_published_year              INT,
  proceedings_volume_number               VARCHAR(40),
  proceedings_issue_number                VARCHAR(40),
  proceedings_page_number                 VARCHAR(80),
  proceedings_isbn_number                 VARCHAR(40),
  proceedings_indexing_detail             VARCHAR(200)
);

CREATE TABLE guest_lecture_details (
  id                        BIGSERIAL PRIMARY KEY,
  submission_id             BIGINT NOT NULL UNIQUE REFERENCES submissions(id) ON DELETE CASCADE,
  event_type                VARCHAR(80),
  topic                     TEXT,
  event_name                TEXT,
  organization_type         VARCHAR(120),
  organization_name         VARCHAR(200),
  organization_address      TEXT,
  audience_type             VARCHAR(120),
  audience_other            VARCHAR(200),
  participant_count         INT
);

CREATE TABLE online_course_details (
  id                        BIGSERIAL PRIMARY KEY,
  submission_id             BIGINT NOT NULL UNIQUE REFERENCES submissions(id) ON DELETE CASCADE,
  course_name               TEXT,
  course_type               VARCHAR(120),
  other_course_type         VARCHAR(120),
  course_category           VARCHAR(120),
  hours_count               INT,
  weeks_count               INT,
  days_count                INT,
  exam_date                 DATE,
  grade_obtained            VARCHAR(50),
  approved_fdp              BOOLEAN
);

CREATE TABLE paper_presentation_details (
  id                                BIGSERIAL PRIMARY KEY,
  submission_id                     BIGINT NOT NULL UNIQUE REFERENCES submissions(id) ON DELETE CASCADE,
  conference_name                   TEXT,
  paper_title                       TEXT,
  organizer_name                    VARCHAR(200),
  industry_or_organizer_name        VARCHAR(200),
  institute_and_location            VARCHAR(200),
  paper_in_proceedings              BOOLEAN,
  page_from                         VARCHAR(30),
  page_to                           VARCHAR(30),
  collaboration_international       BOOLEAN,
  international_institute_name      VARCHAR(200),
  industrial_person_involved        BOOLEAN,
  students_involved                 BOOLEAN,
  registration_amount_rs            NUMERIC(12,2),
  award_received                    BOOLEAN
);

CREATE TABLE patent_filed_details (
  id                                BIGSERIAL PRIMARY KEY,
  submission_id                     BIGINT NOT NULL UNIQUE REFERENCES submissions(id) ON DELETE CASCADE,
  patent_title                      TEXT,
  patent_type                       VARCHAR(120),
  registration_date                 DATE,
  application_no                    VARCHAR(120),
  collaboration_type                VARCHAR(120),
  institution_name_included         BOOLEAN,
  patent_level                      VARCHAR(80),
  form9_filed                       BOOLEAN,
  form18_filed                      BOOLEAN,
  other_faculties_text              TEXT,
  inventors_text                    TEXT,
  inventor_details_text             TEXT,
  patent_license_details            TEXT,
  funding_from_agency               BOOLEAN
);

CREATE TABLE patent_published_details (
  id                                BIGSERIAL PRIMARY KEY,
  submission_id                     BIGINT NOT NULL UNIQUE REFERENCES submissions(id) ON DELETE CASCADE,
  patent_title                      TEXT,
  patent_type                       VARCHAR(120),
  publication_date                  DATE,
  application_no                    VARCHAR(120),
  collaboration_type                VARCHAR(120),
  institution_name_included         BOOLEAN,
  patent_level                      VARCHAR(80),
  form9_filed                       BOOLEAN,
  form18_filed                      BOOLEAN,
  other_faculties_text              TEXT,
  inventors_text                    TEXT,
  inventor_details_text             TEXT,
  patent_license_details            TEXT,
  funding_from_agency               BOOLEAN
);

CREATE TABLE patent_granted_details (
  id                                BIGSERIAL PRIMARY KEY,
  submission_id                     BIGINT NOT NULL UNIQUE REFERENCES submissions(id) ON DELETE CASCADE,
  patent_title                      TEXT,
  patent_type                       VARCHAR(120),
  grant_date                        DATE,
  application_no                    VARCHAR(120),
  collaboration_type                VARCHAR(120),
  institution_name_included         BOOLEAN,
  patent_level                      VARCHAR(80),
  form9_filed                       BOOLEAN,
  form18_filed                      BOOLEAN,
  other_faculties_text              TEXT,
  inventors_text                    TEXT,
  inventor_details_text             TEXT,
  patent_license_details            TEXT,
  funding_from_agency               BOOLEAN
);

-- =========================
-- 5) OPTIONAL IMPORT AUDIT
-- =========================

CREATE TABLE import_batches (
  id                  BIGSERIAL PRIMARY KEY,
  source_name         VARCHAR(120) NOT NULL,
  source_file         VARCHAR(255) NOT NULL,
  row_count           INT,
  imported_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes               TEXT
);

ALTER TABLE submissions
  ADD COLUMN import_batch_id BIGINT REFERENCES import_batches(id);

CREATE INDEX idx_submissions_import_batch ON submissions(import_batch_id);
