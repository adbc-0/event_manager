export function handleQueryError(
    error: Error,
    handlers?: Record<number, (error: ServerError) => void>,
) {
    if (!(error instanceof ServerError)) {
        throw new Error("unexpected fetch error format");
    }
    if (!handlers) {
        throw error;
    }
    if (!handlers[error.status]) {
        throw error;
    }
    handlers[error.status](error);
}

export class ServerError extends Error {
    status: number;

    constructor(message: string, status: number) {
        super(message); // 'Error' breaks prototype chain here
        this.name = "ServerError";
        this.status = status;
        Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
    }
}
