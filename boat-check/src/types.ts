export type TaskStatus = 'open' | 'done' | 'skip';

export interface Cluster {
  id: string;
  title: string;
  order: number;
}

export interface Task {
  id: string;
  clusterId: string;
  title: string;
  note?: string;
  status: TaskStatus;
  order: number;
}

export interface AppData {
  clusters: Cluster[];
  tasks: Task[];
}
