import React from 'react';
import Link from '../link/Link';
import { FaCanadianMapleLeaf, FaHeart } from "react-icons/fa";

export const Footer = () => (
  <footer className="footer">
    <div className="footer__content">
      <p>© {new Date().getFullYear()} Wealthwise is made with <FaHeart className="heart" /> in <FaCanadianMapleLeaf className="canada" title="Canada" /> by <Link
        href="https://radekstepan.com" target="_new">Radek Stepan</Link>
      </p>
      <p>Open source under MIT License</p>
      <p className="footer__email">Contact: hello@wealth<span>simple</span>wi.se<span>curity</span></p>
    </div>
  </footer>
);
