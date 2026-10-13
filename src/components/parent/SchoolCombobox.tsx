'use client';

import { useState, useEffect, useRef } from 'react';
import { Check, ChevronsUpDown, Building2, X } from 'lucide-react';
import { matchSchools } from '@/lib/school-matcher';

interface SchoolItem {
  id: string;
  name: string;
  type: string;
  code?: string | null;
  state?: string | null;
  aliases?: string[] | null;
}

interface SchoolComboboxProps {
  value: string;
  onChange: (schoolName: string, schoolType?: 'SK' | 'SMK') => void;
  selectedSchoolType?: 'SK' | 'SMK';
  required?: boolean;
}

export function SchoolCombobox({
  value,
  onChange,
  selectedSchoolType,
  required = false,
}: SchoolComboboxProps) {
  const [inputValue, setInputValue] = useState(value || '');
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<SchoolItem[]>([]);
  const [allSchools, setAllSchools] = useState<SchoolItem[]>([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync external value
  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  // Load initial schools list from API
  useEffect(() => {
    async function loadSchools() {
      try {
        setLoading(true);
        const res = await fetch('/api/schools');
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setAllSchools(json.data);
          setSuggestions(json.data);
        }
      } catch (err) {
        console.error('Gagal memuatkan senarai sekolah:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSchools();
  }, []);

  // Fetch / filter suggestions when query changes
  useEffect(() => {
    const trimmed = inputValue.trim();
    if (!trimmed) {
      setSuggestions(allSchools);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/schools?q=${encodeURIComponent(trimmed)}`);
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setSuggestions(json.data);
        }
      } catch {
        // Fallback to local matcher
        setSuggestions(matchSchools(trimmed, allSchools));
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [inputValue, allSchools]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectSchool = (school: SchoolItem) => {
    setInputValue(school.name);
    setIsOpen(false);
    const inferredType: 'SK' | 'SMK' =
      school.type === 'SK' ? 'SK' : 'SMK'; // SMA & SMK map to secondary (SMK)
    onChange(school.name, inferredType);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    setIsOpen(true);
    onChange(val);
  };

  const handleClear = () => {
    setInputValue('');
    setSuggestions(allSchools);
    onChange('');
  };

  const getTypeBadgeStyle = (type: string) => {
    switch (type.toUpperCase()) {
      case 'SK':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'SMK':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'SMA':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div ref={containerRef} className="space-y-2 relative">
      <div className="flex items-center justify-between">
        <label htmlFor="schoolNameInput" className="block text-base font-semibold text-[#22303c]">
          Nama Sekolah
        </label>
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Building2 className="w-5 h-5" />
        </div>

        <input
          id="schoolNameInput"
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder="Taip cth: SK Kuala Lumpur, sma kualau lumpur, SMK..."
          required={required}
          autoComplete="off"
          className="w-full rounded-lg border border-[#cfd9e2] bg-white pl-11 pr-20 py-3 text-base text-slate-900 outline-none transition focus:border-[#0072bc] focus:ring-1 focus:ring-[#0072bc]"
        />

        <div className="absolute inset-y-0 right-0 pr-2 flex items-center gap-1">
          {inputValue && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              title="Padam carian"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition"
            aria-label="Pilih sekolah"
          >
            <ChevronsUpDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-72 overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
          {loading && suggestions.length === 0 ? (
            <div className="p-3 text-center text-xs text-slate-500">
              Memuatkan senarai sekolah...
            </div>
          ) : suggestions.length > 0 ? (
            <div className="space-y-1">
              <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Cadangan Padanan Sekolah:
              </div>
              {suggestions.map((school) => {
                const isSelected =
                  inputValue.toLowerCase() === school.name.toLowerCase();

                return (
                  <button
                    key={school.id}
                    type="button"
                    onClick={() => handleSelectSchool(school)}
                    className={`w-full flex items-center justify-between gap-2 rounded-lg p-2.5 text-left text-sm transition ${
                      isSelected
                        ? 'bg-sky-50 text-[#0072bc] font-semibold'
                        : 'text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-black px-1.5 py-0.5 rounded border ${getTypeBadgeStyle(
                            school.type
                          )}`}
                        >
                          {school.type}
                        </span>
                        <span className="truncate font-medium">{school.name}</span>
                        {isSelected && <Check className="w-4 h-4 text-[#0072bc] shrink-0" />}
                      </div>
                      {school.state && (
                        <p className="text-[11px] text-slate-400 pl-8">
                          {school.code ? `${school.code} · ` : ''}{school.state}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}

            </div>
          ) : (
            <div className="p-4 text-center text-xs text-slate-700 bg-slate-50/90 rounded-xl border border-slate-200">
              <p className="font-semibold text-slate-800">
                Nama sekolah tiada dalam padanan. Sila tulis nama sekolah.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SchoolCombobox;

