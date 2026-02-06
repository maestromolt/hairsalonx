'use client';

import { useState, useEffect } from 'react';
import { Calendar, Users, TrendingUp, Clock, Loader2 } from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns';
import { getSupabaseClient } from '@/lib/supabase';

interface Booking {
  id: string;
  service_name: string;
  service_price: number;
  booking_date: string;
  booking_time: string;
  customer_name: string;
  status: string;
}

export default function DashboardStats() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    const monthStart = format(startOfMonth(today), 'yyyy-MM-dd');
    const monthEnd = format(endOfMonth(today), 'yyyy-MM-dd');

    const { data } = await getSupabaseClient()
      .from('bookings')
      .select('*')
      .gte('booking_date', monthStart)
      .lte('booking_date', monthEnd)
      .order('booking_date')
      .order('booking_time');

    if (data) setBookings(data);
    setLoading(false);
  };

  const todayBookings = bookings.filter((b) => b.booking_date === todayStr);
  const weekStart = format(startOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd');
  const weekEnd = format(endOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd');
  const weekBookings = bookings.filter((b) => b.booking_date >= weekStart && b.booking_date <= weekEnd);
  const monthlyRevenue = bookings.reduce((sum, b) => sum + (b.service_price || 0), 0);

  const stats = [
    {
      label: "Today's Appointments",
      value: todayBookings.length.toString(),
      icon: Calendar,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      label: 'This Week',
      value: weekBookings.length.toString(),
      icon: Clock,
      color: 'bg-purple-100 text-purple-600',
    },
    {
      label: 'Monthly Bookings',
      value: bookings.length.toString(),
      icon: Users,
      color: 'bg-green-100 text-green-600',
    },
    {
      label: 'Monthly Revenue',
      value: `€${monthlyRevenue.toFixed(0)}`,
      icon: TrendingUp,
      color: 'bg-orange-100 text-orange-600',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-900">Dashboard</h2>
        <p className="text-sm text-gray-500">{format(today, 'EEEE, MMMM d, yyyy')}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="p-5 bg-white rounded-xl border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Today's Appointments */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Today&apos;s Appointments</h3>
        {todayBookings.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-400">No appointments today</p>
          </div>
        ) : (
          <div className="space-y-3">
            {todayBookings.map((booking) => (
              <div
                key={booking.id}
                className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="text-center min-w-[48px]">
                    <div className="text-sm font-bold text-gray-900">{booking.booking_time.slice(0, 5)}</div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{booking.customer_name}</p>
                    <p className="text-xs text-gray-500">{booking.service_name}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-[10px] font-semibold capitalize ${
                  booking.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                  booking.status === 'completed' ? 'bg-green-100 text-green-700' :
                  booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {booking.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Bookings - Table on desktop, Cards on mobile */}
      <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Recent Bookings This Month</h3>
        
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs font-medium text-gray-500 pb-3">Customer</th>
                <th className="text-left text-xs font-medium text-gray-500 pb-3">Service</th>
                <th className="text-left text-xs font-medium text-gray-500 pb-3">Date</th>
                <th className="text-left text-xs font-medium text-gray-500 pb-3">Time</th>
                <th className="text-left text-xs font-medium text-gray-500 pb-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {bookings.slice(0, 10).map((b) => (
                <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 text-gray-900 font-medium">{b.customer_name}</td>
                  <td className="py-3 text-gray-600">{b.service_name}</td>
                  <td className="py-3 text-gray-600">{b.booking_date}</td>
                  <td className="py-3 text-gray-600">{b.booking_time?.slice(0, 5)}</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${
                      b.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                      b.status === 'completed' ? 'bg-green-100 text-green-700' :
                      b.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-3">
          {bookings.slice(0, 10).map((b) => (
            <div key={b.id} className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{b.customer_name}</p>
                  <p className="text-xs text-gray-500">{b.service_name}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${
                  b.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                  b.status === 'completed' ? 'bg-green-100 text-green-700' :
                  b.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {b.status}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>{b.booking_date}</span>
                <span>{b.booking_time?.slice(0, 5)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
