import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, ChevronLeft, ChevronRight, BrainCircuit, Sparkles, X, 
  TrendingDown, Target, Save, Trash2, Wallet, LogOut, UserCircle,
  ArrowRight, Settings, Plus, RotateCcw, TrendingUp, CreditCard, DollarSign,
  Smartphone, Zap, Landmark, Banknote, Edit2, Check
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithCustomToken, 
  signInAnonymously, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signOut
} from 'firebase/auth';
import { getFirestore, collection, addDoc, deleteDoc, doc, onSnapshot, setDoc, getDoc, updateDoc } from 'firebase/firestore';

// --- IMPORTANTE: CONFIGURACIÓN DE TU PROYECTO ---
// Cuando sigas la guía y crees tu propio Firebase, reemplazarás esto con tus propios datos.
// Por ahora, usa la configuración automática del entorno de prueba.
const firebaseConfig = typeof __firebase_config !== 'undefined' 
  ? JSON.parse(__firebase_config) 
  : { apiKey: "TU_API_KEY_REAL", authDomain: "tu-app.firebaseapp.com", projectId: "tu-app", storageBucket: "tu-app.appspot.com", messagingSenderId: "...", appId: "..." };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
// En producción real, el appId suele ser fijo o gestionado por la config de Firebase
const appId = typeof __app_id !== 'undefined' ? __app_id : 'finanzas-familia';

// --- Iconos Personalizados ---
const Icons = {
  MP: () => (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 8h16M4 16h16" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
      <path d="M12 4v16" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
    </svg>
  ), 
  Lemon: () => (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
      <path d="M12 2L2 12l10 10 10-10L12 2zm0 4l6 6-6 6-6-6 6-6z" fill="currentColor"/>
    </svg>
  ),
  Uala: () => (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none"/>
      <path d="M8 12h8" stroke="currentColor" strokeWidth="3"/>
    </svg>
  ),
  Belo: () => (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
      <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm-2 14l-2-4 4-2 2 4-2 2z" fill="currentColor"/>
    </svg>
  ),
  Macro: () => (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
      <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
      <path d="M8 12l4 4 4-4" stroke="currentColor" strokeWidth="2"/>
    </svg>
  ),
  Naranja: () => (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
      <path d="M4 4l16 16M20 4L4 20" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
    </svg>
  ),
  Santander: () => (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
      <path d="M3 12h18M12 3v18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1" opacity="0.5"/>
    </svg>
  )
};

// --- Constantes Globales ---
const ACCOUNTS = [
  { id: 'EFECTIVO', name: 'Efectivo', color: 'bg-emerald-100 text-emerald-800', icon: <Banknote className="h-5 w-5" /> },
  { id: 'MERCADO PAGO', name: 'Mercado Pago', color: 'bg-sky-100 text-sky-700', icon: <Icons.MP /> },
  { id: 'LEMON CASH', name: 'Lemon Cash', color: 'bg-lime-100 text-lime-800', icon: <Icons.Lemon /> },
  { id: 'BELO', name: 'Belo', color: 'bg-fuchsia-100 text-fuchsia-800', icon: <Icons.Belo /> }, 
  { id: 'UALA', name: 'Ualá', color: 'bg-pink-100 text-pink-800', icon: <Icons.Uala /> },
  { id: 'MACRO CORRIENTE', name: 'Macro Cta. Cte.', color: 'bg-indigo-100 text-indigo-800', icon: <Icons.Macro /> },
  { id: 'MACRO AHORRO', name: 'Macro Ahorro', color: 'bg-indigo-50 text-indigo-900', icon: <Icons.Macro /> },
  { id: 'BNA+', name: 'BNA+', color: 'bg-blue-50 text-blue-900', icon: <Landmark className="h-5 w-5" /> },
  { id: 'SANTANDER', name: 'Santander', color: 'bg-red-100 text-red-800', icon: <Icons.Santander /> },
  { id: 'NARANJA X', name: 'Naranja X', color: 'bg-orange-100 text-orange-800', icon: <Icons.Naranja /> },
  { id: 'DEUDA', name: 'Deuda (A Pagar)', color: 'bg-slate-200 text-slate-600', icon: <TrendingDown className="h-5 w-5" /> },
];

const DEFAULT_CATEGORIES = [
  { id: 'ADELANTO SERGIO ISLA VERDE', color: 'bg-green-900 text-white border-green-900' },
  { id: 'ALDANA', color: 'bg-pink-400 text-white border-pink-400' },
  { id: 'ALQUILER', color: 'bg-slate-900 text-white border-slate-900' },
  { id: 'CELULAR', color: 'bg-slate-700 text-white border-slate-700' },
  { id: 'CHATA', color: 'bg-rose-100 text-rose-800 border-rose-200' },
  { id: 'COMBUSTIBLE', color: 'bg-slate-800 text-white border-slate-800' },
  { id: 'COMIDA', color: 'bg-red-100 text-red-800 border-red-200' },
  { id: 'COMIDA OBRA', color: 'bg-stone-800 text-white border-stone-800' },
  { id: 'COSAS CASA', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  { id: 'CUENTA', color: 'bg-orange-100 text-orange-800 border-orange-200' },
  { id: 'DANDO', color: 'bg-yellow-700 text-white border-yellow-700' },
  { id: 'DEPORTES', color: 'bg-orange-200 text-orange-900 border-orange-300' },
  { id: 'DRUGS', color: 'bg-black text-white border-black' },
  { id: 'eBe CONSTR', color: 'bg-emerald-600 text-white border-emerald-600' },
  { id: 'eBe MUEBLES', color: 'bg-rose-300 text-rose-900 border-rose-400' },
  { id: 'ELEC. LA DONOSA', color: 'bg-amber-700 text-white border-amber-700' },
  { id: 'ESTUDIOS', color: 'bg-blue-400 text-white border-blue-400' },
  { id: 'INCLUB', color: 'bg-gray-400 text-gray-900 border-gray-400' },
  { id: 'INNECESARIOS', color: 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200' },
  { id: 'INVERSIÓN', color: 'bg-slate-500 text-white border-slate-500' },
  { id: 'MAQUINAS', color: 'bg-zinc-800 text-white border-zinc-800' },
  { id: 'MELI', color: 'bg-yellow-300 text-black border-yellow-400' },
  { id: 'MERCADERIA', color: 'bg-green-700 text-white border-green-700' },
  { id: 'MOTO', color: 'bg-pink-200 text-pink-900 border-pink-300' },
  { id: 'MULTAS', color: 'bg-red-900 text-white border-red-900' },
  { id: 'OBRA WANDA EMBALSE', color: 'bg-gray-900 text-white border-gray-900' },
  { id: 'OTTO', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  { id: 'PADEL GOLF', color: 'bg-yellow-600 text-white border-yellow-600' },
  { id: 'PROYECTOS ebe estudio', color: 'bg-violet-200 text-violet-900 border-violet-300' },
  { id: 'ROPA/BELLEZA', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  { id: 'SALIDAS', color: 'bg-pink-100 text-pink-800 border-pink-200' },
  { id: 'SALUD', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { id: 'SUSCRIPCIONES', color: 'bg-red-500 text-white border-red-500' },
  { id: 'TARJETAS CRED', color: 'bg-neutral-900 text-white border-neutral-900' },
  { id: 'TRANSPORTE', color: 'bg-cyan-800 text-white border-cyan-800' },
  { id: 'UNO', color: 'bg-orange-400 text-white border-orange-400' },
  { id: 'VIAJE', color: 'bg-teal-500 text-white border-teal-500' },
];

const COLOR_PALETTE = [
  { name: 'Negro', tw: 'bg-slate-900 text-white border-slate-900' },
  { name: 'Rojo', tw: 'bg-red-100 text-red-800 border-red-200' },
  { name: 'Verde', tw: 'bg-green-100 text-green-800 border-green-200' },
  { name: 'Azul', tw: 'bg-blue-100 text-blue-800 border-blue-200' },
  { name: 'Amarillo', tw: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  { name: 'Violeta', tw: 'bg-violet-100 text-violet-800 border-violet-200' },
  { name: 'Rosa', tw: 'bg-pink-100 text-pink-800 border-pink-200' },
  { name: 'Naranja', tw: 'bg-orange-100 text-orange-800 border-orange-200' },
  { name: 'Cyan', tw: 'bg-cyan-800 text-white border-cyan-800' },
  { name: 'Esmeralda', tw: 'bg-emerald-600 text-white border-emerald-600' },
];

const App = () => {
  // --- Estados Principales ---
  const [user, setUser] = useState(null);
  const [view, setView] = useState('login'); 
  const [expenses, setExpenses] = useState([]);
  const [authLoading, setAuthLoading] = useState(true);
  
  // --- Estados de Datos ---
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [dolarBlue, setDolarBlue] = useState({ compra: 0, venta: 0, loading: true });
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  // --- Estados del Formulario ---
  const [description, setDescription] = useState('');
  const [amountRaw, setAmountRaw] = useState(''); 
  const [category, setCategory] = useState('');
  const [account, setAccount] = useState('EFECTIVO');
  const [type, setType] = useState('expense'); 

  // --- Estados de Configuración (Edición) ---
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState(COLOR_PALETTE[0]);
  const [editingCatId, setEditingCatId] = useState(null);
  const [editCatName, setEditCatName] = useState('');

  // --- Autenticación ---
  useEffect(() => {
    // Escuchar estado de autenticación
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
        setAuthLoading(false);
        // Si hay usuario y estamos en login, ir a home automáticamente
        if (currentUser && view === 'login') {
            setView('home');
        }
    });
    
    // Intento inicial para el entorno de vista previa (mantener funcionalidad actual)
    // En la app real, el usuario hará click en el botón.
    const initPreviewAuth = async () => {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
            try { await signInWithCustomToken(auth, __initial_auth_token); } catch(e) {}
        }
    };
    initPreviewAuth();

    return () => unsubscribe();
  }, []); // Dependencia vacía para ejecutar solo al montar

  // --- Carga de Datos ---
  useEffect(() => {
    if (!user) return;
    const q = collection(db, 'artifacts', appId, 'users', user.uid, 'expenses');
    return onSnapshot(q, (snapshot) => {
      const loaded = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      loaded.sort((a, b) => new Date(b.date) - new Date(a.date));
      setExpenses(loaded);
    });
  }, [user]);

  // --- Carga de Categorías ---
  useEffect(() => {
    if (!user) return;
    const loadCats = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'config', 'categories'));
        if (docSnap.exists() && docSnap.data().list?.length) {
          setCategories(docSnap.data().list);
        }
      } catch (e) { console.error("Error loading cats", e); }
    };
    loadCats();
  }, [user]);

  // Sincronizar selectores
  useEffect(() => {
    if (categories.length > 0 && !category) setCategory(categories[0].id);
  }, [categories, category]);

  // --- Dólar API ---
  useEffect(() => { 
    fetch('https://dolarapi.com/v1/dolares/blue')
      .then(r => r.json())
      .then(d => setDolarBlue({ compra: d.compra, venta: d.venta, loading: false }))
      .catch(() => setDolarBlue({ compra: 0, venta: 0, loading: false }));
  }, []);

  // --- Helpers ---
  const formatMoney = (amount) => {
    if (isNaN(amount) || amount === null) return '$0';
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(amount);
  };

  const handleAmountChange = (e) => {
    const value = e.target.value.replace(/\./g, '').replace(/,/g, ''); 
    if (/^\d*$/.test(value)) setAmountRaw(value);
  };

  const displayAmount = amountRaw ? new Intl.NumberFormat('es-AR').format(amountRaw) : '';

  // --- Lógica de Negocio ---
  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => expense.date.startsWith(selectedMonth));
  }, [expenses, selectedMonth]);

  const accountBalances = useMemo(() => {
    const balances = {};
    ACCOUNTS.forEach(acc => balances[acc.id] = 0);
    expenses.forEach(tx => {
      const acc = tx.account || 'EFECTIVO';
      const isIncome = tx.type === 'income';
      
      // Lógica DEUDA: Si gasto en deuda, NO resta mi patrimonio, pero quiero ver cuanto debo.
      // Aquí, para el balance global, Deuda resta porque es pasivo.
      // Pero el usuario pidió: "es algo que se debe... no se puede descontar en el caso de que tengo efectivo".
      // Interpretación: "Deuda" es un saldo negativo independiente.
      
      if (isIncome) {
        balances[acc] += tx.amount;
      } else {
        balances[acc] -= tx.amount;
      }
    });
    return balances;
  }, [expenses]);

  // Balance Total Real (Excluyendo Deuda si queremos saber liquidez, o incluyendo si es patrimonio neto)
  // El usuario dice "balance total real". Generalmente es Activos - Pasivos.
  const totalGlobalBalance = Object.entries(accountBalances).reduce((acc, [key, val]) => {
    // Si la cuenta es DEUDA, su valor será negativo (lo que debo).
    // Si queremos "dinero real disponible", sumamos solo cuentas positivas.
    // Si queremos "patrimonio", sumamos todo.
    // Asumiremos Patrimonio Neto (Todo).
    return acc + val; 
  }, 0);

  const monthlyStats = useMemo(() => {
    let income = 0;
    let expense = 0;
    filteredExpenses.forEach(tx => {
      if (tx.type === 'income') income += tx.amount;
      else expense += tx.amount;
    });
    return { income, expense, balance: income - expense };
  }, [filteredExpenses]);

  const categoryBreakdown = useMemo(() => {
    const breakdown = {};
    filteredExpenses
      .filter(tx => tx.type !== 'income')
      .forEach(exp => {
        if (!breakdown[exp.category]) breakdown[exp.category] = 0;
        breakdown[exp.category] += exp.amount;
      });
    return Object.entries(breakdown)
      .map(([cat, total]) => ({ cat, total }))
      .sort((a, b) => b.total - a.total);
  }, [filteredExpenses]);

  // --- Manejadores ---
  const handleLogin = async () => {
    setAuthLoading(true);
    // Intentar Login con Google (Ventana Emergente)
    // Esto funcionará cuando la app esté alojada (Vercel/Firebase)
    // En el entorno de prueba, puede fallar por bloqueos de iframe, por eso el try/catch.
    try {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
        // El onAuthStateChanged se encargará de cambiar la vista
    } catch (error) {
        console.warn("Google Popup cerrado o bloqueado. Usando modo anónimo para demo.", error);
        // Fallback para que puedas seguir probando aquí
        await signInAnonymously(auth);
    } finally {
        setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
      await signOut(auth);
      setView('login');
  };

  const changeMonth = (offset) => {
    const [year, month] = selectedMonth.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1 + offset);
    setSelectedMonth(date.toISOString().slice(0, 7));
  };

  const formatMonthShort = (isoMonth) => {
    const [year, month] = isoMonth.split('-');
    return `${month}/${year.slice(2)}`;
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!amountRaw || !user) return; 
    try {
      await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'expenses'), {
        description: description || (type === 'income' ? 'Ingreso' : 'Gasto'),
        amount: parseFloat(amountRaw),
        category: category || (type === 'income' ? 'VARIOS' : 'ALQUILER'), 
        account: account,
        type: type,
        date: new Date().toISOString(),
      });
      setDescription('');
      setAmountRaw('');
    } catch (error) { console.error("Error saving:", error); }
  };

  const handleDelete = async (id) => {
    try { await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'expenses', id)); } 
    catch (error) { console.error("Error deleting:", error); }
  };

  const saveCategoriesToDb = async (newCategories) => {
    try { await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'config', 'categories'), { list: newCategories }); }
    catch (e) { console.error("Error saving cats", e); }
  };

  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    const newCat = { id: newCatName.toUpperCase().trim(), color: newCatColor.tw };
    if (categories.some(c => c.id === newCat.id)) return alert("Ya existe");
    const updated = [...categories, newCat].sort((a, b) => a.id.localeCompare(b.id));
    setCategories(updated);
    saveCategoriesToDb(updated);
    setNewCatName('');
  };

  const handleDeleteCategory = (id) => {
    if (categories.length <= 1) return;
    const updated = categories.filter(c => c.id !== id);
    setCategories(updated);
    saveCategoriesToDb(updated);
    if (category === id) setCategory(updated[0].id);
  };

  const startEditing = (cat) => {
    setEditingCatId(cat.id);
    setEditCatName(cat.id);
  };

  const saveEditCategory = () => {
    if (!editCatName.trim()) return;
    const updated = categories.map(c => {
      if (c.id === editingCatId) {
        return { ...c, id: editCatName.toUpperCase().trim() };
      }
      return c;
    }).sort((a, b) => a.id.localeCompare(b.id)); 
    
    setCategories(updated);
    saveCategoriesToDb(updated);
    setEditingCatId(null);
    setEditCatName('');
  };

  const handleRestoreDefaults = () => {
    setCategories(DEFAULT_CATEGORIES);
    saveCategoriesToDb(DEFAULT_CATEGORIES);
    setCategory(DEFAULT_CATEGORIES[0].id);
  };

  // --- VISTAS ---

  if (view === 'login') {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full z-0"><div className="absolute top-10 left-10 w-64 h-64 bg-violet-600 rounded-full blur-[100px] opacity-20 animate-pulse"></div></div>
        <div className="relative z-10 w-full max-w-sm bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl shadow-2xl text-center">
          <Wallet className="h-12 w-12 text-white mx-auto mb-6" />
          <h1 className="text-3xl font-black text-white mb-2">FINANZAS<span className="font-light text-slate-400">2026</span></h1>
          <button onClick={handleLogin} className="w-full bg-white text-slate-900 font-bold py-4 rounded-xl mt-8 shadow-lg hover:scale-[1.02] transition-transform flex items-center justify-center gap-3">
             <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            {authLoading ? 'Conectando...' : 'Entrar con Google'}
          </button>
        </div>
      </div>
    );
  }

  // --- Vista Asesor IA ---
  if (view === 'advisor') {
    const highestCat = categoryBreakdown[0];
    const totalExp = monthlyStats.expense;
    const savingTip = highestCat ? `Tu mayor gasto es ${highestCat.cat}. Reducirlo un 15% te ahorraría ${formatMoney(totalExp * 0.15)}.` : "Comienza a registrar gastos para recibir consejos.";
    
    return (
      <div className="min-h-screen bg-slate-900 text-white font-sans p-6">
        <div className="max-w-md mx-auto space-y-8">
           <div className="flex items-center gap-3 mb-6">
             <button onClick={() => setView('reports')} className="bg-slate-800 p-2 rounded-full"><ChevronLeft className="h-6 w-6" /></button>
             <h2 className="text-xl font-bold text-violet-300">Asesor Profesional IA</h2>
           </div>
           <div className="bg-slate-800/50 p-6 rounded-3xl border border-violet-500/30">
             <div className="flex items-center gap-3 mb-4">
               <div className="bg-violet-600 p-3 rounded-full"><BrainCircuit className="h-8 w-8 text-white" /></div>
               <div><p className="font-bold text-lg">Contador Inteligente</p><p className="text-xs text-slate-400">Análisis de rentabilidad</p></div>
             </div>
             <div className="space-y-4 text-slate-300 leading-relaxed text-sm">
               <p>Hola, <strong>{user?.displayName || 'Usuario'}</strong>. He analizado tus movimientos de este mes.</p>
               <div className="bg-slate-900 p-4 rounded-xl border-l-4 border-emerald-500">
                 <p className="font-bold text-white mb-1">Estado Actual</p>
                 <p>Tu balance es <span className={monthlyStats.balance >= 0 ? 'text-emerald-400' : 'text-red-400'}>{formatMoney(monthlyStats.balance)}</span>.</p>
               </div>
               <div className="bg-slate-900 p-4 rounded-xl border-l-4 border-violet-500">
                 <p className="font-bold text-white mb-1">Oportunidad de Mejora</p>
                 <p>{savingTip}</p>
               </div>
               <p>Recomiendo establecer un presupuesto fijo para <strong>{highestCat?.cat || 'tus gastos'}</strong>. Evita gastos hormiga y considera instrumentos de inversión de bajo riesgo.</p>
             </div>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-200 text-slate-800 font-sans selection:bg-slate-300">
      
      {/* Header Alineado */}
      <div className="max-w-md mx-auto px-4 pt-4 pb-0">
        <header className="flex justify-between items-end mb-2 px-1">
          <h1 className="text-lg font-black tracking-tighter text-slate-900 flex items-center gap-1 leading-none mb-1">
            FINANZAS<span className="font-light text-slate-500">2026</span>
          </h1>
          <div className="flex gap-2">
            <button onClick={() => setView('settings')} className="text-slate-500 hover:text-slate-900 p-2 bg-white rounded-full shadow-sm"><Settings className="h-5 w-5" /></button>
            <button onClick={handleLogout} className="text-slate-500 hover:text-red-500 p-2 bg-white rounded-full shadow-sm"><LogOut className="h-5 w-5" /></button>
          </div>
        </header>
      </div>

      <main className="max-w-md mx-auto px-4 pb-24">
        
        {view === 'home' && (
          <div className="animate-in fade-in duration-500 space-y-6">
            
            {/* Formulario */}
            <div className="bg-white rounded-[2rem] p-1 shadow-lg border border-slate-100">
              <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-[1.8rem] mb-4">
                <button onClick={() => setType('expense')} className={`py-3 rounded-[1.5rem] font-black text-sm uppercase tracking-wide transition-all ${type === 'expense' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>GASTOS</button>
                <button onClick={() => setType('income')} className={`py-3 rounded-[1.5rem] font-black text-sm uppercase tracking-wide transition-all ${type === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>INGRESOS</button>
              </div>

              <form onSubmit={handleAddExpense} className="px-5 pb-5 space-y-4">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 font-bold text-xl">$</span>
                  <input type="text" inputMode="numeric" placeholder="0" className="w-full pl-8 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-slate-900 outline-none font-mono text-3xl font-bold text-slate-800 text-center" value={displayAmount} onChange={handleAmountChange} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">CUENTA</label>
                    <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none text-xs font-bold text-slate-700 uppercase" value={account} onChange={(e) => setAccount(e.target.value)}>
                      {ACCOUNTS.map(acc => <option key={acc.id} value={acc.id}>{acc.name.toUpperCase()}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">CATEGORÍA</label>
                    <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none text-xs font-bold text-slate-700" value={category} onChange={(e) => setCategory(e.target.value)}>
                      {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.id}</option>)}
                    </select>
                  </div>
                </div>

                <input type="text" placeholder="Detalle (opcional)" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none text-slate-600 text-sm text-center" value={description} onChange={(e) => setDescription(e.target.value)} />
                <button type="submit" className={`w-full text-white font-black uppercase tracking-wide py-5 rounded-2xl transition-all shadow-md hover:shadow-xl active:scale-[0.98] flex justify-center items-center gap-2 ${type === 'income' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-900 hover:bg-slate-800'}`}>
                  <Save className="h-5 w-5" /> {type === 'income' ? 'AGREGAR INGRESO' : 'GUARDAR GASTO'}
                </button>
              </form>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setView('reports')} className="flex flex-col items-center justify-center p-6 rounded-3xl bg-white shadow-lg border border-slate-100 hover:scale-[1.02] transition-transform active:scale-95 group">
                 <div className="bg-violet-100 p-3 rounded-2xl mb-2 group-hover:bg-violet-200 transition-colors"><LayoutDashboard className="h-6 w-6 text-violet-600" /></div>
                 <span className="font-black text-slate-800 text-sm">HISTORIAL</span>
              </button>
              <button onClick={() => setView('balance')} className="flex flex-col items-center justify-center p-6 rounded-3xl bg-white shadow-lg border border-slate-100 hover:scale-[1.02] transition-transform active:scale-95 group">
                 <div className="bg-emerald-100 p-3 rounded-2xl mb-2 group-hover:bg-emerald-200 transition-colors"><CreditCard className="h-6 w-6 text-emerald-600" /></div>
                 <span className="font-black text-slate-800 text-sm">BALANCE</span>
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-300">
              <div className="bg-slate-900 p-4 rounded-2xl text-white text-center shadow-md"><p className="text-slate-400 text-[10px] font-bold uppercase mb-1">Dólar Compra</p><p className="text-xl font-bold">${dolarBlue.loading ? '..' : dolarBlue.compra}</p></div>
              <div className="bg-slate-900 p-4 rounded-2xl text-white text-center shadow-md"><p className="text-slate-400 text-[10px] font-bold uppercase mb-1">Dólar Venta</p><p className="text-xl font-bold text-emerald-400">${dolarBlue.loading ? '..' : dolarBlue.venta}</p></div>
            </div>
          </div>
        )}

        {view === 'balance' && (
          <div className="animate-in slide-in-from-right duration-300 min-h-[85vh] flex flex-col gap-6">
            <div className="flex items-center justify-between bg-white p-2 rounded-full shadow-sm">
              <button onClick={() => setView('home')} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-bold px-4 py-2 rounded-full"><ChevronLeft className="h-4 w-4" /> Volver</button>
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">CUENTAS</h2>
              <div className="w-8"></div>
            </div>

            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden text-center">
               <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500 blur-[100px] opacity-20 -mr-20 -mt-20"></div>
               <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-500 blur-[100px] opacity-20 -ml-20 -mb-20"></div>
               <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] mb-4 relative z-10">Patrimonio Neto</p>
               <h2 className="text-5xl font-black tracking-tighter mb-2 relative z-10">{formatMoney(totalGlobalBalance)}</h2>
               <p className="text-slate-500 text-sm font-medium relative z-10">Balance en tiempo real</p>
            </div>

            <div className="pb-8">
              <h3 className="text-xs font-bold text-slate-500 uppercase px-4 mb-4">Desglose por Cuenta</h3>
              <div className="grid grid-cols-2 gap-3">
                {ACCOUNTS.map(acc => (
                  <div key={acc.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-28 hover:shadow-md transition-shadow relative overflow-hidden">
                    <div className="flex justify-between items-start">
                       <div className={`p-2 rounded-lg ${acc.color} bg-opacity-20`}>{acc.icon}</div>
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-xs uppercase tracking-tight mb-1">{acc.name}</p>
                      <p className={`text-lg font-black tracking-tight ${accountBalances[acc.id] < 0 ? 'text-red-500' : 'text-slate-900'}`}>{formatMoney(accountBalances[acc.id])}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {view === 'reports' && (
          <div className="animate-in slide-in-from-right duration-300 min-h-[85vh] flex flex-col gap-6">
            <div className="flex items-center justify-between bg-white p-2 rounded-full shadow-sm">
              <button onClick={() => setView('home')} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-bold px-4 py-2 rounded-full"><ChevronLeft className="h-5 w-5" /></button>
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">HISTORIAL</h2>
              <div className="w-8"></div>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-md border border-slate-100 text-center">
              <div className="flex items-center justify-between mb-6">
                <button onClick={() => changeMonth(-1)} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200"><ChevronLeft className="h-5 w-5" /></button>
                <div className="text-center">
                   <p className="text-xs font-bold text-slate-400 uppercase mb-1">Periodo</p>
                   <h3 className="text-4xl font-black text-slate-800 tracking-tight">{formatMonthShort(selectedMonth)}</h3>
                </div>
                <button onClick={() => changeMonth(1)} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200"><ChevronRight className="h-5 w-5" /></button>
              </div>
              <div className="grid grid-cols-3 gap-2 py-6 border-t border-b border-slate-100">
                <div><p className="text-xs text-emerald-600 font-bold uppercase mb-2">Ingresos</p><p className="font-black text-xl text-slate-800 leading-none">{formatMoney(monthlyStats.income)}</p></div>
                <div className="border-l border-slate-100"><p className="text-xs text-red-500 font-bold uppercase mb-2">Gastos</p><p className="font-black text-xl text-slate-800 leading-none">{formatMoney(monthlyStats.expense)}</p></div>
                <div className="border-l border-slate-100"><p className="text-xs text-slate-500 font-bold uppercase mb-2">Balance</p><p className={`font-black text-xl leading-none ${monthlyStats.balance < 0 ? 'text-red-500' : 'text-slate-800'}`}>{formatMoney(monthlyStats.balance)}</p></div>
              </div>
              <button onClick={() => setView('advisor')} className="w-full mt-6 bg-slate-900 text-white py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors">
                <BrainCircuit className="h-5 w-5 text-violet-300" /> Consultar Asesor IA
              </button>
            </div>

            <div className="bg-slate-50 rounded-3xl p-4 shadow-inner border border-slate-100 flex-1">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 px-2 pt-2">Movimientos del Mes</h3>
              <div className="space-y-2">
                {filteredExpenses.length === 0 ? (
                  <div className="text-center py-12 text-slate-400"><p className="text-sm">Sin movimientos.</p></div>
                ) : (
                  filteredExpenses.map((item) => {
                    const isIncome = item.type === 'income';
                    const catInfo = categories.find(c => c.id === item.category) || categories[0];
                    const accInfo = ACCOUNTS.find(a => a.id === item.account) || ACCOUNTS[0];
                    return (
                      <div key={item.id} className="group flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-3 overflow-hidden">
                          {isIncome ? (
                             <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0 bg-emerald-100 text-emerald-600"><TrendingUp className="h-4 w-4" /></div>
                          ) : (
                             <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 border bg-white ${catInfo.color.split(' ').find(c => c.startsWith('border-'))}`}>
                               <span className={`text-[9px] font-black ${catInfo.color.split(' ').find(c => c.startsWith('text-'))} text-center leading-none`}>{item.category.slice(0, 2)}</span>
                             </div>
                          )}
                          <div className="overflow-hidden">
                            <p className="font-bold text-slate-800 text-xs truncate">{isIncome ? 'Ingreso' : item.category}</p>
                            <div className="flex items-center gap-1">
                              <span className={`text-[8px] px-1 py-0.5 rounded font-bold uppercase ${accInfo.color}`}>{accInfo.name.substring(0, 8)}</span>
                              {item.description && <p className="text-[10px] text-slate-400 truncate max-w-[80px]">- {item.description}</p>}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                           <span className={`font-bold text-sm block ${isIncome ? 'text-emerald-600' : 'text-slate-700'}`}>{isIncome ? '+' : '-'}{formatMoney(item.amount)}</span>
                           <button onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }} className="text-[10px] text-slate-300 hover:text-red-500"><Trash2 className="h-3 w-3 ml-auto" /></button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {view === 'settings' && (
          <div className="animate-in slide-in-from-right duration-300 min-h-[85vh] flex flex-col gap-6">
            <div className="flex items-center justify-between bg-white p-2 rounded-full shadow-sm">
              <button onClick={() => setView('home')} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-bold px-4 py-2 rounded-full"><ChevronLeft className="h-4 w-4" /> Volver</button>
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">CATEGORÍAS</h2>
              <div className="w-8"></div>
            </div>
            
            <div className="bg-white rounded-3xl p-6 shadow-lg border border-slate-100">
               <div className="bg-slate-50 p-4 rounded-2xl mb-6 border border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase mb-2">{editingCatId ? 'Editando' : 'Crear Nueva'}</p>
                <div className="flex flex-col gap-3">
                  <input type="text" placeholder="Nombre" className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none text-sm font-bold uppercase" value={editingCatId ? editCatName : newCatName} onChange={e => editingCatId ? setEditCatName(e.target.value) : setNewCatName(e.target.value)} />
                  {!editingCatId && <div className="flex gap-2 overflow-x-auto pb-2">{COLOR_PALETTE.map((c, i) => (<button key={i} onClick={() => setNewCatColor(c)} className={`w-8 h-8 rounded-full shrink-0 border-2 ${c.tw.split(' ')[0]} ${newCatColor.name === c.name ? 'ring-2 ring-offset-2 ring-slate-900 scale-110' : 'border-transparent'}`} />))}</div>}
                  
                  {editingCatId ? (
                    <div className="flex gap-2">
                      <button onClick={saveEditCategory} className="flex-1 bg-slate-900 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 text-sm"><Check className="h-4 w-4" /> Guardar</button>
                      <button onClick={() => {setEditingCatId(null); setEditCatName('');}} className="bg-slate-200 text-slate-600 font-bold py-3 px-4 rounded-xl text-sm"><X className="h-4 w-4" /></button>
                    </div>
                  ) : (
                    <button onClick={handleAddCategory} className="bg-slate-900 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 text-sm"><Plus className="h-4 w-4" /> Agregar</button>
                  )}
                </div>
              </div>
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                {categories.map((cat) => (
                  <div key={cat.id} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl">
                    <div className="flex items-center gap-3"><div className={`w-4 h-4 rounded-full ${cat.color.split(' ')[0]}`}></div><span className="font-bold text-sm text-slate-700">{cat.id}</span></div>
                    <div className="flex gap-1">
                      <button onClick={() => startEditing(cat)} className="text-slate-300 hover:text-blue-500 p-2"><Edit2 className="h-4 w-4" /></button>
                      <button onClick={() => handleDeleteCategory(cat.id)} className="text-slate-300 hover:text-red-500 p-2"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t border-slate-100">
                 <button onClick={handleRestoreDefaults} className="w-full text-slate-400 text-xs font-bold flex items-center justify-center gap-2"><RotateCcw className="h-3 w-3" /> Restaurar originales</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;