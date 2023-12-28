import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";

import trashIcon from "~/public/trash.svg";

import { useEvent } from "~/context/EventProvider";
import { useAnonAuth } from "~/hooks/use-anon-auth";
import { Button } from "~/components/Button/Button";
import { ServerError } from "~/utils/index";
import { RequestResponse } from "~/app/api/events/[eventId]/rules/route";
import { ErrorMessage, ID } from "~/typescript";

export function CyclicEventsList() {
    const { userId } = useAnonAuth();
    const { id: eventId } = useParams();
    const { fetchEventCalendar } = useEvent();

    const [rules, setRules] = useState<RequestResponse>([]);

    useEffect(() => {
        async function fetchEventRules() {
            if (!userId) {
                return;
            }

            const searchParams = new URLSearchParams({
                userId: userId.toString(),
            });
            const response = await fetch(
                `/api/events/${eventId}/rules?${searchParams.toString()}`,
            );
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

            const rules = (await response.json()) as RequestResponse;
            setRules(rules);
        }

        fetchEventRules();
    }, [eventId, userId]);

    const deleteRule = async (ruleId: ID) => {
        const response = await fetch(`/api/events/${eventId}/rules/${ruleId}`, {
            method: "DELETE",
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

        const rules = (await response.json()) as RequestResponse;
        setRules(rules);
        await fetchEventCalendar();
    };

    if (!rules.length) {
        return (
            <div className="border border-zinc-800">
                <p className="text-center py-2">No cyclic events</p>
            </div>
        );
    }

    return (
        <div>
            {rules.map((rule) => (
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
                            onClick={() => deleteRule(rule.id)}
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
