'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Calendar } from 'lucide-react';

interface TimelineSliderProps {
  onDateRangeChangeAction: (startDate: Date, endDate: Date) => void;
}

export default function TimelineSlider({ onDateRangeChangeAction }: TimelineSliderProps) {
  const [startValue, setStartValue] = useState<number>(6); // เริ่มที่ 6 เดือนที่แล้ว
  const [endValue, setEndValue] = useState<number>(11); // สิ้นสุดที่เดือนปัจจุบัน (index 11 = เดือนปัจจุบัน)
  const [isDragging, setIsDragging] = useState<'start' | 'end' | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const monthLabelsRef = useRef<HTMLDivElement>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);

  const monthNames = [
    'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
    'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
  ];

  const monthNamesFull = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];

  // สร้างข้อมูลเดือนย้อนหลัง 12 เดือน รวมเดือนปัจจุบัน
  const generateMonthData = () => {
    const months = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        index: 11 - i,
        month: date.getMonth(),
        year: date.getFullYear(),
        label: `${monthNames[date.getMonth()]}`,
        fullLabel: `${monthNamesFull[date.getMonth()]} ${date.getFullYear() + 543}`,
        date: date
      });
    }
    return months;
  };

  const months = generateMonthData();

  // แปลงค่า slider เป็นวันที่
  const getDateFromValue = (value: number, isEnd: boolean = false) => {
    const monthData = months[value];
    if (isEnd) {
      // สำหรับวันที่สิ้นสุด ให้เป็นวันสุดท้ายของเดือน
      return new Date(monthData.year, monthData.month + 1, 0);
    } else {
      // สำหรับวันที่เริ่มต้น ให้เป็นวันที่ 1 ของเดือน
      return new Date(monthData.year, monthData.month, 1);
    }
  };

  // ฟังก์ชันสำหรับเรียก onDateRangeChangeAction พร้อม debouncing
  const triggerDateRangeChange = useCallback((startDate: Date, endDate: Date, immediate: boolean = false) => {
    // ยกเลิก timeout ก่อนหน้า (ถ้ามี)
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdateRef.current;
    
    // ถ้ากำลังลาก ให้รอ 300ms หลังจากหยุดลาก หรือถ้าเวลาผ่านไปเกิน 100ms ให้อัปเดตทันที
    if (isDragging && !immediate) {
      if (timeSinceLastUpdate > 100) {
        onDateRangeChangeAction(startDate, endDate);
        lastUpdateRef.current = now;
      } else {
        debounceTimeoutRef.current = setTimeout(() => {
          onDateRangeChangeAction(startDate, endDate);
          lastUpdateRef.current = Date.now();
        }, 300);
      }
    } else {
      // ถ้าไม่ได้ลาก (เช่น คลิก reset) ให้เรียกทันที
      onDateRangeChangeAction(startDate, endDate);
      lastUpdateRef.current = now;
    }
  }, [isDragging, onDateRangeChangeAction]);

  // Cleanup timeout เมื่อ component unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const startDate = getDateFromValue(startValue);
    const endDate = getDateFromValue(endValue, true);
    triggerDateRangeChange(startDate, endDate);
  }, [startValue, endValue, triggerDateRangeChange]);

  // Handle mouse/touch events for dragging
  const handlePointerDown = (type: 'start' | 'end') => {
    setIsDragging(type);
    // ป้องกันการเลือกข้อความขณะลาก
    document.body.style.userSelect = 'none';
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !sliderRef.current || !monthLabelsRef.current) return;

    e.preventDefault();

    // ใช้ requestAnimationFrame เพื่อความสมูท
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    animationFrameRef.current = requestAnimationFrame(() => {
      const sliderRect = sliderRef.current!.getBoundingClientRect();
      const monthLabelsRect = monthLabelsRef.current!.getBoundingClientRect();
      
      // คำนวณตำแหน่งโดยคำนึงถึง padding ของ month labels
      const paddingOffset = monthLabelsRect.left - sliderRect.left;
      const effectiveWidth = monthLabelsRect.width;
      
      const x = e.clientX - monthLabelsRect.left;
      const percentage = Math.max(0, Math.min(1, x / effectiveWidth));
      const value = Math.round(percentage * 11);

      if (isDragging === 'start') {
        setStartValue(prev => Math.min(Math.max(0, value), Math.min(endValue, 11)));
      } else if (isDragging === 'end') {
        setEndValue(prev => Math.max(Math.max(value, startValue), 0));
      }
    });
  };

  const handlePointerUp = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    // คืนค่าการเลือกข้อความ
    document.body.style.userSelect = '';
    
    if (isDragging) {
      // เมื่อหยุดลาก ให้เรียก onDateRangeChangeAction ทันที
      const startDate = getDateFromValue(startValue);
      const endDate = getDateFromValue(endValue, true);
      triggerDateRangeChange(startDate, endDate, true);
    }
    setIsDragging(null);
  };

  // Handle Tab key press on month labels
  const handleMonthKeyDown = (e: React.KeyboardEvent, monthIndex: number) => {
    if (e.key === 'Tab' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      // เลือกเดือนเดียวเมื่อกด Tab
      setStartValue(monthIndex);
      setEndValue(monthIndex);
    }
  };

  const leftPercent = (startValue / 11) * 100;
  const rightPercent = ((11 - endValue) / 11) * 100;
  
  // คำนวณตำแหน่งจริงของ handles โดยคำนึงถึง padding
  const getHandlePosition = (value: number) => {
    if (!monthLabelsRef.current) return `${(value / 11) * 100}%`;
    
    const sliderWidth = sliderRef.current?.getBoundingClientRect().width || 0;
    const monthLabelsWidth = monthLabelsRef.current.getBoundingClientRect().width;
    const paddingOffset = (sliderWidth - monthLabelsWidth) / 2;
    
    const percentage = value / 11;
    const position = (percentage * monthLabelsWidth + paddingOffset) / sliderWidth * 100;
    
    return `${position}%`;
  };
  const selectedMonths = endValue - startValue + 1;

  const startMonth = months[startValue];
  const endMonth = months[endValue];

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Calendar className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-800 text-lg">ช่วงเวลา</h3>
          <p className="text-sm text-slate-500">ลากแถบเพื่อเลือกช่วงเวลาที่ต้องการ</p>
        </div>
      </div>

      {/* Date Display */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-600">จาก:</span>
            <span className="px-4 py-2 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 rounded-lg font-semibold text-sm shadow-sm">
              {startMonth.fullLabel}
            </span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full">
              <span className="text-sm font-bold text-slate-700">{selectedMonths}</span>
              <span className="text-xs text-slate-500">เดือน</span>
            </div>
            <div className="flex items-center gap-2"></div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-600">ถึง:</span>
            <span className="px-4 py-2 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 rounded-lg font-semibold text-sm shadow-sm">
              {endMonth.fullLabel}
            </span>
          </div>
        </div>

        {/* Range Slider */}
        <div className="relative py-8">
          {/* Month Labels */}
          <div className="flex justify-between mb-3 px-2" ref={monthLabelsRef}>
            {months.map((month, index) => (
              <div
                key={index}
                className={`flex flex-col items-center ${
                  index >= startValue && index <= endValue
                    ? 'opacity-100'
                    : 'opacity-30'
                }`}
                style={{
                  width: '8.33%',
                  transition: 'opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                <div className={`w-0.5 h-3 rounded-full ${
                  index >= startValue && index <= endValue
                    ? 'bg-blue-500'
                    : 'bg-slate-300'
                } ${
                  index === 11 ? 'bg-orange-500' : '' // เดือนปัจจุบันเป็นสีส้ม
                }`}></div>
                <span 
                  className={`text-xs mt-1.5 font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 rounded ${
                    index >= startValue && index <= endValue
                      ? 'text-blue-600'
                      : 'text-slate-400'
                  } ${
                    index === 11 ? 'text-orange-600 font-bold' : '' // เดือนปัจจุบันเป็นสีส้มและตัวหนา
                  }`}
                  tabIndex={0}
                  onKeyDown={(e) => handleMonthKeyDown(e, index)}
                  onClick={() => {
                    // เลือกเดือนเดียวเมื่อคลิก
                    setStartValue(index);
                    setEndValue(index);
                  }}
                >
                  {month.label}
                  {index === 11 && (
                    <span className="block text-xs text-orange-500 mt-0.5">ปัจจุบัน</span>
                  )}
                </span>
              </div>
            ))}
          </div>

          {/* Slider Track */}
          <div
            ref={sliderRef}
            className="relative h-4 cursor-pointer"
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            {/* Background Track */}
            <div className="absolute top-1/2 -translate-y-1/2 w-full h-2 bg-slate-200 rounded-full"></div>

            {/* Active Range */}
            <div
              className="absolute top-1/2 -translate-y-1/2 h-2 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-500 rounded-full shadow-md"
              style={{
                left: getHandlePosition(startValue),
                right: `${100 - parseFloat(getHandlePosition(endValue))}%`,
                transition: isDragging ? 'none' : 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1), right 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-400 rounded-full blur-sm opacity-50"></div>
            </div>

            {/* Start Handle */}
            <div
              className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 bg-white border-3 border-blue-500 rounded-full shadow-lg cursor-grab active:cursor-grabbing touch-none ${
                isDragging === 'start' ? 'scale-125 shadow-xl ring-2 ring-blue-300 ring-offset-2' : 'hover:scale-110'
              }`}
              style={{
                left: getHandlePosition(startValue),
                transition: isDragging === 'start' ? 'none' : 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), left 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
              onPointerDown={() => handlePointerDown('start')}
            >
              <div className={`absolute inset-1 bg-blue-500 rounded-full transition-colors duration-200 ${
                isDragging === 'start' ? 'bg-blue-600' : ''
              }`}></div>
            </div>

            {/* End Handle */}
            <div
              className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 bg-white border-3 border-blue-500 rounded-full shadow-lg cursor-grab active:cursor-grabbing touch-none ${
                isDragging === 'end' ? 'scale-125 shadow-xl ring-2 ring-blue-300 ring-offset-2' : 'hover:scale-110'
              }`}
              style={{
                left: getHandlePosition(endValue),
                transition: isDragging === 'end' ? 'none' : 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), left 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
              onPointerDown={() => handlePointerDown('end')}
            >
              <div className={`absolute inset-1 bg-blue-500 rounded-full transition-colors duration-200 ${
                isDragging === 'end' ? 'bg-blue-600' : ''
              }`}></div>
            </div>
          </div>
        </div>
        
        {/* Timeline Controls */}
        <div className="flex items-center justify-center gap-4 mt-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const newStart = Math.max(0, startValue - 1);
                const newEnd = Math.max(newStart, endValue - 1);
                setStartValue(newStart);
                setEndValue(newEnd);
              }}
              className="w-8 h-8 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-full flex items-center justify-center transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={startValue <= 0}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-sm font-medium text-slate-600 min-w-[60px] text-center">เริ่มต้น</span>
            <button
              onClick={() => {
                const newStart = Math.min(endValue, startValue + 1);
                setStartValue(newStart);
              }}
              className="w-8 h-8 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-full flex items-center justify-center transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={startValue >= endValue}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          
          <div className="w-px h-8 bg-slate-300"></div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const newEnd = Math.max(startValue, endValue - 1);
                setEndValue(newEnd);
              }}
              className="w-8 h-8 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-full flex items-center justify-center transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={endValue <= startValue}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-sm font-medium text-slate-600 min-w-[60px] text-center">สิ้นสุด</span>
            <button
              onClick={() => {
                const newEnd = Math.min(11, endValue + 1);
                setEndValue(newEnd);
              }}
              className="w-8 h-8 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-full flex items-center justify-center transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={endValue >= 11}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-slate-50 px-4 py-3 rounded-lg border border-blue-100">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-slate-700">
            แสดงพนักงานที่เข้าทำงานใน <span className="font-bold text-blue-600">{selectedMonths}</span> เดือน
          </span>
        </div>
        <button
          onClick={() => {
            setStartValue(6);
            setEndValue(11);
          }}
          className="text-xs text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors duration-200"
        >
          รีเซ็ต
        </button>
      </div>
    </div>
  );
}