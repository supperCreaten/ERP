import AuthGuard from "./AuthGuard";
import React from "react";
import { GenerateRoute } from "./baseRoutes";
import RouteNProgress from "./RouteNProgress";

export default function Router () {
  return (
    <>
      <RouteNProgress />
      <AuthGuard>
        <GenerateRoute />
      </AuthGuard>
    </>
  );
}