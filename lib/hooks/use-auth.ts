import { LocalStorageKeys } from "~/constants";
import { useLocalStorage } from "./use-local-storage";
import { useCallback } from "react";

export function useAuth() {
    const [username, setStorage] = useLocalStorage(LocalStorageKeys.EVENT_NAME);

    const setUsername = useCallback(
        (newUserName: string) => {
            setStorage({ name: newUserName });
        },
        [setStorage],
    );

    return {
        username: username?.name,
        setUsername,
    } as const;
}
