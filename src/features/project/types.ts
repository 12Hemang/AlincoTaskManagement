// Project Types
export interface Project {
  name: string;
  project_name: string;
  status: string;
  priority?: string;
  description?: string;
  expected_start_date?: string;
  expected_end_date?: string;
  actual_start_date?: string;
  actual_end_date?: string;
  project_type?: string;
  customer?: string;
  creation?: string;
  owner?: string;
}

export interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  loading: boolean;
  error: string | null;
}