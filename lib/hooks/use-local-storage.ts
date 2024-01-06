import { useCallback, useEffect, useState } from "react";

import { LocalStorageKeys } from "~/constants";
import { Nullable, Values } from "~/typescript";

type EventUserStore = Record<
    string,
    {
        id: number;
        username: string;
    }
>;

export type StorageKey = Values<typeof LocalStorageKeys>;
export type StorageObject<T extends StorageKey> = T extends "event_user_name"
    ? Nullable<EventUserStore>
    : never;

const STORAGE_EVENT = "storage"; // https://developer.mozilla.org/en-US/docs/Web/API/Window/storage_event

export function readKeyFromStorage<T extends StorageKey>(storageKey: T) {
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

    const storageCleanup = useCallback(() => {
        window.localStorage.removeItem(storageKey);
        window.dispatchEvent(new Event(STORAGE_EVENT));
    }, [storageKey]);

    return {
        storageValue,
        setStorage,
        storageCleanup,
    } as const;
}
