'use client';

import { useState, useEffect, useMemo } from 'react';

import { Calendar } from 'lucide-react';

interface TimelineSliderProps {
  onDateRangeChangeAction: (startDate: Date, endDate: Date) => void;
}

// แปลงค่า YYYY-MM ให้เป็นข้อความเดือน+ปีภาษาไทย เช่น "ธันวาคม 2024"
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

  // ตั้งค่าเริ่มต้น = 6 เดือนย้อนหลังจนถึงเดือนปัจจุบัน
  useEffect(() => {
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const startValue = `${sixMonthsAgo.getFullYear()}-${String(sixMonthsAgo.getMonth() + 1).padStart(2, '0')}`;
    const endValue = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    setStartMonth(startValue);
    setEndMonth(endValue);

    const startDate = new Date(sixMonthsAgo.getFullYear(), sixMonthsAgo.getMonth(), 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    onDateRangeChangeAction(startDate, endDate);
  }, [onDateRangeChangeAction]);

  // เรียกเปลี่ยนช่วงเวลาทุกครั้งที่ user ปรับ month
  useEffect(() => {
    if (!startMonth || !endMonth) return;

    const [startYear, startM] = startMonth.split('-').map(Number);
    const [endYear, endM] = endMonth.split('-').map(Number);

    if (!startYear || !startM || !endYear || !endM) return;

    const startDate = new Date(startYear, startM - 1, 1);
    const endDate = new Date(endYear, endM, 0); // วันสุดท้ายของเดือน

    onDateRangeChangeAction(startDate, endDate);
  }, [startMonth, endMonth, onDateRangeChangeAction]);

  // จำนวนเดือนที่เลือก (ใช้แสดงผลให้ user เข้าใจ)
  const selectedMonths = (() => {
    if (!startMonth || !endMonth) return 0;
    const [sy, sm] = startMonth.split('-').map(Number);
    const [ey, em] = endMonth.split('-').map(Number);
    if (!sy || !sm || !ey || !em) return 0;
    return (ey - sy) * 12 + (em - sm) + 1;
  })();

  // เตรียมรายการเดือน/ปีสำหรับ dropdown
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
    const years: number[] = [];
    // ย้อนหลัง 5 ปี และล่วงหน้า 1 ปี (ปรับได้ตามต้องการ)
    for (let y = currentYear - 5; y <= currentYear + 1; y++) {
      years.push(y);
    }
    return years;
  }, []);

  const parseYearMonth = (value: string): { year: number; month: number } | null => {
    if (!value) return null;
    const [y, m] = value.split('-').map(Number);
    if (!y || !m) return null;
    return { year: y, month: m };
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3 mb-1">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Calendar className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-800 text-lg">เลือกช่วงเวลา</h3>
          <p className="text-sm text-slate-500">เลือกเดือนเริ่มต้นและสิ้นสุดที่ต้องการดูพนักงานใหม่</p>
        </div>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* From Month */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-700">จากเดือน</label>

          {(() => {
            const parsed = parseYearMonth(startMonth);
            const year = parsed?.year ?? new Date().getFullYear();
            const month = parsed?.month ?? new Date().getMonth() + 1;

            const handleChange = (newYear: number, newMonth: number) => {
              const value = `${newYear}-${String(newMonth).padStart(2, '0')}`;
              setStartMonth(value);
            };

            return (
              <div className="flex gap-2">
                <select
                  className="w-1/2 px-3 py-2 border border-slate-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={month}
                  onChange={(e) => handleChange(year, Number(e.target.value))}
                >
                  {monthOptions.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
                <select
                  className="w-1/2 px-3 py-2 border border-slate-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={year}
                  onChange={(e) => handleChange(Number(e.target.value), month)}
                >
                  {yearOptions.map((y) => (
                    <option key={y} value={y}>
                      {y + 543}
                    </option>
                  ))}
                </select>
              </div>
            );
          })()}
        </div>

        {/* To Month */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-700">ถึงเดือน</label>

          {(() => {
            const parsed = parseYearMonth(endMonth);
            const year = parsed?.year ?? new Date().getFullYear();
            const month = parsed?.month ?? new Date().getMonth() + 1;

            const handleChange = (newYear: number, newMonth: number) => {
              const value = `${newYear}-${String(newMonth).padStart(2, '0')}`;
              setEndMonth(value);
            };

            return (
              <div className="flex gap-2">
                <select
                  className="w-1/2 px-3 py-2 border border-slate-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={month}
                  onChange={(e) => handleChange(year, Number(e.target.value))}
                >
                  {monthOptions.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
                <select
                  className="w-1/2 px-3 py-2 border border-slate-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={year}
                  onChange={(e) => handleChange(Number(e.target.value), month)}
                >
                  {yearOptions.map((y) => (
                    <option key={y} value={y}>
                      {y + 543}
                    </option>
                  ))}
                </select>
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
          }}
          className="px-3 py-1 rounded-full border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
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
          }}
          className="px-3 py-1 rounded-full border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
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
          }}
          className="px-3 py-1 rounded-full border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
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
          }}
          className="px-3 py-1 rounded-full border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
        >
          12 เดือนล่าสุด
        </button>
      </div>

      {/* Summary */}
      <div className="flex items-center justify-between text-sm text-slate-600 bg-slate-50 rounded-xl px-3 py-2 mt-1 border border-slate-200">
        <span>
          แสดงพนักงานที่เข้าทำงานในช่วงประมาณ <span className="font-semibold text-blue-700">{selectedMonths}</span> เดือน
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