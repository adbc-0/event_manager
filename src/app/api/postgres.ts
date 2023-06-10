import { default as postgresConnect } from "postgres";

export const postgres = postgresConnect({
    ssl: true,
    host: process.env.POSTGRES_HOST,
    port: 5432,
    database: process.env.POSTGRES_DATABASE,
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
});
