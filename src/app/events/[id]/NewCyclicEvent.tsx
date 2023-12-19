import { useParams } from "next/navigation";
import { ChangeEvent, FormEvent, useState } from "react";
import Image from "next/image";

import acceptIcon from "~/public/acceptButton.svg";

import {
    AvailabilityEnum,
    AvailabilityEnumValues,
    FreqEnum,
} from "~/constants";
import { ServerError } from "~/utils/index";
import { useAnonAuth } from "~/hooks/use-anon-auth";
import { Button } from "~/components/Button/Button";
import { Input } from "~/components/Input/Input";
import { ErrorMessage, RRule, ReactProps } from "~/typescript";

// ToDo: Modal name should be on the same line as close button
// ToDo: Fix dialog
// ToDo: Add validation on backend for rule
// ToDo: Calendar event should have all users listed
// ToDo: Restyle dialogs. Cut the transparency effect?

type Rule = RRule & {
    name: string;
    availability: AvailabilityEnumValues;
    startDate: Date;
};

type NewCyclicEventProps = ReactProps & {
    closeDialog: () => void;
};

const defaultRule: Rule = {
    name: "",
    byDay: [],
    freq: FreqEnum.WEEKLY,
    interval: 1,
    availability: AvailabilityEnum.AVAILABLE,
    startDate: new Date(),
} as const;

const daysInWeek = ["MO", "TU", "WE", "TH", "FR", "SU", "SA"];

function addToRule(ruleString: string) {
    return function (key: string, value: string) {
        if (!value) {
            return ruleString;
        }

        return ruleString.concat(key).concat("=").concat(value);
    };
}

function createRule(rule: Rule) {
    const s1 = addToRule(";")("FREQ", rule.freq);
    const s2 = addToRule(s1)("INTERVAL", rule.interval.toString());
    const s3 = addToRule(s2)("BYDAY", rule.byDay.join(","));
    return s3;
}

function isDaySelected(days: string[], searchedDay: string) {
    return days.some((day) => day === searchedDay);
}

// https://www.kanzaki.com/docs/ical/rrule.html
export function NewCyclicEvent({ closeDialog }: NewCyclicEventProps) {
    const { id: eventId } = useParams();
    const { userId } = useAnonAuth();

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

    const submitRule = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const rulePayload = {
            name: rule.name,
            availabilityChoice: rule.availability,
            rule: createRule(rule),
            startDate: rule.startDate,
            userId,
        };
        const response = await fetch(`/api/events/${eventId}/rules`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(rulePayload),
        });
        if (!response.ok) {
            const error = (await response.json()) as ErrorMessage;
            if (!error.message) {
                throw new ServerError(
                    "error unhandled by server",
                    response.status,
                );
            }
            throw new ServerError(error.message, response.status);
        }
        closeDialog();
    };

    return (
        <div className="border border-zinc-800 flex justify-center p-2 text-center">
            <form onSubmit={submitRule}>
                <div className="py-2">
                    <label htmlFor="event-name">
                        I want to make a cyclic event called:
                    </label>
                    <Input
                        id="event-name"
                        required
                        name="name"
                        minLength={1}
                        className="min-w-[80%] mx-auto p-1 mt-2 text-secondary text-center"
                        value={rule.name}
                        onChange={changeName}
                    />
                </div>
                <div className="py-2">
                    <span>Every</span>
                    <select
                        className="m-2 p-1"
                        defaultValue={rule.interval}
                        onChange={changeInterval}
                    >
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                        <option value="6">6</option>
                    </select>
                    <span>week{rule.interval > 1 ? "s" : ""} I will be</span>
                    <select
                        className="m-2 p-1"
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
                </div>
                <div className="flex justify-center gap-2 flex-wrap p-2 py-4">
                    {daysInWeek.map((day) => (
                        <Button
                            theme="BASIC"
                            key={day}
                            type="button"
                            className={`py-3 px-4 max-w-[4rem] ${
                                isDaySelected(rule.byDay, day)
                                    ? "bg-secondary text-black"
                                    : ""
                            }`}
                            onClick={() => toggleDay(day)}
                        >
                            {day}
                        </Button>
                    ))}
                </div>
                <div className="w-full border-b border-zinc-800" />
                <Button
                    aria-label="submit new rule"
                    type="submit"
                    theme="SAVE"
                    className="p-2 m-2 min-w-[50%] mx-auto"
                >
                    <Image
                        src={acceptIcon}
                        className="m-auto"
                        width={24}
                        height={24}
                        alt="submit icon"
                    />
                </Button>
            </form>
        </div>
    );
}
