import React, { ReactNode, useCallback } from "react";
import { useRemount } from "../../hooks/useRemount";
import { useRouter } from "../../hooks/useRouter";
import { type AppRoute, type RouteParams } from "../../routes";
import { cls } from "../../utils/css";
import "./link.less";

interface Props<T = AppRoute> {
  /** If provided, the component will render an anchor linking to the specified route */
  routeName?: AppRoute;
  /** Parameters for the route */
  state?: T extends AppRoute ? RouteParams[T] : undefined;
  /** The URL to navigate to. If provided (and no routeName), the link renders as a normal anchor */
  href?: string;
  /** A callback invoked on click */
  onClick?: (evt: React.MouseEvent<HTMLAnchorElement>) => void;
  /** Link content */
  children: ReactNode;
  /** Additional props spread to the anchor element */
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

  // If a routeName is provided, compute the href using your router,
  // otherwise use the passed href.
  const computedHref = routeName !== undefined ? getHref(routeName, state) : href;
  
  const active =
    routeName !== undefined &&
    window.location.pathname === getHref(routeName, state);

  const handleClick = useCallback(
    (evt: React.MouseEvent<HTMLAnchorElement>) => {
      // Allow default behavior (e.g. opening in a new tab) if:
      // - modifier keys are pressed
      // - it's not a left-click (evt.button !== 0)
      if (
        evt.metaKey ||
        evt.ctrlKey ||
        evt.shiftKey ||
        evt.altKey ||
        evt.button !== 0
      ) {
        return;
      }
      
      // If neither a route nor a click callback was provided, do nothing.
      if (routeName === undefined && !onClick) {
        return;
      }

      evt.preventDefault();

      if (routeName !== undefined) {
        const pathName = getHref(routeName, state);
        // If the link points to the current page, force a remount.
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
    [routeName, getHref, state, remount, goTo, onClick]
  );

  return (
    <a
      className={cls("link", active && "active")}
      href={computedHref}
      onClick={handleClick}
      {...rest}
    >
      {children}
    </a>
  );
};

export default Link;
