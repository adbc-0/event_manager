import { useEffect, useState } from "react";

import { LocalStorageKeys } from "~/utils/constants";
import { Nullable, Values } from "../../typescript";

type StorageKey = Values<typeof LocalStorageKeys>

type EventUserStore = {
    name: string;
}

type StorageObject<T extends StorageKey> = T extends 'event_user_name'
    ? Nullable<EventUserStore> : never;

function getFromStorage<T extends StorageKey>(storageKey: T) {
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
    const [storageValue, setStorageValue] = useState<Nullable<StorageObject<T>>>(null);

    const changeStorageValue = (newValue: StorageObject<T>) => {
        setStorageValue(newValue);
        window.localStorage.setItem(
            storageKey,
            JSON.stringify(newValue)
        );
    };

    useEffect(() => {
        const parsedValue = getFromStorage(storageKey);
        setStorageValue(parsedValue);
    }, [storageKey]);
  
    return [storageValue, changeStorageValue] as const;
}
