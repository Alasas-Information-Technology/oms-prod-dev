import sql from "mssql";

const config: sql.config = {
    server: process.env.DB_HOST!,
    database: process.env.DB_NAME!,
    user: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
    options: {
        encrypt: true,
        trustServerCertificate: true,
    },
};

let pool: sql.ConnectionPool;

export async function getDb() {
    if (!pool) {
        pool = await sql.connect(config);
    }

    return pool;
}

export default sql;