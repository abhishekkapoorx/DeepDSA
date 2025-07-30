import { useState } from 'react';
import { ChevronDown, Plus, Star, Lock } from 'lucide-react';

export default function Sidebar() {
  const [isMyListsExpanded, setIsMyListsExpanded] = useState(true);

  return (
    <div className="w-64 border-r border-border p-4 h-full overflow-y-auto">
      {/* Library Section */}
      <div className="mb-6">
        <div className="text-sm font-medium text-muted-foreground mb-2">LIBRARY</div>
        <div className="space-y-1">
          <div className="flex items-center px-3 py-2 rounded-md bg-primary text-primary-foreground font-medium">
            Library
          </div>
          <div className="flex items-center px-3 py-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent cursor-pointer">
            Study Plan
          </div>
        </div>
      </div>

      {/* My Lists Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-medium text-muted-foreground">MY LISTS</div>
          <button className="p-1 hover:bg-accent rounded">
            <Plus className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
        <div className="space-y-1">
          <button 
            className="flex items-center justify-between w-full px-3 py-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent"
            onClick={() => setIsMyListsExpanded(!isMyListsExpanded)}
          >
            <span>My Lists</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${isMyListsExpanded ? 'rotate-180' : ''}`} />
          </button>
          
          {isMyListsExpanded && (
            <div className="ml-4 space-y-1">
              <div className="flex items-center px-3 py-2 rounded-md bg-accent text-foreground">
                <Star className="h-4 w-4 mr-2 text-yellow-500" />
                <span className="flex-1">Favorite</span>
                <Lock className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 