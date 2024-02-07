import { useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAtom } from "jotai";

import trashIcon from "~/public/trash.svg";

import { calendarDateAtoms } from "~/atoms";
import { calendarKeys } from "~/queries/useEventQuery";
import { rulesKeys, useRuleQuery } from "~/queries/useRulesQuery";
import { useAnonAuth } from "~/hooks/use-anon-auth";
import { handleQueryError } from "~/utils/index";
import { LoadingSpinner } from "~/components/LoadingSpinner/LoadingSpinner";
import { LoadingButton } from "~/components/Button/LoadingButton";
import { EventRouteParams, Nullable } from "~/typescript";

type DeleteRuleArgs = {
    ruleId: string;
    eventId: string;
};

async function DELETE_RULE({ eventId, ruleId }: DeleteRuleArgs) {
    return fetch(`/api/events/${eventId}/rules/${ruleId}`, {
        method: "DELETE",
    });
}

export function CyclicEventsList() {
    const { id: eventId } = useParams<EventRouteParams>();
    const { userId } = useAnonAuth(eventId);
    const [calendarDate] = useAtom(calendarDateAtoms.readDateAtom);

    const queryClient = useQueryClient();
    const rulesQ = useRuleQuery(userId, eventId);

    const [removedEventId, setRemovedEventId] =
        useState<Nullable<string>>(null);

    const deleteRuleMut = useMutation<unknown, Error, DeleteRuleArgs>({
        mutationFn: DELETE_RULE,
        onSettled: () => {
            setRemovedEventId(null);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: calendarKeys.ofEventAndMonth(eventId, calendarDate),
            });
            queryClient.invalidateQueries({
                queryKey: rulesKeys.ofEventAndUser(eventId, String(userId)),
            });
        },
    });

    if (rulesQ.isFetching) {
        return (
            <div className="flex justify-center min-h-12 items-center">
                <LoadingSpinner />
            </div>
        );
    }

    if (rulesQ.isError) {
        handleQueryError(rulesQ.error);
    }

    if (!rulesQ.data?.length) {
        return (
            <div className="border border-primary-lighter-border">
                <p className="text-center py-2">No cyclic events</p>
            </div>
        );
    }

    const _deleteRule = (ruleId: string) => {
        setRemovedEventId(ruleId);
        deleteRuleMut.mutate({ eventId, ruleId });
    };

    return (
        <div>
            {rulesQ.data.map((rule) => (
                <div
                    key={rule.id}
                    className="border border-primary-lighter-border border-b-0 last:border-b"
                >
                    <div className="flex justify-between items-center p-2">
                        <p>{rule.name}</p>
                        <LoadingButton
                            aria-label="delete rule event"
                            type="button"
                            theme="BASIC"
                            className="p-2"
                            disabled={Boolean(removedEventId)}
                            isLoading={removedEventId === rule.id.toString()}
                            onClick={() => _deleteRule(rule.id.toString())}
                        >
                            <Image
                                src={trashIcon}
                                className="m-auto"
                                width={24}
                                height={24}
                                alt="trash can icon"
                            />
                        </LoadingButton>
                    </div>
                </div>
            ))}
        </div>
    );
}
