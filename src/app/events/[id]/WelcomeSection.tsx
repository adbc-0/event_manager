import Image from "next/image";

import editIcon from "~/public/edit.svg";
import { ReactProps } from "../../../../typescript";
import { useAuth } from "~/hooks/use-auth";

type WelcomeSectionProps = ReactProps & {
    eventName: string | null;
    openModal: () => void;
};

export function WelcomeSection({ eventName, openModal }: WelcomeSectionProps) {
    const { username } = useAuth();

    return (
        <section>
            <h1 className="text-center text-3xl p-5">{eventName}</h1>
            {username && (
                <div className="flex justify-center m-5">
                    <h2 className="text-2xl">Welcome {username}</h2>
                    <Image
                        src={editIcon}
                        className="cursor-pointer"
                        width={24}
                        height={24}
                        onClick={openModal}
                        alt="edit username"
                    />
                </div>
            )}
        </section>
    );
}
