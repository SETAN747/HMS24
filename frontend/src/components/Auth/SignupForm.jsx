import React from "react";
import { FaGoogle } from "react-icons/fa";

const SignupForm = ({
  name,
  email,
  password,
  setName,
  setEmail,
  setPassword,
  onSubmit,
  onSwitchToLogin,
  handleGoogleLogin,
}) => {
  return (
    <form onSubmit={onSubmit} className="min-h-[80vh] flex items-center">
      <div className="flex flex-col gap-3 m-auto items-center p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-zinc-600 text-sm shadow-lg">
        <p className="text-2xl font-semibold">Create Account</p>

        <button
          type="button"
          onClick={handleGoogleLogin}
          className="border border-zinc-300 w-full py-2 rounded-md text-base flex items-center justify-center gap-2 hover:bg-gray-100 transition"
        >
          <FaGoogle /> Sign up with Google
        </button>

        <p>Please sign up to book appointments</p>

        <div className="w-full">
          <p>Full Name</p>
          <input
            className="border border-zinc-300 rounded w-full p-2 mt-1"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="w-full">
          <p>Email</p>
          <input
            className="border border-zinc-300 rounded w-full p-2 mt-1"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="w-full">
          <p>Password</p>
          <input
            className="border border-zinc-300 rounded w-full p-2 mt-1"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className="bg-customPrimary text-white w-full py-2 rounded-md text-base"
        >
          Create Account
        </button>

        <p>
          Already have an account?{" "}
          <span
            onClick={onSwitchToLogin}
            className="text-customPrimary underline cursor-pointer"
          >
            Login here
          </span>
        </p>
      </div>
    </form>
  );
};

export default SignupForm;
