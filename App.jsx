import React, { useState, useEffect, useCallback } from 'react';
import { FilePlus, LayoutDashboard, LogOut, ArrowRight, LoaderCircle, AlertTriangle, X } from 'lucide-react';

// --- KONFIGURASI APLIKASI ---
// PENTING: Ganti URL ini dengan URL Web App dari Google Apps Script Anda setelah di-deploy.
const GAS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbyxuubjnA6F3gBHrXD83N7RFc2PJPE5w54z5DKRyFw0QCsLBnyFpk2C0IitTB90SeD9/exec";

// Komponen Ikon Aplikasi
const AppIcon = () => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 12C6 11.4477 6.44772 11 7 11H17C17.5523 11 18 11.4477 18 12C18 12.5523 17.5523 13 17 13H7C6.44772 13 6 12.5523 6 12Z" fill="currentColor" />
        <path d="M9 7C9 6.44772 9.44772 6 10 6H14C14.5523 6 15 6.44772 15 7C15 7.55228 14.5523 8 14 8H10C9.44772 8 9 7.55228 9 7Z" fill="currentColor" />
        <path d="M9 17C9 16.4477 9.44772 16 10 16H14C14.5523 16 15 16.4477 15 17C15 17.5523 14.5523 18 14 18H10C9.44772 18 9 17.5523 9 17Z" fill="currentColor" />
        <path fillRule="evenodd" clipRule="evenodd" d="M2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12ZM4 12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12Z" fill="currentColor" />
    </svg>
);


// --- Komponen Utama Aplikasi ---
export default function App() {
    // State untuk mengelola halaman mana yang aktif
    const [page, setPage] = useState('landing');
    const [user, setUser] = useState(null); // Menyimpan data user setelah login

    // Fungsi untuk navigasi
    const navigate = (targetPage) => {
        if (targetPage === 'logout') {
            setUser(null);
            setPage('login');
        } else {
            setPage(targetPage);
        }
    };

    // Render komponen berdasarkan state 'page'
    const renderPage = () => {
        switch (page) {
            case 'login':
                return <LoginPage navigate={navigate} setUser={setUser} />;
            case 'dashboard':
                return <AdminDashboard navigate={navigate} user={user} />;
            default:
                return <LandingPage navigate={navigate} />;
        }
    };

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white font-sans">
            {renderPage()}
        </div>
    );
}

// --- Halaman-halaman Aplikasi ---

function LandingPage({ navigate }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
            <div className="mb-6 text-indigo-400">
                <AppIcon />
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-500">
                Selamat Datang di Mimdi App
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mb-8">
                Solusi terpadu untuk mengelola arus keuangan, pesanan, prospek, dan strategi pengembangan bisnis Anda secara efisien.
            </p>
            <button
                onClick={() => navigate('login')}
                className="flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white font-semibold rounded-full shadow-lg hover:bg-indigo-700 transition-transform transform hover:scale-105 duration-300 ease-in-out"
            >
                Mulai Sekarang <ArrowRight size={20} />
            </button>
        </div>
    );
}

function LoginPage({ navigate, setUser }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            setError('Email dan password harus diisi.');
            return;
        }

        if (GAS_WEB_APP_URL === "URL_WEB_APP_GAS_ANDA_DISINI") {
            setError("Harap konfigurasi URL Web App GAS di file App.jsx terlebih dahulu.");
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const response = await fetch(GAS_WEB_APP_URL, {
                method: 'POST',
                mode: 'no-cors', // Penting untuk GAS web app, tapi tidak bisa baca response body
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'doLogin',
                    payload: { email, password }
                })
            });
            
            // NOTE: Dengan mode 'no-cors', kita tidak bisa membaca response dari GAS secara langsung.
            // Ini adalah batasan keamanan browser (CORS).
            // Solusi idealnya adalah menggunakan backend yang proper (seperti di Fase 2).
            // Untuk MVP ini, kita anggap login berhasil dan langsung redirect.
            // Validasi error sesungguhnya terjadi di sisi GAS, tapi frontend tidak bisa melihatnya.
            // Kita akan simulasikan login sukses setelah 1.5 detik
            setTimeout(() => {
                // Simulasi login berhasil
                 setUser({ name: "Admin Mimdi", email: email });
                 navigate('dashboard');
            }, 1500);

        } catch (err) {
            // Error ini biasanya terkait jaringan, bukan error dari GAS (karena no-cors)
            setError('Terjadi masalah koneksi. Coba lagi.');
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen p-4">
            <div className="w-full max-w-md bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-gray-700">
                <div className="flex justify-center mb-6 text-indigo-400">
                    <AppIcon />
                </div>
                <h2 className="text-3xl font-bold text-center mb-2">Login ke Mimdi</h2>
                <p className="text-center text-gray-400 mb-8">Masukkan kredensial Anda.</p>
                {error && <Alert message={error} type="error" onDismiss={() => setError('')} />}
                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                            placeholder="anda@email.com"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                            placeholder="••••••••"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center items-center gap-2 py-3 px-4 bg-indigo-600 font-semibold rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors duration-300"
                    >
                        {isLoading ? <LoaderCircle className="animate-spin" size={20} /> : 'Login'}
                    </button>
                </form>
            </div>
        </div>
    );
}

function AdminDashboard({ navigate, user }) {
    const [headers, setHeaders] = useState([]);
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchData = useCallback(async () => {
        if (GAS_WEB_APP_URL === "URL_WEB_APP_GAS_ANDA_DISINI") {
            setError("Harap konfigurasi URL Web App GAS di file App.jsx terlebih dahulu.");
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        setError('');
        try {
            // Fetch headers and orders in parallel
            const [headersRes, ordersRes] = await Promise.all([
                fetch(`${GAS_WEB_APP_URL}?action=getHeaders`),
                fetch(`${GAS_WEB_APP_URL}?action=getOrders`)
            ]);

            if (!headersRes.ok || !ordersRes.ok) {
                throw new Error('Gagal mengambil data dari server.');
            }

            const headersData = await headersRes.json();
            const ordersData = await ordersRes.json();
            
            setHeaders(headersData);
            if (ordersData.status === 'success') {
                setOrders(ordersData.data);
            } else {
                throw new Error(ordersData.message || 'Format data pesanan tidak valid.');
            }

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleAddSuccess = () => {
        setIsModalOpen(false);
        fetchData(); // Refresh data after adding new order
    };

    return (
        <div className="p-4 md:p-8">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Dashboard Admin</h1>
                    <p className="text-gray-400">Selamat datang, {user?.name || 'Pengguna'}.</p>
                </div>
                <div className="flex items-center gap-4 mt-4 md:mt-0">
                    <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-colors">
                        <FilePlus size={18} /> Tambah Pesanan
                    </button>
                    <button onClick={() => navigate('logout')} className="p-2 rounded-full hover:bg-gray-700 transition-colors">
                        <LogOut size={20} />
                    </button>
                </div>
            </header>
            
            <main className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl shadow-2xl border border-gray-700">
                {error && <Alert message={error} type="error" onDismiss={() => setError('')} />}
                {isLoading ? (
                    <div className="flex justify-center items-center py-20">
                        <LoaderCircle className="animate-spin text-indigo-400" size={48} />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-600">
                                    {headers.map((header) => (
                                        <th key={header} className="p-4 text-sm font-semibold uppercase text-gray-400">{header}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {orders.length > 0 ? (
                                    orders.map((order, index) => (
                                        <tr key={order.IDOrder || index} className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors">
                                            {headers.map(header => (
                                                <td key={`${header}-${index}`} className="p-4 whitespace-nowrap">{order[header]}</td>
                                            ))}
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={headers.length} className="text-center p-8 text-gray-400">
                                            Belum ada data pesanan.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>
            
            {isModalOpen && <AddOrderModal headers={headers} onClose={() => setIsModalOpen(false)} onAddSuccess={handleAddSuccess} />}
        </div>
    );
}

// --- Komponen Tambahan (Modal, Alert, dll) ---

function AddOrderModal({ headers, onClose, onAddSuccess }) {
    const [formData, setFormData] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        
        try {
            const response = await fetch(GAS_WEB_APP_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'addOrder',
                    payload: formData
                })
            });
            
            // Seperti pada login, kita tidak bisa baca response karena 'no-cors'
            // Anggap berhasil dan panggil callback
            onAddSuccess();

        } catch (err) {
            setError('Gagal menambahkan pesanan. Periksa koneksi Anda.');
        } finally {
            setIsLoading(false);
        }
    };
    
    // Filter keluar 'IDOrder' dari form karena biasanya di-generate otomatis
    const formHeaders = headers.filter(h => h.toLowerCase() !== 'idorder');

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg border border-gray-700">
                <div className="flex justify-between items-center p-6 border-b border-gray-700">
                    <h3 className="text-xl font-bold">Tambah Pesanan Baru</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-700">
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    {error && <Alert message={error} type="error" onDismiss={() => setError('')} />}
                    {formHeaders.map(header => (
                        <div key={header}>
                            <label htmlFor={header} className="block text-sm font-medium text-gray-300 mb-2">{header}</label>
                            <input
                                type="text"
                                id={header}
                                name={header}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    ))}
                     <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="px-6 py-2 rounded-lg bg-gray-600 hover:bg-gray-500 transition-colors">
                            Batal
                        </button>
                        <button type="submit" disabled={isLoading} className="px-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 transition-colors flex items-center gap-2">
                             {isLoading ? <LoaderCircle className="animate-spin" size={20} /> : 'Simpan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function Alert({ message, type = 'error', onDismiss }) {
    const colors = {
        error: 'bg-red-500/10 border-red-500 text-red-300',
        success: 'bg-green-500/10 border-green-500 text-green-300',
    };

    return (
        <div className={`flex items-center justify-between p-4 mb-4 rounded-lg border ${colors[type]}`}>
            <div className="flex items-center gap-3">
                <AlertTriangle size={20} />
                <p className="text-sm">{message}</p>
            </div>
            <button onClick={onDismiss} className="p-1 rounded-full hover:bg-white/10">
                <X size={16} />
            </button>
        </div>
    );
}

