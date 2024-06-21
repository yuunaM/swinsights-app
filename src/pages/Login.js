import React, { useState, useEffect, useRef } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';
import Link from 'next/link';
import { AuthContext } from '../context/AuthContext';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import WaveAnimate from '../components/WaveAnimate';
import Loading from '../components/Loading';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { currentUser } = useAuth(); // AuthContext.Providerから渡された'currentUser'(つまりログイン中のユーザーの情報)を取得
    const authAreaRef = useRef(null);
    const router = useRouter(); // useRouterフックを使ってルーターオブジェクトを取得

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password); // 入力された情報をFirebase authに照会し、一致するユーザー情報があるか確認
            router.push('/Graph'); // ログインできればGraphへ移動
        } catch (error) {
            console.error("Error logging in: ", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (currentUser) { // 既存ログインユーザーはGraphへ移動
            router.push('/Graph');
        }
    }, [currentUser, router]);

    useEffect(() => {
        if (authAreaRef.current) {
            requestAnimationFrame(() => {
                if (authAreaRef.current) {
                    authAreaRef.current.classList.add('fade-Up');
                }
            });
        }
    }, []);

    if (currentUser) {
        return null;
    }

    return (
        <div className='auth_wrap'>
            {loading ? (
                <Loading />
            ) : (
                <>
                    <div className='auth_area' ref={authAreaRef}>
                        <h2>Log In</h2>
                        <form onSubmit={handleSubmit}>
                            <div>
                                <label>email</label>
                                <input
                                    type='email'
                                    id='email'
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder='email'
                                />
                            </div>
                            <div>
                                <label>password</label>
                                <input
                                    type='password'
                                    id='password'
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder='password'
                                />
                            </div>
                            <button className='animate'><span></span>Log in</button>
                            <p><Link href='/' className='txt_link'>Back</Link></p>
                        </form>
                    </div>
                    <WaveAnimate />
                </>
            )}
        </div>
    )
}

export default Login;
