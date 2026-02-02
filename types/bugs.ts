export interface Bug {
  id: number;
  title: string;
  description?: string;
  status: string;
  type?: string;
  created_by?: string | number;
  created_at?: string;
  deadline?: string;
  screenshot_url?: string;
  assignees: { name: string }[];
}
