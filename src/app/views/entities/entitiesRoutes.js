import { lazy } from "react";
import { authRoles } from "app/auth/authRoles";

const Enitities = lazy(() => import("./entitiesComponent"));


const entityRoutes = [
  {
    path: "/admin/entry-types",
    component: Enitities,
  }

];

export default entityRoutes;
