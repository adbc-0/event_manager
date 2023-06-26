import { StorageKey, StorageObject } from "~/typescript";

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
