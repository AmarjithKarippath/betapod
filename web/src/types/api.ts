export interface User {
  id: number;
  email: string;
  name: string;
  created_at: string;
  is_admin: boolean;
}

export interface AdminStats {
  totals: { users: number; requests: number; enrollments: number; feedback: number };
  by_day: {
    users: { date: string; count: number }[];
    requests: { date: string; count: number }[];
    enrollments: { date: string; count: number }[];
  };
}

export interface TestRequest {
  id: number;
  owner_id: number;
  app_name: string;
  play_store_url: string;
  category: string;
  description: string;
  tester_count: number;
  duration_days: number;
  location: string;
  screenshot_path: string | null;
  status: string;
  created_at: string;
  enrolled_count: number;
  is_enrolled: boolean;
  is_owner: boolean;
}

export interface Enrollment {
  id: number;
  tester_id: number;
  tester_email: string;
  tester_name: string;
  created_at: string;
}

export interface RequestCreate {
  app_name: string;
  play_store_url: string;
  category: string;
  description: string;
  tester_count: number;
  duration_days: number;
  location: string;
}
