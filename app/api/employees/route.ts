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

    return NextResponse.json(employees);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch employees' },
      { status: 500 }
    );
  }
}