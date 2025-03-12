// 密码验证状态管理
const TOKEN_KEY = 'auth_token';
const EXPIRATION_TIME = 30 * 60 * 1000; // 30分钟过期

export const setPasswordToken = () => {
  const token = {
    timestamp: Date.now(),
    expires: Date.now() + EXPIRATION_TIME
  };
  localStorage.setItem(TOKEN_KEY, JSON.stringify(token));
};

export const checkPasswordToken = () => {
  const tokenStr = localStorage.getItem(TOKEN_KEY);
  if (!tokenStr) return false;

  try {
    const token = JSON.parse(tokenStr);
    if (Date.now() > token.expires) {
      localStorage.removeItem(TOKEN_KEY);
      return false;
    }
    return true;
  } catch {
    localStorage.removeItem(TOKEN_KEY);
    return false;
  }
};

export const clearPasswordToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};