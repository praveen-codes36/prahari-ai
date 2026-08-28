import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { InteractiveMapCanvas } from '../../components/map/InteractiveMapCanvas';
import { Globe2, Layers, Filter, Shield, Activity } from 'lucide-react';
import { RoadSegment } from '../../types';

export const GlobalRiskMapPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSelectSegment = (segment: RoadSegment) => {
    navigate(`/authority/priority`);
  };

  return (
    <div className="space-y-4 pb-20 pt-2">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#00daf3] bg-[#00e3fd]/10 px-2 py-0.5 rounded border border-[#00e3fd]/30">
              NATIONAL SPATIAL GIS COMMAND
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            Global Road Network Risk Map
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline text-xs font-mono text-[#8c90a1]">
            Multi-Layer Vector Overlay
          </span>
        </div>
      </div>

      <InteractiveMapCanvas onReportClick={handleSelectSegment} heightClass="h-[78vh]" isAuthorityMode={true} />
    </div>
  );
};
