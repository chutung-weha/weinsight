import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config({ path: ".env", quiet: true });
dotenv.config({ path: ".env.local", override: true, quiet: true });

function redactDatabaseUrl(value) {
  if (!value) return "(missing)";

  try {
    const url = new URL(value);
    const auth = url.username ? `${url.username}:****@` : "";
    return `${url.protocol}//${auth}${url.host}${url.pathname}${url.search}`;
  } catch {
    return "(invalid URL)";
  }
}

const prisma = new PrismaClient();

try {
  const result = await prisma.$queryRawUnsafe("select current_database() as db, current_user as user");
  console.log("DATABASE_URL:", redactDatabaseUrl(process.env.DATABASE_URL));
  console.log("Connected:", result[0]);
} catch (error) {
  console.error("Database connection check failed.");
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
