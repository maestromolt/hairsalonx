'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Clock, User, Loader2, Scissors as ScissorsIcon } from 'lucide-react';
import { format, addDays, startOfWeek, eachDayOfInterval, isSameDay, isToday } from 'date-fns';
import { cn } from '@/lib/utils';
import { getSupabaseClient } from '@/lib/supabase';

interface Booking {
  id: string;
  service_name: string;
  service_duration: number;
  service_price: number;
  booking_date: string;
  booking_time: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  status: string;
}

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({
    start: weekStart,
    end: addDays(weekStart, 6),
  });

  const timeSlots = Array.from({ length: 24 }, (_, i) => {
    const hour = Math.floor(i / 2) + 9;
    const min = i % 2 === 0 ? '00' : '30';
    return `${hour.toString().padStart(2, '0')}:${min}`;
  }).filter((t) => {
    const h = parseInt(t);
    return h >= 9 && h <= 20;
  });

  useEffect(() => {
    fetchBookings();
  }, [currentDate]);

  const fetchBookings = async () => {
    setLoading(true);
    const startDate = format(weekStart, 'yyyy-MM-dd');
    const endDate = format(addDays(weekStart, 6), 'yyyy-MM-dd');

    const { data, error } = await getSupabaseClient()
      .from('bookings')
      .select('*')
      .gte('booking_date', startDate)
      .lte('booking_date', endDate)
      .order('booking_time');

    if (!error && data) {
      setBookings(data);
    }
    setLoading(false);
  };

  const getBookingsForDayAndTime = (day: Date, time: string) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    return bookings.filter(
      (b) => b.booking_date === dateStr && b.booking_time.startsWith(time)
    );
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 border-yellow-200 text-yellow-800',
    confirmed: 'bg-blue-100 border-blue-200 text-blue-800',
    completed: 'bg-green-100 border-green-200 text-green-800',
    cancelled: 'bg-red-100 border-red-200 text-red-800',
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Calendar</h2>
          <p className="text-sm text-gray-500">
            {format(weekStart, 'MMMM d')} - {format(addDays(weekStart, 6), 'MMMM d, yyyy')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentDate(addDays(currentDate, -7))}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Today
          </button>
          <button
            onClick={() => setCurrentDate(addDays(currentDate, 7))}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : (
        <>
          {/* Mobile View - Day by Day */}
          <div className="lg:hidden space-y-4">
            {weekDays.map((day) => {
              const dayBookings = bookings.filter(b => b.booking_date === format(day, 'yyyy-MM-dd'));
              return (
                <div key={day.toISOString()} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className={cn(
                    'p-3 border-b border-gray-200',
                    isToday(day) ? 'bg-brand-50' : 'bg-gray-50'
                  )}>
                    <div className="text-xs text-gray-500 font-medium">{format(day, 'EEEE')}</div>
                    <div className={cn(
                      'text-sm font-semibold mt-0.5',
                      isToday(day) ? 'text-brand-600' : 'text-gray-900'
                    )}>
                      {format(day, 'MMMM d')}
                    </div>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {dayBookings.length === 0 ? (
                      <div className="p-4 text-sm text-gray-400 text-center">No appointments</div>
                    ) : (
                      dayBookings.map((booking) => (
                        <button
                          key={booking.id}
                          onClick={() => setSelectedBooking(booking)}
                          className="w-full p-3 flex items-center gap-3 hover:bg-gray-50 transition-colors"
                        >
                          <div className="text-sm font-medium text-gray-900 min-w-[50px]">
                            {booking.booking_time.slice(0, 5)}
                          </div>
                          <div className="flex-1 text-left">
                            <div className="text-sm font-semibold text-gray-900">{booking.customer_name}</div>
                            <div className="text-xs text-gray-500">{booking.service_name}</div>
                          </div>
                          <span className={cn(
                            'px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize',
                            statusColors[booking.status] || statusColors.pending
                          )}>
                            {booking.status}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop View - Week Grid */}
          <div className="hidden lg:block bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Day headers */}
            <div className="grid grid-cols-[80px_repeat(7,1fr)] border-b border-gray-200">
              <div className="p-3 bg-gray-50" />
              {weekDays.map((day) => (
                <div
                  key={day.toISOString()}
                  className={cn(
                    'p-3 text-center border-l border-gray-200',
                    isToday(day) ? 'bg-brand-50' : 'bg-gray-50'
                  )}
                >
                  <div className="text-xs text-gray-500 font-medium">{format(day, 'EEE')}</div>
                  <div className={cn(
                    'text-sm font-semibold mt-0.5',
                    isToday(day) ? 'text-brand-600' : 'text-gray-900'
                  )}>
                    {format(day, 'd')}
                  </div>
                </div>
              ))}
            </div>

            {/* Time grid */}
            <div className="max-h-[600px] overflow-y-auto">
              {timeSlots.map((time) => (
                <div key={time} className="grid grid-cols-[80px_repeat(7,1fr)] border-b border-gray-100 last:border-b-0">
                  <div className="p-2 text-xs text-gray-400 text-right pr-3 bg-gray-50/50">
                    {time}
                  </div>
                  {weekDays.map((day) => {
                    const dayBookings = getBookingsForDayAndTime(day, time);
                    return (
                      <div
                        key={day.toISOString()}
                        className="min-h-[48px] p-1 border-l border-gray-100 hover:bg-gray-50/50 transition-colors"
                      >
                        {dayBookings.map((booking) => (
                          <button
                            key={booking.id}
                            onClick={() => setSelectedBooking(booking)}
                            className={cn(
                              'w-full text-left p-1.5 rounded-lg text-[10px] border transition-all hover:shadow-sm mb-0.5',
                              statusColors[booking.status] || statusColors.pending
                            )}
                          >
                            <div className="font-semibold truncate">{booking.customer_name}</div>
                            <div className="truncate opacity-70">{booking.service_name}</div>
                          </button>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => setSelectedBooking(null)}>
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                <ScissorsIcon className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{selectedBooking.service_name}</h3>
                <span className={cn(
                  'inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize',
                  statusColors[selectedBooking.status] || statusColors.pending
                )}>
                  {selectedBooking.status}
                </span>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <User className="w-4 h-4 text-gray-400" />
                <span>{selectedBooking.customer_name}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-4 h-4 text-gray-400" />
                <span>{selectedBooking.booking_date} at {selectedBooking.booking_time}</span>
              </div>
              {selectedBooking.customer_email && (
                <div className="text-gray-500 text-xs">{selectedBooking.customer_email}</div>
              )}
              {selectedBooking.customer_phone && (
                <div className="text-gray-500 text-xs">{selectedBooking.customer_phone}</div>
              )}
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setSelectedBooking(null)}
                className="btn-secondary flex-1 text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
