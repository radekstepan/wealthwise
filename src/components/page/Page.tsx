import React from 'react';
import { Router, Route } from "wouter";
import {routes, AppRoute} from "../../routes";
import RemountProvider from "../../providers/RemountProvider";
import Loader from "../loader/Loader";
import Link from '../link/Link';
import './page.less';

function Page() {
  return (
    <RemountProvider>
      <div className="page">
        <div className="topbar">
          <div className="logo">wealthwise</div>
          <div className="nav">
            <Link routeName={AppRoute.run}>Simulator</Link>
            <Link routeName={AppRoute.home}>Overview</Link>
            <Link href="#">Changelog</Link>
            <Link href="#">Issues</Link>
            <Link href="#">Source Code</Link>
          </div>
        </div>
        <React.Suspense fallback={<Loader />}>
          <Router>
            {routes.map((route) => (
              <Route key={route.name} path={route.path} component={route.view} />
            ))}
          </Router>
        </React.Suspense>
      </div>
    </RemountProvider>
  );
}

export default Page;
