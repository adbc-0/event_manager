import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";

import trashIcon from "~/public/trash.svg";

import { Button } from "~/components/Button/Button";
import { ServerError } from "~/utils/index";
import { RequestResponse } from "~/app/api/events/[eventId]/rules/route";
import { ErrorMessage } from "~/typescript";

// ToDo: TanStack Query?
// ToDo: Should coming data be requested for given user?
export function CyclicEventsList() {
    const { id: eventId } = useParams();

    const [rules, setRules] = useState<RequestResponse>([]);

    useEffect(() => {
        async function fetchEventRules() {
            const response = await fetch(`/api/events/${eventId}/rules`);
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
    }, [eventId]);

    const deleteRule = async (ruleId: number) => {
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
    };

    if (!rules.length) {
        return (
            <div className="border border-zinc-800">
                <p className="text-center py-2">
                    No created rules for this user were found
                </p>
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
