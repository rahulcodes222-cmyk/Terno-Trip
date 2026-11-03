'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ChevronDown } from 'lucide-react';
import type { ITripItineraryDay } from '@/types';

interface ItineraryEditorProps {
  defaultDays?: ITripItineraryDay[];
  onChange: (days: ITripItineraryDay[]) => void;
}

export default function ItineraryEditor({ defaultDays = [], onChange }: ItineraryEditorProps) {
  const [days, setDays] = useState<ITripItineraryDay[]>(defaultDays);
  const [expandedDay, setExpandedDay] = useState<number | null>(null);

  useEffect(() => {
    onChange(days);
  }, [days, onChange]);

  const handleAddDay = () => {
    const newDay: ITripItineraryDay = {
      day: days.length + 1,
      title: '',
      description: '',
      activities: [],
      accommodation: '',
    };
    setDays([...days, newDay]);
    setExpandedDay(days.length);
  };

  const handleRemoveDay = (idx: number) => {
    const updated = days.filter((_, i) => i !== idx).map((d, i) => ({
      ...d,
      day: i + 1,
    }));
    setDays(updated);
  };

  const handleUpdateDay = (idx: number, field: keyof ITripItineraryDay, value: unknown) => {
    const updated = [...days];
    (updated[idx] as unknown as Record<string, unknown>)[field] = value;
    setDays(updated);
  };

  const handleAddActivity = (idx: number) => {
    const updated = [...days];
    if (!Array.isArray(updated[idx].activities)) {
      updated[idx].activities = [];
    }
    updated[idx].activities.push('');
    setDays(updated);
  };

  const handleUpdateActivity = (dayIdx: number, actIdx: number, value: string) => {
    const updated = [...days];
    updated[dayIdx].activities[actIdx] = value;
    setDays(updated);
  };

  const handleRemoveActivity = (dayIdx: number, actIdx: number) => {
    const updated = [...days];
    updated[dayIdx].activities = updated[dayIdx].activities.filter((_, i) => i !== actIdx);
    setDays(updated);
  };

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Day-by-Day Itinerary
        </label>
        <button
          type="button"
          onClick={handleAddDay}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-colors"
          style={{ backgroundColor: '#FF6B00' }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#E65100')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FF6B00')}
        >
          <Plus className="h-3.5 w-3.5" /> Add Day
        </button>
      </div>

      {days.length === 0 ? (
        <p className="rounded-lg border border-dashed border-gray-300 px-4 py-3 text-center text-xs text-gray-500">
          No itinerary days added yet. Click "Add Day" to create one.
        </p>
      ) : (
        <div className="space-y-2">
          {days.map((day, idx) => (
            <div key={idx} className="overflow-hidden rounded-xl border border-gray-200 bg-white">
              {/* Header / Collapsed View */}
              <button
                type="button"
                onClick={() => setExpandedDay(expandedDay === idx ? null : idx)}
                className="flex w-full items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3 text-left">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FF6B00] text-xs font-bold text-white">
                    {day.day}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {day.title || `Day ${day.day}`}
                    </p>
                    <p className="truncate text-xs text-gray-500">
                      {day.description || 'No description'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <ChevronDown
                    className={`h-4 w-4 text-gray-400 transition-transform ${
                      expandedDay === idx ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </button>

              {/* Expanded View */}
              {expandedDay === idx && (
                <div className="border-t border-gray-100 px-4 py-4 space-y-4">
                  {/* Title */}
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-700">
                      Day Title
                    </label>
                    <input
                      type="text"
                      value={day.title}
                      onChange={(e) => handleUpdateDay(idx, 'title', e.target.value)}
                      placeholder="e.g., Arrival & Acclimatization"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#FF6B00] focus:outline-none focus:ring-1 focus:ring-[#FF6B00]"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      value={day.description}
                      onChange={(e) => handleUpdateDay(idx, 'description', e.target.value)}
                      placeholder="What happens on this day..."
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#FF6B00] focus:outline-none focus:ring-1 focus:ring-[#FF6B00] resize-y min-h-[80px]"
                    />
                  </div>

                  {/* Activities */}
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <label className="block text-xs font-medium text-gray-700">
                        Activities
                      </label>
                      <button
                        type="button"
                        onClick={() => handleAddActivity(idx)}
                        className="text-xs text-[#FF6B00] hover:text-[#E65100] font-medium"
                      >
                        + Add Activity
                      </button>
                    </div>
                    <div className="space-y-2">
                      {day.activities.map((act, actIdx) => (
                        <div key={actIdx} className="flex gap-2">
                          <input
                            type="text"
                            value={act}
                            onChange={(e) => handleUpdateActivity(idx, actIdx, e.target.value)}
                            placeholder="e.g., Trek to base camp"
                            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#FF6B00] focus:outline-none focus:ring-1 focus:ring-[#FF6B00]"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveActivity(idx, actIdx)}
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Accommodation */}
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-700">
                      Accommodation
                    </label>
                    <input
                      type="text"
                      value={day.accommodation || ''}
                      onChange={(e) => handleUpdateDay(idx, 'accommodation', e.target.value)}
                      placeholder="e.g., 4-star hotel in Delhi"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#FF6B00] focus:outline-none focus:ring-1 focus:ring-[#FF6B00]"
                    />
                  </div>

                  {/* Remove Day Button */}
                  <div className="flex justify-end border-t pt-3">
                    <button
                      type="button"
                      onClick={() => handleRemoveDay(idx)}
                      className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Remove Day
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <p className="mt-2 text-xs text-gray-400">
        {days.length} day{days.length !== 1 ? 's' : ''} added
      </p>
    </div>
  );
}
