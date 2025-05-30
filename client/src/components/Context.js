import React, { createContext, useState, useContext } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [loginUser, setLoginUser] = useState(null);
  sessionStorage.setItem('user', JSON.stringify(loginUser))
  const user = JSON.parse(sessionStorage.getItem('user'));


  return (
    <UserContext.Provider value={{ loginUser, setLoginUser, user }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
