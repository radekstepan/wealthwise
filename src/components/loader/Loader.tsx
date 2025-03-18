import React, { useEffect, useState } from "react";
import "./loader.less";

const Loader: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    return () => setIsVisible(false);
  }, []);

  return (
    <div className={`loading ${isVisible ? "visible" : ""}`}>
      <div className="spinner" />
    </div>
  );
};

export default Loader;
