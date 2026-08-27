import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, MapPin, Camera, CheckCircle2, Navigation, Loader2 } from 'lucide-react';
import apiClient from '../../services/apiClient';

export const ReportAccidentPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [severity, setSeverity] = useState('HIGH');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [loadingLoc, setLoadingLoc] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const geo = await res.json();
            setLocation({ lat, lng, address: geo.display_name || `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}` });
          } catch {
            setLocation({ lat, lng, address: `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}` });
          }
          setLoadingLoc(false);
        },
        () => setLoadingLoc(false)
      );
    } else {
      setLoadingLoc(false);
    }
  }, []);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await apiClient.post('/accidents', {
        severity: severity,
        description: description || 'Emergency at this location.',
        coordinates: [location?.lng || 0, location?.lat || 0]
      });
      setStep(2);
    } catch (err) {
      console.error('Failed to report accident', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (step === 2) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center">
        <div className="w-16 h-16 bg-[#00e3fd]/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_#00e3fd]">
          <CheckCircle2 className="w-8 h-8 text-[#00daf3]" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Emergency Reported</h2>
        <p className="text-[#8c90a1] mb-8 max-w-md">
          Your accident report has been transmitted directly to Emergency Dispatch (108) and nearby traffic authorities.
        </p>
        <button
          onClick={() => navigate('/citizen')}
          className="bg-[#242a3a] hover:bg-[#2f3445] text-white px-6 py-3 rounded-xl font-bold transition-all"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto pb-20 pt-2 space-y-6">
      <div className="bg-[#191f2f] rounded-2xl border border-white/10 p-6">
        <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
          <div className="w-10 h-10 bg-[#ff5252]/20 rounded-xl flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-[#ff5252]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Report Accident</h1>
            <p className="text-xs text-[#8c90a1]">Dispatch emergency services instantly</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Location */}
          <div>
            <label className="block text-xs font-mono text-[#8c90a1] uppercase mb-2">GPS Location</label>
            <div className="bg-[#0d1322] border border-white/10 rounded-xl p-4 flex items-center gap-3">
              <MapPin className="w-5 h-5 text-[#00daf3]" />
              <div className="flex-1">
                {loadingLoc ? (
                  <div className="flex items-center gap-2 text-sm text-[#8c90a1]">
                    <Loader2 className="w-4 h-4 animate-spin" /> Acquiring satellite lock...
                  </div>
                ) : (
                  <div className="text-sm text-white font-medium">{location?.address || 'Location unavailable'}</div>
                )}
              </div>
            </div>
          </div>

          {/* Severity */}
          <div>
            <label className="block text-xs font-mono text-[#8c90a1] uppercase mb-2">Severity Level</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setSeverity('LOW')}
                className={`p-3 rounded-xl border text-sm font-bold transition-all ${
                  severity === 'LOW'
                    ? 'bg-[#ffa000]/20 border-[#ffa000] text-[#ffa000]'
                    : 'bg-[#0d1322] border-white/10 text-[#8c90a1] hover:border-white/30'
                }`}
              >
                Minor (No Injuries)
              </button>
              <button
                onClick={() => setSeverity('HIGH')}
                className={`p-3 rounded-xl border text-sm font-bold transition-all ${
                  severity === 'HIGH'
                    ? 'bg-[#ff5252]/20 border-[#ff5252] text-[#ff5252] shadow-[0_0_15px_rgba(255,82,82,0.3)]'
                    : 'bg-[#0d1322] border-white/10 text-[#8c90a1] hover:border-white/30'
                }`}
              >
                Major (Injuries/Blockage)
              </button>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-mono text-[#8c90a1] uppercase mb-2">Additional Details (Optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="E.g., 2 vehicles involved, blocking left lane..."
              className="w-full bg-[#0d1322] border border-white/10 rounded-xl p-4 text-sm text-white placeholder:text-[#4d5366] focus:outline-none focus:border-[#00daf3]"
              rows={3}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting || loadingLoc}
            className="w-full bg-[#ff5252] hover:bg-[#ff7b7b] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,82,82,0.4)] transition-all"
          >
            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <AlertTriangle className="w-5 h-5" />}
            {submitting ? 'Transmitting to Dispatch...' : 'REPORT EMERGENCY NOW'}
          </button>
        </div>
      </div>
    </div>
  );
};
