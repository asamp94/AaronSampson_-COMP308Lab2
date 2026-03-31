import { createContext, useContext, useState, useEffect } from 'react';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';

const ME = gql`
  query Me {
    me {
      id
      userName
      email
      role
    }
  }
`;

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);

  const { data, loading } = useQuery(ME, {
    fetchPolicy: 'network-only',
  });

  useEffect(() => {
    if (data?.me) {
      setCurrentUser(data.me);
    } else {
      setCurrentUser(null);
    }
  }, [data]);

  return (
    <AuthContext.Provider value={{ currentUser, setCurrentUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);