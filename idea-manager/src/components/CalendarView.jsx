import { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
} from 'lucide-react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
} from 'date-fns';
import { ja } from 'date-fns/locale';
import { useApp } from '../contexts/AppContext';
import IdeaCard from './IdeaCard';

const CalendarView = () => {
  const { ideas } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  const ideaCountByDate = useMemo(() => {
    const counts = {};
    ideas.forEach((idea) => {
      const dateKey = format(new Date(idea.createdAt), 'yyyy-MM-dd');
      counts[dateKey] = (counts[dateKey] || 0) + 1;
    });
    return counts;
  }, [ideas]);

  const selectedDateIdeas = useMemo(() => {
    if (!selectedDate) return [];
    return ideas.filter((idea) =>
      isSameDay(new Date(idea.createdAt), selectedDate)
    );
  }, [ideas, selectedDate]);

  const weekDays = ['日', '月', '火', '水', '木', '金', '土'];

  return (
    <div className="calendar-view">
      <div className="calendar-container">
        <div className="calendar-header">
          <button
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            className="btn-icon"
          >
            <ChevronLeft size={20} />
          </button>
          <h2>{format(currentDate, 'yyyy年 M月', { locale: ja })}</h2>
          <button
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            className="btn-icon"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="calendar-grid">
          {weekDays.map((day) => (
            <div key={day} className="calendar-weekday">
              {day}
            </div>
          ))}

          {calendarDays.map((day) => {
            const dateKey = format(day, 'yyyy-MM-dd');
            const count = ideaCountByDate[dateKey] || 0;
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const isToday = isSameDay(day, new Date());

            return (
              <button
                key={dateKey}
                onClick={() => setSelectedDate(day)}
                className={`calendar-day ${!isCurrentMonth ? 'other-month' : ''} ${
                  isSelected ? 'selected' : ''
                } ${isToday ? 'today' : ''} ${count > 0 ? 'has-ideas' : ''}`}
              >
                <span className="day-number">{format(day, 'd')}</span>
                {count > 0 && <span className="idea-count">{count}</span>}
              </button>
            );
          })}
        </div>
      </div>

      <div className="calendar-details">
        {selectedDate ? (
          <>
            <h3>
              <Calendar size={16} />
              {format(selectedDate, 'yyyy年M月d日（E）', { locale: ja })}
            </h3>
            {selectedDateIdeas.length === 0 ? (
              <p className="no-ideas">この日のアイデアはありません</p>
            ) : (
              <div className="date-ideas">
                {selectedDateIdeas.map((idea) => (
                  <IdeaCard key={idea.id} idea={idea} />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="select-date-hint">
            <Calendar size={32} />
            <p>日付を選択してアイデアを表示</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarView;
