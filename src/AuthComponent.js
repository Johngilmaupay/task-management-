import React, { useState } from "react";
import { signUp, login, logout } from "./auth";

const AuthComponent = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async () => {
    try {
      const user = await signUp(email, password);
      alert(`User Created: ${user.email}`);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleLogin = async () => {
    try {
      const user = await login(email, password);
      alert(`Logged in as: ${user.email}`);
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h2>Firebase Authentication</h2>
      <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
      <button onClick={handleSignup}>Sign Up</button>
      <button onClick={handleLogin}>Log In</button>
      <button onClick={logout}>Log Out</button>
    </div>
  );
};

export default AuthComponent;
