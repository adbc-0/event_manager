import Hashids from "hashids";

const SALT = process.env.HASH_ID_SALT;
const MIN_LENGTH = 10;

if (!SALT) {
    throw new Error("Missing env variable");
}

const instance = new Hashids(SALT, MIN_LENGTH);

export const hashId = {
    encode(valuesToBeEncoded: string[] | string): string {
        return instance.encode(valuesToBeEncoded);
    },
    decode(string: string): [string, null] | [null, string] {
        if (!instance.isValidId(string)) {
            return [null, "invalid hash id format"];
        }

        const decodedHashId = instance.decode(string).toString();
        if (!decodedHashId) {
            return [null, "invalid hash id value"];
        }

        return [decodedHashId, null];
    },
};
