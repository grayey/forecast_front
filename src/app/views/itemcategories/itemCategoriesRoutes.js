import { lazy } from "react";
import { authRoles } from "app/auth/authRoles";

const ItemCategories = lazy(() => import("./itemCategoriesComponent"));
const DepartmentMapping = lazy(() => import("./departmentMapping"));


const itemCategoriesRoutes = [
  {
    path: "/admin/item-categories",
    component: ItemCategories,
  },
  {
    path: "/admin/department-items-mapping",
    component: DepartmentMapping,
  },
  

];

export default itemCategoriesRoutes;
