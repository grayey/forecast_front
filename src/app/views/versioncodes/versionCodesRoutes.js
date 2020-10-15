import { lazy } from "react";
import { authRoles } from "app/auth/authRoles";

const VersionCodes = lazy(() => import("./VersionCodesComponent"));


const versionCodesRoutes = [
  {
    path: "/admin/versioning",
    component: VersionCodes,
  }

];

export default versionCodesRoutes;
