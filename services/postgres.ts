import { default as postgresConnect } from "postgres";

const postgressBaseConfig = {
    host: process.env.POSTGRES_HOST,
    port: 5432,
    database: process.env.POSTGRES_DATABASE,
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
} as const;

const postgressDevConfig = {
    ssl: false,
    ...postgressBaseConfig,
} as const;

const postgressProdConfig = {
    ssl: true,
    postgressBaseConfig,
} as const;

export const postgres = postgresConnect(
    process.env.NODE_ENV === "development"
        ? postgressDevConfig
        : postgressProdConfig,
);
