import { useEffect, useState } from "react";

export function useAbort() {
    const [abortController, setAbortController] = useState(
        new AbortController(),
    );

    useEffect(() => {
        setAbortController(new AbortController());
        return () => {
            abortController.abort();
        };
    }, []);

    return abortController.signal;
}
