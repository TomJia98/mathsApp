export const loginAPI = async (userData) => {
  const loginRequest = await fetch("/user/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });

  return loginRequest;
};

export const signup = async (newUserData) => {
  const signupRequest = await fetch("/user/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newUserData),
  });

  return signupRequest;
};
