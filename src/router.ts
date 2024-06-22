import Vue from "vue";
import Router from "vue-router";
import Layout from "@/layout/index.vue";


Vue.use(Router);

const router = new Router({
  scrollBehavior: (to, from, savedPosition) => {
    if (savedPosition) {
      return savedPosition;
    }
    return { x: 0, y: 0 };
  },
  base: process.env.BASE_URL,
  routes: [
    {
      path: "/login",
      component: () => import("@/views/login/index.vue"),
      meta: { title: "后台管理系统", hidden: true, notNeedAuth: true }
    },
    {
      path: "/404",
      component: () => import("@/views/404.vue"),
      meta: { title: "后台管理系统", hidden: true, notNeedAuth: true }
    },
    {
      path: "/",
      component: Layout,
      redirect: "/order",
      children: [
        {
          path: "order",
          component: () => import("@/views/orderDetails/index.vue"),
          meta: {
            title: "订单管理",
            icon: "icon-order"
          }
        },
        {
          path: "dish",
          component: () => import("@/views/dish/index.vue"),
          meta: {
            title: "菜品管理",
            icon: "icon-dish"
          }
        },
        {
          path: "/dish/add",
          component: () => import("@/views/dish/addDishtype.vue"),
          meta: {
            title: "添加菜品",
            hidden: true
          }
        },
        {
          path: "category",
          component: () => import("@/views/category/index.vue"),
          meta: {
            title: "分类管理",
            icon: "icon-category"
          }
        }
      ]
    },
    {
      path: "*",
      redirect: "/404",
      meta: { hidden: true }
    }
  ]
});

export default router;
