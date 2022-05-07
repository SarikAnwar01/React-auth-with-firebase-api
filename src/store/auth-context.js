import React, { useState, useEffect, useCallback } from 'react';

let logoutTimer;

const AuthContext = React.createContext({
    token: "",
    isLoggedIn: false,
    login: (token) => { },
    logout: () => { },
});

const calculateRemainingTime = (expirationTate) => {
    const currentTime = new Date().getTime();
    const adjExpirationTime = new Date(expirationTate).getTime();

    const remainingTimeDuration = adjExpirationTime - currentTime;

    return remainingTimeDuration;
};

const retriveStoredToken = () => {
    const storedToken = localStorage.getItem("token");
    const storedExpirationDuration = localStorage.getItem("expirationTime");
    const remainingTime = calculateRemainingTime(storedExpirationDuration);
    if (remainingTime <= 60000) {
        localStorage.removeItem("token");
        localStorage.removeItem("expirationTime");
        return null;
    }
    return {
        token: storedToken,
        expirationTime: remainingTime
    };

};

export const AuthContextProvider = (props) => {
    const tokenData = retriveStoredToken();
    let initialToken;
    if (tokenData) {

        initialToken = tokenData.token;
    }
    const [token, setToken] = useState(initialToken);
    const userIsLoggedIn = !!token;

    const logoutHandler = useCallback(() => {
        setToken(null);
        localStorage.removeItem("token");
        localStorage.removeItem("expirationTime");
        if (logoutTimer) {
            clearTimeout(logoutTimer);
        }
    }, []);
    const loginHandler = (token, expirationTime) => {

        setToken(token);

        localStorage.setItem("token", token);
        localStorage.setItem("expirationTime", expirationTime);
        const remainingTime = calculateRemainingTime(expirationTime);
        logoutTimer = setTimeout(logoutHandler, remainingTime);


    };

    useEffect(() => {

        if (tokenData) {
            console.log(tokenData.expirationTime);
            logoutTimer = setTimeout(logoutHandler, tokenData.expirationTime);
        }
    }, [tokenData, logoutHandler]);

    const contextValue = {
        token: token,
        isLoggedIn: userIsLoggedIn,
        login: loginHandler,
        logout: logoutHandler,
    };

    return (<AuthContext.Provider value={contextValue}>
        {props.children}
    </AuthContext.Provider>);
};
export default AuthContext;
