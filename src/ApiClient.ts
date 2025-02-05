import { IJob, IMember } from "./types";

const BASE_API_URL = "https://bn-hiring-challenge.fly.dev/";

const fetchJobs = async () => {
  const jobs = await fetch(`${BASE_API_URL}jobs.json`);
  const result = (await jobs.json()) as IJob[];
  return result;
};

const fetchMembers = async () => {
  const members = await fetch(`${BASE_API_URL}members.json`);
  const result = (await members.json()) as IMember[];
  return result;
};

export const fetchData = async () => {
  const [jobs, members] = await Promise.all([fetchJobs(), fetchMembers()]);
  return { jobs, members };
};
