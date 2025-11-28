import sql from 'mssql';
import { Pool } from 'pg';

// MSSQL Configuration
const config: sql.config = {
  server: process.env.MSSQL_SERVER!,
  database: process.env.MSSQL_DATABASE!,
  user: process.env.MSSQL_USER!,
  password: process.env.MSSQL_PASSWORD!,
  port: parseInt(process.env.MSSQL_PORT || '1433'),
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true,
    connectTimeout: 30000,
    requestTimeout: 30000
  }
};

// PostgreSQL Configuration - ใช้ค่าจาก .env.local ของคุณ (PG_*)
const pgConfig = {
  host: process.env.PG_HOST!,
  port: parseInt(process.env.PG_PORT || '5432'),
  database: process.env.PG_DATABASE!,
  user: process.env.PG_USER!,
  password: process.env.PG_PASSWORD!,
  ssl: false // ปิด SSL ตามที่ทดสอบ
};

const pgPool = new Pool(pgConfig);

export async function query(queryText: string, params?: any[]) {
  const start = Date.now();
  let pool: sql.ConnectionPool | null = null;
  
  try {
    pool = await sql.connect(config);
    const request = pool.request();
    
    // Add parameters if provided
    if (params && params.length > 0) {
      params.forEach((param, index) => {
        request.input(`param${index + 1}`, param);
      });
      
      // Replace parameter placeholders with MSSQL syntax
      let formattedQuery = queryText;
      params.forEach((_, index) => {
        formattedQuery = formattedQuery.replace(`$${index + 1}`, `@param${index + 1}`);
      });
      
      const result = await request.query(formattedQuery);
      const duration = Date.now() - start;
      console.log('Executed query', { queryText, duration, rows: result.recordset.length });
      return result;
    } else {
      const result = await request.query(queryText);
      const duration = Date.now() - start;
      console.log('Executed query', { queryText, duration, rows: result.recordset.length });
      return result;
    }
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  } finally {
    if (pool) {
      await pool.close();
    }
  }
}

export interface Employee {
  id: string;
  userAD: string;
  fullName: string;
  fullNameEN: string;
  nickname: string;
  imageUrl: string;
  departmentCode: string;
  department: string;
  departmentENG: string;
  departmentNickname: string;
  empCode: string;
  email: string;
  tel: string;
  bandCode: string;
  bandLevel: string;
  sortLevel: number;
  position: string;
  active: boolean;
  createdAt: Date;
  firstWorkingDate: Date;
  postgresId?: string; // เพิ่ม ID จาก PostgreSQL
}

export interface Department {
  id: string;
  name: string;
}

export interface CareerBand {
  id: string;
  name: string;
}

async function getPostgresImage(fullName: string): Promise<{imageUrl: string, postgresId: string} | null> {
  try {
    const pgClient = await pgPool.connect();
    
    // Remove ALL spaces including leading, trailing, and between words
    const normalizedName = fullName.replace(/\s+/g, '').trim();
    
    const result = await pgClient.query(`
      SELECT id, "imageUrl" 
      FROM employees 
      WHERE REPLACE("fullName", ' ', '') = $1 AND status = 'active'
    `, [normalizedName]);
    pgClient.release();
    
    if (result.rows.length > 0 && result.rows[0].imageUrl) {
      console.log(`🖼️ Found PostgreSQL image for: "${fullName}" -> "${normalizedName}" -> ${result.rows[0].imageUrl}`);
      return {
        imageUrl: result.rows[0].imageUrl,
        postgresId: result.rows[0].id
      };
    }
    
    console.log(`❌ No PostgreSQL image found for: "${fullName}" (no spaces: "${normalizedName}")`);
    return null;
  } catch (error) {
    console.error('❌ Error getting PostgreSQL image:', error);
    return null;
  }
}

export async function getEmployees(
  startDate?: Date,
  endDate?: Date,
  department?: string,
  bandLevel?: string,
  isNewEmployee?: boolean
): Promise<Employee[]> {
  try {
    const client = await pgPool.connect();

    // สร้างเงื่อนไขแบบ dynamic
    const conditions: string[] = [];
    const values: any[] = [];

    // ใช้เฉพาะพนักงานที่ active
    conditions.push(`e.status = 'active'`);

    // กรองตามช่วงวันที่จากหน้าเว็บ ด้วย workStartDate
    if (startDate) {
      values.push(startDate);
      conditions.push(`e."workStartDate" >= $${values.length}`);
    }

    if (endDate) {
      values.push(endDate);
      conditions.push(`e."workStartDate" <= $${values.length}`);
    }

    // ตัวเลือกเสริม: ถ้า flag isNewEmployee เป็น true ให้บังคับเฉพาะ 90 วันที่ผ่านมา
    if (isNewEmployee) {
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      values.push(ninetyDaysAgo);
      conditions.push(`e."workStartDate" >= $${values.length}`);
    }

    if (department) {
      values.push(department);
      // กรองตามชื่อฝ่ายจาก departments.fullName
      conditions.push(`d."fullName" = $${values.length}`);
    }

    // การกรองตามระดับตำแหน่ง (bandLevel) จะย้ายไปทำในชั้น API
    // หลังจากที่แมปเป็นชื่อไทยเต็มจากตาราง career_bands แล้ว

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const queryText = `
      SELECT
        e.id,
        e."employeeId" AS "empCode",
        e."fullName",
        e."nickName",
        d."fullName" AS "departmentName",
        e."deptName" AS "deptName",
        e."position",
        e."email",
        e."mobilePhone",
        e."imageUrl",
        e."career_band",
        e."workStartDate",
        e.status
      FROM employees e
      -- ใช้ FK จาก employees.departments ไปยัง departments.id เพื่อดึงชื่อเต็มของฝ่าย/สถาบัน
      LEFT JOIN departments d ON e."departments" = d.id
      ${whereClause}
      ORDER BY e."workStartDate" DESC
      LIMIT 1000
    `;

    const result = await client.query(queryText, values);
    client.release();

    console.log('✅ Successfully fetched employees from PostgreSQL employees table:', result.rows.length);

    const employees: Employee[] = result.rows.map((row: any) => ({
      id: String(row.id),
      userAD: '',
      fullName: row.fullName as string,
      fullNameEN: '',
      nickname: row.nickName as string,
      imageUrl: row.imageUrl as string,
      departmentCode: '',
      // ใช้ชื่อฝ่าย/สถาบันจาก departments.fullName ถ้ามี
      // ถ้าไม่มีให้ fallback ไป deptName เดิมใน employees
      // และถ้ายังไม่มีอีกให้ใช้ข้อความ default ว่า 'ไม่ระบุฝ่าย/สถาบัน'
      department:
        (row.departmentName as string) ||
        (row.deptName as string) ||
        'ไม่ระบุฝ่าย/สถาบัน',
      departmentENG: '',
      departmentNickname: '',
      empCode: row.empCode as string,
      email: row.email as string,
      tel: row.mobilePhone as string,
      bandCode: '',
      // ตอนนี้ใช้ค่า career_band เดิมเป็น text (เช่น D1, M3) เพื่อให้ข้อมูลกลับมาขึ้นก่อน
      bandLevel: row.career_band ? String(row.career_band) : '',
      sortLevel: 0,
      position: row.position as string,
      active: row.status === 'active',
      createdAt: row.workStartDate ? new Date(row.workStartDate) : new Date(),
      firstWorkingDate: row.workStartDate ? new Date(row.workStartDate) : new Date(),
      postgresId: String(row.id),
    }));

    return employees;
  } catch (error) {
    console.error('❌ Database error in getEmployees (Postgres):', error);
    return [];
  }
}

export async function getDepartments(): Promise<Department[]> {
  try {
    const client = await pgPool.connect();

    // ใช้ตาราง departments จริง และ join กับ employees.departments (FK ไปยัง departments.id)
    // เพื่อให้มีเฉพาะฝ่าย/สถาบันที่มีพนักงานอยู่ในระบบ
    const result = await client.query(`
      SELECT DISTINCT d.id, d."fullName" AS name
      FROM departments d
      JOIN employees e ON e."departments" = d.id
      WHERE e.status = 'active'
        AND d."fullName" IS NOT NULL
        AND d."fullName" <> ''
        AND d."fullName" NOT IN ('ผู้อำนวยการใหญ่', 'รองผู้อำนวยการใหญ่')
      ORDER BY d."fullName"
    `);

    client.release();

    console.log('✅ Successfully fetched departments from PostgreSQL departments table (joined with employees):', result.rows.length);

    // map ให้ตรงกับ interface Department { id, name }
    return result.rows.map((row: any) => ({
      id: String(row.id),
      name: row.name as string,
    }));
  } catch (error) {
    console.error('❌ Database error in getDepartments:', error);
    return [];
  }
}

export async function getCareerBands(): Promise<CareerBand[]> {
  try {
    const client = await pgPool.connect();

    const result = await client.query(`
      SELECT id, "thName" AS name
      FROM career_bands
      WHERE "thName" IS NOT NULL AND "thName" <> ''
      ORDER BY id
    `);

    client.release();

    console.log('✅ Successfully fetched career bands from PostgreSQL career_bands table:', result.rows.length);

    return result.rows.map((row: any) => ({
      id: String(row.id),
      name: row.name as string,
    }));
  } catch (error) {
    console.error('❌ Database error in getCareerBands:', error);
    return [];
  }
}
