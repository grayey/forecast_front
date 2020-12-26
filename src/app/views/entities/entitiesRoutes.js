import { lazy } from "react";
import { authRoles } from "app/auth/authRoles";
import { ADMINISTRATION } from "app/appConstants";


const Enitities = lazy(() => import("./entitiesComponent"));


const entityRoutes = [
  {
    exact:true,
    path: "/admin/entry-types",
    component: Enitities,
    auth:ADMINISTRATION.Entry_Types

  }

];

export default entityRoutes;
