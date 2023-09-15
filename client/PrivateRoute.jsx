import { useContext, useLayoutEffect } from "react";
import { UserContext } from "./Context/UserContext";
import { useNavigate } from "react-router-dom";

function PrivateRoute({ children }) {
  const { userInfo } = useContext(UserContext);
  const navigate = useNavigate();

  useLayoutEffect(() => {
    if (!userInfo) {
      navigate("/login", { replace: true });
    }
  }, [userInfo]);

  if (userInfo && Object.keys(userInfo).length !== 0) {
    return children;
  }

  return null;
}

export default PrivateRoute;
