"use client";

import {
    FormEvent,
    useEffect,
    useRef,
    useState
} from "react";

import {
    LOCAL_STORAGE_KEY,
    useLocalStorage,
} from "~/hooks/use-local-storage";
import { useIsClient } from "~/hooks/use-is-client";
import Calendar from "~/components/Calendar/Calendar";
import { UsersAvailability } from "../../../../typescript";

type RouteParams = {
    id: string;
}

type ReactProps = {
    params: RouteParams;
}

// you cannot use metadata with client component
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


function fetchEventCalendar(eventId: string): Promise<UsersAvailability> {
    console.log('fetching for event:', eventId);
    // Add choices
    return Promise.resolve({ users: {
            orzel: { available: [1], notAvailable: [2], maybeAvailable: [3] },
            bidon: { available: [1], notAvailable: [3], maybeAvailable: [] }
        },
    });
}

export default function EventCalendar({ params }: ReactProps) {
    const { id: eventId } = params;

    const isClient = useIsClient();
    const [storageName, setUserStorage] = useLocalStorage(LOCAL_STORAGE_KEY.EVENT_NAME);

    const nameInputRef = useRef<HTMLInputElement>(null);

    const [calendarAvailability, setCalendarAvailability] = useState<UsersAvailability | null>(null);
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

    useEffect(() => {
        // ToDo: Abort controller
        // ToDo: Error handling
        async function initEventCalendar() {
            const response = await fetchEventCalendar(eventId);
            setCalendarAvailability(response); 
        }

        initEventCalendar();
    }, []);

    if (!calendarAvailability) {
        return null;
    }

    return (
        <div>
            <h1>Event calendar</h1>
            <div className="flex">
                <h2>Welcome {storageName?.name}</h2>
                <button type="button" onClick={openIdentityModal}>Change name</button>
            </div>
            {/* <Legend /> */}
            <div>
                <p>Yellow - if needed</p>
                <p>Red - no</p>
                <p>Green - tes</p>
            </div>
            <Calendar availability={calendarAvailability} />
            {/* <UsernameForm /> */}
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