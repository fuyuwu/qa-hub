import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "browse",
      component: () => import("../views/BrowseView.vue"),
    },
    {
      path: "/practice",
      name: "practice",
      component: () => import("../views/PracticeView.vue"),
    },
    {
      path: "/admin",
      name: "admin",
      component: () => import("../views/AdminView.vue"),
    },
  ],
});

export default router;
