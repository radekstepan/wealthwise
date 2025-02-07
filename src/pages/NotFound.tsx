import React, { useEffect } from "react";

const NotFound: React.FC = () => {
  useEffect(() => {
    document.title = "404";
  }, []);

  return (
    <div className="flex">
      404
    </div>
  )
};

export default NotFound;
