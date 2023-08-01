import React, { useState } from "react";
import Login from "../components/login.js";
import { Link } from "react-router-dom";

const Landing = () => {
  // let [formState, setFormState] = useState({
  //   username: "",
  //   password: "",
  // });

  let [loginState, setLoginState] = useState(false);

  const openModal = () => {
    setLoginState(true);
  };

  const closeModal = () => {
    setLoginState(false);
  };
  return (
    <div id="landing">
      <h1>This is the landing page</h1>
      <Login isOpen={loginState} onClose={closeModal} />
      <button onClick={openModal}>Login</button>
    </div>
  );
};

export default Landing;
