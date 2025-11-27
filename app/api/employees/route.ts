import { NextRequest, NextResponse } from 'next/server';
import { getEmployees, getDepartments, getCareerBands } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const department = searchParams.get('department');
    const bandLevel = searchParams.get('position'); // Keep as 'position' for frontend compatibility
    const type = searchParams.get('type');
    const isNewEmployee = searchParams.get('newEmployee') === 'true';

    if (type === 'departments') {
      const departments = await getDepartments();
      return NextResponse.json(departments);
    }

    if (type === 'careerBands') {
      const careerBands = await getCareerBands();
      return NextResponse.json(careerBands);
    }

    const employees = await getEmployees(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
      department || undefined,
      bandLevel || undefined,
      isNewEmployee
    );

    // ขั้นตอนที่สอง: แมป career_bands.id -> name เพื่อให้ bandLevel เป็นชื่อตำแหน่งเต็ม
    const careerBands = await getCareerBands();
    // getCareerBands() คืนค่า { id, name } โดย name มาจาก career_bands.thName
    const bandMap = new Map(careerBands.map((cb) => [String(cb.id), cb.name]));

    const enrichedEmployees = employees.map((emp) => {
      const currentLevel = emp.bandLevel ? String(emp.bandLevel) : '';
      const fullTitle = currentLevel ? bandMap.get(currentLevel) : undefined;

      return {
        ...emp,
        bandLevel: fullTitle || currentLevel,
      };
    });

    return NextResponse.json(enrichedEmployees);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch employees' },
      { status: 500 }
    );
  }
}