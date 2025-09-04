import { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";

export default function OAuthCallback() {
  const { setToken } = useContext(AppContext);
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      // Save token locally
      localStorage.setItem("token", token);
      setToken(token);

      // Redirect to home or dashboard
      navigate("/", { replace: true });
    } else {
      // If no token found, send user back to login
      navigate("/login", { replace: true });
    }
  }, [setToken, navigate]);

  return (
    <div className="flex h-screen items-center justify-center">
      <p className="text-lg text-gray-700 animate-pulse">
        Logging you in...
      </p>
    </div>
  );
}
