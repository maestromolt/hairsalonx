'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Clock, Loader2 } from 'lucide-react';
import { cn, formatPrice, formatDuration } from '@/lib/utils';
import { getSupabaseClient } from '@/lib/supabase';

interface Service {
  id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price: number;
  is_active: boolean;
}

export default function ServicesManager() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration_minutes: 30,
    price: 0,
  });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    const { data } = await getSupabaseClient()
      .from('services')
      .select('*')
      .order('name');
    if (data) setServices(data);
    setLoading(false);
  };

  const handleSave = async () => {
    if (editingId) {
      await getSupabaseClient()
        .from('services')
        // @ts-ignore
        .update(formData)
        .eq('id', editingId);
    } else {
      await getSupabaseClient().from('services')
        // @ts-ignore
        .insert({
          ...formData,
          is_active: true,
          salon_id: services[0]?.id ? undefined : undefined,
        });
    }
    setShowForm(false);
    setEditingId(null);
    setFormData({ name: '', description: '', duration_minutes: 30, price: 0 });
    fetchServices();
  };

  const handleEdit = (service: Service) => {
    setEditingId(service.id);
    setFormData({
      name: service.name,
      description: service.description || '',
      duration_minutes: service.duration_minutes,
      price: service.price,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this service?')) {
      await getSupabaseClient().from('services').delete().eq('id', id);
      fetchServices();
    }
  };

  // Deduplicate by name for display
  const uniqueServices = services.reduce((acc, s) => {
    if (!acc.find(existing => existing.name === s.name)) {
      acc.push(s);
    }
    return acc;
  }, [] as Service[]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Services</h2>
          <p className="text-sm text-gray-500">{uniqueServices.length} services configured</p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingId(null);
            setFormData({ name: '', description: '', duration_minutes: 30, price: 0 });
          }}
          className="btn-primary text-xs gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Service
        </button>
      </div>

      {/* Service Form */}
      {showForm && (
        <div className="mb-6 p-6 bg-white rounded-xl border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">
            {editingId ? 'Edit Service' : 'New Service'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
              <input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input text-sm"
                placeholder="e.g. Haircut"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
              <input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input text-sm"
                placeholder="Optional description"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Duration (minutes)</label>
              <input
                type="number"
                value={formData.duration_minutes}
                onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 0 })}
                className="input text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Price (€)</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                className="input text-sm"
                step="0.01"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleSave} className="btn-primary text-xs">
              {editingId ? 'Update' : 'Create'}
            </button>
            <button
              onClick={() => { setShowForm(false); setEditingId(null); }}
              className="btn-secondary text-xs"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Services List */}
      <div className="space-y-2">
        {uniqueServices.map((service) => (
          <div
            key={service.id}
            className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-all"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-gray-900">{service.name}</h3>
                <span className={cn(
                  'px-1.5 py-0.5 rounded text-[10px] font-medium',
                  service.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                )}>
                  {service.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              {service.description && (
                <p className="text-xs text-gray-500 mt-0.5">{service.description}</p>
              )}
              <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDuration(service.duration_minutes)}
                </span>
                <span className="font-semibold text-gray-700">{formatPrice(service.price)}</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleEdit(service)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5 text-gray-400" />
              </button>
              <button
                onClick={() => handleDelete(service.id)}
                className="p-2 rounded-lg hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5 text-gray-400 hover:text-red-500" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
