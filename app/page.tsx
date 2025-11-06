'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import EmployeeCard from '@/components/EmployeeCard';
import TimelineSlider from '@/components/TimelineFilter';
import SearchAndFilters from '@/components/Filters';
import Footer from '@/components/Footer';
import { Employee } from '@/lib/db';
import { Users, Loader2 } from 'lucide-react';
import Image from 'next/image';

export default function Home() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [careerBands, setCareerBands] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [dateRange, setDateRange] = useState<{ startDate: Date; endDate: Date }>({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 6)),
    endDate: new Date()
  });
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filters, setFilters] = useState<{ department: string; position: string }>({
    department: '',
    position: '' // This will be used for bandLevel
  });

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        startDate: dateRange.startDate.toISOString(),
        endDate: dateRange.endDate.toISOString()
      });

      const response = await fetch(`/api/employees?${params}`);
      if (response.ok) {
        const data = await response.json();
        console.log('👥 Employees data:', data);
        setEmployees(data);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await fetch('/api/employees?type=departments');
      if (response.ok) {
        const data = await response.json();
        console.log('📋 Departments loaded:', data);
        setDepartments(data);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchCareerBands = async () => {
    try {
      const response = await fetch('/api/employees?type=careerBands');
      if (response.ok) {
        const data = await response.json();
        console.log('🎯 Career bands loaded:', data);
        setCareerBands(data);
      }
    } catch (error) {
      console.error('Error fetching career bands:', error);
    }
  };

  useEffect(() => {
    fetchDepartments();
    fetchCareerBands();
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [dateRange]);

  useEffect(() => {
    let filtered = employees;

    console.log('🔍 Filtering employees:', {
      totalEmployees: employees.length,
      searchTerm,
      filters
    });

    if (searchTerm) {
      filtered = filtered.filter(emp =>
        emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.bandLevel?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.nickname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.userAD?.toLowerCase().includes(searchTerm.toLowerCase())
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
    setFilteredEmployees(filtered);
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
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-white">
      {/* Header with FTI Logo */}
      <motion.header
        className="bg-white shadow-sm border-b border-slate-200"
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center">
            <Image
              src="/FTI-MasterLogo-Naming_RGB-forLightBG.png"
              alt="FTI - Federation of Thai Industries"
              width={260}
              height={65}
              priority
              className="h-16 w-auto"
            />
          </div>
        </div>
      </motion.header>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Page Header Section */}
        <motion.section
          className="mb-8 text-center"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true, amount: 0.3 }}
        >
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              พนักงานใหม่
            </h1>
          </div>
          <p className="text-slate-600 text-lg">
            ติดตามและต้อนรับพนักงานใหม่ที่เข้าร่วมทีมของเรา
          </p>
        </motion.section>

        {/* Timeline Slider Section */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true, amount: 0.2 }}
        >
          <TimelineSlider onDateRangeChangeAction={handleDateRangeChange} />
        </motion.div>

        {/* Search and Filters Section */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true, amount: 0.2 }}
        >
          <SearchAndFilters
            departments={departments}
            careerBands={careerBands}
            onSearchChangeAction={handleSearchChange}
            onFiltersChange={handleFiltersChange}
          />
        </motion.div>

        {/* Results Summary */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true, amount: 0.2 }}
        >
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-slate-700 font-medium">
                  พบพนักงานทั้งหมด {filteredEmployees.length} คน
                </span>
              </div>
              {(searchTerm || filters.department || filters.position) && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilters({ department: '', position: '' });
                  }}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  ล้างตัวกรอง
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Employee Cards Section */}
        <main>
          {loading ? (
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
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
            >
              {filteredEmployees.map((employee, index) => (
                <motion.div
                  key={employee.id}
                  variants={{
                    hidden: { opacity: 0, y: 24 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  initial="hidden"
                  whileInView="visible"
                  transition={{
                    duration: 0.45,
                    delay: index * 0.05,
                    ease: [0.22, 1, 0.36, 1]
                  }}
                  viewport={{ once: true, amount: 0.2 }}
                >
                  <EmployeeCard employee={employee} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
}