import  { useState } from "react";
import axios from "axios";

const OtpModal = ({ email, backendUrl, onClose, onVerified }) => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const verify = async () => {
    try {
      setLoading(true);
      const { data } = await axios.post(`${backendUrl}/api/user/register/verify-otp`, { email, otp });
      setLoading(false);
      if (data.success) {
        // token returned
        localStorage.setItem("token", data.token);
        onVerified && onVerified(data.token);
      } else {
        alert(data.message || "Invalid OTP");
      }
    } catch (err) {
      setLoading(false);
      alert(err.message);
    }
  };

  const resend = async () => {
    try {
      await axios.post(`${backendUrl}/api/user/register/resend-otp`, { email });
      alert("OTP resent");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white p-6 rounded-lg w-96 shadow-lg">
        <h3 className="text-lg font-semibold mb-2">Enter verification code</h3>
        <p className="text-sm text-gray-600 mb-4">OTP sent to {email}</p>
        <input value={otp} onChange={(e) => setOtp(e.target.value)} className="w-full border p-2 rounded" />
        <div className="flex justify-between mt-4">
          <button onClick={resend} className="text-sm text-gray-600">Resend</button>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-3 py-1 border rounded">Cancel</button>
            <button onClick={verify} disabled={loading} className="px-3 py-1 bg-customPrimary text-white rounded">
              {loading ? "Verifying..." : "Verify"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OtpModal;
