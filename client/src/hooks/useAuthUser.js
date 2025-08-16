import { useQuery } from "@tanstack/react-query";
import { getAuthUser } from "../lib/api";

const useAuthUser = () => {
  const authUser = useQuery({
    queryKey: ["authUser"],
    queryFn: getAuthUser,
    retry: false, // auth check
    staleTime: 0, // Always refetch
    cacheTime: 0, // Don't cache
  });

  // Debug logs
  console.log("useAuthUser Debug:", {
    isLoading: authUser.isLoading,
    data: authUser.data,
    error: authUser.error,
    status: authUser.status
  });

  return { 
    isLoading: authUser.isLoading, 
    authUser: authUser.data?.user,
    error: authUser.error 
  };
};
export default useAuthUser;