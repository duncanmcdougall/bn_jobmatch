import { fetchData } from "./ApiClient";
import { PrismaClient } from "@prisma/client";
import { DatabaseService } from "./DatabaseService";
import { buildVectors } from "./transformers";

const prisma = new PrismaClient();

async function runMatcher() {
  const dbService = new DatabaseService(prisma);
  const result = await dbService.matchJobs();

  for (const name of Object.keys(result)) {
    const { bio, jobs } = result[name];
    console.log(`${name} - "${bio}"`);
    console.table(jobs);
  }
}

runMatcher()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
