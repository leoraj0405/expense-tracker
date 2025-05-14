import React, { createContext, useState, useContext } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [loginUser, setLoginUser] = useState(null);

  return (
    <UserContext.Provider value={{ loginUser, setLoginUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
