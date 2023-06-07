import { LocalStorageKeys } from "~/utils/constants";
import { useLocalStorage } from "./use-local-storage";

export function useAuth() {
    const [getUsername, setUsernameInStorage] = useLocalStorage(
        LocalStorageKeys.EVENT_NAME,
    );

    const setUsername = (newUserName: string) => {
        setUsernameInStorage({ name: newUserName });
    };

    return {
        getUsername,
        setUsername,
    } as const;
}
