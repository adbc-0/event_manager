import Hashids from "hashids";

const SALT = process.env.HASH_ID_SALT;
const MIN_LENGTH = 10;

if (!SALT) {
    throw new Error("Missing env variable");
}

export const hashIds = new Hashids(SALT, MIN_LENGTH);
