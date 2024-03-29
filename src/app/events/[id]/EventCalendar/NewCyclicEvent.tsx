import { useParams } from "next/navigation";
import { ChangeEvent, FormEvent, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAtom } from "jotai";

import { AvailabilityEnum, FreqEnum, WeekdaysList } from "~/constants";
import { calendarDateAtoms } from "~/atoms";
import { NewRuleSchema } from "~/schemas";
import { rulesKeys } from "~/queries/useRulesQuery";
import { calendarKeys } from "~/queries/useEventQuery";
import { getCurrentDayOfWeek } from "~/services/dayJsFacade";
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
    startDate: string;
    userId: number | undefined;
};
type CreateRule = {
    eventId: string;
    rulePayload: RulePayload;
};

function weekdayToRuleDay(weekday: (typeof WeekdaysList)[number]) {
    return weekday.substring(0, 2).toUpperCase();
}

const todayWeekday = getCurrentDayOfWeek();

const nilRule: Rule = {
    name: "",
    byDay: [weekdayToRuleDay(todayWeekday)],
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

function POST_RULE({ eventId, rulePayload }: CreateRule) {
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

    const createRuleMut = useMutation<unknown, Error, CreateRule>({
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
        if (isSelected && rule.byDay.length === 1) {
            return;
        }
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
            startDate: rule.startDate.toJSON(),
            userId,
        };
        const parser = NewRuleSchema.safeParse(rulePayload);
        if (!parser.success) {
            return;
        }
        await createRuleMut.mutateAsync({ eventId, rulePayload });
        closeDialog();
    };

    // ToDo: Add validation to input that works on mobile (or toast)
    return (
        <div className="border border-primary-lighter-border flex justify-center p-2 text-center">
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
                        className="min-w-[80%] mx-auto p-1 mt-2 text-accent text-center"
                        value={rule.name}
                        onChange={changeName}
                    />
                </div>
                <div className="py-2">
                    <span>Every</span>
                    <select
                        className="bg-primary m-2 p-1 border border-primary-border rounded-md text-accent text-center focus:outline-none focus:ring focus:ring-accent"
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
                        className="bg-primary m-2 p-1 border border-primary-border rounded-md text-accent text-center focus:outline-none focus:ring focus:ring-accent"
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
                <div className="flex justify-center gap-2 flex-wrap p-2">
                    {daysInWeek.map((day) => (
                        <Button
                            theme="BASIC"
                            key={day}
                            type="button"
                            className={`py-3 px-4 max-w-[4rem] ${
                                isDaySelected(rule.byDay, day)
                                    ? "bg-accent text-black"
                                    : ""
                            }`}
                            onClick={() => toggleDay(day)}
                        >
                            {day}
                        </Button>
                    ))}
                </div>
                <div className="w-full border-b-2 border-neutral-700 my-4" />
                <LoadingButton
                    type="submit"
                    theme="SAVE"
                    className="p-2 m-2 min-w-[50%] mx-auto"
                    isLoading={createRuleMut.isPending}
                >
                    Create Event
                </LoadingButton>
            </form>
        </div>
    );
}
