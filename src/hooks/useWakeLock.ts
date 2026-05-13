import { useEffect, useRef } from 'react';

export const useWakeLock = (isActive: boolean) => {
    const wakeLock = useRef<WakeLockSentinel | null>(null);

    useEffect(() => {
        const requestWakeLock = async () => {
            if ('wakeLock' in navigator && isActive) {
                try {
                    wakeLock.current = await navigator.wakeLock.request('screen');
                } catch (err) {
                    console.error(`${err}: Không thể giữ màn hình sáng.`);
                }
            }
        };

        requestWakeLock();

        return () => {
            wakeLock.current?.release();
            wakeLock.current = null;
        };
    }, [isActive]);
};