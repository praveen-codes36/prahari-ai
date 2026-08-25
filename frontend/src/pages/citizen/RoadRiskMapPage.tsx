import React from 'react';
import { useNavigate } from 'react-router-dom';
import { InteractiveMapCanvas } from '../../components/map/InteractiveMapCanvas';
import { Shield, ArrowLeft, Plus } from 'lucide-react';
import { RoadSegment } from '../../types';

export const RoadRiskMapPage: React.FC = () => {
  const navigate = useNavigate();

  const handleReportDefectOnSegment = (segment: RoadSegment) => {
    navigate(`/citizen/report-defect?segmentId=${segment.id}&road=${encodeURIComponent(segment.name)}`);
  };

  return (
    <div className="space-y-4 max-w-6xl mx-auto pb-20 pt-2">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/citizen')}
            className="w-8 h-8 rounded-lg bg-[#191f2f] hover:bg-[#242a3a] border border-white/10 flex items-center justify-center text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              Road Risk Heatmap
              <span className="text-[10px] font-mono bg-[#00e3fd]/15 text-[#00daf3] px-2 py-0.5 rounded border border-[#00e3fd]/30">
                LIVE TELEMETRY
              </span>
            </h1>
            <p className="text-xs text-[#8c90a1]">
              Explore municipal road health scores, defect clusters, and accident risk density.
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/citizen/report-defect')}
          className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#b3c5ff] hover:bg-[#dae1ff] text-[#002b75] font-bold text-xs shadow-lg transition-all"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          Report Here
        </button>
      </div>

      {/* Main Interactive Map */}
      <InteractiveMapCanvas onReportClick={handleReportDefectOnSegment} heightClass="h-[75vh]" />
    </div>
  );
};
