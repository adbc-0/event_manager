import Image from "next/image";

import closeIcon from "~/public/close.svg";

import { Button } from "../Button/Button";
import { ReactProps } from "~/typescript";

type ClosePaneProps = ReactProps & {
    closeModal: () => void;
};

export function ClosePaneButton({ closeModal }: ClosePaneProps) {
    return (
        <div className="flex justify-end">
            <Button
                aria-label="close list view button"
                type="button"
                theme="BASIC"
                className="w-9 h-9 rounded-full border-none"
                onClick={closeModal}
            >
                <Image
                    src={closeIcon}
                    className="m-auto"
                    width={24}
                    height={24}
                    alt="close modal icon"
                />
            </Button>
        </div>
    );
}
