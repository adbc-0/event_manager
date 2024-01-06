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

import { ClosePaneButton } from "../GlassmorphicPane/ClosePane";
import { GlassmorphicPane } from "../GlassmorphicPane/GlassmorphicPane";
import { ReactProps, Nullable } from "~/typescript";

type DialogProps = ReactProps & {
    title?: string;
    fullscreen?: boolean;
};
type DialogContextT = {
    dialogRef: Nullable<RefObject<HTMLDialogElement>>;
    isOpen: boolean;
    openDialog: () => void;
    closeDialog: () => void;
};

const DialogContext = createContext<DialogContextT>({
    dialogRef: null,
    isOpen: false,
    openDialog: () => {
        throw new Error("unimplmeneted");
    },
    closeDialog: () => {
        throw new Error("unimplmeneted");
    },
});

function useDialogContext() {
    const ctx = useContext(DialogContext);
    if (!ctx) {
        throw new Error("wrap component with provider to use dialog context");
    }
    return ctx;
}

function Dialog({ children }: DialogProps) {
    const dialogRef = useRef<Nullable<ElementRef<"dialog">>>(null);
    const [isOpen, setIsOpen] = useState(false);
    const openDialog = useCallback(() => {
        setIsOpen(true);
    }, []);
    const closeDialog = useCallback(() => {
        setIsOpen(false);
    }, []);
    const provider = useMemo(
        () => ({
            dialogRef,
            isOpen,
            openDialog,
            closeDialog,
        }),
        [closeDialog, isOpen, openDialog],
    );

    return (
        <DialogContext.Provider value={provider}>
            {children}
        </DialogContext.Provider>
    );
}

function DialogTrigger({ children }: DialogProps) {
    if (!children) {
        throw new Error("Missing children component");
    }
    if (Children.count(children) > 1) {
        throw new Error("Pass only single element");
    }

    const { dialogRef } = useDialogContext();

    const _handleOpenDialog = () => {
        if (!dialogRef) {
            return;
        }
        dialogRef.current?.showModal();
    };

    return (
        <>
            {Children.map(children, (child) => {
                if (!isValidElement(child)) {
                    throw new Error("Invalid react element");
                }

                return cloneElement(child as ReactElement, {
                    onClick: _handleOpenDialog,
                });
            })}
        </>
    );
}

function DialogTopBar({ title }: { title: string | undefined }) {
    const { dialogRef } = useDialogContext();
    return (
        <div className="flex justify-between bg-neutral-800 rounded-t-md p-2 items-center">
            <h2 className="text-xl">{title}</h2>
            <ClosePaneButton closeModal={() => dialogRef?.current?.close()} />
        </div>
    );
}

function DialogContent({ children, title, fullscreen = false }: DialogProps) {
    const { dialogRef, isOpen, openDialog, closeDialog } = useDialogContext();

    // stop rendering dialog when open attribute dissapears from native dialog
    useEffect(() => {
        if (dialogRef?.current) {
            const dialogObserver = new MutationObserver(() => {
                if (dialogRef.current?.open) {
                    openDialog();
                    return;
                }
                closeDialog();
            });
            dialogObserver.observe(dialogRef.current, { attributes: true });
            return () => {
                dialogObserver.disconnect();
            };
        }
    }, [closeDialog, dialogRef, openDialog]);

    return (
        <dialog
            ref={dialogRef}
            className="p-0 w-full rounded-md open:animate-fade-in"
        >
            {isOpen &&
                (fullscreen ? (
                    <GlassmorphicPane
                        outerClassName="md:max-w-3xl md:m-auto"
                        innerClassName="h-[calc(100dvh-8rem)]"
                    >
                        <div className="h-full flex flex-col">
                            <DialogTopBar title={title} />
                            <div className="p-2 grow">
                                <div className="relative h-full">
                                    <div className="absolute overflow-auto inset-0 shadow-md">
                                        {children}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </GlassmorphicPane>
                ) : (
                    <GlassmorphicPane
                        outerClassName="md:max-w-3xl md:m-auto" // alternative -> md:max-w-sm md:m-auto
                    >
                        <DialogTopBar title={title} />
                        <div className="p-2">{children}</div>
                    </GlassmorphicPane>
                ))}
        </dialog>
    );
}

function DialogClose() {
    return null;
}

Dialog.DialogTrigger = DialogTrigger;
Dialog.DialogContent = DialogContent;
Dialog.DialogClose = DialogClose;

export default Dialog;
