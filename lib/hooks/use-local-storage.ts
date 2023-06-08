import { LocalStorageKeys } from "~/utils/constants";
import { Nullable, Values } from "../../typescript";

type StorageKey = Values<typeof LocalStorageKeys>;

type EventUserStore = {
    name: string;
};

type StorageObject<T extends StorageKey> = T extends "event_user_name"
    ? Nullable<EventUserStore>
    : never;

function readKeyFromStorage<T extends StorageKey>(storageKey: T) {
    if (!window) {
        return null;
    }

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
    const getFromStorage = () => readKeyFromStorage(storageKey);

    const setStorage = (newValue: StorageObject<T>) => {
        if (!window) {
            return null;
        }

        window.localStorage.setItem(storageKey, JSON.stringify(newValue));
    };

    return [getFromStorage, setStorage] as const;
}
