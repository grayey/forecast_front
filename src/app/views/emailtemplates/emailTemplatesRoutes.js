import { lazy } from "react";
import { authRoles } from "app/auth/authRoles";
import { ADMINISTRATION } from "app/appConstants";


const EmailTemplates = lazy(() => import("./emailTemplatesComponent"));


const emailTemplatesRoutes = [
  {
    exact:true,
    path: "/admin/email-templates",
    component: EmailTemplates,
    auth:ADMINISTRATION.Email_Templates
  },


];

export default emailTemplatesRoutes;
