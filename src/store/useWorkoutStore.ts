import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type WorkoutStatus = 'SETUP' | 'ACTIVE' | 'REST' | 'FINISHED';

interface WorkoutState {
    sets: number[]; // Ví dụ: [15, 12, 10]
    currentSetIndex: number;
    status: WorkoutStatus;
    restTime: number; // giây

    // Actions
    startWorkout: (sets: number[], rest: number) => void;
    completeSet: () => void;
    resetWorkout: () => void;
}

export const useWorkoutStore = create<WorkoutState>()(
    persist(
        (set) => ({
            sets: [],
            currentSetIndex: 0,
            status: 'SETUP',
            restTime: 60,

            startWorkout: (sets, rest) => set({
                sets,
                restTime: rest,
                currentSetIndex: 0,
                status: 'ACTIVE'
            }),

            completeSet: () => set((state) => {
                const isLastSet = state.currentSetIndex === state.sets.length - 1;
                return {
                    status: isLastSet ? 'FINISHED' : 'REST',
                };
            }),

            resetWorkout: () => set({ status: 'SETUP', currentSetIndex: 0 }),
        }),
        { name: 'gym-storage' }
    )
);