import { useEffect, useRef } from "react";

export function useAbort() {
    const abortController = useRef(new AbortController());

    useEffect(() => {
        abortController.current = new AbortController();
        return () => {
            abortController.current.abort();
        };
    }, []);

    return abortController.current.signal;
}
