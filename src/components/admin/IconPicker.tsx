import React, { useState } from 'react';
import * as LucideIcons from 'lucide-react';
import { Search, X, Check } from 'lucide-react';

const APPROVED_ICONS: string[] = [
  'Building2',
  'HardHat',
  'Ruler',
  'Wrench',
  'Layers',
  'ShieldCheck',
  'ClipboardCheck',
  'Users',
  'MessageSquare',
  'Clock',
  'DollarSign',
  'CheckCircle2',
  'Leaf',
  'Factory',
  'HeartPulse',
  'GraduationCap',
  'Home',
  'Briefcase',
  'Globe2',
  'Quote',
  'Landmark',
  'Truck',
  'Droplets',
  'Zap',
  'Sun',
  'Recycle',
  'Compass',
  'Award',
  'BadgeCheck',
  'Cog',
  'Settings',
  'Waves',
  'Wind',
  'TreePine',
  'Hammer',
  'Paintbrush',
  'Blocks',
  'Building',
  'Flame',
  'Gauge',
  'Lightbulb',
  'Mountain',
  'PenTool',
  'Pickaxe',
  'Radar',
  'Search',
  'Sprout',
  'TrafficCone',
  'Warehouse',
];

interface IconPickerProps {
  value: string;
  onChange: (iconName: string) => void;
  label?: string;
}

export function renderLucideIcon(name: string, className = 'w-5 h-5') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const IconComponent = (LucideIcons as Record<string, any>)[name] || LucideIcons.Building2;
  return <IconComponent className={className} />;
}

export default function IconPicker({ value, onChange, label = 'Select Icon' }: IconPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = APPROVED_ICONS.filter((icon) =>
    icon.toLowerCase().includes(search.toLowerCase().trim())
  );

  return (
    <div>
      {label && <label className="block text-xs font-medium text-surface-steel/90 mb-1.5">{label}</label>}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-lg bg-brand-navy-light/40 border border-white/15 text-white hover:border-brand-blue-light transition-all focus:outline-none focus:ring-2 focus:ring-brand-blue"
      >
        <span className="p-1.5 rounded-md bg-brand-blue/20 text-brand-blue-light">
          {renderLucideIcon(value, 'w-5 h-5')}
        </span>
        <span className="text-sm font-medium flex-1 text-left">{value || 'Choose an icon...'}</span>
        <span className="text-xs text-surface-steel/60">Change</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-brand-navy-dark/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-brand-navy border border-white/15 shadow-elevated p-6 text-white flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-brand-blue/20 text-brand-blue-light">
                  {renderLucideIcon(value, 'w-5 h-5')}
                </span>
                <h3 className="text-base font-heading font-bold text-white">Choose an Icon</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-surface-steel/60 hover:text-white transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-surface-steel/50" />
              <input
                type="text"
                placeholder="Search approved icons (e.g. Building, HardHat)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-brand-navy-dark/70 border border-white/10 text-sm text-white placeholder-surface-steel/40 focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>

            <div className="mt-4 grid grid-cols-4 sm:grid-cols-6 gap-2.5 overflow-y-auto flex-1 p-1">
              {filtered.map((iconName) => {
                const isSelected = value === iconName;
                return (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => {
                      onChange(iconName);
                      setIsOpen(false);
                    }}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all text-center gap-1.5 ${
                      isSelected
                        ? 'bg-brand-blue/30 border-brand-blue-light text-white shadow-md'
                        : 'bg-brand-navy-light/20 border-white/5 text-surface-steel/80 hover:bg-brand-navy-light/50 hover:text-white'
                    }`}
                  >
                    <div className="relative">
                      {renderLucideIcon(iconName, 'w-6 h-6')}
                      {isSelected && (
                        <span className="absolute -top-1 -right-2 bg-brand-blue text-white rounded-full p-0.5">
                          <Check className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-mono truncate max-w-full">{iconName}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-white/10 flex justify-end">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-sm text-white transition-colors"
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
