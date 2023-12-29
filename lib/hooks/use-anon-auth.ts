import { useCallback } from "react";

import { useLocalStorage } from "./use-local-storage";
import { LocalStorageKeys } from "~/constants";
import { EventUser } from "~/app/api/events/[eventId]/users/route";

export function useAnonAuth(eventId: string) {
    const { storageValue: loggedEvents, setStorage } = useLocalStorage(
        LocalStorageKeys.EVENT_NAME,
    );

    const setUserId = useCallback(
        (newUser: EventUser) => {
            const storageCopy = structuredClone(loggedEvents ?? {});
            storageCopy[eventId] = newUser;
            setStorage(storageCopy);
        },
        [eventId, loggedEvents, setStorage],
    );

    const logout = useCallback(() => {
        const storageCopy = structuredClone(loggedEvents ?? {});
        delete storageCopy[eventId];
        setStorage(storageCopy);
    }, [eventId, loggedEvents, setStorage]);

    return {
        userId: loggedEvents?.[eventId]?.id,
        username: loggedEvents?.[eventId]?.username,
        setUsername: setUserId,
        logout,
    } as const;
}
