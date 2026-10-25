export type AdminUser = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  referral_code: string | null;
  status: string;
  created_at: string;
};

export type AdminCourse = {
  id: number;
  title: string;
  category: string;
  lessons_count: number;
  price: number | string;
  students_count: number;
  status: "published";
};

export type AdminEnrollment = {
  id: number;
  user_id: number;
  course_id: number;
  student_name: string;
  student_email: string;
  student_phone: string | null;
  course_name: string;
  order_id: string;
  status: string;
  progress: number;
  price_paid: number | string | null;
  referral_code: string | null;
  utr: string | null;
  enrolled_at: string;
};

export type AdminDashboardData = {
  users: AdminUser[];
  courses: AdminCourse[];
  enrollments: AdminEnrollment[];
  statistics: {
    total_users: number;
    total_courses: number;
    total_enrollments: number;
  };
};

export async function loadAdminDashboard(
  token: string,
): Promise<AdminDashboardData> {
  const response = await fetch("/api/v1/admin/dashboard", {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const payload = (await response.json()) as {
    success: boolean;
    data?: AdminDashboardData;
    message?: string;
  };

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.message ?? "Unable to load admin data.");
  }

  return payload.data;
}

export async function approveAdminEnrollment(
  token: string,
  enrollmentId: number,
): Promise<void> {
  const response = await fetch(
    `/api/v1/admin/enrollments/${enrollmentId}/approve`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    },
  );
  const payload = (await response.json()) as {
    success: boolean;
    message?: string;
  };

  if (!response.ok || !payload.success) {
    throw new Error(payload.message ?? "Unable to approve enrollment.");
  }
}
