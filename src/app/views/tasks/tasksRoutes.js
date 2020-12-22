import { lazy } from "react";
import { authRoles } from "app/auth/authRoles";

const Tasks = lazy(() => import("./TasksComponent"));


const tasksRoutes = [
  {
    path: "/admin/system-tasks",
    component: Tasks,
  }

];

export default tasksRoutes;
