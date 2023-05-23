"use client";

import {
    FormEvent,
    useRef,
    useState
} from "react";

import {
    LOCAL_STORAGE_KEY,
    useLocalStorage,
} from "~/hooks/use-local-storage";
import { useIsClient } from "~/hooks/use-is-client";
import Calendar from "~/components/Calendar/Calendar";

type RouteParams = {
    id: string;
}

type ReactProps = {
    params: RouteParams;
}

// export const metadata = {
//     title: 'Schedule event',
//     description: 'Schedule some event',
// };

// https://beta.nextjs.org/docs/data-fetching/generating-static-params
// export async function generateStaticParams() {
//     const monthEvents = await new Promise<RouteParams[]>((resolve) => {
//         resolve([{ id: '1' }]);
//     });

//     return monthEvents.map(({ id }) => id);
// }

export default function EventCalendar({ params }: ReactProps) {
    const isClient = useIsClient();
    const [storageName, setUserStorage] = useLocalStorage(LOCAL_STORAGE_KEY.EVENT_NAME);

    const nameInputRef = useRef<HTMLInputElement>(null);

    const [manualIdentityModal, setManualIdentityModal] = useState(false);

    const renderIdentityModal = (!storageName && isClient) || manualIdentityModal;

    const openIdentityModal = () => {
        setManualIdentityModal(true);
    };

    const closeIdentityModal = () => {
        setManualIdentityModal(false);
    };

    const saveUserName = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const inputValue = nameInputRef.current?.value;
        if (!inputValue) {
            return;
        }

        setUserStorage({ name: inputValue });
        setManualIdentityModal(!inputValue);
    };

    return (
        <div>
            <h1>Event calendar</h1>
            <Calendar />
            <div>
                <p>Yellow - if needed</p>
                <p>Red - no</p>
                <p>Green - tes</p>
            </div>
            <p>{storageName?.name}</p>
            <button type="button" onClick={openIdentityModal}>Change name</button>
            {renderIdentityModal && (
                <form onSubmit={saveUserName}>
                    <p>Add name</p>
                    <input ref={nameInputRef} />
                    <button type="button" onClick={closeIdentityModal}>Cancel</button>
                    <button type="submit">Submit</button>
                </form>
            )}
        </div>
    );
}