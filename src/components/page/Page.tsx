import React from 'react';
import { Router, Route } from "wouter";
import {routes, AppRoute} from "../../routes";
import RemountProvider from "../../providers/RemountProvider";
import Loader from "../loader/Loader";
import Link from '../link/Link';
import { Footer } from '../footer/Footer';
import './page.less';

function Page() {
  return (
    <RemountProvider>
      <div className="wrapper">
        <div className="topbar">
          <div className="logo">wealthwise</div>
          <div className="nav">
            <Link routeName={AppRoute.home}>Overview</Link>
            <Link routeName={AppRoute.run} className="run">Simulator</Link>
            <Link routeName={AppRoute.faq}>FAQ</Link>
            <Link href="https://github.com/radekstepan/wealthwise" target="_new">Source Code</Link>
          </div>
        </div>
        <React.Suspense fallback={<Loader />}>
          <Router>
            <div className="page">
              {routes.map((route) => (
                <Route key={route.name} path={route.path} component={route.view} />
              ))}
            </div>
          </Router>
          <Footer />
        </React.Suspense>
      </div>
    </RemountProvider>
  );
}

export default Page;
