import { useParams } from "next/navigation";
import { ChangeEvent, FormEvent, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAtom } from "jotai";

import { AvailabilityEnum, FreqEnum, WeekdaysList } from "~/constants";
import { calendarDateAtoms } from "~/atoms";
import { EditedRuleSchema } from "~/schemas";
import { rulesKeys } from "~/queries/useRulesQuery";
import { calendarKeys } from "~/queries/useEventQuery";
import { useAnonAuth } from "~/hooks/use-anon-auth";
import { getCurrentDayOfWeek } from "~/services/dayJsFacade";
import { EventRule } from "~/app/api/events/[eventId]/rules/route";
import { parseRule } from "~/utils/eventUtils";
import { useDialogContext } from "~/components/Dialog/Dialog";
import { Button } from "~/components/Button/Button";
import { Input } from "~/components/Input/Input";
import { LoadingButton } from "~/components/Button/LoadingButton";
import {
    EventRouteParams,
    RRule,
    AvailabilityEnumValues,
    ID,
} from "~/typescript";

type Rule = RRule & {
    name: string;
    availability: AvailabilityEnumValues;
};
type RulePayload = {
    name: string;
    availabilityChoice: AvailabilityEnumValues;
    rule: string;
    userId: ID;
};
type UpdateRule = {
    ruleId: number;
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
} as const;

const daysInWeek = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"];

function loadRule(rule: EventRule): Rule {
    const parsedRule = parseRule(rule.rule);
    return {
        ...nilRule,
        name: rule.name,
        availability: rule.choice,
        byDay: parsedRule.BYDAY.split(","),
        freq: parsedRule.FREQ,
        interval: parseInt(parsedRule.INTERVAL),
    };
}

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

function PUT_RULE({ eventId, ruleId, rulePayload }: UpdateRule) {
    return fetch(`/api/events/${eventId}/rules/${ruleId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(rulePayload),
    });
}

type EditCyclicEventProps = {
    savedRule: EventRule;
};

// ToDo: Move common logic to hook
// https://www.kanzaki.com/docs/ical/rrule.html
export function EditCyclicEvent({ savedRule }: EditCyclicEventProps) {
    const { id: eventId } = useParams<EventRouteParams>();
    const { userId } = useAnonAuth(eventId);
    const [calendarDate] = useAtom(calendarDateAtoms.readDateAtom);
    const { closeDialog } = useDialogContext();

    const queryClient = useQueryClient();

    const createRuleMut = useMutation<unknown, Error, UpdateRule>({
        mutationFn: PUT_RULE,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: calendarKeys.ofEventAndMonth(eventId, calendarDate),
            });
            queryClient.invalidateQueries({
                queryKey: rulesKeys.ofEventAndUser(eventId, String(userId)),
            });
        },
    });

    const [isDirty, setIsDirty] = useState(false);
    const [rule, setRule] = useState<Rule>(loadRule(savedRule));

    const changeName = (e: ChangeEvent<HTMLInputElement>) => {
        setRule((prev) => ({ ...prev, name: e.target.value }));
        setIsDirty(true);
    };
    const changeInterval = (e: ChangeEvent<HTMLSelectElement>) => {
        const interval = Number.parseInt(e.target.value);
        setRule((prev) => ({ ...prev, interval }));
        setIsDirty(true);
    };
    const changeAvailability = (e: ChangeEvent<HTMLSelectElement>) => {
        const availability = e.target.value as AvailabilityEnumValues;
        setRule((prev) => ({ ...prev, availability }));
        setIsDirty(true);
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
        setIsDirty(true);
    };

    const _updateRule = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!userId) {
            throw new Error("Missing user id");
        }
        const rulePayload = {
            name: rule.name,
            availabilityChoice: rule.availability,
            rule: createRule(rule),
            userId: userId,
        };
        const { success } = EditedRuleSchema.safeParse(rulePayload);
        if (!success) {
            return;
        }
        await createRuleMut.mutateAsync({
            eventId,
            ruleId: savedRule.id,
            rulePayload,
        });
        setIsDirty(false);
        closeDialog();
    };

    return (
        <div className="flex justify-center p-2 text-center">
            <form onSubmit={_updateRule} className="grow">
                <div className="py-2">
                    <Input
                        aria-label="Event name"
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
                        className="bg-input m-2 p-1 rounded-md text-accent text-center focus:outline-none focus:ring focus:ring-accent"
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
                        className="bg-input m-2 p-1 rounded-md text-accent text-center focus:outline-none focus:ring focus:ring-accent"
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
                            variant="BASIC"
                            key={day}
                            type="button"
                            className={`py-3 px-4 max-w-[4rem] ${
                                isDaySelected(rule.byDay, day)
                                    ? "bg-accent text-accent-foreground"
                                    : ""
                            }`}
                            onClick={() => toggleDay(day)}
                        >
                            {day}
                        </Button>
                    ))}
                </div>
                {isDirty && (
                    <>
                        <div className="w-full my-4" />
                        <LoadingButton
                            type="submit"
                            variant="SAVE"
                            className="p-2 m-2 min-w-[50%] mx-auto"
                            isLoading={createRuleMut.isPending}
                        >
                            Edit
                        </LoadingButton>
                    </>
                )}
            </form>
        </div>
    );
}
