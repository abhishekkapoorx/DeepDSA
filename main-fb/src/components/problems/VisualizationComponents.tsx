"use client";
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface ArrayVisualizationProps {
  name: string;
  values: any[];
  highlightedIndices?: number[];
  pointerIndices?: Record<string, number>;
}

export const ArrayVisualization: React.FC<ArrayVisualizationProps> = ({
  name,
  values,
  highlightedIndices = [],
  pointerIndices = {}
}) => {
  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">{name}:</div>
      <div className="flex gap-1 flex-wrap">
        {values.map((value, index) => {
          const isHighlighted = highlightedIndices.includes(index);
          const pointerLabels = Object.entries(pointerIndices)
            .filter(([_, idx]) => idx === index)
            .map(([label]) => label);
          
          return (
            <div key={index} className="relative flex flex-col items-center">
              {/* Pointer Labels */}
              {pointerLabels.length > 0 && (
                <div className="mb-1 flex gap-1">
                  {pointerLabels.map((label) => (
                    <Badge key={label} variant="outline" className="text-xs px-1 py-0">
                      {label}
                    </Badge>
                  ))}
                </div>
              )}
              
              {/* Box */}
              <div
                className={`
                  w-12 h-12 flex items-center justify-center border-2 rounded-md font-mono text-sm font-semibold
                  ${isHighlighted 
                    ? 'bg-blue-500 text-white border-blue-600 shadow-lg scale-110' 
                    : 'bg-background border-border hover:border-primary'
                  }
                  transition-all duration-300
                `}
              >
                {value}
              </div>
              
              {/* Index */}
              <div className="text-xs text-muted-foreground mt-1">{index}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface StackVisualizationProps {
  name: string;
  values: any[];
  operation?: string;
}

export const StackVisualization: React.FC<StackVisualizationProps> = ({
  name,
  values,
  operation
}) => {
  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">{name}:</div>
      <div className="relative">
        {/* Base */}
        <div className="w-32 h-2 bg-foreground rounded-sm" />
        
        {/* Stack elements */}
        <div className="mt-2 space-y-1">
          {values.map((value, index) => (
            <div
              key={index}
              className="w-32 h-10 flex items-center justify-center border-2 border-foreground rounded-md bg-primary text-primary-foreground font-mono text-sm font-semibold"
              style={{
                marginLeft: index * 4,
                marginRight: index * 4,
              }}
            >
              {value}
            </div>
          ))}
        </div>
        
        {/* Top arrow */}
        {values.length > 0 && (
          <div className="absolute right-0 top-0">
            <Badge variant="outline" className="text-xs">
              TOP
            </Badge>
          </div>
        )}
      </div>
      
      {operation && (
        <div className="text-xs text-muted-foreground italic">
          {operation}
        </div>
      )}
    </div>
  );
};

interface QueueVisualizationProps {
  name: string;
  values: any[];
  front?: number;
  rear?: number;
}

export const QueueVisualization: React.FC<QueueVisualizationProps> = ({
  name,
  values,
  front,
  rear
}) => {
  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">{name}:</div>
      <div className="flex items-center gap-2">
        {/* Queue elements */}
        <div className="flex gap-1">
          {values.map((value, index) => {
            const isFront = front !== undefined && index === front;
            const isRear = rear !== undefined && index === rear;
            
            return (
              <div key={index} className="relative">
                <div
                  className={`
                    w-16 h-12 flex items-center justify-center border-2 rounded-md font-mono text-sm font-semibold
                    ${isFront ? 'bg-green-500 text-white border-green-600' : ''}
                    ${isRear ? 'bg-blue-500 text-white border-blue-600' : ''}
                    ${!isFront && !isRear ? 'bg-background border-border' : ''}
                    transition-all duration-300
                  `}
                >
                  {value}
                </div>
                
                {/* Labels */}
                {isFront && (
                  <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 text-xs font-medium text-green-600">
                    FRONT
                  </div>
                )}
                {isRear && (
                  <div className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 text-xs font-medium text-blue-600">
                    REAR
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Arrow */}
        <div className="text-lg">→</div>
      </div>
    </div>
  );
};

interface LinkedNodeVisualizationProps {
  value: any;
  next: boolean;
  nodeId?: string;
}

export const LinkedNodeVisualization: React.FC<LinkedNodeVisualizationProps> = ({
  value,
  next,
  nodeId
}) => {
  return (
    <div className="flex items-center gap-2">
      {/* Node */}
      <div className="relative">
        <div className="w-16 h-16 border-2 border-primary rounded-lg bg-primary/10 flex items-center justify-center font-mono font-semibold">
          {value}
        </div>
        {nodeId && (
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-muted-foreground">
            {nodeId}
          </div>
        )}
      </div>
      
      {/* Arrow */}
      {next && (
        <div className="flex items-center">
          <div className="h-0.5 w-8 bg-primary" />
          <div className="border-t-2 border-r-2 border-primary w-3 h-3 transform rotate-45 translate-x-[-6px]" />
        </div>
      )}
    </div>
  );
};

interface LinkedListVisualizationProps {
  name: string;
  nodes: Array<{ value: any; next: boolean }>;
  headLabel?: string;
}

export const LinkedListVisualization: React.FC<LinkedListVisualizationProps> = ({
  name,
  nodes,
  headLabel = 'head'
}) => {
  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">{name}:</div>
      <div className="flex items-center gap-2">
        {/* Head pointer */}
        <div className="text-xs text-muted-foreground font-medium">
          {headLabel} →
        </div>
        
        {/* Nodes */}
        <div className="flex items-center gap-2">
          {nodes.map((node, index) => (
            <LinkedNodeVisualization
              key={index}
              value={node.value}
              next={node.next}
              nodeId={`n${index}`}
            />
          ))}
          
          {/* Null indicator */}
          {nodes.length > 0 && (
            <div className="w-16 h-16 border-2 border-dashed border-muted rounded-lg flex items-center justify-center">
              <span className="text-muted-foreground text-sm">null</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface PointerVisualizationProps {
  label: string;
  value: number;
  maxValue: number;
}

export const PointerVisualization: React.FC<PointerVisualizationProps> = ({
  label,
  value,
  maxValue
}) => {
  const percentage = (value / maxValue) * 100;
  
  return (
    <div className="w-full space-y-1">
      <div className="flex justify-between text-xs">
        <span className="font-medium">{label}:</span>
        <span className="text-muted-foreground">{value}</span>
      </div>
      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

interface VariableBoxProps {
  name: string;
  value: any;
  type?: string;
}

export const VariableBox: React.FC<VariableBoxProps> = ({
  name,
  value,
  type
}) => {
  const formatValue = () => {
    if (typeof value === 'string') {
      return `"${value}"`;
    }
    if (typeof value === 'boolean') {
      return value ? 'true' : 'false';
    }
    if (value === null) {
      return 'null';
    }
    if (value === undefined) {
      return 'undefined';
    }
    return String(value);
  };

  return (
    <div className="flex items-center gap-2 p-2 border rounded-md bg-card hover:bg-muted transition-colors">
      <div className="text-sm font-medium text-primary">{name}:</div>
      <Badge variant="outline" className="font-mono text-sm">
        {formatValue()}
      </Badge>
      {type && (
        <Badge variant="secondary" className="text-xs">
          {type}
        </Badge>
      )}
    </div>
  );
};

