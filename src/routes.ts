import React from "react";

export enum AppRoute {
  home,
  run,
  faq,
  notFound,
}

export type RouteParams = {
  [AppRoute.home]: undefined;
  [AppRoute.run]: undefined;
  [AppRoute.faq]: undefined;
  [AppRoute.notFound]: undefined;
};

export type RouteParam = RouteParams[keyof RouteParams];

export const routes = [
  {
    name: AppRoute.home,
    path: "/",
    view: React.lazy(() => import("./pages/Home")),
  },
  {
    name: AppRoute.run,
    path: "/run",
    view: React.lazy(() => import("./pages/Run")),
  },
  {
    name: AppRoute.faq,
    path: "/faq",
    view: React.lazy(() => import("./pages/FAQ")),
  },
  {
    name: AppRoute.notFound,
    path: "/404",
    view: React.lazy(() => import("./pages/NotFound")),
  },
];
