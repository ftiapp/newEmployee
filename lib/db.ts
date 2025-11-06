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

// PostgreSQL Configuration - ใช้ค่าจาก .env.local ของคุณ
const pgConfig = {
  host: process.env.DB_HOST!,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME!,
  user: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
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
      WHERE REPLACE("fullName", ' ', '') = $1
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
    // Connect to MSSQL
    const pool = await sql.connect(config);
    const request = pool.request();
    
    // Build query
    let queryText = `
      SELECT TOP (1000)
        EmployeeID as id,
        UserAD as userAD,
        FullName_TH as fullName,
        FullName_EN as fullNameEN,
        Nickname as nickname,
        EmpPic as imageUrl,
        DepartmentCode as departmentCode,
        Department_Name_TH as department,
        Department_Name_ENG as departmentENG,
        Department_nickname as departmentNickname,
        EmpCode as empCode,
        Email2 as email,
        Tel as tel,
        BandCode as bandCode,
        BandLevel as bandLevel,
        SortLevel as sortLevel,
        Position as position,
        Active as active,
        CurrentPositionStartDate as createdAt,
        FirstWorkingDate
      FROM [K2FTI].[dbo].[NewEmployee]
      WHERE Active = 1
    `;

    // Add filters
    if (startDate) {
      request.input('startDate', startDate);
      queryText += ` AND FirstWorkingDate >= @startDate`;
    }

    if (endDate) {
      request.input('endDate', endDate);
      queryText += ` AND FirstWorkingDate <= @endDate`;
    }

    if (isNewEmployee) {
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      request.input('ninetyDaysAgo', ninetyDaysAgo);
      queryText += ` AND FirstWorkingDate >= @ninetyDaysAgo`;
    }

    if (department) {
      request.input('department', department);
      queryText += ` AND Department_Name_TH = @department`;
    }

    if (bandLevel) {
      request.input('bandLevel', bandLevel);
      queryText += ` AND BandLevel = @bandLevel`;
    }

    queryText += ` ORDER BY FirstWorkingDate DESC`;
    
    // Execute query
    const result = await request.query(queryText);
    await pool.close();
    
    console.log('✅ Successfully fetched employees from MSSQL:', result.recordset.length);
    
    // Process employees - use PostgreSQL images ONLY
    const employees = await Promise.all(result.recordset.map(async (emp: any) => {
      let finalImageUrl: string;
      let postgresId: string;
      
      console.log(`🔍 Processing employee: ${emp.fullName}`);
      
      // Try to get image from PostgreSQL by matching fullName
      const pgData = await getPostgresImage(emp.fullName);
      
      if (pgData) {
        console.log(`✅ Using PostgreSQL image for: ${emp.fullName}`);
        finalImageUrl = pgData.imageUrl;
        postgresId = pgData.postgresId;
      } else {
        // If no PostgreSQL image, use default avatar - NO MSSQL fallback!
        finalImageUrl = '/images/default-avatar.svg';
        postgresId = emp.id; // Use original MSSQL id as fallback
        console.log(`⚠️ Using default avatar for: ${emp.fullName}`);
      }
      
      return {
        ...emp,
        id: pgData ? postgresId : emp.id, // Use PostgreSQL id if available, otherwise keep original MSSQL id
        imageUrl: finalImageUrl,
        postgresId: postgresId,
        createdAt: emp.createdAt ? new Date(emp.createdAt) : new Date(),
        firstWorkingDate: emp.firstWorkingDate ? new Date(emp.firstWorkingDate) : new Date()
      };
    }));
    
    return employees;
      
  } catch (error) {
    console.error('❌ Database error in getEmployees:', error);
    return [];
  }
}

export async function getDepartments(): Promise<Department[]> {
  try {
    const pool = await sql.connect(config);
    const request = pool.request();
    
    const queryText = `
      SELECT DISTINCT TOP (1000)
        DepartmentCode as id,
        Department_Name_TH as name
      FROM [K2FTI].[dbo].[NewEmployee]
      WHERE Active = 1 AND Department_Name_TH IS NOT NULL
      ORDER BY Department_Name_TH
    `;
    
    const result = await request.query(queryText);
    await pool.close();
    
    console.log('✅ Successfully fetched departments from NewEmployee table:', result.recordset.length);
    return result.recordset;
  } catch (error) {
    console.error('❌ Database error in getDepartments:', error);
    return [];
  }
}

export async function getCareerBands(): Promise<CareerBand[]> {
  try {
    const pool = await sql.connect(config);
    const request = pool.request();
    
    const queryText = `
      SELECT DISTINCT TOP (1000)
        Position as id,
        Position as name
      FROM [K2FTI].[dbo].[NewEmployee]
      WHERE Active = 1 AND Position IS NOT NULL
      ORDER BY Position
    `;
    
    const result = await request.query(queryText);
    await pool.close();
    
    console.log('✅ Successfully fetched positions from NewEmployee table:', result.recordset.length);
    return result.recordset;
  } catch (error) {
    console.error('❌ Database error in getCareerBands:', error);
    return [];
  }
}
