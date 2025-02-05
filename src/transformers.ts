import {
  type FeatureExtractionPipeline,
  pipeline,
} from "@huggingface/transformers";
import { IJob, IJobVector, IMember, IMemberVector } from "./types";

const SentenceTransformerPipeline = (): Promise<FeatureExtractionPipeline> =>
  pipeline("feature-extraction", "sentence-transformers/all-mpnet-base-v2");

const convertToVector = async (
  pipeline: FeatureExtractionPipeline,
  text: string
) => {
  const tensor = await pipeline(text, {
    pooling: "mean",
    normalize: true,
  });
  return Array.from(tensor.data) as number[];
};

export const buildVectors = async (
  jobs: IJob[],
  members: IMember[]
): Promise<{ jobs: IJobVector[]; members: IMemberVector[] }> => {
  const extractor = await SentenceTransformerPipeline();

  const jobsOutput = await Promise.all(
    jobs.map(async (job) => {
      const vector = await convertToVector(
        extractor,
        `${job.title} ${job.location}`.toLowerCase()
      );
      return { vector, ...job };
    })
  );

  const membersOutput = await Promise.all(
    members.map(async (member) => {
      const vector = await convertToVector(extractor, member.bio);
      return { vector, ...member };
    })
  );

  return { jobs: jobsOutput, members: membersOutput };
};
