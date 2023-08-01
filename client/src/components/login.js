import React, { useState } from "react";
import { Link } from "react-router-dom";
import Modal from "react-modal";

const login = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} contentLabel="Login" onRequestClose={onClose}>
      <h2>this is the modal</h2>
      <button onClick={onClose}>close</button>
    </Modal>
  );
};

export default login;
