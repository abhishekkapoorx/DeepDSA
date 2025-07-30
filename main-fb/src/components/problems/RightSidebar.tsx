import { useState } from 'react';
import { ChevronLeft, ChevronRight, Search, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

const companies = [
  { name: 'Meta', count: 1265 },
  { name: 'Google', count: 2064 },
  { name: 'Amazon', count: 1871 },
  { name: 'Microsoft', count: 1219 },
  { name: 'Uber', count: 522 },
  { name: 'Bloomberg', count: 1084 },
  { name: 'Apple', count: 569 },
  { name: 'TikTok', count: 443 },
  { name: 'Oracle', count: 309 },
  { name: 'Adobe', count: 510 },
  { name: 'Citadel', count: 104 },
  { name: 'TCS', count: 194 },
  { name: 'Goldman Sachs', count: 275 }
];

export default function RightSidebar() {
  const [currentWeek, setCurrentWeek] = useState(5);

  return (
    <div className="w-80 border-l border-border p-4 space-y-6 hidden xl:block">
      {/* Calendar/Challenge Progress */}
      <div className="space-y-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-foreground">Day 30</div>
          <div className="text-sm text-muted-foreground">19:15:37 left</div>
        </div>
        
        <div className="text-center">
          <div className="text-4xl font-bold text-primary mb-2">7 JUL</div>
          <div className="text-xs text-muted-foreground">July 2024</div>
        </div>
        
        {/* Simple Calendar */}
        <div className="grid grid-cols-7 gap-1 text-xs">
          {Array.from({ length: 31 }, (_, i) => (
            <div
              key={i + 1}
              className={`p-1 text-center rounded ${
                i + 1 === 30 
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
            className="w-full pl-8 pr-3 py-1 text-xs bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        
        <div className="space-y-1 max-h-60 overflow-y-auto">
          {companies.map((company) => (
            <div
              key={company.name}
              className="flex items-center justify-between p-2 rounded hover:bg-accent cursor-pointer"
            >
              <span className="text-sm text-foreground">{company.name}</span>
              <span className="text-xs text-muted-foreground">{company.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 