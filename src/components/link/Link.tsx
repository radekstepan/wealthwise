import React, { ReactNode, useCallback } from "react";
import {useRemount} from "../../hooks/useRemount";
import {useRouter} from "../../hooks/useRouter";
import { type AppRoute, type RouteParams } from "../../routes";
import { cls } from "../../utils/css";
import "./link.less";

interface Props<T = AppRoute> {
  /** The name of the route to navigate to. If provided, the component will render an anchor that links to the specified route. */
  routeName?: AppRoute;
  /** An object containing the parameters to use when navigating to the route. */
  state?: T extends AppRoute ? RouteParams[T] : undefined;
  /** The URL to navigate to. If provided, the component will render an anchor that links to the specified URL. */
  href?: string;
  /** A callback function that will be called when the link is clicked. */
  onClick?: (evt: unknown) => void;
  /** The content of the link. */
  children: ReactNode;
  /** Any additional props will be spread to the underlying anchor element. */
  [key: string]: unknown;
}

const Link: React.FC<Props> = ({
  routeName,
  href,
  state,
  onClick,
  children,
  ...rest
}) => {
  const { goTo, getHref } = useRouter();
  const remount = useRemount();
  const active = routeName !== undefined && window.location.pathname === getHref(routeName, state);

  const $onClick = useCallback(
    (evt: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
      if (!routeName && !onClick) {
        return;
      }
      evt.preventDefault();

      if (routeName) {
        // Force reload of this page.
        const pathName = getHref(routeName, state);
        if (window.location.pathname === pathName) {
          remount();
        } else {
          goTo(routeName, state);
        }
      }
      if (onClick) {
        onClick(evt);
      }
    },
    [goTo, onClick]
  );

  return (
    <a
      className={cls("link", active && "active")}
      href={routeName !== undefined ? getHref(routeName, state) : href}
      onClick={$onClick}
      target={href ? "_blank" : undefined}
      {...rest}
    >
      {children}
    </a>
  );
};

export default Link;
