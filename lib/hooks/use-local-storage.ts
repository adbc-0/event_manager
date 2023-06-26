import { useCallback, useEffect, useState } from "react";

import { readKeyFromStorage } from "~/services/localStorage";
import { Nullable, StorageKey, StorageObject } from "~/typescript";

const STORAGE_EVENT = "storage"; // https://developer.mozilla.org/en-US/docs/Web/API/Window/storage_event

export function useLocalStorage<T extends StorageKey>(storageKey: T) {
    const [storageValue, setStorageValue] =
        useState<Nullable<StorageObject<T>>>(null);

    const changeStateOnLocalStorageEvent = useCallback(() => {
        const parsedValue = readKeyFromStorage(storageKey);
        setStorageValue(parsedValue);
    }, [storageKey]);

    useEffect(() => {
        changeStateOnLocalStorageEvent();
    }, [changeStateOnLocalStorageEvent]);

    useEffect(() => {
        window.addEventListener(STORAGE_EVENT, changeStateOnLocalStorageEvent);
        return () => {
            window.removeEventListener(
                STORAGE_EVENT,
                changeStateOnLocalStorageEvent,
            );
        };
    }, [changeStateOnLocalStorageEvent]);

    const setStorage = useCallback(
        (newValue: StorageObject<T>) => {
            window.localStorage.setItem(storageKey, JSON.stringify(newValue));
            window.dispatchEvent(new Event(STORAGE_EVENT));
        },
        [storageKey],
    );

    return [storageValue, setStorage] as const;
}
