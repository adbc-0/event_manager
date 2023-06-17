import { useCallback, useEffect, useState } from "react";

import { LocalStorageKeys } from "~/utils/constants";
import { Nullable, Values } from "~/typescript";

type StorageKey = Values<typeof LocalStorageKeys>;

type EventUserStore = {
    name: string;
};

type StorageObject<T extends StorageKey> = T extends "event_user_name"
    ? Nullable<EventUserStore>
    : never;

function readKeyFromStorage<T extends StorageKey>(storageKey: T) {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) {
        return null;
    }

    try {
        return JSON.parse(raw) as StorageObject<T>;
    } catch (exception) {
        window.localStorage.removeItem(storageKey);
        throw exception;
    }
}

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
