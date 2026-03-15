"use client";

import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut 
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import HealthChatbot from "@/components/HealthChatbot";
import { 
  LayoutDashboard, 
  Calendar, 
  FileText, 
  User as UserIcon, 
  LogOut, 
  Stethoscope, 
  Activity, 
  Clock, 
  ArrowRight
} from "lucide-react";

export default function Home() {
  const { user, userRole, loading: authLoading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"patient" | "doctor">("patient");
  const [error, setError] = useState("");

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", userCredential.user.uid), {
          name,
          email,
          role,
          createdAt: new Date().toISOString(),
        });
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // --- Login / Signup Page ---
  if (!user) {
    return (
      <main className="min-h-screen flex flex-col md:flex-row bg-white">
        {/* Left Side: Branding */}
        <div className="md:w-1/2 bg-blue-600 p-8 flex flex-col justify-center text-white">
          <div className="max-w-md mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-white p-2 rounded-xl">
                <Stethoscope className="w-8 h-8 text-blue-600" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight">E-HealthCare</h1>
            </div>
            <h2 className="text-4xl font-bold mb-4">Modern Healthcare, simplified.</h2>
            <p className="text-blue-100 text-lg mb-8">
              Access your medical records, book appointments, and chat with our in-browser AI health assistant.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-500 p-1 rounded-full"><ArrowRight size={16} /></div>
                <span>Encrypted Digital Records</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-blue-500 p-1 rounded-full"><ArrowRight size={16} /></div>
                <span>Browser-based AI Assistant</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-blue-500 p-1 rounded-full"><ArrowRight size={16} /></div>
                <span>Real-time Doctor Scheduling</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Auth Form */}
        <div className="md:w-1/2 p-8 flex flex-col justify-center items-center">
          <div className="w-full max-w-sm">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">
              {isLogin ? "Welcome Back" : "Create an Account"}
            </h2>
            <form onSubmit={handleAuth} className="space-y-4">
              {!isLogin && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input 
                      type="text" value={name} onChange={(e) => setName(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">I am a...</label>
                    <select 
                      value={role} onChange={(e) => setRole(e.target.value as any)}
                      className="w-full p-2 border border-gray-300 rounded-lg outline-none"
                    >
                      <option value="patient">Patient</option>
                      <option value="doctor">Doctor</option>
                    </select>
                  </div>
                </>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input 
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input 
                  type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required 
                />
              </div>
              {error && <p className="text-red-500 text-xs">{error}</p>}
              <button 
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-colors"
              >
                {isLogin ? "Sign In" : "Register"}
              </button>
            </form>
            <p className="mt-6 text-center text-sm text-gray-600">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button onClick={() => setIsLogin(!isLogin)} className="text-blue-600 font-semibold hover:underline">
                {isLogin ? "Sign Up" : "Log In"}
              </button>
            </p>
          </div>
        </div>
      </main>
    );
  }

  // --- Main Dashboard Page ---
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
        <div className="p-6 flex items-center gap-3 border-b border-gray-100">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <Stethoscope className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl text-blue-600">E-Health</span>
        </div>
        <nav className="flex-1 p-4 space-y-2 mt-4">
          <button className="flex items-center gap-3 w-full p-3 bg-blue-50 text-blue-600 rounded-xl font-medium">
            <LayoutDashboard size={20} /> Dashboard
          </button>
          <button className="flex items-center gap-3 w-full p-3 text-gray-500 hover:bg-gray-50 rounded-xl font-medium transition-all">
            <Calendar size={20} /> Appointments
          </button>
          <button className="flex items-center gap-3 w-full p-3 text-gray-500 hover:bg-gray-50 rounded-xl font-medium transition-all">
            <FileText size={20} /> Medical Records
          </button>
          <button className="flex items-center gap-3 w-full p-3 text-gray-500 hover:bg-gray-50 rounded-xl font-medium transition-all">
            <UserIcon size={20} /> Profile
          </button>
        </nav>
        <div className="p-4 border-t border-gray-100">
          <button 
            onClick={() => signOut(auth)}
            className="flex items-center gap-3 w-full p-3 text-red-500 hover:bg-red-50 rounded-xl font-medium transition-all"
          >
            <LogOut size={20} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8 relative">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Good Morning, {user.email?.split('@')[0]}</h1>
            <p className="text-gray-500 capitalize">Role: {userRole || 'Patient'}</p>
          </div>
          <div className="flex items-center gap-4 text-sm font-medium text-gray-500 bg-white p-2 px-4 rounded-full shadow-sm border border-gray-100">
            <Activity className="w-4 h-4 text-green-500" />
            Vitals: Normal
          </div>
        </header>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Appointments */}
          <div className="md:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg">Upcoming Appointments</h3>
              <button className="text-blue-600 text-sm font-bold hover:underline">View all</button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">DS</div>
                  <div>
                    <p className="font-bold">Dr. Sarah Johnson</p>
                    <p className="text-xs text-gray-500">General Consultation</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm">Tomorrow, 10:30 AM</p>
                  <p className="text-xs text-gray-500">Room 402</p>
                </div>
              </div>
              <div className="text-center py-10 text-gray-400">
                <p className="text-sm">No other appointments scheduled.</p>
                <button className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-full text-xs font-bold shadow-lg shadow-blue-200">Book New</button>
              </div>
            </div>
          </div>

          {/* Card 2: Health Stats */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-lg mb-6">Quick Stats</h3>
            <div className="space-y-6">
              <div className="flex justify-between items-end border-b border-gray-50 pb-4">
                <div>
                  <p className="text-xs text-gray-400 font-bold mb-1 uppercase tracking-wider">Heart Rate</p>
                  <p className="text-2xl font-bold">72 <span className="text-sm text-gray-400">bpm</span></p>
                </div>
                <Activity className="text-red-400 w-8 h-8 mb-1" />
              </div>
              <div className="flex justify-between items-end border-b border-gray-50 pb-4">
                <div>
                  <p className="text-xs text-gray-400 font-bold mb-1 uppercase tracking-wider">Blood Pressure</p>
                  <p className="text-2xl font-bold">120/80 <span className="text-sm text-gray-400">mmHg</span></p>
                </div>
                <Clock className="text-blue-400 w-8 h-8 mb-1" />
              </div>
              <div className="flex justify-between items-end border-b border-gray-50 pb-4">
                <div>
                  <p className="text-xs text-gray-400 font-bold mb-1 uppercase tracking-wider">BMI</p>
                  <p className="text-2xl font-bold">22.4 <span className="text-sm text-gray-400">Normal</span></p>
                </div>
                <Activity className="text-green-400 w-8 h-8 mb-1" />
              </div>
            </div>
          </div>
        </div>

        <section className="mt-10">
          <h3 className="font-bold text-lg mb-6">Recent Medical Records</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {['Prescription_Feb.pdf', 'Lab_Report_Jan.pdf', 'XRay_Chest.jpg'].map((file, i) => (
              <div key={i} className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center gap-3 hover:border-blue-200 cursor-pointer transition-all">
                <div className="bg-orange-50 p-2 rounded-lg text-orange-500">
                  <FileText size={20} />
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-bold truncate">{file}</p>
                  <p className="text-[10px] text-gray-400">Uploaded 2 days ago</p>
                </div>
              </div>
            ))}
            <div className="border-2 border-dashed border-gray-200 p-4 rounded-2xl flex items-center justify-center text-gray-400 hover:border-blue-400 transition-all cursor-pointer group">
              <span className="text-xs font-bold group-hover:text-blue-600">+ Upload New Record</span>
            </div>
          </div>
        </section>

        {/* AI Chatbot Component temporarily disabled for debugging */}
        {/* <HealthChatbot /> */}
      </main>
    </div>
  );
}
