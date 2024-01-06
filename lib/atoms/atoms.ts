import { atom } from "jotai";

import {
    getCurrentDate,
    getNextMonthDate,
    getPrevMonthDate,
} from "~/services/dayJsFacade";

function calendarDateAtomCreator() {
    const calendarDateAtom = atom(getCurrentDate());
    const calendarDate = atom((get) => get(calendarDateAtom));
    const incrementMonth = atom(null, (_, set) =>
        set(calendarDateAtom, (date) => getNextMonthDate(date)),
    );
    const decrementMonth = atom(null, (_, set) =>
        set(calendarDateAtom, (date) => getPrevMonthDate(date)),
    );
    return {
        readDateAtom: calendarDate,
        incrementMonthAtom: incrementMonth,
        decrementMonthAtom: decrementMonth,
    } as const;
}

export const calendarDateAtoms = calendarDateAtomCreator();
