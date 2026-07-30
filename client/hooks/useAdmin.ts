import { adminService } from "@/service/admin.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";


export const useGetDashboardStats = () => {
  return useQuery({
    queryKey: ["dashboardStats"],
    queryFn: adminService.getDashboardStats,
  });
};

export const useGetAllUsers = () => {
  return useQuery({
    queryKey: ["adminUsers"],
    queryFn: adminService.getAllUsers,
  });
};

export const useGetChatRooms = () => {
  return useQuery({
    queryKey: ["adminChatRooms"],
    queryFn: adminService.getChatRooms,
  });
};

export const useDeleteChatRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (roomId: string) => adminService.deleteChatRoom(roomId),
    onSuccess: (res: any) => {
      toast.success(res.message || "Chat conversation deleted");
      queryClient.invalidateQueries({ queryKey: ["adminChatRooms"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete chat room");
    },
  });
};