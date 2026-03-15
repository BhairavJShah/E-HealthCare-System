"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut 
} from "firebase/auth";
import { doc, setDoc, collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { 
  LayoutDashboard, 
  Calendar, 
  FileText, 
  User as UserIcon, 
  LogOut, 
  Stethoscope, 
  Activity, 
  Clock, 
  ArrowRight,
  Plus
} from "lucide-react";

export default function Home() {
  const { user, userRole, loading: authLoading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"patient" | "doctor">("patient");
  const [error, setError] = useState("");
  
  // Data States
  const [appointments, setAppointments] = useState<any[]>([]);
  const [records, setRecords] = useState<any[]>([]);

  useEffect(() => {
    if (user && db) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      // Fetch Appointments
      const q = query(collection(db, "appointments"), where(userRole === "doctor" ? "doctorId" : "patientId", "==", user?.uid));
      const querySnapshot = await getDocs(q);
      setAppointments(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      // Fetch Records
      const rq = query(collection(db, "records"), where("patientId", "==", user?.uid));
      const rSnapshot = await getDocs(rq);
      setRecords(rSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (e) { console.error(e); }
  };

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
    } catch (err: any) { setError(err.message); }
  };

  if (authLoading) return <div className="min-h-screen flex items-center justify-center bg-white"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-600"></div></div>;

  if (!user) {
    return (
      <main className="min-h-screen flex flex-col md:flex-row bg-white text-gray-900">
        <div className="md:w-1/2 bg-blue-600 p-8 flex flex-col justify-center text-white">
          <div className="max-w-md mx-auto">
            <div className="flex items-center gap-3 mb-6"><div className="bg-white p-2 rounded-xl"><Stethoscope className="w-8 h-8 text-blue-600" /></div><h1 className="text-3xl font-bold tracking-tight">E-Health</h1></div>
            <h2 className="text-4xl font-bold mb-4">Modern Healthcare, simplified.</h2>
            <p className="text-blue-100 text-lg mb-8">Access medical records, book appointments, and chat with AI.</p>
          </div>
        </div>
        <div className="md:w-1/2 p-8 flex flex-col justify-center items-center">
          <div className="w-full max-w-sm">
            <h2 className="text-2xl font-bold mb-6">{isLogin ? "Welcome Back" : "Create Account"}</h2>
            <form onSubmit={handleAuth} className="space-y-4">
              {!isLogin && (
                <>
                  <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" required />
                  <select value={role} onChange={(e) => setRole(e.target.value as any)} className="w-full p-3 border border-gray-200 rounded-xl outline-none">
                    <option value="patient">I am a Patient</option>
                    <option value="doctor">I am a Doctor</option>
                  </select>
                </>
              )}
              <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" required />
              <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" required />
              {error && <p className="text-red-500 text-xs">{error}</p>}
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-100">{isLogin ? "Sign In" : "Register"}</button>
            </form>
            <button onClick={() => setIsLogin(!isLogin)} className="w-full mt-6 text-sm text-blue-600 font-semibold">{isLogin ? "Need an account? Sign Up" : "Have an account? Log In"}</button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 text-gray-900">
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
        <div className="p-6 flex items-center gap-3 border-b border-gray-100"><Stethoscope className="text-blue-600" /> <span className="font-bold text-xl">E-Health</span></div>
        <nav className="flex-1 p-4 space-y-2 mt-4">
          <button className="flex items-center gap-3 w-full p-3 bg-blue-50 text-blue-600 rounded-xl font-bold"><LayoutDashboard size={20} /> Dashboard</button>
          <button className="flex items-center gap-3 w-full p-3 text-gray-400 hover:bg-gray-50 rounded-xl"><Calendar size={20} /> Appointments</button>
          <button className="flex items-center gap-3 w-full p-3 text-gray-400 hover:bg-gray-50 rounded-xl"><FileText size={20} /> Records</button>
        </nav>
        <div className="p-4 border-t border-gray-100"><button onClick={() => signOut(auth)} className="flex items-center gap-3 w-full p-3 text-red-500 hover:bg-red-50 rounded-xl font-bold"><LogOut size={20} /> Sign Out</button></div>
      </aside>

      <main className="flex-1 overflow-y-auto p-8">
        <header className="flex justify-between items-center mb-10">
          <div><h1 className="text-2xl font-extrabold">Welcome, {user.email?.split('@')[0]}</h1><p className="text-gray-400 text-sm">Role: {userRole || 'Patient'}</p></div>
          <div className="bg-white p-2 px-4 rounded-full shadow-sm border flex items-center gap-2 text-xs font-bold text-gray-500"><Activity size={14} className="text-green-500"/> System Status: Online</div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-xl mb-6">Upcoming Appointments</h3>
            {appointments.length > 0 ? (
              appointments.map((app, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl mb-3 border border-gray-100">
                  <div className="flex items-center gap-4"><div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">{app.doctorName?.[0]}</div><div><p className="font-bold">{app.doctorName}</p><p className="text-xs text-gray-400">{app.type}</p></div></div>
                  <div className="text-right font-bold text-xs"><p>{app.date}</p><p className="text-gray-400">{app.time}</p></div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-gray-300"><Calendar size={40} className="mx-auto mb-4 opacity-20"/><p className="text-sm">No scheduled appointments.</p><button className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-full text-xs font-bold shadow-lg">Book Now</button></div>
            )}
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-xl mb-6">Health Vitals</h3>
            <div className="space-y-8">
              <div><p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Heart Rate</p><p className="text-3xl font-black">72 <span className="text-sm font-normal text-gray-300 tracking-normal">bpm</span></p></div>
              <div><p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Blood Pressure</p><p className="text-3xl font-black">120/80 <span className="text-sm font-normal text-gray-300 tracking-normal">mmHg</span></p></div>
              <div><p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">BMI Index</p><p className="text-3xl font-black">22.4 <span className="text-sm font-normal text-green-400 tracking-normal">Healthy</span></p></div>
            </div>
          </div>
        </div>

        <section className="mt-12">
          <h3 className="font-bold text-xl mb-6">Medical Records</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {records.map((r, i) => (
              <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 hover:border-blue-200 transition-all cursor-pointer shadow-sm flex items-center gap-4">
                <div className="bg-blue-50 p-2 rounded-xl text-blue-500"><FileText size={24}/></div>
                <div><p className="font-bold text-sm truncate">{r.name}</p><p className="text-[10px] text-gray-400">{r.date}</p></div>
              </div>
            ))}
            <div className="border-2 border-dashed border-gray-200 p-5 rounded-2xl flex flex-col items-center justify-center text-gray-300 hover:border-blue-400 hover:text-blue-500 transition-all cursor-pointer group">
              <Plus size={24} className="mb-1" /> <span className="text-xs font-black">Upload New</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
