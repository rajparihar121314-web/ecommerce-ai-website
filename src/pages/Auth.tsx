import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export default function Auth() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrorMsg("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      setErrorMsg("Invalid email or password");
    } else {
      navigate("/");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-black">

      <form
        onSubmit={handleLogin}
        className="bg-neutral-900 p-8 rounded-xl w-96 space-y-5"
      >

        <h1 className="text-3xl font-bold text-center text-white">
          Welcome Back
        </h1>

        <p className="text-center text-gray-400">
          Sign in to your account
        </p>

        {errorMsg && (
          <p className="text-red-500 text-center text-sm">
            {errorMsg}
          </p>
        )}

        <div>
          <label className="text-sm text-gray-300">Email</label>
          <input
            type="email"
            placeholder="you@example.com"
            className="w-full mt-1 p-3 rounded bg-neutral-800 text-white"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="text-sm text-gray-300">Password</label>
          <input
            type="password"
            placeholder="******"
            className="w-full mt-1 p-3 rounded bg-neutral-800 text-white"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="text-right">
          <a href="#" className="text-yellow-400 text-sm">
            Forgot Password?
          </a>
        </div>

        <button
          type="submit"
          className="w-full bg-yellow-500 text-black p-3 rounded font-semibold"
        >
          Sign In
        </button>

        <p className="text-center text-gray-400 text-sm">
          Don't have an account?{" "}
          <span className="text-yellow-400">Sign Up</span>
        </p>

      </form>

    </div>
  );
}