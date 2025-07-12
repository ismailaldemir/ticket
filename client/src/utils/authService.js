const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      "x-auth-token": token,
    },
  };
};

export default { getAuthHeader };
