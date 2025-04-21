import Cookies from 'js-cookie';

export const setUserSession = (token, user) => {
    Cookies.set('isLogged', token, { expires: 1 / 48 });
    Cookies.set('user', JSON.stringify(user), { expires: 1 / 48 });
};

export const getUser = () => {
    const user = Cookies.get('user');
    return user ? JSON.parse(user) : null;
};

export const getToken = () => Cookies.get('isLogged');

export const clearSession = () => {
    Cookies.remove('isLogged', {path: '/'});
    Cookies.remove('user', {path: '/'});
};
