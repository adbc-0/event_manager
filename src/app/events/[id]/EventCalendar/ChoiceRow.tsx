import Image from "next/image";
import { StaticImport } from "next/dist/shared/lib/get-img-props";
import { twMerge } from "tailwind-merge";

import checkCircleIcon from "~/public/check_circle.svg";
import deleteCircleIcon from "~/public/delete_circle.svg";
import questionCircleIcon from "~/public/question_cricle.svg";

import { AvailabilityEnumValues, ReactProps } from "~/typescript";

type ChoiceRowProps = ReactProps & {
    day: string;
    dayChoices: Record<string, AvailabilityEnumValues>;
    users: string[];
};

const availabilityColor = {
    available: `bg-green-600`,
    maybe_available: `bg-orange-600`,
    unavailable: `bg-red-600`,
} as const;

const iconSwitch: Record<AvailabilityEnumValues, StaticImport> = {
    available: checkCircleIcon,
    maybe_available: questionCircleIcon,
    unavailable: deleteCircleIcon,
} as const;

export function ChoiceRow({ day, dayChoices, users }: ChoiceRowProps) {
    return (
        <tr className="grid auto-cols-fr grid-flow-col gap-1 bg-primary-light my-1">
            <th scope="row" className="p-2 font-medium text-gray-300 bg-neutral-500 bg-opacity-15">
                {day}
            </th>
            {users.map((user) => {
                const userChoiceForDay = dayChoices[user];
                return (
                    <td
                        key={day + user}
                        className={twMerge(
                            "bg-opacity-15 flex justify-center align-center bg-neutral-500",
                            availabilityColor[userChoiceForDay],
                        )}
                    >
                        {userChoiceForDay ? (
                            <Image
                                src={iconSwitch[userChoiceForDay]}
                                width={24}
                                height={24}
                                alt="close modal icon"
                            />
                        ) : null}
                    </td>
                );
            })}
        </tr>
    );
}
