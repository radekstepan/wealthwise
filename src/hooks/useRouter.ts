import { useCallback, useMemo } from "react";
import { useLocation } from "wouter";
import UrlPattern from "url-pattern";
import { routes, AppRoute, type RouteParam, type RouteParams } from "../routes";

type UseRoute<Return, T = AppRoute> = (
  name: T,
  state?: T extends AppRoute ? RouteParams[T] : undefined
) => Return;

export const useRouter = () => {
  const [, setLocation] = useLocation();

  const getHref: UseRoute<string> = (name, state) => {
    const route = routes.find((r) => r.name === name);
    if (!route) {
      return getHref(AppRoute.notFound);
    }

    if (!state) {
      return route.path;
    }

    const pattern = new UrlPattern(route.path);
    return pattern.stringify(state);
  };

  const goTo: UseRoute<void> = useCallback(
    (name: AppRoute, state?: RouteParam) => {
      const path = getHref(name, state);
      setLocation(path);
    },
    [setLocation]
  );

  return useMemo(
    () => ({
      getHref,
      goTo,
    }),
    [goTo]
  );
};
