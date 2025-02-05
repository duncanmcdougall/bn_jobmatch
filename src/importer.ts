import { fetchData } from "./ApiClient";
import { PrismaClient } from "@prisma/client";
import { DatabaseService } from "./DatabaseService";
import { buildVectors } from "./transformers";

const prisma = new PrismaClient();

async function runImporter() {
  console.log("Importing data...");
  const { jobs, members } = await fetchData();

  const vectors = await buildVectors(jobs, members);

  const dbService = new DatabaseService(prisma);
  await dbService.import(vectors.jobs, vectors.members);

  console.log(
    `Data imported successfully. {jobs: ${jobs.length}, members: ${members.length}}`
  );
}

runImporter()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
