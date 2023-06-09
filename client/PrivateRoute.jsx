import React, { useContext, useLayoutEffect } from "react";
import { UserContext } from "./Context/UserContext";
import { useNavigate } from "react-router-dom";

function PrivateRoute({ children }) {
  const { userInfo } = useContext(UserContext);
  const navigate = useNavigate();

  useLayoutEffect(() => {
    if (!userInfo) {
      navigate("/login");
    }
  }, [userInfo]);
  return children;
}

export default PrivateRoute;
