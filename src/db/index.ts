import { neon } from "@neondatabase/serverless";
import { drizzle, NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema";
import * as relations from "./relations";

const fullSchema = { ...schema, ...relations };
type FullSchema = typeof fullSchema;
type DB = NeonHttpDatabase<FullSchema>;

let _db: DB | undefined;

function getDb(): DB {
  if (!_db) {
    _db = drizzle(neon(process.env.DATABASE_URL!), { schema: fullSchema });
  }
  return _db;
}

export const db: DB = new Proxy({} as DB, {
  get(_target, prop) {
    return (getDb() as unknown as Record<string | symbol, unknown>)[prop];
  },
});
