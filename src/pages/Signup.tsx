import React, { useState, useContext } from 'react';
import { auth } from '../config/firebase';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import WaveAnimate from '../components/WaveAnimate';
import Loading from '../components/Loading';

export default function Signup() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { currentUser } = useAuth(); // AuthContext.Providerから渡された'currentUser'(つまりログイン中のユーザーの情報)を取得
    const router = useRouter(); // useRouterフックを使ってルーターオブジェクトを取得

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(false);
        try {
            const { user } = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(user, { displayName: name });
            router.push('/Graph');
        } catch (error) {
            console.error("Error logging in: ", error);
        } finally {
            setLoading(false);
        }
    }

    if (currentUser) {
        router.push('/Graph');
        return null;
    }

    return (
        <div className='auth_wrap'>
            {loading ? (
                <Loading />
            ) : (
                <>
                    <div className='auth_area'>
                        <h2>Sign UP</h2>
                        <form onSubmit={handleSubmit}>
                            <div>
                                <label>email</label>
                                <input
                                    type='email'
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder='email'
                                />
                            </div>
                            <div>
                                <label>password</label>
                                <input
                                    type='password'
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder='password'
                                />
                            </div>
                            <div>
                                <label>name</label>
                                <input
                                    type='text'
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder='user name'
                                />
                            </div>
                            <button type='submit' className='animate'><span></span>Sign UP</button>
                        </form>
                        <p><Link href='/' className='txt_link'>Back</Link></p>
                    </div>
                    <WaveAnimate />
                </>
            )}
        </div>
    );
}