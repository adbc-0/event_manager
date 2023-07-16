import Image from "next/image";
import { twMerge } from "tailwind-merge";

import checkCircleIcon from "~/public/check_circle.svg";
import deleteCircleIcon from "~/public/delete_circle.svg";
import questionCircleIcon from "~/public/question_cricle.svg";

import { AvailabilityEnumValues } from "~/constants";
import { ReactProps } from "~/typescript";
import { StaticImport } from "next/dist/shared/lib/get-img-props";

type ChoiceRowProps = ReactProps & {
    day: string;
    dayChoices: Record<string, AvailabilityEnumValues>;
    users: string[];
};

const availabilityBaseStyle = "px-2 py-2 backdrop-filter bg-opacity-10";

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
        <tr className="bg-gray-300 backdrop-filter bg-opacity-10">
            <th scope="row" className="px-2 py-2 font-medium text-gray-300">
                {day}
            </th>
            {users.map((user) => {
                const userChoiceForDay = dayChoices[user];
                return (
                    <td
                        key={day + user}
                        className={twMerge(
                            availabilityBaseStyle,
                            availabilityColor[userChoiceForDay],
                        )}
                    >
                        {userChoiceForDay ? (
                            <Image
                                src={iconSwitch[userChoiceForDay]}
                                className="m-auto"
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
