'use client';
import {
  createContext,
  useContext,
  useState,
  useEffect,
  Dispatch,
  SetStateAction,
  ReactNode
} from 'react';
interface UserContextType {
  profileUrl: string;
  setProfileUrl: Dispatch<SetStateAction<string>>;
  tempUserName: string;
  setTempUsername: Dispatch<SetStateAction<string>>;
}
const UserContext = createContext<UserContextType>({
  profileUrl: '',
  setProfileUrl: () => {},
  tempUserName: '',
  setTempUsername: () => {}
});
type UserContextProviderProps = {
  children: ReactNode;
};
export const UserContextProvider: React.FC<UserContextProviderProps> = ({
  children
}) => {
  const [profileUrl, setProfileUrl] = useState<string>('');
  const [tempUserName, setTempUsername] = useState<string>('');

  return (
    <UserContext.Provider
      value={{
        tempUserName,
        setTempUsername,
        profileUrl,
        setProfileUrl
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => useContext(UserContext);
