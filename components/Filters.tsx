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
  onFiltersChangeAction: (departments: string[], positions: string[]) => void;
}

interface FiltersProps {
  departments: Department[];
  careerBands: CareerBand[];
  onFiltersChangeAction: (departments: string[], positions: string[]) => void;
}

export default function SearchAndFilters({
  departments,
  careerBands,
  onSearchChangeAction,
  onFiltersChangeAction
}: SearchAndFiltersProps) {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [selectedPositions, setSelectedPositions] = useState<string[]>([]);
  const [isDepartmentOpen, setIsDepartmentOpen] = useState<boolean>(false);
  const [isPositionOpen, setIsPositionOpen] = useState<boolean>(false);

  useEffect(() => {
    console.log('📝 Search term changed:', searchTerm);
    onSearchChangeAction(searchTerm);
  }, [searchTerm, onSearchChangeAction]);

  useEffect(() => {
    console.log('🏢 Filters changed:', {
      selectedDepartments,
      selectedPositions
    });
    onFiltersChangeAction(selectedDepartments, selectedPositions);
  }, [selectedDepartments, selectedPositions, onFiltersChangeAction]);

  const clearSearch = () => {
    setSearchTerm('');
  };

  const hasActiveFilters =
    Boolean(searchTerm) || selectedDepartments.length > 0 || selectedPositions.length > 0;

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedDepartments([]);
    setSelectedPositions([]);
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
              className="w-full pl-10 pr-10 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-900 placeholder-slate-500 transition-all hover:border-slate-400 shadow-sm"
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
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsDepartmentOpen((prev) => !prev)}
              className="w-full flex items-center justify-between px-4 py-3 border border-slate-300 rounded-xl bg-white text-slate-900 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-slate-400 shadow-sm"
            >
              <span className="truncate">
                {selectedDepartments.length === 0
                  ? 'ทุกฝ่าย/สถาบัน'
                  : selectedDepartments.join(', ')}
              </span>
              <span className="ml-2 text-slate-400 text-xs">
                ▼
              </span>
            </button>

            {isDepartmentOpen && (
              <div className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg max-h-56 overflow-y-auto">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDepartments([]);
                    setIsDepartmentOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-blue-50 ${
                    selectedDepartments.length === 0
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-700'
                  }`}
                >
                  ทุกฝ่าย/สถาบัน
                </button>
                {departments
                  .filter((department) =>
                    department.name !== 'FTI Expo' &&
                    department.name !== 'ประจำผู้อำนวยการใหญ่ (โครงการพิเศษ CSR)'
                  )
                  .map((department) => {
                    const isActive = selectedDepartments.includes(department.name);
                    return (
                      <button
                        key={department.id}
                        type="button"
                        onClick={() => {
                          setSelectedDepartments((prev) => {
                            const exists = prev.includes(department.name);
                            if (exists) {
                              return prev.filter((d) => d !== department.name);
                            }
                            return [...prev, department.name];
                          });
                          setIsDepartmentOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-blue-50 ${
                          isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-700'
                        }`}
                      >
                        {department.name}
                      </button>
                    );
                  })}
              </div>
            )}
          </div>
        </div>

        {/* Position Filter */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            <User className="w-4 h-4 inline mr-1 text-blue-600" />
            ระดับตำแหน่ง
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsPositionOpen((prev) => !prev)}
              className="w-full flex items-center justify-between px-4 py-3 border border-slate-300 rounded-xl bg-white text-slate-900 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-slate-400 shadow-sm"
            >
              <span className="truncate">
                {selectedPositions.length === 0
                  ? 'ทุกระดับตำแหน่ง'
                  : selectedPositions.join(', ')}
              </span>
              <span className="ml-2 text-slate-400 text-xs">▼</span>
            </button>

            {isPositionOpen && (
              <div className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg max-h-56 overflow-y-auto">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPositions([]);
                    setIsPositionOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-blue-50 ${
                    selectedPositions.length === 0
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-700'
                  }`}
                >
                  ทุกระดับตำแหน่ง
                </button>
                {careerBands.map((careerBand) => {
                  const isActive = selectedPositions.includes(careerBand.name);
                  return (
                    <button
                      key={careerBand.id}
                      type="button"
                      onClick={() => {
                        setSelectedPositions((prev) => {
                          const exists = prev.includes(careerBand.name);
                          if (exists) {
                            return prev.filter((p) => p !== careerBand.name);
                          }
                          return [...prev, careerBand.name];
                        });
                        setIsPositionOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-blue-50 ${
                        isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-700'
                      }`}
                    >
                      {careerBand.name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
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
          {selectedDepartments.map((dept) => (
            <span
              key={dept}
              className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
            >
              <Building2 className="w-3 h-3" />
              {dept}
              <button
                onClick={() =>
                  setSelectedDepartments((prev) => prev.filter((d) => d !== dept))
                }
                className="ml-1 hover:bg-blue-100 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          {selectedPositions.map((pos) => (
            <span
              key={pos}
              className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
            >
              <User className="w-3 h-3" />
              {pos}
              <button
                onClick={() =>
                  setSelectedPositions((prev) => prev.filter((p) => p !== pos))
                }
                className="ml-1 hover:bg-blue-100 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}