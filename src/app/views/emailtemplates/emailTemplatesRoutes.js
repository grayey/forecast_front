import { lazy } from "react";
import { authRoles } from "app/auth/authRoles";

const EmailTemplates = lazy(() => import("./emailTemplatesComponent"));


const emailTemplatesRoutes = [
  {
    path: "/admin/email-templates",
    component: EmailTemplates,
  },


];

export default emailTemplatesRoutes;
