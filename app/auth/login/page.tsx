'use strict';
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const showToast = (message: string, type: 'success' | 'error') => {
        const toast = document.createElement('div');
        toast.className = `fixed top-5 right-5 z-50 ${type === 'success' ? 'bg-green-600' : 'bg-red-600'} text-black px-6 py-3 rounded-xl shadow-lg font-bold text-xs md:text-sm flex items-center gap-2 transition-all`;
        toast.innerText = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                showToast(data.message || 'Login failed. Make sure you enter the correct credentials', 'error');
                setLoading(false);
                return;
            }

            const { username: user } = data.data;
            localStorage.setItem('user', JSON.stringify({ username: user }));
            window.dispatchEvent(new Event('auth-change'));
            showToast('Successfully logged in!', 'success');
            setLoading(false);
            router.replace('/');
        } catch (err) {
            showToast('There\'s an error in the server.', 'error');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-lighter_black flex flex-col justify-between font-sans text-[#1E293B]">
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <img
                    src="/background.png"
                    alt="Background"
                    className="w-full h-full object-cover filter blur-md scale-105 brightness-50"
                />
                <div className="absolute inset-0 bg-lighter_black/40"></div>
            </div>

            <main className="relative z-10 flex-grow flex items-center justify-center p-4 md:p-6">
                <div className="max-w-md w-full bg-black rounded-xl p-6 md:p-8 shadow-2xl flex flex-col justify-between">
                    <div>
                        <div className="text-center space-y-1 mb-6">
                            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-purple">Score Battle</h1>
                        </div>

                        <div className="flex mb-6">
                            <div className="flex-1 pb-3 text-center text-xs md:text-sm font-bold border-b-2 border-purple text-purple">
                                Login
                            </div>
                            <Link href="/auth/register" className="flex-1 pb-3 text-center text-xs md:text-sm font-medium text-gray-400 hover:text-purple transition-colors">
                                Register
                            </Link>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="block text-[10px] md:text-xs font-bold text-gray-400">
                                    Username
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Enter username"
                                    className="w-full placeholder:text-gray-600 text-gray-400  bg-black rounded-xl px-4 py-2.5 border border-purple text-xs md:text-sm focus:ring-2 focus:ring-purple focus:border-purple outline-none transition-all"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-[10px] md:text-xs font-bold text-gray-400">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="..."
                                    className="w-full placeholder:text-gray-600 text-gray-400 bg-black rounded-xl px-4 py-2.5 border border-purple text-xs md:text-sm focus:ring-2 focus:ring-purple focus:border-purple outline-none transition-all"
                                />
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-purple text-black py-3 rounded-xl font-bold text-xs md:text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                                >
                                    {loading ? 'loading...' : 'Log In'}
                                </button>
                            </div>
                        </form>
                    </div>

                </div>
            </main>
        </div>
    );
}