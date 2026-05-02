// hooks/useAdmin.ts

import { adminService } from "@/service/admin.service";
import { useQuery } from "@tanstack/react-query";


export const useGetDashboardStats = () => {
  return useQuery({
    queryKey: ["dashboardStats"],
    queryFn: adminService.getDashboardStats,
  });
};