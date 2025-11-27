'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import EmployeeCard from '@/components/EmployeeCard';
import TimelineSlider from '@/components/TimelineFilter';
import SearchAndFilters from '@/components/Filters';
import Footer from '@/components/Footer';
import { useEmployees, useDepartments, useCareerBands } from '@/lib/api';
import { Users, Loader2 } from 'lucide-react';
import Image from 'next/image';

export default function Home() {
  const [dateRange, setDateRange] = useState<{ startDate: Date; endDate: Date }>({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 6)),
    endDate: new Date()
  });
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filters, setFilters] = useState<{ department: string; position: string }>({
    department: '',
    position: '' // This will be used for bandLevel
  });

  // Use React Query hooks for data fetching with caching
  const { data: employees = [], isLoading: employeesLoading } = useEmployees({
    startDate: dateRange.startDate.toISOString(),
    endDate: dateRange.endDate.toISOString()
  });

  const { data: departments = [] } = useDepartments();
  const { data: careerBands = [] } = useCareerBands();

  // Memoize filtered employees to prevent unnecessary re-computations
  const filteredEmployees = useMemo(() => {
    let filtered = employees;

    console.log('🔍 Filtering employees:', {
      totalEmployees: employees.length,
      activeEmployees: employees.filter(emp => emp.active === true).length,
      searchTerm,
      filters
    });

    // Filter only active employees
    filtered = filtered.filter(emp => emp.active === true);
    console.log('✅ After active filter:', filtered.length);

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(emp =>
        (emp.fullName || '').toLowerCase().includes(term) ||
        (emp.department || '').toLowerCase().includes(term) ||
        (emp.position || '').toLowerCase().includes(term) ||
        (emp.bandLevel || '').toLowerCase().includes(term) ||
        (emp.nickname || '').toLowerCase().includes(term) ||
        (emp.email || '').toLowerCase().includes(term) ||
        (emp.userAD || '').toLowerCase().includes(term)
      );
    }

    if (filters.department) {
      console.log('🏢 Filtering by department:', filters.department);
      console.log('📋 Available departments:', [...new Set(employees.map(emp => emp.department))]);
      filtered = filtered.filter(emp => emp.department === filters.department);
      console.log('✅ After department filter:', filtered.length);
    }

    if (filters.position) {
      console.log('💼 Filtering by position:', filters.position);
      console.log('📋 Available positions:', [...new Set(employees.map(emp => emp.position))]);
      filtered = filtered.filter(emp => emp.position === filters.position);
      console.log('✅ After position filter:', filtered.length);
    }

    console.log('🎯 Final filtered count:', filtered.length);
    return filtered;
  }, [employees, searchTerm, filters]);

  const handleDateRangeChange = useCallback((startDate: Date, endDate: Date) => {
    setDateRange({ startDate, endDate });
  }, []);

  const handleSearchChange = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  const handleFiltersChange = useCallback((department: string, position: string) => {
    setFilters({ department, position });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Top Header (themed like FTI apps) */}
      <header className="bg-white shadow">
        <div className="flex h-14 w-full items-stretch">
          {/* Left brand block */}
          <div className="flex items-stretch">
            <div className="flex items-center bg-white pl-3 pr-8 text-indigo-800 sm:pl-6 sm:pr-10">

              <div className="flex items-center gap-2">
                <img
                  src="/Logo.png"
                  alt="FTI Logo"
                  className="h-7 w-auto sm:h-8 object-contain"
                />
                <div className="flex flex-col leading-snug">
                  <span className="inline-flex items-center gap-1.5 text-base font-semibold tracking-wide sm:text-lg">
                    <span>ยินดีต้อนรับพนักงานใหม่</span>
                  </span>
                  <span className="hidden text-[11px] text-slate-500 sm:inline">
                    สภาอุตสาหกรรมแห่งประเทศไทย
                  </span>
                </div>
              </div>
            </div>
          </div>
          {/* Right fill block */}
          <div className="flex-1 bg-indigo-800 header-blue-notch" />
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-7xl space-y-8">
        {/* Hero / Page Header */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 px-5 py-5 md:px-8 md:py-6 grid grid-cols-1 md:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)] gap-6 md:items-center">
          <div className="flex items-start gap-4">
            <div className="p-3 md:p-4 bg-slate-100 rounded-xl border border-slate-200">
              <Users className="w-7 h-7 md:w-8 md:h-8 text-slate-700" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">
                พนักงานใหม่
              </h1>
              <p className="text-slate-600 text-sm md:text-base leading-relaxed">
                ติดตามและต้อนรับพนักงานใหม่ที่เข้าร่วมทีมของเราในช่วงเวลาที่เลือก
              </p>
            </div>
          </div>
          <div className="flex flex-col items-start md:items-end gap-3 md:gap-2">
            <span className="text-xs uppercase tracking-wide text-slate-500">สรุปจำนวนพนักงานใหม่</span>
            <div className="inline-flex items-baseline gap-2 px-4 py-2 rounded-lg bg-slate-100 border border-slate-200">
              <span className="text-2xl font-bold text-slate-900">{filteredEmployees.length}</span>
              <span className="text-sm text-slate-600">คนในช่วงที่เลือก</span>
            </div>
          </div>
        </section>

        {/* Controls: Timeline + Filters */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 md:p-6 space-y-5">
          <div className="rounded-lg p-4 bg-slate-50 border border-slate-200/70">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-800">1. เลือกช่วงเวลา</h2>
                <p className="text-xs text-slate-500">เลือกช่วงเดือนที่ต้องการดูพนักงานใหม่</p>
              </div>
            </div>
            <TimelineSlider onDateRangeChangeAction={handleDateRangeChange} />
          </div>

          <div className="rounded-lg p-4 bg-slate-50 border border-slate-200/70">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-800">2. ค้นหาและกรอง</h2>
                <p className="text-xs text-slate-500">ค้นหาตามชื่อ ฝ่าย หรือระดับตำแหน่ง เพื่อเจอคนที่ต้องการเร็วขึ้น</p>
              </div>
            </div>
            <SearchAndFilters
              departments={departments}
              careerBands={careerBands}
              onSearchChangeAction={handleSearchChange}
              onFiltersChangeAction={handleFiltersChange}
            />
          </div>
        </section>

        {/* Results Summary */}
        <section className="mb-2">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 px-5 py-3 flex flex-wrap items-center justify-between gap-3">

            <div className="flex items-center gap-2">
              <span className="text-sm md:text-base text-slate-700 font-medium">
                ผลลัพธ์พนักงานทั้งหมด {filteredEmployees.length} คน
              </span>
            </div>
            {(searchTerm || filters.department || filters.position) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilters({ department: '', position: '' });
                }}
                className="text-xs md:text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                ล้างตัวกรองทั้งหมด
              </button>
            )}
          </div>
        </section>

        {/* Employee Cards Section */}
        <main>
          {employeesLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
              <span className="text-slate-600 text-lg">กำลังโหลดข้อมูล...</span>
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="text-center py-20">
              <div className="inline-flex p-6 bg-blue-50 rounded-full mb-6">
                <Users className="w-16 h-16 text-blue-400" />
              </div>
              <h3 className="text-2xl font-semibold text-slate-800 mb-2">
                ไม่พบข้อมูลพนักงาน
              </h3>
              <p className="text-slate-600 text-lg mb-6">
                ไม่มีพนักงานใหม่ในช่วงเวลาที่เลือก หรือตามเงื่อนไขที่กรอง
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilters({ department: '', position: '' });
                }}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
              >
                ล้างตัวกรองทั้งหมด
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEmployees.map((employee) => (
                <div key={employee.id}>
                  <EmployeeCard employee={employee} />
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
}