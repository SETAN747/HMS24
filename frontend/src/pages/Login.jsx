import { useState, useEffect, useContext } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

import LoginForm from "../components/Auth/LoginForm";
import SignupForm from "../components/Auth/SignupForm";
import OtpModal from "../components/Auth/OtpModal";

const Login = () => {
  const { backendUrl, token, setToken } = useContext(AppContext);
  const navigate = useNavigate();

  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const [showOtpModal, setShowOtpModal] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");

  const handleGoogleLogin = () => {
    window.location.href = `${backendUrl}/api/user/google`;
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      if (mode === "signup") { 
        
        const { data } = await axios.post(`${backendUrl}/api/user/register`, {
          name,
          email,
          password,
        }); 
        
        if (data.success) {
          // toast.success("Account created successfully");
          // setMode("login");
          toast.success("OTP sent to your email");
          setPendingEmail(email);
          setShowOtpModal(true);
        } else toast.error(data.message);
      } else {
        const { data } = await axios.post(`${backendUrl}/api/user/login`, {
          email,
          password,
          
        });
        if (data.success) {
          localStorage.setItem("token", data.token);
          setToken(data.token); 
           navigate("/");
        } else toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  useEffect(() => {
    if (token) navigate("/");
  }, [token]);

  return (
    <>
      {" "}
      {mode === "signup" ? (
        <SignupForm
          name={name}
          email={email}
          password={password}
          setName={setName}
          setEmail={setEmail}
          setPassword={setPassword}
          onSubmit={onSubmitHandler}
          onSwitchToLogin={() => setMode("login")}
          handleGoogleLogin={handleGoogleLogin}
        />
      ) : (
        <LoginForm
          email={email}
          password={password}
          setEmail={setEmail}
          setPassword={setPassword}
          onSubmit={onSubmitHandler}
          onSwitchToSignup={() => setMode("signup")}
          handleGoogleLogin={handleGoogleLogin}
        />
      )}
      ; 
      {showOtpModal && (
        <OtpModal
          email={pendingEmail}
          backendUrl={backendUrl}
          onClose={() => setShowOtpModal(false)}
          onVerified={(token) => {
            setToken(token); // store token in context
            setShowOtpModal(false);
            navigate("/"); // redirect after verification
          }}
        />
      )}
    </>
  );
};

export default Login;
