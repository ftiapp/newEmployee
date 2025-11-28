'use client';

import { useState, useEffect, useMemo, useRef } from 'react';

import { Calendar, ChevronDown } from 'lucide-react';

interface TimelineSliderProps {
  onDateRangeChangeAction: (startDate: Date, endDate: Date) => void;
}

function formatThaiMonthLabel(value: string): string {
  if (!value) return '';
  const [yearStr, monthStr] = value.split('-');
  const year = Number(yearStr);
  const month = Number(monthStr);
  if (!year || !month) return '';

  const d = new Date(year, month - 1, 1);
  return d.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long'
  });
}

export default function TimelineSlider({ onDateRangeChangeAction }: TimelineSliderProps) {

  const [startMonth, setStartMonth] = useState<string>(''); // รูปแบบ YYYY-MM
  const [endMonth, setEndMonth] = useState<string>('');
  const [isStartMonthOpen, setIsStartMonthOpen] = useState(false);
  const [isStartYearOpen, setIsStartYearOpen] = useState(false);
  const [isEndMonthOpen, setIsEndMonthOpen] = useState(false);
  const [isEndYearOpen, setIsEndYearOpen] = useState(false);
  const [activePreset, setActivePreset] = useState<'month' | '3m' | '6m' | '12m' | null>('6m');
  const containerRef = useRef<HTMLDivElement | null>(null);

  const closeAllDropdowns = () => {
    setIsStartMonthOpen(false);
    setIsStartYearOpen(false);
    setIsEndMonthOpen(false);
    setIsEndYearOpen(false);
  };

  useEffect(() => {
    const now = new Date();

    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const startValue = `${sixMonthsAgo.getFullYear()}-${String(sixMonthsAgo.getMonth() + 1).padStart(2, '0')}`;
    const endValue = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    setStartMonth(startValue);
    setEndMonth(endValue);

    // ค่าเริ่มต้นถือว่าใช้ preset 6 เดือนล่าสุด
    setActivePreset('6m');

    const startDate = new Date(sixMonthsAgo.getFullYear(), sixMonthsAgo.getMonth(), 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    onDateRangeChangeAction(startDate, endDate);
  }, [onDateRangeChangeAction]);

  // ปิด dropdown ทั้งหมดเมื่อคลิกนอกกล่อง TimelineSlider
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (containerRef.current && target && !containerRef.current.contains(target)) {
        closeAllDropdowns();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!startMonth || !endMonth) return;

    let [startYear, startM] = startMonth.split('-').map(Number);
    let [endYear, endM] = endMonth.split('-').map(Number);

    if (!startYear || !startM || !endYear || !endM) return;

    // คำนวณจำนวนเดือนที่เลือกอยู่ตอนนี้
    let diffMonths = (endYear - startYear) * 12 + (endM - startM) + 1;

    // ถ้าเกิน 12 เดือน ให้บีบ endMonth ให้อยู่ไม่เกิน 12 เดือนจาก startMonth
    if (diffMonths > 12) {
      const startBase = new Date(startYear, startM - 1, 1);
      const clampedEnd = new Date(startBase.getFullYear(), startBase.getMonth() + 11, 1);
      const clampedEndValue = `${clampedEnd.getFullYear()}-${String(
        clampedEnd.getMonth() + 1
      ).padStart(2, '0')}`;

      // ป้องกัน loop โดย set เฉพาะเมื่อค่าจริงต่างจากที่คำนวณใหม่
      if (clampedEndValue !== endMonth) {
        setEndMonth(clampedEndValue);
        return;
      }

      endYear = clampedEnd.getFullYear();
      endM = clampedEnd.getMonth() + 1;
    }

    const startDate = new Date(startYear, startM - 1, 1);
    const endDate = new Date(endYear, endM, 0); // วันสุดท้ายของเดือน

    onDateRangeChangeAction(startDate, endDate);
  }, [startMonth, endMonth, onDateRangeChangeAction]);

  const selectedMonths = (() => {
    if (!startMonth || !endMonth) return 0;
    const [sy, sm] = startMonth.split('-').map(Number);
    const [ey, em] = endMonth.split('-').map(Number);
    if (!sy || !sm || !ey || !em) return 0;
    return (ey - sy) * 12 + (em - sm) + 1;
  })();

  const startLabel = startMonth ? formatThaiMonthLabel(startMonth) : '';
  const endLabel = endMonth ? formatThaiMonthLabel(endMonth) : '';

  const monthOptions = useMemo(
    () => [
      { value: 1, label: 'มกราคม' },
      { value: 2, label: 'กุมภาพันธ์' },
      { value: 3, label: 'มีนาคม' },
      { value: 4, label: 'เมษายน' },
      { value: 5, label: 'พฤษภาคม' },
      { value: 6, label: 'มิถุนายน' },
      { value: 7, label: 'กรกฎาคม' },
      { value: 8, label: 'สิงหาคม' },
      { value: 9, label: 'กันยายน' },
      { value: 10, label: 'ตุลาคม' },
      { value: 11, label: 'พฤศจิกายน' },
      { value: 12, label: 'ธันวาคม' }
    ],
    []
  );

  const yearOptions = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    // แสดงเฉพาะปีที่ครอบคลุม 12 เดือนล่าสุด: ปัจจุบัน และปีก่อนหน้า
    return [currentYear - 1, currentYear];
  }, []);

  const parseYearMonth = (value: string): { year: number; month: number } | null => {
    if (!value) return null;
    const [y, m] = value.split('-').map(Number);
    if (!y || !m) return null;
    return { year: y, month: m };
  };

  return (
    <div
      ref={containerRef}
      onClick={closeAllDropdowns}
      className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 space-y-5"
    >
      <div className="flex items-center gap-3 mb-1">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Calendar className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-800 text-lg">เลือกช่วงเวลา</h3>
          <p className="text-sm text-slate-500">เลือกเดือนเริ่มต้นและสิ้นสุดที่ต้องการดูพนักงานใหม่</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-700">จากเดือน</label>

          {(() => {
            const parsed = parseYearMonth(startMonth);
            const year = parsed?.year ?? new Date().getFullYear();
            const month = parsed?.month ?? new Date().getMonth() + 1;

            const handleChange = (newYear: number, newMonth: number) => {
              const value = `${newYear}-${String(newMonth).padStart(2, '0')}`;
              setStartMonth(value);
              setActivePreset(null);
            };

            return (
              <div className="flex gap-2">
                <div className="relative w-1/2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsStartMonthOpen((prev) => !prev);
                      setIsStartYearOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-4 py-3 border border-slate-300 rounded-xl bg-white text-slate-900 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-slate-400 shadow-sm text-sm"
                  >
                    <span className="truncate">
                      {monthOptions.find((m) => m.value === month)?.label || 'เลือกเดือน'}
                    </span>
                    <ChevronDown className="w-4 h-4 text-slate-400 ml-2" />
                  </button>
                  {isStartMonthOpen && (
                    <div className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg max-h-56 overflow-y-auto text-sm">
                      {monthOptions.map((m) => {
                        const isActive = m.value === month;
                        return (
                          <button
                            key={m.value}
                            type="button"
                            onClick={() => {
                              handleChange(year, m.value);
                              setIsStartMonthOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 hover:bg-blue-50 ${
                              isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-700'
                            }`}
                          >
                            {m.label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="relative w-1/2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsStartYearOpen((prev) => !prev);
                      setIsStartMonthOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-4 py-3 border border-slate-300 rounded-xl bg-white text-slate-900 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-slate-400 shadow-sm text-sm"
                  >
                    <span className="truncate">{year + 543}</span>
                    <ChevronDown className="w-4 h-4 text-slate-400 ml-2" />
                  </button>
                  {isStartYearOpen && (
                    <div className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg max-h-56 overflow-y-auto text-sm">
                      {yearOptions.map((y) => {
                        const isActive = y === year;
                        return (
                          <button
                            key={y}
                            type="button"
                            onClick={() => {
                              handleChange(y, month);
                              setIsStartYearOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 hover:bg-blue-50 ${
                              isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-700'
                            }`}
                          >
                            {y + 543}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-700">ถึงเดือน</label>

          {(() => {
            const parsed = parseYearMonth(endMonth);
            const year = parsed?.year ?? new Date().getFullYear();
            const month = parsed?.month ?? new Date().getMonth() + 1;

            const handleChange = (newYear: number, newMonth: number) => {
              const value = `${newYear}-${String(newMonth).padStart(2, '0')}`;
              setEndMonth(value);
              setActivePreset(null);
            };

            return (
              <div className="flex gap-2">
                {/* End Month Dropdown */}
                <div className="relative w-1/2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsEndMonthOpen((prev) => !prev);
                      setIsEndYearOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-4 py-3 border border-slate-300 rounded-xl bg-white text-slate-900 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-slate-400 shadow-sm text-sm"
                  >
                    <span className="truncate">
                      {monthOptions.find((m) => m.value === month)?.label || 'เลือกเดือน'}
                    </span>
                    <ChevronDown className="w-4 h-4 text-slate-400 ml-2" />
                  </button>
                  {isEndMonthOpen && (
                    <div className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg max-h-56 overflow-y-auto text-sm">
                      {monthOptions.map((m) => {
                        const isActive = m.value === month;
                        return (
                          <button
                            key={m.value}
                            type="button"
                            onClick={() => {
                              handleChange(year, m.value);
                              setIsEndMonthOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 hover:bg-blue-50 ${
                              isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-700'
                            }`}
                          >
                            {m.label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* End Year Dropdown */}
                <div className="relative w-1/2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsEndYearOpen((prev) => !prev);
                      setIsEndMonthOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-4 py-3 border border-slate-300 rounded-xl bg-white text-slate-900 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-slate-400 shadow-sm text-sm"
                  >
                    <span className="truncate">{year + 543}</span>
                    <ChevronDown className="w-4 h-4 text-slate-400 ml-2" />
                  </button>
                  {isEndYearOpen && (
                    <div className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg max-h-56 overflow-y-auto text-sm">
                      {yearOptions.map((y) => {
                        const isActive = y === year;
                        return (
                          <button
                            key={y}
                            type="button"
                            onClick={() => {
                              handleChange(y, month);
                              setIsEndYearOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 hover:bg-blue-50 ${
                              isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-700'
                            }`}
                          >
                            {y + 543}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>

      </div>

      {/* Quick presets */}
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-slate-600 mr-1">ช่วงเวลาแนะนำ:</span>

        <button
          type="button"
          onClick={() => {
            const now = new Date();
            const start = new Date(now.getFullYear(), now.getMonth(), 1);
            const startValue = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}`;
            const endValue = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
            setStartMonth(startValue);
            setEndMonth(endValue);
            setActivePreset('month');
          }}
          className={`px-3 py-1 rounded-full border text-sm transition-colors ${
            activePreset === 'month'
              ? 'bg-blue-50 text-blue-700 border-blue-300'
              : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
          }`}
        >
          เดือนนี้
        </button>
        <button
          type="button"
          onClick={() => {
            const now = new Date();
            const start = new Date(now.getFullYear(), now.getMonth() - 2, 1);
            const startValue = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}`;
            const endValue = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
            setStartMonth(startValue);
            setEndMonth(endValue);
            setActivePreset('3m');
          }}
          className={`px-3 py-1 rounded-full border text-sm transition-colors ${
            activePreset === '3m'
              ? 'bg-blue-50 text-blue-700 border-blue-300'
              : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
          }`}
        >
          3 เดือนล่าสุด
        </button>
        <button
          type="button"
          onClick={() => {
            const now = new Date();
            const start = new Date(now.getFullYear(), now.getMonth() - 5, 1);
            const startValue = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}`;
            const endValue = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
            setStartMonth(startValue);
            setEndMonth(endValue);
            setActivePreset('6m');
          }}
          className={`px-3 py-1 rounded-full border text-sm transition-colors ${
            activePreset === '6m'
              ? 'bg-blue-50 text-blue-700 border-blue-300'
              : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
          }`}
        >
          6 เดือนล่าสุด
        </button>
        <button
          type="button"
          onClick={() => {
            const now = new Date();
            const start = new Date(now.getFullYear(), now.getMonth() - 11, 1);
            const startValue = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}`;
            const endValue = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
            setStartMonth(startValue);
            setEndMonth(endValue);
            setActivePreset('12m');
          }}
          className={`px-3 py-1 rounded-full border text-sm transition-colors ${
            activePreset === '12m'
              ? 'bg-blue-50 text-blue-700 border-blue-300'
              : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
          }`}
        >
          12 เดือนล่าสุด
        </button>
      </div>

      {/* Summary */}
      <div className="flex items-center justify-between text-sm text-slate-600 bg-slate-50 rounded-xl px-3 py-2 mt-1 border border-slate-200">
        <span>
          แสดงพนักงานที่เข้าทำงานในช่วงประมาณ{' '}
          <span className="font-semibold text-blue-700">{selectedMonths}</span> เดือน
        </span>

        <button
          type="button"
          onClick={() => {
            const now = new Date();
            const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);
            const startValue = `${threeMonthsAgo.getFullYear()}-${String(threeMonthsAgo.getMonth() + 1).padStart(2, '0')}`;
            const endValue = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
            setStartMonth(startValue);
            setEndMonth(endValue);
          }}
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          รีเซ็ต 3 เดือนล่าสุด
        </button>
      </div>
    </div>
  );
}