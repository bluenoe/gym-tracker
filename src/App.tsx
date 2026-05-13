import { useState, useEffect, useRef } from 'react';
import { useWorkoutStore } from './store/useWorkoutStore';
import { useWakeLock } from './hooks/useWakeLock';

// --- HELPER: Play beep sound ---
const playBeep = (audioRef: React.RefObject<HTMLAudioElement | null>) => {
  const audio = audioRef.current;
  if (!audio) return;
  audio.currentTime = 0;
  audio.play().catch(() => {
    // Silently ignore autoplay restrictions
  });
};

// --- HELPER: Format seconds as m:ss ---
const formatTime = (totalSeconds: number): string => {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export default function App() {
  const { status, sets, currentSetIndex, restTime, startWorkout, completeSet, resetWorkout } = useWorkoutStore();
  useWakeLock(status === 'ACTIVE' || status === 'REST');

  // --- PERSISTENT AUDIO REF (avoid recreating on every tick) ---
  const beepRef = useRef<HTMLAudioElement | null>(null);
  if (!beepRef.current) {
    beepRef.current = new Audio('/beep.mp3');
    beepRef.current.preload = 'auto';
  }

  // --- LOCAL STATE CHO SETUP FORM ---
  const [draftSets, setDraftSets] = useState<number[]>([15, 12, 10]);
  const [draftRest, setDraftRest] = useState<number>(60);

  const updateSetDraft = (index: number, value: number) => {
    const newSets = [...draftSets];
    newSets[index] = value || 0;
    setDraftSets(newSets);
  };

  const addSet = () => setDraftSets([...draftSets, 10]);
  const removeSet = () => setDraftSets(draftSets.slice(0, -1));

  // --- LOGIC COUNTDOWN CHO REST ---
  const [timeLeft, setTimeLeft] = useState(restTime);
  useEffect(() => {
    if (status !== 'REST') return;

    if (timeLeft === 0) {
      playBeep(beepRef);
      useWorkoutStore.setState((s) => ({
        status: 'ACTIVE',
        currentSetIndex: s.currentSetIndex + 1,
      }));
      setTimeLeft(restTime);
      return;
    }

    // Play beep at 3, 2, 1
    if (timeLeft <= 3) {
      playBeep(beepRef);
    }

    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [status, timeLeft, restTime]);

  // --- REP TIMER (ascending counter for ACTIVE state) ---
  const [repSeconds, setRepSeconds] = useState(0);
  useEffect(() => {
    if (status !== 'ACTIVE') return;
    setRepSeconds(0);
    const timer = setInterval(() => setRepSeconds((prev) => prev + 1), 1000);
    return () => clearInterval(timer);
  }, [status, currentSetIndex]);

  // --- MÀN HÌNH SETUP (Minimalist & Customizable) ---
  if (status === 'SETUP') {
    return (
      <div className="flex flex-col min-h-screen bg-black text-white p-8">
        <h1 className="text-sm tracking-[0.3em] text-gray-500 uppercase mb-12">Workout Configuration</h1>

        <div className="space-y-8 flex-1">
          {/* Tùy chỉnh Sets */}
          <div>
            <div className="flex justify-between items-end mb-4">
              <h2 className="text-xl font-light tracking-wide">SETS & REPS</h2>
              <div className="flex gap-4">
                <button onClick={removeSet} disabled={draftSets.length <= 1} className="text-gray-500 disabled:opacity-20 text-2xl font-light">-</button>
                <button onClick={addSet} className="text-white text-2xl font-light">+</button>
              </div>
            </div>

            <div className="space-y-2">
              {draftSets.map((rep, index) => (
                <div key={index} className="flex justify-between items-center border-b border-gray-800 pb-2">
                  <span className="text-gray-400 font-mono text-sm">SET {index + 1}</span>
                  <input
                    type="number"
                    value={rep}
                    onChange={(e) => updateSetDraft(index, parseInt(e.target.value))}
                    className="bg-transparent text-right text-2xl font-light focus:outline-none w-20"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Tùy chỉnh Rest Time */}
          <div className="pt-6">
            <div className="flex justify-between items-center border-b border-gray-800 pb-2">
              <h2 className="text-xl font-light tracking-wide">REST (SEC)</h2>
              <input
                type="number"
                value={draftRest}
                onChange={(e) => setDraftRest(parseInt(e.target.value) || 0)}
                className="bg-transparent text-right text-2xl font-light focus:outline-none w-20"
              />
            </div>
          </div>
        </div>

        <button
          onClick={() => startWorkout(draftSets, draftRest)}
          className="w-full py-5 mt-8 bg-white text-black text-sm tracking-[0.2em] uppercase font-bold active:scale-95 transition-transform"
        >
          Begin
        </button>
      </div>
    );
  }

  // --- MÀN HÌNH ACTIVE (Đang tập - Minimalist) ---
  if (status === 'ACTIVE') {
    return (
      <div
        onClick={completeSet}
        className="flex flex-col items-center justify-center min-h-screen bg-black text-white cursor-pointer select-none"
      >
        <p className="text-gray-500 text-sm tracking-[0.3em] absolute top-12 left-1/2 -translate-x-1/2 uppercase">
          Set {currentSetIndex + 1} / {sets.length}
        </p>
        <p className="text-gray-600 text-sm font-mono absolute top-12 right-8">
          {formatTime(repSeconds)}
        </p>
        <h2 className="text-[12rem] font-light tracking-tighter leading-none">{sets[currentSetIndex]}</h2>
        <p className="text-gray-700 text-xs tracking-[0.2em] absolute bottom-12 uppercase">Tap to complete</p>
      </div>
    );
  }

  // --- MÀN HÌNH REST (Đang nghỉ - Minimalist) ---
  if (status === 'REST') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white transition-colors duration-700 select-none">
        <p className="text-gray-500 text-sm tracking-[0.3em] absolute top-12 uppercase">Resting</p>
        <h2 className="text-[10rem] font-light font-mono leading-none">{timeLeft}</h2>
        <button
          onClick={() => setTimeLeft(0)}
          className="absolute bottom-12 text-gray-500 text-xs tracking-[0.2em] uppercase border-b border-gray-700 pb-1"
        >
          Skip Rest
        </button>
      </div>
    );
  }

  // --- MÀN HÌNH FINISHED ---
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white text-center">
      <h2 className="text-4xl font-light tracking-widest mb-2 uppercase">Complete</h2>
      <p className="text-gray-500 text-sm tracking-[0.1em] mb-12">Session recorded.</p>
      <button
        onClick={resetWorkout}
        className="px-8 py-4 border border-white text-sm tracking-[0.2em] uppercase hover:bg-white hover:text-black transition-colors"
      >
        New Session
      </button>
    </div>
  );
}