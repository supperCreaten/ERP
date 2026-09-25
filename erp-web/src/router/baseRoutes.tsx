import { useAppRoutes } from "@/hooks/use-app-routes";
import { useRoutes } from "react-router-dom";
import LazySuspense from "@/components/LazySuspense";

export function GenerateRoute () {
  const routes = useAppRoutes();
  return <LazySuspense>{useRoutes(routes)}</LazySuspense>;
}
