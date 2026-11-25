
'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import useSession from "@/hooks/useSession";

export default function Home() {
  const { user, isLoading, error } = useSession();
  const [score, setScore] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  if (!user) return null;

  const showToast = (message: string, type: 'success' | 'error') => {
    const toast = document.createElement('div');
    toast.className = `fixed top-5 right-5 z-50 ${type === 'success' ? 'bg-green-600' : 'bg-red-600'
      } text-black px-6 py-3 rounded-xl shadow-lg font-bold text-xs md:text-sm`;

    toast.innerText = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  const handleSet = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/score', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score }),
      });

      if (!res.ok) {
        throw new Error('Failed to update score');
      }

      showToast('Score updated successfully!', 'success');
      window.location.reload();

    } catch (err) {
      showToast("There's an error in the server.", 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      localStorage.removeItem('user');
      localStorage.removeItem('token');

      router.replace('/auth/login');
      router.refresh();
    } catch (err) {
      showToast("There's an error in the server.", 'error');
    }
  }

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 dark:bg-lighter_black">
      <div className="flex flex-col gap-1 bg-black rounded-xl md:w-auto p-8">
        <h1 className="text-2xl">
          hi! {user?.username}
        </h1>

        <h1 className="text-2xl">
          Your score: <span className="text-purple font-bold">
            {user?.score}
          </span>
        </h1>

        <button
          onClick={() => { router.push('/leaderboard') }}
          className="h-full w-50 text-black bg-pink_custom px-2 rounded-sm"
        >
          Leaderboard
        </button>

        <h1 className="mt-10 text-2xl">
          Set your score
        </h1>

        <form onSubmit={handleSet} className="flex flex-row gap-3 h-7">
          <input
            type="number"
            value={score}
            onChange={(e) => setScore(Number(e.target.value))}
            className="w-20 pl-1.25 rounded-sm h-full bg-black border-2 border-purple"
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="h-full text-black bg-purple px-2 rounded-sm disabled:opacity-50"
          >
            {isSubmitting ? '...' : 'set'}
          </button>
        </form>

        <button
          onClick={handleLogout}
          className="mt-10 h-full w-20 text-white bg-red-800 px-2 rounded-sm"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
