"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";

interface BookedRange {
  startDate: string | Date;
  endDate: string | Date;
  status: string;
}

interface AvailabilityCalendarProps {
  bookedRanges?: BookedRange[];
}

export default function AvailabilityCalendar({ bookedRanges = [] }: AvailabilityCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  function prevMonth() {
    setCurrentDate(new Date(year, month - 1, 1));
  }

  function nextMonth() {
    setCurrentDate(new Date(year, month + 1, 1));
  }

  function getDayStatus(day: number) {
    const targetDate = new Date(year, month, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (targetDate < today) {
      return "past";
    }

    for (const range of bookedRanges) {
      const s = new Date(range.startDate);
      const e = new Date(range.endDate);
      s.setHours(0, 0, 0, 0);
      e.setHours(23, 59, 59, 999);

      if (targetDate >= s && targetDate <= e) {
        if (range.status === "BORROWED") return "borrowed";
        if (range.status === "APPROVED" || range.status === "RESERVED") return "reserved";
      }
    }
    return "available";
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-emerald-600" />
          <h4 className="text-sm font-bold text-slate-800">
            {monthNames[month]} {year}
          </h4>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={nextMonth}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Days of week header */}
      <div className="grid grid-cols-7 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
        <span>Sun</span>
        <span>Mon</span>
        <span>Tue</span>
        <span>Wed</span>
        <span>Thu</span>
        <span>Fri</span>
        <span>Sat</span>
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {Array.from({ length: firstDayIndex }).map((_, i) => (
          <div key={`empty-${i}`} className="h-8"></div>
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const status = getDayStatus(day);

          let colorClasses = "bg-emerald-50 text-emerald-800 font-semibold border-emerald-200 hover:bg-emerald-100";
          if (status === "past") colorClasses = "bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed";
          if (status === "reserved") colorClasses = "bg-amber-100 text-amber-800 font-bold border-amber-300";
          if (status === "borrowed") colorClasses = "bg-rose-100 text-rose-800 font-bold border-rose-300";

          return (
            <div
              key={`day-${day}`}
              className={`h-8 rounded-lg flex items-center justify-center border text-xs transition ${colorClasses}`}
            >
              {day}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-around text-[10px] text-slate-600">
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          <span>Available</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          <span>Reserved</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
          <span>Borrowed</span>
        </div>
      </div>
    </div>
  );
}
