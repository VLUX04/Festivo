import React, { createContext, useContext, useState } from "react";

type RegistrationData = {
    username: string;
    name: string;
    email: string;
    password: string;
    accountType: string;
    bio: string;
    location: string;
    preferences: string[];
};

type RegistrationContextType = {
    data: RegistrationData;
    saveRegistration: (fields: Partial<RegistrationData>) => void;
};

const defaultData: RegistrationData = {
    username: "",
    name: "",
    email: "",
    password: "",
    accountType: "",
    bio: "",
    location: "",
    preferences: [],
};

const RegistrationContext = createContext<RegistrationContextType | null>(null);

export const RegistrationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [data, setData] = useState<RegistrationData>(defaultData);

    const saveRegistration = (fields: Partial<RegistrationData>) => {
        setData(prev => ({ ...prev, ...fields }));
    };

    return (
        <RegistrationContext.Provider value={{ data, saveRegistration }}>
            {children}
        </RegistrationContext.Provider>
    );
};

export const useRegistration = () => {
    const context = useContext(RegistrationContext);
    if (!context) throw new Error("useRegistration must be used inside RegistrationProvider");
    return context;
};
