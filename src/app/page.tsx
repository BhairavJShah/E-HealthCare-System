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
  Plus,
  X
} from "lucide-react";

export default function Home() {
  const { user, userRole, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"patient" | "doctor">("patient");
  const [error, setError] = useState("");
  
  // Modal States
  const [showBookModal, setShowBookModal] = useState(false);
  const [showRecordModal, setShowRecordModal] = useState(false);

  // Form States
  const [doctorName, setDoctorName] = useState("");
  const [apptDate, setApptDate] = useState("");
  const [apptTime, setApptTime] = useState("");
  const [recordName, setRecordModalName] = useState("");

  // Data States
  const [appointments, setAppointments] = useState<any[]>([]);
  const [records, setRecords] = useState<any[]>([]);

  useEffect(() => {
    if (user && db) {
      fetchData();
    }
  }, [user, activeTab]);

  const fetchData = async () => {
    try {
      const q = query(collection(db, "appointments"), where(userRole === "doctor" ? "doctorId" : "patientId", "==", user?.uid));
      const querySnapshot = await getDocs(q);
      setAppointments(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      const rq = query(collection(db, "records"), where("patientId", "==", user?.uid));
      const rSnapshot = await getDocs(rq);
      setRecords(rSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (e) { console.error(e); }
  };

  const handleBookAppt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !db) return;
    try {
      await addDoc(collection(db, "appointments"), {
        patientId: user.uid,
        doctorName,
        date: apptDate,
        time: apptTime,
        type: "General Consultation"
      });
      setShowBookModal(false);
      fetchData();
    } catch (e) { alert("Error booking appointment"); }
  };

  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !db) return;
    try {
      await addDoc(collection(db, "records"), {
        patientId: user.uid,
        name: recordName,
        date: new Date().toLocaleDateString(),
      });
      setShowRecordModal(false);
      fetchData();
    } catch (e) { alert("Error saving record"); }
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
          <button onClick={() => setActiveTab("dashboard")} className={`flex items-center gap-3 w-full p-3 rounded-xl font-bold transition-all ${activeTab === "dashboard" ? "bg-blue-50 text-blue-600" : "text-gray-400 hover:bg-gray-50"}`}><LayoutDashboard size={20} /> Dashboard</button>
          <button onClick={() => setActiveTab("appointments")} className={`flex items-center gap-3 w-full p-3 rounded-xl font-bold transition-all ${activeTab === "appointments" ? "bg-blue-50 text-blue-600" : "text-gray-400 hover:bg-gray-50"}`}><Calendar size={20} /> Appointments</button>
          <button onClick={() => setActiveTab("records")} className={`flex items-center gap-3 w-full p-3 rounded-xl font-bold transition-all ${activeTab === "records" ? "bg-blue-50 text-blue-600" : "text-gray-400 hover:bg-gray-50"}`}><FileText size={20} /> Records</button>
        </nav>
        <div className="p-4 border-t border-gray-100"><button onClick={() => signOut(auth)} className="flex items-center gap-3 w-full p-3 text-red-500 hover:bg-red-50 rounded-xl font-bold transition-all"><LogOut size={20} /> Sign Out</button></div>
      </aside>

      <main className="flex-1 overflow-y-auto p-8 relative">
        <header className="flex justify-between items-center mb-10">
          <div><h1 className="text-2xl font-extrabold capitalize">Welcome, {user.email?.split('@')[0]}</h1><p className="text-gray-400 text-sm">Portal: {userRole || 'Patient'}</p></div>
          <div className="bg-white p-2 px-4 rounded-full shadow-sm border flex items-center gap-2 text-xs font-bold text-gray-500"><Activity size={14} className="text-green-500"/> Online</div>
        </header>

        {activeTab === "dashboard" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-xl mb-6">Upcoming Appointments</h3>
                {appointments.slice(0, 2).length > 0 ? (
                  appointments.slice(0, 2).map((app, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl mb-3 border border-gray-100">
                      <div className="flex items-center gap-4"><div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">{app.doctorName?.[0]}</div><div><p className="font-bold">{app.doctorName}</p><p className="text-xs text-gray-400">{app.type}</p></div></div>
                      <div className="text-right font-bold text-xs"><p>{app.date}</p><p className="text-gray-400">{app.time}</p></div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-gray-300"><Calendar size={40} className="mx-auto mb-4 opacity-20"/><p className="text-sm">No scheduled appointments.</p></div>
                )}
                <button onClick={() => setShowBookModal(true)} className="mt-4 w-full bg-blue-600 text-white py-3 rounded-2xl text-sm font-bold shadow-lg shadow-blue-100">Book New Appointment</button>
              </div>

              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-xl mb-6">Health Vitals</h3>
                <div className="space-y-8">
                  <div><p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Heart Rate</p><p className="text-3xl font-black">72 <span className="text-sm font-normal text-gray-300">bpm</span></p></div>
                  <div><p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Blood Pressure</p><p className="text-3xl font-black">120/80 <span className="text-sm font-normal text-gray-300">mmHg</span></p></div>
                  <div><p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">BMI Index</p><p className="text-3xl font-black">22.4 <span className="text-sm font-normal text-green-400">Normal</span></p></div>
                </div>
              </div>
            </div>

            <section className="mt-12">
              <h3 className="font-bold text-xl mb-6">Recent Records</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {records.slice(0, 3).map((r, i) => (
                  <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="bg-blue-50 p-2 rounded-xl text-blue-500"><FileText size={24}/></div>
                    <div className="overflow-hidden"><p className="font-bold text-sm truncate">{r.name}</p><p className="text-[10px] text-gray-400">{r.date}</p></div>
                  </div>
                ))}
                <div onClick={() => setShowRecordModal(true)} className="border-2 border-dashed border-gray-200 p-5 rounded-2xl flex flex-col items-center justify-center text-gray-300 hover:border-blue-400 hover:text-blue-500 transition-all cursor-pointer">
                  <Plus size={24} className="mb-1" /> <span className="text-xs font-black">Add New</span>
                </div>
              </div>
            </section>
          </>
        )}

        {activeTab === "appointments" && (
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-8"><h3 className="font-bold text-2xl">My Appointments</h3><button onClick={() => setShowBookModal(true)} className="bg-blue-600 text-white px-6 py-2 rounded-full text-xs font-bold shadow-lg">+ New</button></div>
            <div className="space-y-4">
              {appointments.map((app, i) => (
                <div key={i} className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="flex items-center gap-6"><div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xl font-bold">{app.doctorName?.[0]}</div><div><p className="font-bold text-lg">{app.doctorName}</p><p className="text-sm text-gray-400">{app.type}</p></div></div>
                  <div className="text-right font-bold"><p className="text-blue-600">{app.date}</p><p className="text-gray-400">{app.time}</p></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "records" && (
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-8"><h3 className="font-bold text-2xl">Medical Records Vault</h3><button onClick={() => setShowRecordModal(true)} className="bg-blue-600 text-white px-6 py-2 rounded-full text-xs font-bold shadow-lg">+ Upload</button></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {records.map((r, i) => (
                <div key={i} className="p-6 bg-gray-50 rounded-3xl border border-gray-100 flex items-center gap-6">
                  <div className="bg-white p-4 rounded-2xl shadow-sm text-blue-600"><FileText size={32}/></div>
                  <div><p className="font-bold text-lg">{r.name}</p><p className="text-sm text-gray-400">Received on {r.date}</p></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MODALS */}
        {showBookModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center mb-6"><h3 className="font-bold text-xl">Book Appointment</h3><button onClick={() => setShowBookModal(false)}><X className="text-gray-400"/></button></div>
              <form onSubmit={handleBookAppt} className="space-y-4">
                <input type="text" placeholder="Doctor Name" value={doctorName} onChange={(e) => setDoctorName(e.target.value)} className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" required />
                <input type="date" value={apptDate} onChange={(e) => setApptDate(e.target.value)} className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" required />
                <input type="time" value={apptTime} onChange={(e) => setApptTime(e.target.value)} className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" required />
                <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-100">Confirm Booking</button>
              </form>
            </div>
          </div>
        )}

        {showRecordModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center mb-6"><h3 className="font-bold text-xl">Add Medical Record</h3><button onClick={() => setShowRecordModal(false)}><X className="text-gray-400"/></button></div>
              <form onSubmit={handleAddRecord} className="space-y-4">
                <input type="text" placeholder="Record Name (e.g. Lab Report)" value={recordName} onChange={(e) => setRecordModalName(e.target.value)} className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" required />
                <div className="border-2 border-dashed border-gray-200 p-8 rounded-2xl flex flex-col items-center justify-center text-gray-400 text-sm">
                  <Plus size={32} className="mb-2 opacity-20"/>
                  <span>Simulated File Upload</span>
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-100">Save Record</button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
