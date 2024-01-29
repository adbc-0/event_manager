import { useParams } from "next/navigation";
import { ChangeEvent, FormEvent, useState } from "react";
import Image from "next/image";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAtom } from "jotai";

import acceptIcon from "~/public/acceptButton.svg";

import { AvailabilityEnum, FreqEnum } from "~/constants";
import { calendarDateAtoms } from "~/atoms";
import { rulesKeys } from "~/queries/useRulesQuery";
import { calendarKeys } from "~/queries/useEventQuery";
import { useAnonAuth } from "~/hooks/use-anon-auth";
import { useDialogContext } from "~/components/Dialog/Dialog";
import { Button } from "~/components/Button/Button";
import { Input } from "~/components/Input/Input";
import { LoadingButton } from "~/components/Button/LoadingButton";
import { EventRouteParams, RRule, AvailabilityEnumValues } from "~/typescript";

type Rule = RRule & {
    name: string;
    availability: AvailabilityEnumValues;
    startDate: Date;
};
type RulePayload = {
    name: string;
    availabilityChoice: AvailabilityEnumValues;
    rule: string;
    startDate: Date;
    userId: number | undefined;
};
type CreateRuleArgs = {
    eventId: string;
    rulePayload: RulePayload;
};

const nilRule: Rule = {
    name: "",
    byDay: [],
    freq: FreqEnum.WEEKLY,
    interval: 1,
    availability: AvailabilityEnum.AVAILABLE,
    startDate: new Date(),
} as const;

const daysInWeek = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"];

function addToRule(ruleString: string) {
    return function (key: string, value: string) {
        if (!value) {
            return ruleString;
        }
        const newRule = key.concat("=").concat(value);
        if (!ruleString) {
            return ruleString.concat(newRule);
        }
        return ruleString.concat(";").concat(newRule);
    };
}

function createRule(rule: Rule) {
    const s0 = "";
    const s1 = addToRule(s0)("FREQ", rule.freq);
    const s2 = addToRule(s1)("INTERVAL", rule.interval.toString());
    return addToRule(s2)("BYDAY", rule.byDay.join(","));
}

function isDaySelected(days: string[], searchedDay: string) {
    return days.some((day) => day === searchedDay);
}

function POST_RULE({ eventId, rulePayload }: CreateRuleArgs) {
    return fetch(`/api/events/${eventId}/rules`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(rulePayload),
    });
}

// https://www.kanzaki.com/docs/ical/rrule.html
export function NewCyclicEvent() {
    const { id: eventId } = useParams<EventRouteParams>();
    const { userId } = useAnonAuth(eventId);
    const [calendarDate] = useAtom(calendarDateAtoms.readDateAtom);
    const { closeDialog } = useDialogContext();

    const queryClient = useQueryClient();

    const createRuleMut = useMutation<unknown, Error, CreateRuleArgs>({
        mutationFn: POST_RULE,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: calendarKeys.ofEventAndMonth(eventId, calendarDate),
            });
            queryClient.invalidateQueries({
                queryKey: rulesKeys.ofEventAndUser(eventId, String(userId)),
            });
        },
    });

    const [rule, setRule] = useState<Rule>(nilRule);

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
        // ToDo: Add error handling
        await createRuleMut.mutateAsync({ eventId, rulePayload });
        closeDialog();
    };

    return (
        <div className="border border-zinc-800 flex justify-center p-2 text-center">
            <form onSubmit={submitRule} className="grow">
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
                        className="bg-primary m-2 p-1 border border-primary-darker rounded-md text-secondary text-center focus:outline-none focus:ring focus:ring-secondary"
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
                        className="bg-primary m-2 p-1 border border-primary-darker rounded-md text-secondary text-center focus:outline-none focus:ring focus:ring-secondary"
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
                <div className="w-full border-b-2 border-neutral-700" />
                <LoadingButton
                    aria-label="submit new rule"
                    type="submit"
                    theme="SAVE"
                    className="p-2 m-2 min-w-[50%] mx-auto"
                    isLoading={createRuleMut.isPending}
                >
                    <Image
                        src={acceptIcon}
                        className="m-auto"
                        width={24}
                        height={24}
                        alt="submit icon"
                    />
                </LoadingButton>
            </form>
        </div>
    );
}
