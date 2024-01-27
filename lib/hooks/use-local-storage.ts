import { useCallback, useEffect, useMemo, useState } from "react";

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

class Observable {
    observers: (() => void)[];

    constructor() {
        this.observers = [];
    }

    subscribe(callback: () => void) {
        this.observers.push(callback);
    }

    unsubscribe(callback: () => void) {
        this.observers = this.observers.filter(
            (observer) => observer !== callback,
        );
    }

    notify() {
        this.observers.forEach((observer) => observer());
    }
}

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
    const [observableInstance] = useState(new Observable());
    const [storageValue, setStorageValue] =
        useState<Nullable<StorageObject<T>>>(null);

    const changeStateOnLocalStorageEvent = useCallback(() => {
        const parsedValue = readKeyFromStorage(storageKey);
        observableInstance.notify();
        setStorageValue(parsedValue);
    }, [observableInstance, storageKey]);

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

    const exportedObserver = useMemo(
        () => ({
            subscribe: observableInstance.subscribe.bind(observableInstance),
            unsubscribe:
                observableInstance.unsubscribe.bind(observableInstance),
        }),
        [observableInstance],
    );

    return {
        storageValue,
        observer: exportedObserver,
        setStorage,
        storageCleanup,
    } as const;
}
