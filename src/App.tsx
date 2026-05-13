import { useState, useEffect } from 'react';
import { useWorkoutStore } from './store/useWorkoutStore';
import { useWakeLock } from './hooks/useWakeLock';

export default function App() {
  const { status, sets, currentSetIndex, restTime, startWorkout, completeSet, resetWorkout } = useWorkoutStore();
  useWakeLock(status === 'ACTIVE' || status === 'REST');

  // Logic Đếm ngược cho màn hình nghỉ
  const [timeLeft, setTimeLeft] = useState(restTime);
  useEffect(() => {
    let timer: number;
    if (status === 'REST' && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0 && status === 'REST') {
      useWorkoutStore.setState((s) => ({ status: 'ACTIVE', currentSetIndex: s.currentSetIndex + 1 }));
      setTimeLeft(restTime);
    }
    return () => clearInterval(timer);
  }, [status, timeLeft, restTime]);

  // --- MÀN HÌNH SETUP ---
  if (status === 'SETUP') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6">
        <h1 className="text-3xl font-bold mb-8 text-gray-400">THIẾT LẬP BUỔI TẬP</h1>
        <div className="w-full max-w-sm space-y-4">
          <button
            onClick={() => startWorkout([15, 12, 10], 60)}
            className="w-full py-6 bg-blue-600 rounded-2xl text-xl font-bold active:scale-95 transition"
          >
            Mặc định: 3 Set (15-12-10)
          </button>
          <p className="text-center text-gray-500 italic">Bà có thể tự chế thêm input nhập set sau nha.</p>
        </div>
      </div>
    );
  }

  // --- MÀN HÌNH ACTIVE (Đang tập) ---
  if (status === 'ACTIVE') {
    return (
      <div
        onClick={completeSet}
        className="flex flex-col items-center justify-center min-h-screen bg-black cursor-pointer select-none"
      >
        <p className="text-blue-500 text-2xl font-bold mb-4 uppercase tracking-widest">
          Set {currentSetIndex + 1} / {sets.length}
        </p>
        <h2 className="text-[15rem] font-black leading-none">{sets[currentSetIndex]}</h2>
        <p className="text-gray-500 text-xl mt-10">XONG THÌ CHẠM VÀO MÀN HÌNH</p>
      </div>
    );
  }

  // --- MÀN HÌNH REST (Đang nghỉ) ---
  if (status === 'REST') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-blue-900 transition-colors duration-500">
        <p className="text-2xl font-bold mb-4 uppercase">Nghỉ đi bà...</p>
        <h2 className="text-[12rem] font-mono font-black">{timeLeft}s</h2>
        <button onClick={() => setTimeLeft(0)} className="mt-8 px-8 py-4 bg-white/10 rounded-full">Bỏ qua nghỉ</button>
      </div>
    );
  }

  // --- MÀN HÌNH FINISHED ---
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
      <h2 className="text-6xl font-bold mb-4">XONG RỒI! 🔥</h2>
      <p className="text-gray-400 mb-10">Bà giỏi lắm, đi tắm thôi.</p>
      <button onClick={resetWorkout} className="px-10 py-4 bg-green-600 rounded-xl font-bold">TẬP TIẾP BÀI KHÁC</button>
    </div>
  );
}