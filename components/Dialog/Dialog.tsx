import {
    Children,
    ElementRef,
    ReactElement,
    RefObject,
    cloneElement,
    createContext,
    isValidElement,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import Image from "next/image";

import closeIcon from "~/public/close.svg";

import { ReactProps, Nullable } from "~/typescript";
import { Button } from "../Button/Button";

type DialogContentProps = ReactProps & {
    title?: string;
};
type DialogContextT = {
    dialogRef: Nullable<RefObject<HTMLDialogElement>>;
    isOpen: boolean;
    startRenderingDialogChildren: () => void;
    stopRenderingDialogChildren: () => void;
    closeDialog: () => void;
    openDialog: () => void;
};

const DialogContext = createContext<DialogContextT>({
    dialogRef: null,
    isOpen: false,
    startRenderingDialogChildren: () => {
        throw new Error("unimplmeneted");
    },
    stopRenderingDialogChildren: () => {
        throw new Error("unimplmeneted");
    },
    openDialog: () => {
        throw new Error("unimplmeneted");
    },
    closeDialog: () => {
        throw new Error("unimplmeneted");
    },
});

export function useDialogContext() {
    const ctx = useContext(DialogContext);
    if (!ctx) {
        throw new Error("wrap component with provider to use dialog context");
    }
    return ctx;
}

function Dialog({ children }: ReactProps) {
    const dialogRef = useRef<Nullable<ElementRef<"dialog">>>(null);
    const [isOpen, setIsOpen] = useState(false);
    const startRenderingDialogChildren = useCallback(() => {
        setIsOpen(true);
    }, []);
    const stopRenderingDialogChildren = useCallback(() => {
        setIsOpen(false);
    }, []);
    const openDialog = useCallback(() => {
        if (!dialogRef?.current) {
            throw new Error("dialog ref was not set properly");
        }
        dialogRef.current.showModal();
    }, []);
    const closeDialog = useCallback(() => {
        if (!dialogRef?.current) {
            throw new Error("dialog ref was not set properly");
        }
        dialogRef.current.close();
    }, []);
    const provider = useMemo(
        () => ({
            dialogRef,
            isOpen,
            startRenderingDialogChildren,
            stopRenderingDialogChildren,
            openDialog,
            closeDialog,
        }),
        [
            isOpen,
            startRenderingDialogChildren,
            stopRenderingDialogChildren,
            openDialog,
            closeDialog,
        ],
    );

    return (
        <DialogContext.Provider value={provider}>
            {children}
        </DialogContext.Provider>
    );
}

function DialogTrigger({ children }: ReactProps) {
    if (!children) {
        throw new Error("missing children");
    }

    const { openDialog } = useDialogContext();
    const triggerElement = Children.only(children);
    if (!isValidElement(triggerElement)) {
        throw new Error("invalid react element");
    }

    return cloneElement(triggerElement as ReactElement, {
        onClick: openDialog,
    });
}

type ClosePaneProps = ReactProps & {
    closeModal: () => void;
};

function DialogCloseButton({ closeModal }: ClosePaneProps) {
    return (
        <Button
            aria-label="close list view button"
            type="button"
            theme="BASIC"
            className="w-9 h-9 rounded-full"
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
    );
}

function DialogTopBar({ title }: { title: string | undefined }) {
    const { closeDialog } = useDialogContext();
    return (
        <div className="flex justify-between rounded-t-md p-2 items-center border-b border-b-black h-14">
            <h2 className="text-xl">{title}</h2>
            <DialogCloseButton closeModal={closeDialog} />
        </div>
    );
}

function DialogContent({ children, title }: DialogContentProps) {
    const {
        dialogRef,
        isOpen,
        startRenderingDialogChildren,
        stopRenderingDialogChildren,
    } = useDialogContext();

    // stop rendering dialog when open attribute dissapears from native dialog
    useEffect(() => {
        if (dialogRef?.current) {
            const dialogObserver = new MutationObserver(() => {
                if (dialogRef.current?.open) {
                    startRenderingDialogChildren();
                    return;
                }
                stopRenderingDialogChildren();
            });
            dialogObserver.observe(dialogRef.current, { attributes: true });
            return () => {
                dialogObserver.disconnect();
            };
        }
    }, [dialogRef, startRenderingDialogChildren, stopRenderingDialogChildren]);

    return (
        <dialog
            ref={dialogRef}
            className="open:flex open:flex-col overflow-hidden w-full md:max-w-3xl bg-primary rounded-md shadow-lg border border-black"
        >
            {isOpen && (
                <>
                    <DialogTopBar title={title} />
                    <div className="p-2 bg-primary-lighter overflow-y-auto">
                        {children}
                    </div>
                </>
            )}
        </dialog>
    );
}

function composeEventHandlers<E>(
    originalEventHandler?: (event: E) => void,
    ourEventHandler?: (event: E) => void,
    { checkForDefaultPrevented = true } = {},
) {
    return function handleEvent(event: E) {
        originalEventHandler?.(event);

        if (
            checkForDefaultPrevented === false ||
            !(event as unknown as Event).defaultPrevented
        ) {
            return ourEventHandler?.(event);
        }
    };
}

function DialogClose({ children }: ReactProps) {
    if (!children) {
        throw new Error("missing children");
    }

    const { closeDialog } = useDialogContext();
    const triggerElement = Children.only(children);
    if (!isValidElement(triggerElement)) {
        throw new Error("invalid react element");
    }

    const originalOnClick = triggerElement.props.onClick;

    return cloneElement(triggerElement as ReactElement, {
        onClick: composeEventHandlers(originalOnClick, closeDialog),
    });
}

Dialog.DialogClose = DialogClose;
Dialog.DialogTrigger = DialogTrigger;
Dialog.DialogContent = DialogContent;

export default Dialog;
