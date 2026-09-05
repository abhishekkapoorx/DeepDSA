declare module "@uiw/react-heat-map" {
  import * as React from "react";

  export interface HeatMapValue {
    date: Date | string;
    count?: number;
  }

  export interface HeatMapProps {
    value: HeatMapValue[];
    startDate?: Date | string;
    endDate?: Date | string;
    rectSize?: number;
    space?: number;
    rectProps?: React.SVGProps<SVGRectElement>;
    weekLabels?: { style?: React.CSSProperties };
    monthLabels?: { style?: React.CSSProperties };
    panelColors?: Record<number | string, string>;
    className?: string;
    style?: React.CSSProperties;
  }

  const HeatMap: React.FC<HeatMapProps>;
  export default HeatMap;
}
