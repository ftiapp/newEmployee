'use client';

import { useState, useEffect } from 'react';
import { Search, Building2, User, X } from 'lucide-react';

interface Department {
  id: string;
  name: string;
}

interface CareerBand {
  id: string;
  name: string;
}

interface SearchAndFiltersProps {
  departments: Department[];
  careerBands: CareerBand[];
  onSearchChangeAction: (term: string) => void;
  onFiltersChange: (department: string, position: string) => void;
}

interface FiltersProps {
  departments: Department[];
  careerBands: CareerBand[];
  onFiltersChange: (department: string, position: string) => void;
}

export default function SearchAndFilters({
  departments,
  careerBands,
  onSearchChangeAction,
  onFiltersChange
}: SearchAndFiltersProps) {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [selectedPosition, setSelectedPosition] = useState<string>('');

  useEffect(() => {
    console.log('📝 Search term changed:', searchTerm);
    onSearchChangeAction(searchTerm);
  }, [searchTerm, onSearchChangeAction]);

  useEffect(() => {
    console.log('🏢 Filters changed:', { selectedDepartment, selectedPosition });
    onFiltersChange(selectedDepartment, selectedPosition);
  }, [selectedDepartment, selectedPosition, onFiltersChange]);

  const clearSearch = () => {
    setSearchTerm('');
  };

  const hasActiveFilters = searchTerm || selectedDepartment || selectedPosition;

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedDepartment('');
    setSelectedPosition('');
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Search className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 text-lg">ค้นหาและกรอง</h3>
            <p className="text-sm text-slate-500"> ค้นหาและกรองข้อมูลพนักงาน</p>
          </div>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
            ล้างทั้งหมด
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search Bar */}
        <div className="relative md:col-span-1">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            ค้นหา
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ชื่อ, ชื่อเล่น, ฝ่าย, ตำแหน่ง, ระดับ, อีเมล, UserAD..."
              className="w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-900 placeholder-slate-500 transition-all"
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Department Filter */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            <Building2 className="w-4 h-4 inline mr-1 text-blue-600" />
            ฝ่าย/สถาบัน
          </label>
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-900 transition-all"
          >
            <option value="">ทุกฝ่าย/สถาบัน</option>
            {departments.map((department) => (
              <option key={department.id} value={department.name}>
                {department.name}
              </option>
            ))}
          </select>
        </div>

        {/* Position Filter */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            <User className="w-4 h-4 inline mr-1 text-blue-600" />
            ระดับตำแหน่ง
          </label>
          <select
            value={selectedPosition}
            onChange={(e) => setSelectedPosition(e.target.value)}
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-900 transition-all"
          >
            <option value="">ทุกระดับตำแหน่ง</option>
            {careerBands.map((careerBand) => (
              <option key={careerBand.id} value={careerBand.name}>
                {careerBand.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-4 flex flex-wrap gap-2">
          {searchTerm && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
              <Search className="w-3 h-3" />
              {searchTerm}
              <button onClick={clearSearch} className="ml-1 hover:bg-blue-100 rounded-full p-0.5">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {selectedDepartment && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
              <Building2 className="w-3 h-3" />
              {selectedDepartment}
              <button onClick={() => setSelectedDepartment('')} className="ml-1 hover:bg-blue-100 rounded-full p-0.5">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {selectedPosition && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
              <User className="w-3 h-3" />
              {selectedPosition}
              <button onClick={() => setSelectedPosition('')} className="ml-1 hover:bg-blue-100 rounded-full p-0.5">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}