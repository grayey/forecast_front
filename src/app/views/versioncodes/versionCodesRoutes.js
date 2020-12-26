import { lazy } from "react";
import { authRoles } from "app/auth/authRoles";
import { ADMINISTRATION } from "app/appConstants";

const VersionCodes = lazy(() => import("./VersionCodesComponent"));


const versionCodesRoutes = [
  {
    exact:true,
    path: "/admin/versioning",
    component: VersionCodes,
    auth:ADMINISTRATION.Versioning
  }

];

export default versionCodesRoutes;
