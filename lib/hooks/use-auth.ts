import { LocalStorageKeys } from "~/utils/constants";
import { useLocalStorage } from "./use-local-storage";

export function useAuth() {
    const [usernameStorage, setUsernameStorage] = useLocalStorage(
        LocalStorageKeys.EVENT_NAME,
    );

    const setUsername = (newUserName: string) => {
        setUsernameStorage({ name: newUserName });
    };

    return {
        username: usernameStorage?.name,
        setUsername,
    } as const;
}
