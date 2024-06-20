import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../config/firebase';

// AuthContextの作成
const AuthContext = createContext(undefined);
// createContext関数を使って'AuthContext'と言うコンテキストを上記のAuthContextProps型に従って作成。
// <>内は型式で'AuthContextProps'型か、'undefined'のどちらかになる。初期値はundefined。


export const useAuth = () => {
  const context = useContext(AuthContext); // AuthContextの情報を取得しcontextに格納
  if (!context) { // contextが存在しなければエラーを返す
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context; //最後にcontextの情報を返す
};


// ユーザーログイン状態の監視
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null); // currentUser stateを定義し、初期値を'null'に設定

  useEffect(() => {
    // onAuthStateChanged関数を使って認証状態が変化した時に実行
    // たとえばユーザーBがログインに成功すると認証状態が変更になり、 引数'user'にはユーザーBの認証情報が渡る
    const unsubscribe = onAuthStateChanged(auth, (user) => { // 引数'user'にはFirebase Authenticationのオブジェクトである'User'もしくはnullが入る
      setCurrentUser(user); // 'currentUser' stateを更新
    });
    return () => unsubscribe(); // クリーンアップ
  }, []);

  return (
    // 'currentUser' stateをAuthContextに渡す
    <AuthContext.Provider value={{ currentUser }}> 
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };