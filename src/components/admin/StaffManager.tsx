'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Mail, Loader2 } from 'lucide-react';
import { cn, getInitials } from '@/lib/utils';
import { getSupabaseClient } from '@/lib/supabase';

interface StaffMember {
  id: string;
  name: string;
  email: string;
  is_active: boolean;
}

export default function StaffManager() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '' });

  const colors = [
    'bg-rose-100 text-rose-700',
    'bg-sky-100 text-sky-700',
    'bg-amber-100 text-amber-700',
    'bg-emerald-100 text-emerald-700',
    'bg-violet-100 text-violet-700',
  ];

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    const { data } = await getSupabaseClient()
      .from('staff')
      .select('*')
      .order('name');
    if (data) setStaff(data);
    setLoading(false);
  };

  // Deduplicate
  const uniqueStaff = staff.reduce((acc, s) => {
    if (!acc.find(existing => existing.name === s.name)) {
      acc.push(s);
    }
    return acc;
  }, [] as StaffMember[]);

  const handleSave = async () => {
    if (editingId) {
      await getSupabaseClient().from('staff')
        // @ts-ignore
        .update(formData).eq('id', editingId);
    } else {
      await getSupabaseClient().from('staff')
        // @ts-ignore
        .insert({ ...formData, is_active: true });
    }
    setShowForm(false);
    setEditingId(null);
    setFormData({ name: '', email: '' });
    fetchStaff();
  };

  const handleEdit = (member: StaffMember) => {
    setEditingId(member.id);
    setFormData({ name: member.name, email: member.email });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to remove this staff member?')) {
      await getSupabaseClient().from('staff').delete().eq('id', id);
      fetchStaff();
    }
  };

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
          <h2 className="text-lg font-bold text-gray-900">Staff</h2>
          <p className="text-sm text-gray-500">{uniqueStaff.length} team members</p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingId(null);
            setFormData({ name: '', email: '' });
          }}
          className="btn-primary text-xs gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Staff
        </button>
      </div>

      {/* Staff Form */}
      {showForm && (
        <div className="mb-6 p-6 bg-white rounded-xl border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">
            {editingId ? 'Edit Staff Member' : 'New Staff Member'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
              <input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input text-sm"
                placeholder="e.g. Emma de Vries"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
              <input
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input text-sm"
                placeholder="emma@salon.com"
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

      {/* Staff Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {uniqueStaff.map((member, i) => (
          <div
            key={member.id}
            className="p-4 bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm',
                colors[i % colors.length]
              )}>
                {getInitials(member.name)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-gray-900 truncate">{member.name}</h3>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Mail className="w-3 h-3" />
                  <span className="truncate">{member.email}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
              <span className={cn(
                'px-1.5 py-0.5 rounded text-[10px] font-medium',
                member.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
              )}>
                {member.is_active ? 'Active' : 'Inactive'}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleEdit(member)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Edit2 className="w-3 h-3 text-gray-400" />
                </button>
                <button
                  onClick={() => handleDelete(member.id)}
                  className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-3 h-3 text-gray-400 hover:text-red-500" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
