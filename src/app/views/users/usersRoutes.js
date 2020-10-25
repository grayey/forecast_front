import { lazy } from "react";
import { authRoles } from "app/auth/authRoles";

const Users = lazy(() => import("./UsersComponent"));


const usersRoutes = [
  {
    path: "/admin/users",
    component: Users,
  }

];

export default usersRoutes;
