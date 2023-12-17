import { ChangeEvent, useState } from "react";
import { Button } from "~/components/Button/Button";
import { Input } from "~/components/Input/Input";

import { AvailabilityEnum, AvailabilityEnumValues } from "~/constants";

type Rule = {
    name: string;
    freq: string;
    interval: number;
    byDay: string[];
    availability: AvailabilityEnumValues;
};

const defaultRule: Rule = {
    name: "",
    byDay: [],
    freq: "WEEKLY",
    interval: 1,
    availability: AvailabilityEnum.AVAILABLE,
};

// https://www.kanzaki.com/docs/ical/rrule.html
export function NewCyclicEvent() {
    const [rule, setRule] = useState<Rule>(defaultRule);

    const changeName = (e: ChangeEvent<HTMLInputElement>) => {
        setRule((prev) => ({ ...prev, name: e.target.value }));
    };
    const changeInterval = (e: ChangeEvent<HTMLSelectElement>) => {
        const interval = Number.parseInt(e.target.value);
        setRule((prev) => ({ ...prev, interval }));
    };
    const changeAvailability = (e: ChangeEvent<HTMLSelectElement>) => {
        const availability = e.target.value as AvailabilityEnumValues;
        setRule((prev) => ({ ...prev, availability }));
    };
    const toggleDay = (day: string) => {
        const isSelected = rule.byDay.some(
            (selectedDay) => selectedDay === day,
        );
        if (isSelected) {
            const filteredDays = rule.byDay.filter(
                (selectedDays) => selectedDays !== day,
            );
            setRule((prev) => ({ ...prev, byDay: filteredDays }));
            return;
        }

        setRule((prev) => ({ ...prev, byDay: [...prev.byDay, day] }));
    };

    return (
        <div className="border border-zinc-800">
            <div>
                <span>I want to make a cyclic event named:</span>
                <Input value={rule.name} onChange={changeName} />
            </div>
            <div>
                <span>Every</span>
                <select defaultValue={rule.interval} onChange={changeInterval}>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                    <option value="6">6</option>
                </select>
                <span>week I will be</span>
                <select
                    defaultValue={rule.availability}
                    onChange={changeAvailability}
                >
                    <option value={AvailabilityEnum.AVAILABLE}>
                        available
                    </option>
                    <option value={AvailabilityEnum.UNAVAILABLE}>
                        unavailable
                    </option>
                    <option value={AvailabilityEnum.MAYBE_AVAILABLE}>
                        maybe available
                    </option>
                </select>
                <span>for following days in a week:</span>
                <div>
                    <button type="button" onClick={() => toggleDay("MO")}>
                        MO
                    </button>
                    <button type="button" onClick={() => toggleDay("TU")}>
                        TU
                    </button>
                    <button type="button" onClick={() => toggleDay("WE")}>
                        WE
                    </button>
                    <button type="button" onClick={() => toggleDay("TH")}>
                        TH
                    </button>
                    <button type="button" onClick={() => toggleDay("FR")}>
                        FR
                    </button>
                    <button type="button" onClick={() => toggleDay("SU")}>
                        SU
                    </button>
                    <button type="button" onClick={() => toggleDay("SA")}>
                        SA
                    </button>
                </div>
            </div>
            <Button theme="BASIC" onClick={() => {}}>Submit</Button>
        </div>
    );
}
