import React, { useState } from "react";
import { Link } from "react-router-dom";

const Landing = () => {
  let [formState, setFormState] = useState({
    username: "",
    password: "",
  });

  return <div id="landing"></div>;
};

export default Landing;
