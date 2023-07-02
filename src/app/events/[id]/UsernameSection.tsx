import Image from "next/image";

import editIcon from "~/public/edit.svg";
import { useAuth } from "~/hooks/use-auth";
import { Button } from "~/components/Button/Button";
import { ReactProps } from "~/typescript";

type UsernameSectionProps = ReactProps & {
    openModal: () => void;
};

export function UsernameSection({ openModal }: UsernameSectionProps) {
    const { username } = useAuth();

    if (!username) {
        return null;
    }

    return (
        <section className="flex justify-center items-center gap-1 m-5">
            <h2 className="text-2xl">Welcome {username}</h2>
            <Button
                aria-label="edit username"
                type="button"
                theme="BASIC"
                className="w-9 h-9"
                onClick={openModal}
            >
                <Image
                    src={editIcon}
                    className="m-auto"
                    width={24}
                    height={24}
                    alt="edit icon"
                />
            </Button>
        </section>
    );
}
