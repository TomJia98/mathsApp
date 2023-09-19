import React, { useState } from "react";
import { Link } from "react-router-dom";
import Modal from "react-modal";

const Login = ({ isOpen, onClose }) => {
  const [usernameState, setUsernameState] = useState("");
  const [passwordState, setPasswordState] = useState("");

  const handleFormSubmit = () => {
    console.log(usernameState);
    console.log(passwordState);
  };

  return (
    <Modal isOpen={isOpen} contentLabel="Login" onRequestClose={onClose}>
      <h2>this is the modal</h2>

      <label>
        Username :{" "}
        <input
          type="text"
          id="username"
          onChange={(e) => setUsernameState(e.target.value)}
        ></input>
      </label>
      <br />
      <label>
        Password :{" "}
        <input
          type="password"
          id="password"
          onChange={(e) => setPasswordState(e.target.value)}
        ></input>
      </label>
      <br />
      <button onClick={handleFormSubmit}>Log In</button>
      <button>Sign Up</button>
      <button onClick={onClose}>close</button>
      <></>
    </Modal>
  );
};

export default Login;
