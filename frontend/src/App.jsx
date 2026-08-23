import { useState, useEffect, useRef } from "react";
import {
  MapPin, AlertTriangle, Lightbulb, Trash2, Droplets, Siren, Building2,
  Radar, Clock, Camera, X, ShieldCheck, CheckCircle2, Loader2, Navigation,
  Eye, ChevronDown, Bell, User, LogOut, Mail, Lock, ArrowRight, Check,
  CheckCircle, XCircle, Info, ShieldAlert
} from "lucide-react";

const C = {
  void: "#080C15",
  panel: "#0E1522",
  panelRaised: "#141D2F",
  panelBorder: "#212C42",
  hairline: "#1B2436",
  saffron: "#E8A33D",
  saffronDim: "#8A6529",
  riskHigh: "#E5484D",
  riskMed: "#E8A33D",
  riskLow: "#3DDC84",
  cyan: "#4FD1E8",
  violet: "#B98CE8",
  textPrimary: "#EEF1F8",
  textMuted: "#828EA6",
  textFaint: "#4E5A72",
};

const DEFECT_META = {
  pothole:     { label: "Pothole",           icon: AlertTriangle, color: C.riskHigh, dept: "Road Dept." },
  streetlight: { label: "Broken Streetlight", icon: Lightbulb,     color: C.saffron,  dept: "Electrical Dept." },
  garbage:     { label: "Garbage Overflow",   icon: Trash2,        color: C.riskLow,  dept: "Sanitation Dept." },
  drainage:    { label: "Drainage Failure",   icon: Droplets,      color: C.cyan,     dept: "Drainage/PWD" },
};

const STATUS_META = {
  reported: { label: "Reported",       color: C.textMuted },
  verified: { label: "AI Verified",    color: C.cyan },
  assigned: { label: "Dept. Assigned", color: C.saffron },
  progress: { label: "In Progress",    color: C.violet },
  resolved: { label: "Resolved",       color: C.riskLow },
};

const initialReports = [
  { id: "PR-1042", type: "pothole", x: 300, y: 300, severity: "High", status: "assigned", time: "6 min ago" },
  { id: "PR-1041", type: "streetlight", x: 470, y: 240, severity: "Medium", status: "verified", time: "22 min ago" },
  { id: "PR-1040", type: "drainage", x: 190, y: 410, severity: "High", status: "progress", time: "1 hr ago" },
  { id: "PR-1039", type: "garbage", x: 600, y: 150, severity: "Low", status: "reported", time: "2 hr ago" },
  { id: "PR-1038", type: "pothole", x: 630, y: 400, severity: "High", status: "resolved", time: "5 hr ago" },
  { id: "PR-1037", type: "streetlight", x: 130, y: 180, severity: "Medium", status: "resolved", time: "1 day ago" },
  { id: "PR-1036", type: "drainage", x: 540, y: 470, severity: "Medium", status: "assigned", time: "1 day ago" },
  { id: "PR-1035", type: "pothole", x: 380, y: 480, severity: "High", status: "progress", time: "1 day ago" },
];

const RISK_ZONES = [
  { x: 300, y: 300, r: 65, level: "high" },
  { x: 560, y: 210, r: 46, level: "med" },
  { x: 630, y: 400, r: 58, level: "high" },
  { x: 190, y: 410, r: 42, level: "med" },
  { x: 470, y: 130, r: 34, level: "low" },
];

const EMERGENCY = {
  ambulances: [{ x: 120, y: 260 }, { x: 700, y: 480 }],
  hospitals: [{ x: 90, y: 100 }, { x: 720, y: 300 }],
};

const ROADS = [
  "M40,290 C180,240 260,340 420,300 S620,190 760,270",
  "M110,40 C160,190 250,290 300,440 S345,540 395,575",
  "M700,45 L645,150 L595,300 L495,400 L400,450",
  "M40,505 C220,470 400,530 580,485 S720,440 770,470",
  "M330,60 C310,180 330,260 300,300",
];

const riskColor = (level) => (level === "high" ? C.riskHigh : level === "med" ? C.saffron : C.riskLow);

const DEMO_ACCOUNT = { name: "Praveen Kumar", email: "demo@prahari.in", password: "demo123", role: "authority" };

function Switch({ checked, onChange, color = C.saffron }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      aria-pressed={checked}
      style={{ background: checked ? color : C.panelBorder }}
      className="relative h-5 w-9 shrink-0 rounded-full transition-colors duration-200"
    >
      <span
        style={{
          left: checked ? "18px" : "2px",
          background: C.void,
          boxShadow: "0 1px 3px rgba(0,0,0,0.35)",
        }}
        className="absolute top-0.5 h-4 w-4 rounded-full transition-all duration-200"
      />
    </button>
  );
}

function Logo({ size = 32 }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
        <div
          style={{ border: `1.5px solid ${C.saffronDim}`, animation: "sweep 4s linear infinite" }}
          className="absolute inset-0 rounded-full border-t-transparent"
        />
        <Radar size={size * 0.5} style={{ color: C.saffron }} />
      </div>
      <div>
        <div style={{ color: C.textPrimary, fontFamily: "Chakra Petch" }} className="text-base font-bold tracking-wide leading-none">
          PRAHARI
        </div>
        <div style={{ color: C.textFaint }} className="text-[9px] uppercase tracking-widest mt-0.5">
          AI Sentinel for Safer Roads
        </div>
      </div>
    </div>
  );
}

function Field({ icon: Icon, ...props }) {
  return (
    <div
      style={{ background: C.panelRaised, border: `1px solid ${C.panelBorder}` }}
      className="flex items-center gap-2.5 rounded-lg px-3 py-2.5"
    >
      <Icon size={15} style={{ color: C.textFaint }} className="shrink-0" />
      <input
        {...props}
        style={{ color: C.textPrimary, fontFamily: "Inter" }}
        className="bg-transparent outline-none text-[13px] w-full placeholder:text-[#4E5A72]"
      />
    </div>
  );
}

function StatCard({ label, value, icon: Icon, accent }) {
  return (
    <div style={{ background: C.panelRaised, border: `1px solid ${C.panelBorder}` }} className="rounded-lg p-3 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span style={{ color: C.textFaint, fontFamily: "Inter" }} className="text-[10px] uppercase tracking-wider">{label}</span>
        <Icon size={14} style={{ color: accent }} />
      </div>
      <span style={{ color: C.textPrimary, fontFamily: "JetBrains Mono" }} className="text-2xl font-semibold leading-none">{value}</span>
    </div>
  );
}

function StatusBadge({ status }) {
  const meta = STATUS_META[status];
  return (
    <span style={{ color: meta.color, background: `${meta.color}18`, fontFamily: "Inter" }} className="text-[10px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap">
      {meta.label}
    </span>
  );
}

const TOAST_ICON = { success: CheckCircle, error: XCircle, info: Info };
const TOAST_COLOR = { success: C.riskLow, error: C.riskHigh, info: C.cyan };

function ToastStack({ toasts, onDismiss }) {
  return (
    <div className="fixed top-4 right-4 z-60 flex flex-col gap-2 w-72">
      {toasts.map((t) => {
        const Icon = TOAST_ICON[t.type];
        const color = TOAST_COLOR[t.type];
        return (
          <div
            key={t.id}
            className="fade-up rounded-lg px-3 py-2.5 flex items-start gap-2.5"
            style={{ background: C.panelRaised, border: `1px solid ${C.panelBorder}`, borderLeft: `3px solid ${color}`, boxShadow: "0 10px 28px rgba(0,0,0,0.5)" }}
          >
            <Icon size={15} style={{ color }} className="shrink-0 mt-0.5" />
            <span style={{ color: C.textPrimary, fontFamily: "Inter" }} className="text-[12px] flex-1 leading-snug">{t.message}</span>
            <button onClick={() => onDismiss(t.id)}><X size={12} style={{ color: C.textFaint }} /></button>
          </div>
        );
      })}
    </div>
  );
}

function LandingPage({ goTo }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center px-6 relative overflow-hidden" style={{ background: C.void }}>
      <div
        style={{ background: `radial-gradient(circle, ${C.saffron}14, transparent 70%)` }}
        className="absolute w-150 h-150 rounded-full pointer-events-none"
      />
      <div className="relative z-10 flex flex-col items-center text-center max-w-lg">
        <Logo size={44} />
        <h1 style={{ color: C.textPrimary, fontFamily: "Chakra Petch" }} className="text-3xl md:text-4xl font-bold mt-8 leading-tight">
          Every road hazard,<br />seen before it costs a life.
        </h1>
        <p style={{ color: C.textMuted, fontFamily: "Inter" }} className="text-sm mt-4 leading-relaxed">
          PRAHARI combines AI defect detection, accident-risk prediction, and safety-aware
          emergency routing into a single sentinel watching India's roads.
        </p>
        <div className="flex items-center gap-3 mt-8">
          <button
            onClick={() => goTo("login")}
            style={{ background: C.saffron, color: C.void, fontFamily: "Inter" }}
            className="px-5 py-2.5 rounded-lg text-[13px] font-semibold flex items-center gap-1.5"
          >
            Sign In <ArrowRight size={14} />
          </button>
          <button
            onClick={() => goTo("register")}
            style={{ border: `1px solid ${C.panelBorder}`, color: C.textPrimary, fontFamily: "Inter" }}
            className="px-5 py-2.5 rounded-lg text-[13px] font-semibold"
          >
            Create Account
          </button>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-12 w-full">
          {[
            { label: "Detect", icon: Eye, desc: "AI classifies defects from a photo" },
            { label: "Predict", icon: ShieldAlert, desc: "Risk-scored accident hotspots" },
            { label: "Respond", icon: Navigation, desc: "Safest route, not shortest" },
          ].map((f) => (
            <div key={f.label} style={{ background: C.panel, border: `1px solid ${C.hairline}` }} className="rounded-lg p-3 flex flex-col items-center gap-1.5">
              <f.icon size={16} style={{ color: C.saffron }} />
              <span style={{ color: C.textPrimary, fontFamily: "Inter" }} className="text-[11px] font-semibold">{f.label}</span>
              <span style={{ color: C.textFaint }} className="text-[9.5px] leading-tight">{f.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LoginPage({ goTo, onLogin, accounts, addToast, prefillEmail }) {
  const [email, setEmail] = useState(prefillEmail || "");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      addToast("error", "Enter both email and password.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const acc = accounts.find((a) => a.email === email && a.password === password);
      setLoading(false);
      if (acc) {
        addToast("success", `Welcome back, ${acc.name.split(" ")[0]}.`);
        onLogin(acc);
      } else {
        addToast("error", "Invalid email or password.");
      }
    }, 700);
  };

  return (
    <AuthShell>
      <Logo size={36} />
      <h2 style={{ color: C.textPrimary, fontFamily: "Chakra Petch" }} className="text-xl font-bold mt-6">Sign In</h2>
      <p style={{ color: C.textFaint, fontFamily: "Inter" }} className="text-[11.5px] mt-1 mb-6">
        Demo login — <span style={{ color: C.textMuted, fontFamily: "JetBrains Mono" }}>demo@prahari.in / demo123</span>
      </p>
      <form onSubmit={submit} className="w-full flex flex-col gap-3">
        <Field icon={Mail} type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Field icon={Lock} type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <div className="flex items-center justify-between mt-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <Switch checked={remember} onChange={setRemember} />
            <span style={{ color: C.textMuted, fontFamily: "Inter" }} className="text-[11.5px]">Remember me this session</span>
          </label>
          <button type="button" onClick={() => addToast("info", "Password reset link sent (demo).")} style={{ color: C.saffron, fontFamily: "Inter" }} className="text-[11.5px] font-medium">
            Forgot password?
          </button>
        </div>
        <button
          type="submit"
          disabled={loading}
          style={{ background: C.saffron, color: C.void, fontFamily: "Inter" }}
          className="rounded-lg py-2.5 text-[13px] font-semibold flex items-center justify-center gap-1.5 mt-2"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <>Sign In <ArrowRight size={14} /></>}
        </button>
      </form>
      <p style={{ color: C.textFaint, fontFamily: "Inter" }} className="text-[11.5px] mt-5">
        New to PRAHARI?{" "}
        <button onClick={() => goTo("register")} style={{ color: C.saffron }} className="font-semibold">Create an account</button>
      </p>
    </AuthShell>
  );
}

function RegisterPage({ goTo, addToast, registerAccount }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [role, setRole] = useState("citizen");
  const [agree, setAgree] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (!name || !email || !password) return addToast("error", "Fill in all fields.");
    if (password !== confirm) return addToast("error", "Passwords do not match.");
    if (!agree) return addToast("error", "Please accept the terms to continue.");
    registerAccount({ name, email, password, role });
    addToast("success", "Account created. Please sign in.");
    goTo("login", email);
  };

  return (
    <AuthShell>
      <Logo size={36} />
      <h2 style={{ color: C.textPrimary, fontFamily: "Chakra Petch" }} className="text-xl font-bold mt-6">Create Account</h2>
      <p style={{ color: C.textFaint, fontFamily: "Inter" }} className="text-[11.5px] mt-1 mb-6">Session-only demo account — not persisted after reload.</p>
      <form onSubmit={submit} className="w-full flex flex-col gap-3">
        <Field icon={User} placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
        <Field icon={Mail} type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Field icon={Lock} type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <Field icon={Lock} type="password" placeholder="Confirm password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />

        <div className="flex gap-2">
          {["citizen", "authority"].map((r) => (
            <button
              type="button"
              key={r}
              onClick={() => setRole(r)}
              style={{
                background: role === r ? `${C.saffron}1A` : C.panelRaised,
                border: `1px solid ${role === r ? C.saffron : C.panelBorder}`,
                color: role === r ? C.saffron : C.textMuted,
                fontFamily: "Inter",
              }}
              className="flex-1 rounded-lg py-2 text-[12px] font-medium capitalize"
            >
              {r}
            </button>
          ))}
        </div>

        <label className="flex items-center gap-2 cursor-pointer mt-1">
          <Switch checked={agree} onChange={setAgree} color={C.riskLow} />
          <span style={{ color: C.textMuted, fontFamily: "Inter" }} className="text-[11.5px]">I agree to the terms & data usage policy</span>
        </label>

        <button
          type="submit"
          style={{ background: C.saffron, color: C.void, fontFamily: "Inter" }}
          className="rounded-lg py-2.5 text-[13px] font-semibold flex items-center justify-center gap-1.5 mt-2"
        >
          Create Account <Check size={14} />
        </button>
      </form>
      <p style={{ color: C.textFaint, fontFamily: "Inter" }} className="text-[11.5px] mt-5">
        Already have an account?{" "}
        <button onClick={() => goTo("login")} style={{ color: C.saffron }} className="font-semibold">Sign in</button>
      </p>
    </AuthShell>
  );
}

function AuthShell({ children }) {
  return (
    <div className="w-full h-full flex items-center justify-center px-6" style={{ background: C.void }}>
      <div style={{ background: C.panel, border: `1px solid ${C.hairline}` }} className="w-full max-w-sm rounded-xl p-6 flex flex-col items-center fade-up">
        {children}
      </div>
    </div>
  );
}

function DashboardPage({ user, onLogout, addToast, notifications, addNotification }) {
  const [activeTab, setActiveTab] = useState(user.role === "citizen" ? "citizen" : "authority");
  const [layers, setLayers] = useState({ heatmap: true, defects: true, emergency: true });
  const [reports, setReports] = useState(initialReports);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [now, setNow] = useState(new Date());
  const [routeSim, setRouteSim] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [liveSync, setLiveSync] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const timeoutRefs = useRef([]);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => () => timeoutRefs.current.forEach(clearTimeout), []);

  const toggleLayer = (key) => setLayers((l) => ({ ...l, [key]: !l[key] }));

  const submitReport = () => {
    const id = `PR-${1043 + reports.length}`;
    const types = Object.keys(DEFECT_META);
    const type = types[Math.floor(Math.random() * types.length)];
    const x = 120 + Math.random() * 560;
    const y = 90 + Math.random() * 420;
    setReports((r) => [{ id, type, x, y, severity: "High", status: "reported", time: "just now" }, ...r]);
    setShowModal(false);
    addToast("success", `${id} submitted for AI verification.`);

    const t1 = setTimeout(() => {
      setReports((r) => r.map((rep) => (rep.id === id ? { ...rep, status: "verified" } : rep)));
      addToast("info", `${id} verified by AI as ${DEFECT_META[type].label}.`);
      addNotification(`${id} verified — classified as ${DEFECT_META[type].label}`);
    }, 1800);
    const t2 = setTimeout(() => {
      setReports((r) => r.map((rep) => (rep.id === id ? { ...rep, status: "assigned" } : rep)));
      addNotification(`${id} routed to ${DEFECT_META[type].dept}`);
    }, 3600);
    timeoutRefs.current.push(t1, t2);
  };

  const runRouteSim = () => {
    setRouteSim((v) => {
      if (!v) addToast("info", "Safer route found — 6 min faster despite +2 km.");
      return !v;
    });
  };

  const filteredReports = statusFilter === "all" ? reports : reports.filter((r) => r.status === statusFilter);
  const counts = {
    total: reports.length,
    pending: reports.filter((r) => r.status !== "resolved").length,
    resolved: reports.filter((r) => r.status === "resolved").length,
    highRisk: RISK_ZONES.filter((z) => z.level === "high").length,
  };

  return (
    <div className="w-full h-full flex flex-col" style={{ background: C.void }}>
      <header style={{ borderBottom: `1px solid ${C.hairline}`, background: C.panel }} className="flex items-center justify-between px-4 py-2.5 shrink-0">
        <Logo size={30} />

        <nav className="hidden md:flex items-center gap-1" style={{ background: C.panelRaised, border: `1px solid ${C.panelBorder}` }}>
          {["citizen", "authority", "emergency"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{ color: activeTab === tab ? C.void : C.textMuted, background: activeTab === tab ? C.saffron : "transparent", fontFamily: "Inter" }}
              className="text-[11px] font-semibold px-3.5 py-1.5 capitalize transition-colors"
            >
              {tab}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <label className="hidden sm:flex items-center gap-1.5 cursor-pointer">
            <span style={{ color: C.textFaint, fontFamily: "Inter" }} className="text-[10px]">Live Sync</span>
            <Switch checked={liveSync} onChange={setLiveSync} color={C.riskLow} />
          </label>
          {liveSync && (
            <span style={{ color: C.textFaint, fontFamily: "JetBrains Mono" }} className="text-[10px] hidden lg:inline">
              {now.toLocaleTimeString("en-IN", { hour12: false })}
            </span>
          )}

          <div className="relative">
            <button onClick={() => { setBellOpen((v) => !v); setProfileOpen(false); }} className="relative p-1.5">
              <Bell size={16} style={{ color: C.textMuted }} />
              {notifications.length > 0 && (
                <span style={{ background: C.riskHigh }} className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full border-2" >
                  <span style={{borderColor: C.panel}} className="absolute inset-0 rounded-full border-2" />
                </span>
              )}
            </button>
            {bellOpen && (
              <div style={{ background: C.panelRaised, border: `1px solid ${C.panelBorder}` }} className="fade-up absolute right-0 top-9 w-72 rounded-lg p-2 z-50 max-h-80 overflow-y-auto">
                <div style={{ color: C.textFaint, fontFamily: "Inter" }} className="text-[10px] uppercase tracking-wider px-2 py-1">Notifications</div>
                {notifications.length === 0 && <div style={{ color: C.textFaint }} className="text-[11px] px-2 py-3">No notifications yet.</div>}
                {notifications.map((n, i) => (
                  <div key={i} className="px-2 py-2 rounded-md hover:bg-white/3 flex gap-2 items-start">
                    <span style={{ background: C.saffron }} className="w-1.5 h-1.5 rounded-full mt-1 shrink-0" />
                    <span style={{ color: C.textMuted, fontFamily: "Inter" }} className="text-[11px] leading-snug">{n}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <button onClick={() => { setProfileOpen((v) => !v); setBellOpen(false); }} className="flex items-center gap-2">
              <div style={{ background: `${C.saffron}22`, color: C.saffron, fontFamily: "Inter" }} className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold">
                {user.name.split(" ").map((p) => p[0]).join("").slice(0, 2)}
              </div>
            </button>
            {profileOpen && (
              <div style={{ background: C.panelRaised, border: `1px solid ${C.panelBorder}` }} className="fade-up absolute right-0 top-10 w-48 rounded-lg p-1.5 z-50">
                <div className="px-2.5 py-2" style={{ borderBottom: `1px solid ${C.panelBorder}` }}>
                  <div style={{ color: C.textPrimary, fontFamily: "Inter" }} className="text-[12px] font-semibold truncate">{user.name}</div>
                  <div style={{ color: C.textFaint, fontFamily: "JetBrains Mono" }} className="text-[9.5px] truncate">{user.email}</div>
                </div>
                <button onClick={onLogout} className="w-full flex items-center gap-2 px-2.5 py-2 mt-1 rounded-md hover:bg-white/3 text-left">
                  <LogOut size={13} style={{ color: C.riskHigh }} />
                  <span style={{ color: C.riskHigh, fontFamily: "Inter" }} className="text-[11.5px] font-medium">Log Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row gap-3 p-3 min-h-0 overflow-y-auto">
        <div style={{ background: C.panel, border: `1px solid ${C.hairline}` }} className="relative flex-1 rounded-xl overflow-hidden min-h-105 lg:min-h-0">
          <div className="absolute top-3 left-3 z-20 flex gap-1.5 flex-wrap max-w-[85%]">
            {[
              { key: "heatmap", label: "Risk Heatmap", color: C.riskHigh },
              { key: "defects", label: "Defects", color: C.saffron },
              { key: "emergency", label: "Emergency Units", color: C.cyan },
            ].map((l) => (
              <button
                key={l.key}
                onClick={() => toggleLayer(l.key)}
                style={{ background: layers[l.key] ? `${l.color}1A` : "transparent", border: `1px solid ${layers[l.key] ? l.color : C.panelBorder}`, color: layers[l.key] ? l.color : C.textMuted, fontFamily: "Inter" }}
                className="text-[11px] font-medium px-2.5 py-1.5 rounded-md flex items-center gap-1.5"
              >
                <span style={{ background: layers[l.key] ? l.color : C.textFaint }} className="w-1.5 h-1.5 rounded-full" />
                {l.label}
              </button>
            ))}
          </div>

          <button
            onClick={runRouteSim}
            style={{ background: routeSim ? C.riskLow : C.saffron, color: C.void, fontFamily: "Inter" }}
            className="absolute top-3 right-3 z-20 text-[11px] font-semibold px-3 py-1.5 rounded-md flex items-center gap-1.5 shadow-lg"
          >
            <Navigation size={13} />
            {routeSim ? "Clear Route Sim" : "Simulate Emergency Route"}
          </button>

          <svg viewBox="0 0 800 600" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
            <defs>
              <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
                <path d="M32 0H0V32" fill="none" stroke={C.hairline} strokeWidth="1" />
              </pattern>
              {RISK_ZONES.map((z, i) => (
                <radialGradient id={`glow-${i}`} key={i}>
                  <stop offset="0%" stopColor={riskColor(z.level)} stopOpacity="0.55" />
                  <stop offset="100%" stopColor={riskColor(z.level)} stopOpacity="0" />
                </radialGradient>
              ))}
              <radialGradient id="sweepGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={C.saffron} stopOpacity="0.16" />
                <stop offset="100%" stopColor={C.saffron} stopOpacity="0" />
              </radialGradient>
            </defs>
            <rect width="800" height="600" fill={C.void} />
            <rect width="800" height="600" fill="url(#grid)" />
            {layers.heatmap && RISK_ZONES.map((z, i) => <circle key={i} cx={z.x} cy={z.y} r={z.r * 1.8} fill={`url(#glow-${i})`} />)}
            <g style={{ transformOrigin: "400px 300px", animation: "sweep 6s linear infinite" }}>
              <path d="M400,300 L400,60 A240,240 0 0,1 550,120 Z" fill="url(#sweepGrad)" />
            </g>
            <circle cx="400" cy="300" r="240" fill="none" stroke={C.hairline} strokeWidth="1" />
            <circle cx="400" cy="300" r="150" fill="none" stroke={C.hairline} strokeWidth="1" />
            {ROADS.map((d, i) => <path key={i} d={d} fill="none" stroke="#2B3854" strokeWidth="7" strokeLinecap="round" />)}
            {ROADS.map((d, i) => <path key={"c" + i} d={d} fill="none" stroke="#465C87" strokeWidth="1.5" strokeDasharray="2 6" strokeLinecap="round" />)}
            {routeSim && (
              <>
                <path d="M120,260 C220,270 280,290 300,300 C340,320 400,380 470,400 C560,430 650,460 700,480" fill="none" stroke={C.riskHigh} strokeWidth="3" strokeDasharray="6 5" opacity="0.85" />
                <path d="M120,260 C150,180 260,150 330,130 C430,105 560,140 610,240 C650,330 680,400 700,480" fill="none" stroke={C.riskLow} strokeWidth="3.5" strokeDasharray="10 6" style={{ animation: "dashMove 2.5s linear infinite" }} />
              </>
            )}
            {layers.defects && reports.map((r) => {
              const meta = DEFECT_META[r.type];
              const Icon = meta.icon;
              const isSel = selectedMarker === r.id;
              return (
                <g key={r.id} transform={`translate(${r.x},${r.y})`} onClick={() => setSelectedMarker(isSel ? null : r.id)} style={{ cursor: "pointer" }}>
                  <circle r={isSel ? 13 : 9} fill={C.panel} stroke={meta.color} strokeWidth="2" />
                  <foreignObject x="-6" y="-6" width="12" height="12"><Icon size={12} color={meta.color} /></foreignObject>
                </g>
              );
            })}
            {layers.emergency && (
              <>
                {EMERGENCY.ambulances.map((p, i) => (
                  <g key={"amb" + i} transform={`translate(${p.x},${p.y})`}>
                    <circle r="11" fill={`${C.cyan}22`} stroke={C.cyan} strokeWidth="1.5" />
                    <foreignObject x="-6" y="-6" width="12" height="12"><Siren size={12} color={C.cyan} /></foreignObject>
                  </g>
                ))}
                {EMERGENCY.hospitals.map((p, i) => (
                  <g key={"hos" + i} transform={`translate(${p.x},${p.y})`}>
                    <rect x="-10" y="-10" width="20" height="20" rx="4" fill={`${C.textPrimary}14`} stroke={C.textMuted} strokeWidth="1.5" />
                    <foreignObject x="-6" y="-6" width="12" height="12"><Building2 size={12} color={C.textMuted} /></foreignObject>
                  </g>
                ))}
              </>
            )}
          </svg>

          {selectedMarker && (() => {
            const r = reports.find((x) => x.id === selectedMarker);
            if (!r) return null;
            const meta = DEFECT_META[r.type];
            const Icon = meta.icon;
            return (
              <div className="fade-up absolute z-30 w-52 rounded-lg p-3" style={{ left: `${(r.x / 800) * 100}%`, top: `${(r.y / 600) * 100}%`, background: C.panelRaised, border: `1px solid ${C.panelBorder}`, boxShadow: "0 8px 24px rgba(0,0,0,0.45)" }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <Icon size={13} color={meta.color} />
                    <span style={{ color: C.textPrimary, fontFamily: "Inter" }} className="text-xs font-semibold">{meta.label}</span>
                  </div>
                  <button onClick={() => setSelectedMarker(null)}><X size={12} color={C.textFaint} /></button>
                </div>
                <div style={{ color: C.textFaint, fontFamily: "JetBrains Mono" }} className="text-[10px] mb-1">{r.id} · {r.time}</div>
                <div style={{ color: C.textMuted }} className="text-[11px] mb-2">Severity: {r.severity} · {meta.dept}</div>
                <StatusBadge status={r.status} />
              </div>
            );
          })()}

          {routeSim && (
            <div className="fade-up absolute bottom-3 left-3 z-20 rounded-lg p-3 w-64" style={{ background: C.panelRaised, border: `1px solid ${C.panelBorder}`, boxShadow: "0 8px 24px rgba(0,0,0,0.45)" }}>
              <div style={{ color: C.textPrimary, fontFamily: "Inter" }} className="text-xs font-semibold mb-2">Route Comparison</div>
              <div className="flex items-center justify-between text-[11px] mb-1.5">
                <span style={{ color: C.riskHigh }} className="flex items-center gap-1"><span className="w-2 h-0.5" style={{ background: C.riskHigh }} /> Shortest (7 km)</span>
                <span style={{ color: C.textMuted, fontFamily: "JetBrains Mono" }}>ETA 18 min</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span style={{ color: C.riskLow }} className="flex items-center gap-1"><span className="w-2 h-0.5" style={{ background: C.riskLow }} /> PRAHARI Safe Route (9 km)</span>
                <span style={{ color: C.riskLow, fontFamily: "JetBrains Mono" }} className="font-semibold">ETA 12 min</span>
              </div>
              <div style={{ borderTop: `1px solid ${C.panelBorder}`, color: C.textFaint }} className="mt-2 pt-2 text-[10px]">Avoids 3 high-risk zones & 4 reported potholes</div>
            </div>
          )}
        </div>

        <aside className="w-full lg:w-80 shrink-0 flex flex-col gap-3 min-h-0">
          <div className="grid grid-cols-2 gap-2">
            <StatCard label="Total Reports" value={counts.total} icon={Eye} accent={C.saffron} />
            <StatCard label="Pending" value={counts.pending} icon={Clock} accent={C.cyan} />
            <StatCard label="Resolved" value={counts.resolved} icon={CheckCircle2} accent={C.riskLow} />
            <StatCard label="High-Risk Zones" value={counts.highRisk} icon={AlertTriangle} accent={C.riskHigh} />
          </div>

          <div style={{ background: C.panel, border: `1px solid ${C.hairline}` }} className="rounded-xl flex-1 flex flex-col min-h-70 overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2.5" style={{ borderBottom: `1px solid ${C.hairline}` }}>
              <span style={{ color: C.textPrimary, fontFamily: "Chakra Petch" }} className="text-[13px] font-semibold">Recent Reports</span>
              <div className="relative">
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ background: C.panelRaised, color: C.textMuted, border: `1px solid ${C.panelBorder}`, fontFamily: "Inter" }} className="text-[10px] rounded pl-2 pr-5 py-1 appearance-none outline-none">
                  <option value="all">All statuses</option>
                  {Object.keys(STATUS_META).map((s) => <option key={s} value={s}>{STATUS_META[s].label}</option>)}
                </select>
                <ChevronDown size={10} style={{ color: C.textFaint }} className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-2 py-2 flex flex-col gap-1.5">
              {filteredReports.map((r) => {
                const meta = DEFECT_META[r.type];
                const Icon = meta.icon;
                return (
                  <button key={r.id} onClick={() => setSelectedMarker(r.id)} style={{ background: selectedMarker === r.id ? C.panelRaised : "transparent", border: `1px solid ${selectedMarker === r.id ? C.panelBorder : "transparent"}` }} className="flex items-center gap-2.5 px-2 py-2 rounded-lg text-left hover:bg-white/3 transition-colors">
                    <div style={{ background: `${meta.color}18` }} className="w-7 h-7 rounded-md flex items-center justify-center shrink-0">
                      <Icon size={13} color={meta.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span style={{ color: C.textPrimary, fontFamily: "Inter" }} className="text-[11.5px] font-medium truncate">{meta.label}</span>
                        {r.status === "verified" && <Loader2 size={10} className="animate-spin shrink-0" style={{ color: C.cyan }} />}
                      </div>
                      <span style={{ color: C.textFaint, fontFamily: "JetBrains Mono" }} className="text-[9.5px]">{r.id} · {r.time}</span>
                    </div>
                    <StatusBadge status={r.status} />
                  </button>
                );
              })}
              {filteredReports.length === 0 && <div style={{ color: C.textFaint }} className="text-[11px] text-center py-6">No reports in this status.</div>}
            </div>
          </div>
        </aside>
      </div>

      <button onClick={() => setShowModal(true)} style={{ background: C.saffron, color: C.void, boxShadow: "0 10px 30px rgba(232,163,61,0.35)" }} className="fixed bottom-6 right-6 z-40 rounded-full px-4 py-3 flex items-center gap-2 font-semibold text-[12px]">
        <Camera size={15} /> Report a Defect
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(4,7,13,0.7)" }}>
          <div className="fade-up w-full max-w-sm rounded-xl p-5" style={{ background: C.panel, border: `1px solid ${C.panelBorder}` }}>
            <div className="flex items-center justify-between mb-4">
              <span style={{ color: C.textPrimary, fontFamily: "Chakra Petch" }} className="text-sm font-semibold">Report a Road Defect</span>
              <button onClick={() => setShowModal(false)}><X size={15} color={C.textFaint} /></button>
            </div>
            <div style={{ border: `1.5px dashed ${C.panelBorder}`, color: C.textFaint }} className="rounded-lg h-28 flex flex-col items-center justify-center gap-1.5 mb-3">
              <Camera size={20} />
              <span className="text-[11px]">Tap to capture or upload photo</span>
            </div>
            <div style={{ background: C.panelRaised, border: `1px solid ${C.panelBorder}` }} className="rounded-lg px-3 py-2 flex items-center gap-2 mb-4">
              <MapPin size={13} color={C.saffron} />
              <span style={{ color: C.textMuted, fontFamily: "JetBrains Mono" }} className="text-[11px]">25.4358° N, 81.8463° E — GPS locked</span>
            </div>
            <button onClick={submitReport} style={{ background: C.saffron, color: C.void, fontFamily: "Inter" }} className="w-full rounded-lg py-2.5 text-[12.5px] font-semibold flex items-center justify-center gap-1.5">
              <ShieldCheck size={14} /> Submit for AI Verification
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


export default function PrahariApp() {
  const [page, setPage] = useState("landing");
  const [prefillEmail, setPrefillEmail] = useState("");
  const [user, setUser] = useState(null);
  const [accounts, setAccounts] = useState([DEMO_ACCOUNT]);
  const [toasts, setToasts] = useState([]);
  const [notifications, setNotifications] = useState([
    "Zone 3 (Prayagraj North) upgraded to high-risk after 3rd incident this week",
    "Weekly civic report summary is ready for review",
  ]);

  const addToast = (type, message) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, type, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3800);
  };
  const dismissToast = (id) => setToasts((t) => t.filter((x) => x.id !== id));
  const addNotification = (msg) => setNotifications((n) => [msg, ...n]);

  const goTo = (p, email) => {
    if (email) setPrefillEmail(email);
    setPage(p);
  };

  const handleLogin = (acc) => {
    setUser(acc);
    setPage("dashboard");
  };

  const handleLogout = () => {
    setUser(null);
    setPage("landing");
    addToast("info", "Signed out.");
  };

  const registerAccount = (acc) => setAccounts((a) => [...a, acc]);

  return (
    <div style={{ background: C.void }} className="w-screen h-screen relative overflow-hidden">
      <style>{`
        @keyframes sweep { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes dashMove { to { stroke-dashoffset: -200; } }
        @keyframes fadeUp { from { opacity:0; transform: translateY(6px);} to {opacity:1; transform:translateY(0);} }
        .fade-up { animation: fadeUp .25s ease-out; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-thumb { background: ${C.panelBorder}; border-radius: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
      `}</style>

      <ToastStack toasts={toasts} onDismiss={dismissToast} />

      {page === "landing" && <LandingPage goTo={goTo} />}
      {page === "login" && <LoginPage goTo={goTo} onLogin={handleLogin} accounts={accounts} addToast={addToast} prefillEmail={prefillEmail} />}
      {page === "register" && <RegisterPage goTo={goTo} addToast={addToast} registerAccount={registerAccount} />}
      {page === "dashboard" && user && (
        <DashboardPage user={user} onLogout={handleLogout} addToast={addToast} notifications={notifications} addNotification={addNotification} />
      )}
    </div>
  );
}
