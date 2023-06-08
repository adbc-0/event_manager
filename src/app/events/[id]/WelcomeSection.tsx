import Image from "next/image";

import editIcon from "~/public/edit.svg";
import { ReactProps } from "../../../../typescript";
import { useAuth } from "~/hooks/use-auth";

type WelcomeSectionProps = ReactProps & {
    openModal: () => void;
};

export function WelcomeSection({ openModal }: WelcomeSectionProps) {
    const { username } = useAuth();

    if (!username) {
        return null;
    }

    return (
        <section className="flex justify-center m-5">
            <h2 className="text-2xl">Welcome {username}</h2>
            <Image
                src={editIcon}
                className="cursor-pointer"
                width={24}
                height={24}
                onClick={openModal}
                alt="edit username"
            />
        </section>
    );
}
