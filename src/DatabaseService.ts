import { Prisma, PrismaClient } from "@prisma/client";
import pgvector from "pgvector";
import { IJob, IJobVector, IMember, IMemberVector } from "./types";

interface IClosestJobs
  extends Record<
    string,
    {
      bio: string;
      jobs: { distance: number; title: string; location: string }[];
    }
  > {}

export class DatabaseService {
  private _prisma: PrismaClient;
  constructor(prisma: PrismaClient) {
    this._prisma = prisma;
  }

  private clear() {
    return [
      this._prisma.job.deleteMany({}),
      this._prisma.member.deleteMany({}),
    ];
  }

  /**
   * Imports job and member data into the database.
   *
   * This method performs a database transaction that first clears existing data,
   * then inserts new job and member records with their respective embeddings.
   *
   * @param jobs - An array of job vectors, each containing location, title, and vector data.
   * @param members - An array of member vectors, each containing name, bio, and vector data.
   * @returns A promise that resolves when the transaction is complete.
   */
  async import(jobs: IJobVector[], members: IMemberVector[]) {
    this._prisma.$transaction([
      ...this.clear(),
      ...jobs.map(
        ({ location, title, vector }) =>
          this._prisma
            .$executeRaw`INSERT INTO "Job" (embedding, location, title) VALUES (${pgvector.toSql(
            vector
          )}::vector, ${location}, ${title})`
      ),
      ...members.map(
        ({ name, bio, vector }) =>
          this._prisma
            .$executeRaw`INSERT INTO "Member" (embedding, bio, name) VALUES (${pgvector.toSql(
            vector
          )}::vector, ${bio}, ${name})`
      ),
    ]);
  }

  async matchJobs(threshold = 0.5): Promise<IClosestJobs> {
    const result = (await this._prisma.$queryRaw(
      Prisma.sql`SELECT 
      m.name AS name,
      m.bio AS bio,
      j.title AS title,
      j.location AS location,
      (m.embedding <=> j.embedding) AS distance
      FROM "Member" m
      LEFT JOIN LATERAL (
      SELECT 
          j.title, 
          j.location, 
          j.embedding,
          (m.embedding <=> j.embedding) AS distance
      FROM "Job" j
      WHERE(m.embedding <=> j.embedding) < ${threshold}
      ORDER BY distance
      LIMIT 10
      ) j ON true  
      ORDER BY m.name, distance`
    )) as (IMember & IJob & { distance: number })[];

    const grouped = result.reduce((acc, item) => {
      if (!acc[item.name]) {
        acc[item.name] = {
          bio: item.bio,
          jobs: [],
        };
      }
      acc[item.name].jobs.push({
        title: item.title,
        location: item.location,
        distance: item.distance,
      });
      return acc;
    }, {} as IClosestJobs);

    return grouped;
  }
}
