export interface IJob {
  title: string;
  location: string;
}

export interface IMember {
  name: string;
  bio: string;
}

export interface IVectorItem {
  vector: number[];
}

export interface IJobVector extends IJob, IVectorItem {}
export interface IMemberVector extends IMember, IVectorItem {}
