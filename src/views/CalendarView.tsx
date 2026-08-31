import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  CheckCircle2,
  Circle,
} from 'lucide-react';
import { useItems } from '../context/ItemsContext';
import { getCategoryInfo, getPriorityBadge } from '../utils/categoryHelpers';
import { LifeItem } from '../types';

export const CalendarView: React.FC = () => {
  const { items, setIsQuickCaptureOpen, setSelectedItemForDetail, toggleComplete } = useItems();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDay(today.toISOString().split('T')[0]);
  };

  // Build days for month grid
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const days: Array<{ dateStr: string; dayNum: number; isCurrentMonth: boolean }> = [];

  // Prev month padding
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    const prevMonthNum = month === 0 ? 12 : month;
    const prevYear = month === 0 ? year - 1 : year;
    const dateStr = `${prevYear}-${String(prevMonthNum).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    days.push({ dateStr, dayNum: d, isCurrentMonth: false });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    days.push({ dateStr, dayNum: i, isCurrentMonth: true });
  }

  // Next month padding to fill 35 or 42 grid cells
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    const nextMonthNum = month === 11 ? 1 : month + 2;
    const nextYear = month === 11 ? year + 1 : year;
    const dateStr = `${nextYear}-${String(nextMonthNum).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    days.push({ dateStr, dayNum: i, isCurrentMonth: false });
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const activeSelectedDate = selectedDay || todayStr;

  // Find items for selected date
  const dayItems = items.filter((item) => item.date === activeSelectedDate);

  return (
    <div className="space-y-5 max-w-6xl mx-auto pb-12">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white font-display">
            Life Calendar & Schedule
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Appointments, bills, deliveries, and maintenance timelines
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={goToToday}
            className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200"
          >
            Today
          </button>
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs font-bold text-slate-800 dark:text-slate-200">
              {monthNames[month]} {year}
            </span>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={() => setIsQuickCaptureOpen(true)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add Item</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Month Grid */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-xs">
          {/* Day of week headers */}
          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* Days cells */}
          <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
            {days.map((d, idx) => {
              const dayItemsForCell = items.filter((item) => item.date === d.dateStr);
              const isToday = d.dateStr === todayStr;
              const isSelected = d.dateStr === activeSelectedDate;

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedDay(d.dateStr)}
                  className={`min-h-[64px] sm:min-h-[85px] p-1.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/40 shadow-xs'
                      : isToday
                      ? 'border-indigo-300 dark:border-indigo-800 bg-slate-50 dark:bg-slate-800/40'
                      : d.isCurrentMonth
                      ? 'border-slate-100 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 bg-transparent'
                      : 'border-transparent text-slate-300 dark:text-slate-700 bg-slate-50/30 dark:bg-slate-900/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full ${
                        isToday
                          ? 'bg-indigo-600 text-white'
                          : isSelected
                          ? 'text-indigo-600 dark:text-indigo-400 font-extrabold'
                          : d.isCurrentMonth
                          ? 'text-slate-800 dark:text-slate-200'
                          : 'text-slate-300 dark:text-slate-700'
                      }`}
                    >
                      {d.dayNum}
                    </span>
                    {dayItemsForCell.length > 0 && (
                      <span className="text-[10px] font-bold text-slate-400">
                        {dayItemsForCell.length}
                      </span>
                    )}
                  </div>

                  {/* Badges preview */}
                  <div className="space-y-0.5 overflow-hidden">
                    {dayItemsForCell.slice(0, 2).map((item) => {
                      const catInfo = getCategoryInfo(item.category);
                      return (
                        <div
                          key={item.id}
                          className={`text-[9px] px-1 py-0.5 rounded font-medium truncate flex items-center gap-1 ${
                            item.completed ? 'opacity-50 line-through' : ''
                          } ${catInfo.bgLight} ${catInfo.textColor} ${catInfo.bgDark}`}
                        >
                          <span>{catInfo.emoji}</span>
                          <span className="truncate">{item.title}</span>
                        </div>
                      );
                    })}
                    {dayItemsForCell.length > 2 && (
                      <span className="text-[9px] text-slate-400 font-bold pl-1">
                        +{dayItemsForCell.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Day Agenda */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs flex flex-col space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Selected Day
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
                {new Date(activeSelectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
              </h3>
            </div>

            <button
              onClick={() => setIsQuickCaptureOpen(true)}
              className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 text-xs font-semibold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3">
            {dayItems.length > 0 ? (
              dayItems.map((item) => {
                const catInfo = getCategoryInfo(item.category);
                const priorityBadge = getPriorityBadge(item.priority);

                return (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-2 hover:border-slate-300 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleComplete(item.id)}
                          className="p-1 rounded text-slate-400 hover:text-emerald-600"
                        >
                          {item.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Circle className="w-4 h-4" />
                          )}
                        </button>
                        <span className="text-sm">{catInfo.emoji}</span>
                        <h4
                          onClick={() => setSelectedItemForDetail(item)}
                          className={`text-xs font-bold text-slate-900 dark:text-white cursor-pointer hover:underline truncate ${
                            item.completed ? 'line-through text-slate-400' : ''
                          }`}
                        >
                          {item.title}
                        </h4>
                      </div>
                      <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold border ${priorityBadge.badgeClass}`}>
                        {priorityBadge.label}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/50 dark:border-slate-700/50">
                      {item.time ? <span>⏰ {item.time}</span> : <span>📅 All day</span>}
                      {item.amount && <span className="font-bold text-slate-900 dark:text-white">${item.amount}</span>}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs space-y-2">
                <CalendarIcon className="w-8 h-8 mx-auto text-slate-300" />
                <p>No events or deadlines scheduled for this day.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
