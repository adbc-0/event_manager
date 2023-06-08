import Image from "next/image";

import editIcon from "~/public/edit.svg";
import { useAuth } from "~/hooks/use-auth";
import { ReactProps } from "../../../../typescript";
import { Button } from "~/components/Button/Button";

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
            <Button theme="BASIC" className="w-9 h-9 p-0">
                <Image
                    src={editIcon}
                    className="cursor-pointer m-auto"
                    width={24}
                    height={24}
                    onClick={openModal}
                    alt="edit username"
                />
            </Button>
        </section>
    );
}
