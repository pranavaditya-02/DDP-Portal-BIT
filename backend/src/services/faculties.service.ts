import { getMysqlPool } from "../database/mysql";
import { logger } from "../utils/logger";
import { RowDataPacket } from "mysql2";

export interface Faculty {
  id: string;
  name: string | null;
  email: string | null;
  department_id: number | null;
}

class FacultiesService {
  async getAllFaculties(): Promise<Faculty[]> {
    const pool = getMysqlPool();
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT id, name, email, department_id FROM faculty ORDER BY name ASC LIMIT 1000`
    );
    return rows as Faculty[];
  }

  async searchFaculties(q?: string): Promise<Faculty[]> {
    const pool = getMysqlPool();
    const params: string[] = [];
    let where = "";
    if (q && q.trim().length > 0) {
      const like = `%${q.toLowerCase()}%`;
      where = "WHERE LOWER(name) LIKE ? OR LOWER(id) LIKE ? OR LOWER(email) LIKE ?";
      params.push(like, like, like);
    }
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT id, name, email, department_id FROM faculty ${where} ORDER BY name ASC LIMIT 500`,
      params,
    );
    return rows as Faculty[];
  }
}

export default new FacultiesService();
