import { LocalStorageKeys } from "~/constants";
import { useLocalStorage } from "./use-local-storage";
import { useCallback } from "react";

export function useAnonAuth() {
    const {
        storageValue: username,
        setStorage,
        storageCleanup,
    } = useLocalStorage(LocalStorageKeys.EVENT_NAME);

    const setUsername = useCallback(
        (newUserName: string) => {
            setStorage({ name: newUserName });
        },
        [setStorage],
    );

    const logout = useCallback(() => {
        storageCleanup();
    }, [storageCleanup]);

    return {
        username: username?.name,
        setUsername,
        logout,
    } as const;
}
