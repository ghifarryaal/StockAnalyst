import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, ScrollText, Lock, Eye, AlertCircle } from 'lucide-react';
import Navbar from '../components/Navbar';

const TermsPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#0f1117] text-gray-300 font-sans selection:bg-blue-500/30">
            <Navbar />
            <div className="max-w-4xl mx-auto px-6 py-12">
                <button
                    onClick={() => navigate(-1)}
                    className="group mb-8 flex items-center gap-2 text-gray-400 hover:text-white transition-all duration-300"
                >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    Kembali
                </button>

                <div className="mb-12">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-blue-600/20 rounded-2xl">
                            <ScrollText className="w-8 h-8 text-blue-400" />
                        </div>
                        <h1 className="text-4xl font-bold text-white tracking-tight">
                            Terms & <span className="text-blue-500">Conditions</span>
                        </h1>
                    </div>
                    <p className="text-gray-400 text-lg">
                        Terakhir diperbarui: 18 Februari 2026
                    </p>
                </div>

                {/* Content */}
                <div className="space-y-8">
                    {/* Section 1 */}
                    <section className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8 backdrop-blur-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <ShieldCheck className="w-6 h-6 text-green-400" />
                            <h2 className="text-xl font-bold text-white">1. Penerimaan Ketentuan</h2>
                        </div>
                        <p className="leading-relaxed">
                            Dengan mengakses dan menggunakan platform StockAnalyst, Anda setuju untuk terikat oleh Ketentuan Layanan ini. Jika Anda tidak menyetujui bagian mana pun dari ketentuan ini, Anda tidak diperbolehkan menggunakan layanan kami.
                        </p>
                    </section>

                    {/* Section 2 */}
                    <section className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8 backdrop-blur-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <Lock className="w-6 h-6 text-blue-400" />
                            <h2 className="text-xl font-bold text-white">2. Akun Educator</h2>
                        </div>
                        <p className="leading-relaxed mb-4">
                            Sebagai Educator, Anda bertanggung jawab untuk:
                        </p>
                        <ul className="space-y-3 list-none">
                            <li className="flex items-start gap-3">
                                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                                <span>Menyediakan informasi sertifikasi yang valid dan akurat.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                                <span>Menjaga kerahasiaan kredensial login dan kode OTP Anda.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                                <span>Memberikan analisis yang independen dan berbasis data.</span>
                            </li>
                        </ul>
                    </section>

                    {/* Section 3 */}
                    <section className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8 backdrop-blur-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <AlertCircle className="w-6 h-6 text-yellow-400" />
                            <h2 className="text-xl font-bold text-white">3. Kode Etik & Larangan</h2>
                        </div>
                        <p className="leading-relaxed mb-4 text-gray-400">
                            Larangan keras bagi seluruh Educator:
                        </p>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-2xl">
                                <p className="text-sm">❌ Melakukan "Pom-Pom" atau manipulasi harga saham.</p>
                            </div>
                            <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-2xl">
                                <p className="text-sm">❌ Menyebarkan informasi palsu atau menyesatkan.</p>
                            </div>
                            <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-2xl">
                                <p className="text-sm">❌ Menjanjikan keuntungan pasti (Guaranteed Return).</p>
                            </div>
                            <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-2xl">
                                <p className="text-sm">❌ Menggunakan kata-kata kasar atau tidak pantas.</p>
                            </div>
                        </div>
                    </section>

                    {/* Section 4 */}
                    <section className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8 backdrop-blur-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <Eye className="w-6 h-6 text-purple-400" />
                            <h2 className="text-xl font-bold text-white">4. Batasan Tanggung Jawab</h2>
                        </div>
                        <p className="leading-relaxed italic text-gray-400">
                            StockAnalyst adalah platform edukasi. Seluruh analisis yang dibagikan oleh Educator bersifat edukatif dan bukan merupakan perintah jual atau beli. Keputusan investasi sepenuhnya ada di tangan pengguna (Disclaimer On).
                        </p>
                    </section>
                </div>

                {/* Footer */}
                <div className="mt-16 pt-8 border-t border-slate-800 text-center">
                    <p className="text-gray-500 text-sm">
                        &copy; 2026 StockAnalyst. Semua Hak Dilindungi.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default TermsPage;
