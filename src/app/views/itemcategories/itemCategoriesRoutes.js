import { lazy } from "react";
import { authRoles } from "app/auth/authRoles";

const ItemCategories = lazy(() => import("./itemCategoriesComponent"));


const itemCategoriesRoutes = [
  {
    path: "/admin/item-categories",
    component: ItemCategories,
  }

];

export default itemCategoriesRoutes;
