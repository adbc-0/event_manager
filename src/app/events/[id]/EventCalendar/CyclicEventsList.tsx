import { useParams } from "next/navigation";
import Image from "next/image";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAtom } from "jotai";

import trashIcon from "~/public/trash.svg";

import { calendarDateAtoms } from "~/atoms";
import { calendarKeys } from "~/queries/useEventQuery";
import { rulesKeys, useRuleQuery } from "~/queries/useRulesQuery";
import { useAnonAuth } from "~/hooks/use-anon-auth";
import { Button } from "~/components/Button/Button";
import { handleQueryError } from "~/utils/index";
import { EventRouteParams } from "~/typescript";

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

    const deleteRuleMut = useMutation<unknown, Error, DeleteRuleArgs>({
        mutationFn: DELETE_RULE,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: calendarKeys.ofEventAndMonth(eventId, calendarDate),
            });
            queryClient.invalidateQueries({
                queryKey: rulesKeys.ofEventAndUser(eventId, String(userId)),
            });
        },
    });

    if (rulesQ.isLoading) {
        return null;
    }

    if (rulesQ.isError) {
        handleQueryError(rulesQ.error);
    }

    if (!rulesQ.data?.length) {
        return (
            <div className="border border-zinc-800">
                <p className="text-center py-2">No cyclic events</p>
            </div>
        );
    }

    return (
        <div>
            {rulesQ.data.map((rule) => (
                <div
                    key={rule.id}
                    className="border border-zinc-800 border-b-0 last:border-b"
                >
                    <div className="flex justify-between items-center p-2">
                        <p>{rule.name}</p>
                        <Button
                            aria-label="delete rule event"
                            type="button"
                            theme="BASIC"
                            className="p-2"
                            onClick={() =>
                                deleteRuleMut.mutate({
                                    eventId,
                                    ruleId: rule.id.toString(),
                                })
                            }
                        >
                            <Image
                                src={trashIcon}
                                className="m-auto"
                                width={24}
                                height={24}
                                alt="trash can icon"
                            />
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    );
}
