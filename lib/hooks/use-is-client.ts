import {
    useEffect,
    useState,
} from "react";

// ToDo: Remove as currently unused
export function useIsClient() {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    return isClient;
}
