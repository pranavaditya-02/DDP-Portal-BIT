import type { PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import getMysqlPool from '../database/mysql';

interface CsvRow {
  [key: string]: string;
}

interface ImportSummary {
  processedRows: number;
  insertedSubmissions: number;
  insertedEvents: number;
  insertedDocuments: number;
  insertedIndustries: number;
  skippedRows: number;
  warnings: string[];
}

interface LookupMaps {
  iqacStatus: Map<string, number>;
  eventType: Map<string, number>;
  eventLevel: Map<string, number>;
  eventMode: Map<string, number>;
  organizerType: Map<string, number>;
  sponsorshipType: Map<string, number>;
  docType: Map<string, number>;
  industries: Map<string, number>;
}

const EXPECTED_HEADERS = [
  'BIP ID',
  'Faculty ID',
  'Task ID',
  'Special Lab Involved',
  'Special Lab Id',
  'Event Type',
  'If Others Please Specify',
  'Event Level',
  'Event Title',
  'Event Organizer',
  'event Mode',
  'Event Location',
  'Start Date',
  'End Date',
  'Event Duration',
  'Organizer Type',
  'Industry',
  'Other Organizer Name',
  'Type of Sponsorship',
  'Name of the Funding Agency If Others',
  'Amount in Rs.',
  'IQAC Verification',
  'Apex Proof',
  'certificate_proof',
] as const;

const normalizeKey = (value: string): string => value.trim().toLowerCase();

const parseCsvText = (content: string): CsvRow[] => {
  const source = content.replace(/^\uFEFF/, '');
  const lines = source
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter((line) => line.length > 0);

  if (lines.length < 2) {
    return [];
  }

  const headerLine = lines[0];
  const delimiter = detectDelimiter(headerLine);
  const headers = parseDelimitedLine(headerLine, delimiter);

  const rows: CsvRow[] = [];
  for (let i = 1; i < lines.length; i += 1) {
    const values = parseDelimitedLine(lines[i], delimiter);
    const row: CsvRow = {};
    for (let j = 0; j < headers.length; j += 1) {
      row[headers[j]] = values[j] ?? '';
    }
    rows.push(row);
  }

  return rows;
};

const detectDelimiter = (headerLine: string): string => {
  const delimiters = ['\t', ',', ';'];
  let selected = ',';
  let count = -1;

  for (const delimiter of delimiters) {
    const c = headerLine.split(delimiter).length;
    if (c > count) {
      selected = delimiter;
      count = c;
    }
  }

  return selected;
};

const parseDelimitedLine = (line: string, delimiter: string): string[] => {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];

    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (!inQuotes && ch === delimiter) {
      values.push(current.trim());
      current = '';
      continue;
    }

    current += ch;
  }

  values.push(current.trim());
  return values;
};

const toDateSql = (value: string): string | null => {
  const raw = value.trim();
  if (!raw) {
    return null;
  }

  const dmy = raw.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (dmy) {
    return `${dmy[3]}-${dmy[2]}-${dmy[1]}`;
  }

  const ymd = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (ymd) {
    return raw;
  }

  return null;
};

const toNumber = (value: string): number | null => {
  const clean = value.trim().replace(/,/g, '');
  if (!clean) {
    return null;
  }

  const parsed = Number(clean);
  return Number.isFinite(parsed) ? parsed : null;
};

const cleanText = (value: string): string | null => {
  const clean = value.trim();
  if (!clean) {
    return null;
  }

  const upper = clean.toUpperCase();
  if (upper === 'NIL' || upper === 'NULL') {
    return null;
  }

  return clean;
};

const ensureHeaders = (rows: CsvRow[]): void => {
  if (rows.length === 0) {
    throw new Error('CSV is empty or has only a header row.');
  }

  const available = new Set(Object.keys(rows[0]).map(normalizeKey));
  const missing = EXPECTED_HEADERS.filter((header) => !available.has(normalizeKey(header)));

  if (missing.length > 0) {
    throw new Error(`CSV is missing required headers: ${missing.join(', ')}`);
  }
};

const loadLookupMap = async (
  connection: PoolConnection,
  tableName: string,
): Promise<Map<string, number>> => {
  const [rows] = await connection.query<RowDataPacket[]>(
    `SELECT id, label FROM ${tableName}`,
  );

  const map = new Map<string, number>();
  for (const row of rows) {
    map.set(normalizeKey(String(row.label)), Number(row.id));
  }
  return map;
};

const loadIndustryMap = async (connection: PoolConnection): Promise<Map<string, number>> => {
  const [rows] = await connection.query<RowDataPacket[]>(
    'SELECT id, industry_name FROM industries',
  );

  const map = new Map<string, number>();
  for (const row of rows) {
    map.set(normalizeKey(String(row.industry_name)), Number(row.id));
  }
  return map;
};

const getOrCreateIndustry = async (
  connection: PoolConnection,
  lookups: LookupMaps,
  industryName: string,
): Promise<{ id: number; inserted: boolean }> => {
  const key = normalizeKey(industryName);
  const existing = lookups.industries.get(key);
  if (existing) {
    return { id: existing, inserted: false };
  }

  const [result] = await connection.execute<ResultSetHeader>(
    'INSERT INTO industries (industry_name) VALUES (?)',
    [industryName],
  );

  const id = Number(result.insertId);
  lookups.industries.set(key, id);
  return { id, inserted: true };
};

const getOrCreateSubmission = async (
  connection: PoolConnection,
  taskId: string | null,
  facultyId: string,
  iqacId: number | null,
  bipId: string | null,
): Promise<{ id: number; inserted: boolean }> => {
  if (taskId) {
    const [existing] = await connection.execute<RowDataPacket[]>(
      'SELECT id FROM submissions WHERE task_id = ? LIMIT 1',
      [taskId],
    );

    if (existing.length > 0) {
      return { id: Number(existing[0].id), inserted: false };
    }
  }

  const [insertResult] = await connection.execute<ResultSetHeader>(
    `INSERT INTO submissions (
      task_id,
      remarks,
      activity_type,
      faculty_id,
      iqac_verification_id,
      created_at,
      updated_at
    ) VALUES (?, ?, 'events_attended', ?, ?, NOW(), NOW())`,
    [taskId, bipId ? `Migrated from BIP ID ${bipId}` : 'Migrated from CSV import', facultyId, iqacId],
  );

  return { id: Number(insertResult.insertId), inserted: true };
};

const getOrCreateDocument = async (
  connection: PoolConnection,
  docTypeId: number,
  filePath: string,
): Promise<{ id: number; inserted: boolean }> => {
  const [existing] = await connection.execute<RowDataPacket[]>(
    'SELECT id FROM documents WHERE doc_type_id = ? AND file_path = ? LIMIT 1',
    [docTypeId, filePath],
  );

  if (existing.length > 0) {
    return { id: Number(existing[0].id), inserted: false };
  }

  const [insertResult] = await connection.execute<ResultSetHeader>(
    'INSERT INTO documents (doc_type_id, file_path, uploaded_at) VALUES (?, ?, NOW())',
    [docTypeId, filePath],
  );

  return { id: Number(insertResult.insertId), inserted: true };
};

export class EventsAttendedImportService {
  async importFromCsv(csvContent: string): Promise<ImportSummary> {
    const rows = parseCsvText(csvContent);
    ensureHeaders(rows);

    const summary: ImportSummary = {
      processedRows: 0,
      insertedSubmissions: 0,
      insertedEvents: 0,
      insertedDocuments: 0,
      insertedIndustries: 0,
      skippedRows: 0,
      warnings: [],
    };

    const connection = await getMysqlPool().getConnection();

    try {
      await connection.beginTransaction();

      const lookups: LookupMaps = {
        iqacStatus: await loadLookupMap(connection, 'ref_iqac_status'),
        eventType: await loadLookupMap(connection, 'ref_event_type_attended'),
        eventLevel: await loadLookupMap(connection, 'ref_event_level'),
        eventMode: await loadLookupMap(connection, 'ref_event_mode'),
        organizerType: await loadLookupMap(connection, 'ref_organizer_type'),
        sponsorshipType: await loadLookupMap(connection, 'ref_sponsorship_type'),
        docType: await loadLookupMap(connection, 'ref_doc_type'),
        industries: await loadIndustryMap(connection),
      };

      const apexDocTypeId = lookups.docType.get('apex_proof');
      const certificateDocTypeId = lookups.docType.get('certificate_proof');

      if (!apexDocTypeId || !certificateDocTypeId) {
        throw new Error('ref_doc_type must contain apex_proof and certificate_proof values.');
      }

      for (const row of rows) {
        summary.processedRows += 1;

        const taskId = cleanText(row['Task ID'] ?? '') ?? null;
        const facultyId = cleanText(row['Faculty ID'] ?? '');
        if (!facultyId) {
          summary.skippedRows += 1;
          summary.warnings.push(`Row ${summary.processedRows}: skipped due to missing Faculty ID.`);
          continue;
        }

        const iqacLabel = normalizeKey(row['IQAC Verification'] ?? '');
        const iqacId = lookups.iqacStatus.get(iqacLabel) ?? null;

        const submission = await getOrCreateSubmission(
          connection,
          taskId,
          facultyId,
          iqacId,
          cleanText(row['BIP ID'] ?? ''),
        );
        if (submission.inserted) {
          summary.insertedSubmissions += 1;
        }

        const [existingEvent] = await connection.execute<RowDataPacket[]>(
          'SELECT id FROM events_attended WHERE submission_id = ? LIMIT 1',
          [submission.id],
        );

        if (existingEvent.length > 0) {
          summary.skippedRows += 1;
          summary.warnings.push(`Row ${summary.processedRows}: submission already has events_attended entry (task ${taskId}).`);
          continue;
        }

        const industryName = cleanText(row['Industry'] ?? '');
        let industryId: number | null = null;
        if (industryName) {
          const industry = await getOrCreateIndustry(connection, lookups, industryName);
          industryId = industry.id;
          if (industry.inserted) {
            summary.insertedIndustries += 1;
          }
        }

        let apexProofId: number | null = null;
        const apexProofUrl = cleanText(row['Apex Proof'] ?? '');
        if (apexProofUrl) {
          const doc = await getOrCreateDocument(connection, apexDocTypeId, apexProofUrl);
          apexProofId = doc.id;
          if (doc.inserted) {
            summary.insertedDocuments += 1;
          }
        }

        let certificateProofId: number | null = null;
        const certificateProofUrl = cleanText(row['certificate_proof'] ?? '');
        if (certificateProofUrl) {
          const doc = await getOrCreateDocument(connection, certificateDocTypeId, certificateProofUrl);
          certificateProofId = doc.id;
          if (doc.inserted) {
            summary.insertedDocuments += 1;
          }
        }

        const specialLabInvolved = normalizeKey(row['Special Lab Involved'] ?? '') === 'yes' ? 1 : 0;
        const specialLabIdRaw = toNumber(row['Special Lab Id'] ?? '');
        const specialLabId = specialLabIdRaw !== null ? Math.trunc(specialLabIdRaw) : null;

        const eventTypeId = lookups.eventType.get(normalizeKey(row['Event Type'] ?? '')) ?? null;
        const eventLevelId = lookups.eventLevel.get(normalizeKey(row['Event Level'] ?? '')) ?? null;
        const eventModeId = lookups.eventMode.get(normalizeKey(row['event Mode'] ?? '')) ?? null;
        const organizerTypeId = lookups.organizerType.get(normalizeKey(row['Organizer Type'] ?? '')) ?? null;
        const sponsorshipTypeId = lookups.sponsorshipType.get(normalizeKey(row['Type of Sponsorship'] ?? '')) ?? null;

        if (!eventTypeId) {
          summary.warnings.push(`Row ${summary.processedRows}: Event Type not found -> ${row['Event Type']}`);
        }
        if (!eventLevelId) {
          summary.warnings.push(`Row ${summary.processedRows}: Event Level not found -> ${row['Event Level']}`);
        }
        if (!eventModeId) {
          summary.warnings.push(`Row ${summary.processedRows}: Event Mode not found -> ${row['event Mode']}`);
        }

        await connection.execute(
          `INSERT INTO events_attended (
            submission_id,
            special_labs_involved,
            special_lab_id,
            event_type_id,
            if_event_type_others,
            topic_name,
            organizer_type_id,
            industry_id,
            event_level_id,
            event_title,
            event_organizer,
            event_mode_id,
            event_location,
            event_date_from,
            event_date_to,
            duration_days,
            other_organizer_name,
            sponsorship_type_id,
            funding_agency_name,
            amount_inrs,
            apex_proof_id,
            certificate_proof_id
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)` ,
          [
            submission.id,
            specialLabInvolved,
            specialLabId,
            eventTypeId,
            cleanText(row['If Others Please Specify'] ?? ''),
            cleanText(row['Event Title'] ?? ''),
            organizerTypeId,
            industryId,
            eventLevelId,
            cleanText(row['Event Title'] ?? ''),
            cleanText(row['Event Organizer'] ?? ''),
            eventModeId,
            cleanText(row['Event Location'] ?? ''),
            toDateSql(row['Start Date'] ?? ''),
            toDateSql(row['End Date'] ?? ''),
            toNumber(row['Event Duration'] ?? ''),
            cleanText(row['Other Organizer Name'] ?? ''),
            sponsorshipTypeId,
            cleanText(row['Name of the Funding Agency If Others'] ?? ''),
            toNumber(row['Amount in Rs.'] ?? ''),
            apexProofId,
            certificateProofId,
          ],
        );

        summary.insertedEvents += 1;
      }

      await connection.commit();
      return summary;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

export default new EventsAttendedImportService();
