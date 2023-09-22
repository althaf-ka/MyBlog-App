import { GoogleLogin } from "@react-oauth/google";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./GoogleAuth.css";
import axios from "../../../config/axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function GoogleAuth({ action, setUserInfo, setErrMessage }) {
  const navigate = useNavigate();
  const handleGoogleResponse = async credentialResponse => {
    try {
      if (action === "register") {
        const response = await axios.post(
          "/users/google/auth",
          credentialResponse
        );
        if (response.status === 200) {
          toast.success("Successfully Signed Up");
          navigate("/login");
        }
      } else if (action === "login") {
        axios.defaults.withCredentials = true;
        const response = await axios.post(
          "/users/google/login",
          credentialResponse
        );

        if (response.data.email) {
          const { _id, email, name } = response.data;
          setUserInfo({ _id, email, name });
          navigate("/");
        }
      }
    } catch (err) {
      console.log(err);
      setErrMessage(err.response.data);
      toast.error(err.response.data);
    }
  };

  const handleGoogleError = () => {
    toast.error("Error in Google Login");
  };

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <GoogleLogin
        onSuccess={handleGoogleResponse}
        onError={handleGoogleError}
        useOneTap
      />
    </GoogleOAuthProvider>
  );
}

export default GoogleAuth;
