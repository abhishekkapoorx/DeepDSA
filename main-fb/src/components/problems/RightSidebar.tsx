import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Search, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CompanyCount { name: string; count: number }
interface RightSidebarProps {
  problems?: Array<{ companyTags?: string[] }>;
}

export default function RightSidebar({ problems }: RightSidebarProps) {
  const [currentWeek, setCurrentWeek] = useState(5);
  const [companies, setCompanies] = useState<CompanyCount[]>([]);
  const [query, setQuery] = useState('');
  const [now, setNow] = useState<Date>(new Date());

  // Tick every second for countdown and today's highlight
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const monthNames = [
    'January','February','March','April','May','June','July','August','September','October','November','December'
  ];
  const shortMonthNames = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
  const year = now.getFullYear();
  const month = now.getMonth();
  const day = now.getDate();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const endOfDay = new Date(year, month, day, 23, 59, 59, 999);
  const msLeft = Math.max(0, endOfDay.getTime() - now.getTime());
  const hh = Math.floor(msLeft / 3600000);
  const mm = Math.floor((msLeft % 3600000) / 60000);
  const ss = Math.floor((msLeft % 60000) / 1000);
  const pad = (n: number) => n.toString().padStart(2, '0');

  useEffect(() => {
    let cancelled = false;
    const computeFromProblems = (list: Array<{ companyTags?: string[] }>) => {
      const map = new Map<string, number>();
      for (const p of list) {
        const tags: string[] = Array.isArray(p.companyTags) ? p.companyTags : [];
        for (const t of tags) map.set(t, (map.get(t) || 0) + 1);
      }
      return Array.from(map, ([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
    };
    const loadCompanies = async () => {
      // If parent provided problems, use them directly
      if (Array.isArray(problems)) {
        const agg = computeFromProblems(problems);
        if (!cancelled) setCompanies(agg);
        return;
      }
      try {
        const res = await fetch('/api/problems?limit=500', { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        const list = data?.problems || [];
        const agg: CompanyCount[] = computeFromProblems(list);
        if (!cancelled) setCompanies(agg);
      } catch {}
    };
    loadCompanies();
    return () => { cancelled = true };
  }, [problems]);

  const filteredCompanies = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return companies;
    return companies.filter(c => c.name.toLowerCase().includes(q));
  }, [companies, query]);

  return (
    <div className="w-80 border-l border-border p-4 space-y-6 hidden xl:block">
      {/* Calendar/Challenge Progress */}
      <div className="space-y-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-foreground">Day {day}</div>
          <div className="text-sm text-muted-foreground">{pad(hh)}:{pad(mm)}:{pad(ss)} left</div>
        </div>
        
        <div className="text-center">
          <div className="text-4xl font-bold text-primary mb-2">{day} {shortMonthNames[month]}</div>
          <div className="text-xs text-muted-foreground">{monthNames[month]} {year}</div>
        </div>
        
        {/* Simple Calendar */}
        <div className="grid grid-cols-7 gap-1 text-xs">
          {Array.from({ length: daysInMonth }, (_, i) => (
            <div
              key={i + 1}
              className={`p-1 text-center rounded ${
                i + 1 === day 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-muted-foreground'
              }`}
            >
              {i + 1}
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Premium */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">Weekly Premium</span>
          <Info className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="text-xs text-muted-foreground">1 day left</div>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((week) => (
            <Button
              key={week}
              variant={week === currentWeek ? 'default' : 'outline'}
              size="sm"
              className="flex-1 text-xs"
              onClick={() => setCurrentWeek(week)}
            >
              W{week}
            </Button>
          ))}
        </div>
      </div>

      {/* Redeem */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-sm font-medium text-foreground">0 Redeem</span>
        </div>
        <Button variant="link" size="sm" className="p-0 h-auto text-xs text-primary">
          Rules
        </Button>
      </div>

      {/* Trending Companies */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">Trending Companies</span>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" className="p-1 h-6 w-6">
              <ChevronLeft className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="sm" className="p-1 h-6 w-6">
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
          <input
            type="text"
            placeholder="Q Search for a company..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1 text-xs bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        
        <div className="space-y-1 max-h-60 overflow-y-auto">
          {filteredCompanies.map((company) => (
            <div
              key={company.name}
              className="flex items-center justify-between p-2 rounded hover:bg-accent cursor-pointer"
            >
              <span className="text-sm text-foreground">{company.name}</span>
              <span className="text-xs text-muted-foreground">{company.count}</span>
            </div>
          ))}
          {filteredCompanies.length === 0 && (
            <div className="p-2 text-xs text-muted-foreground">No companies found</div>
          )}
        </div>
      </div>
    </div>
  );
} 