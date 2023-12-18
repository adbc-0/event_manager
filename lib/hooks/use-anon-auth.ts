import { useCallback } from "react";

import { useLocalStorage } from "./use-local-storage";
import { LocalStorageKeys } from "~/constants";
import { EventUser } from "~/app/api/events/[eventId]/users/route";

export function useAnonAuth() {
    const {
        storageValue: user,
        setStorage,
        storageCleanup,
    } = useLocalStorage(LocalStorageKeys.EVENT_NAME);

    const setUserId = useCallback(
        (newUser: EventUser) => {
            setStorage(newUser);
        },
        [setStorage],
    );

    const logout = useCallback(() => {
        storageCleanup();
    }, [storageCleanup]);

    return {
        userId: user?.id,
        username: user?.username,
        setUsername: setUserId,
        logout,
    } as const;
}
