import { LocalStorageKeys } from "~/constants";
import { useLocalStorage } from "./use-local-storage";
import { useCallback } from "react";

export function useAnonAuth() {
    const {
        storageValue: username,
        setStorage,
        storageCleanup,
    } = useLocalStorage(LocalStorageKeys.EVENT_NAME);

    const setUserId = useCallback(
        (newUserId: number) => {
            setStorage({ id: newUserId });
        },
        [setStorage],
    );

    const logout = useCallback(() => {
        storageCleanup();
    }, [storageCleanup]);

    return {
        userId: username?.id,
        setUsername: setUserId,
        logout,
    } as const;
}
