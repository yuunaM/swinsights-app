import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import WaveAnimate from '../components/WaveAnimate'

export default function Home() {
    const { currentUser } = useAuth();
    const router = useRouter(); 
    const authAreaRef = useRef(null);
    
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
        router.push('/Graph');
        return null;
    }

  return (
      <div className='auth_wrap'>
         <div className='auth_area wel' ref={authAreaRef}>
            <h1>Wellcome to<br />SwinSightS</h1>
            <Link href='/Login' className='links animate'><span></span>Login</Link>
            <p style={{color: '#8185ab'}}>- or -</p>
            <Link href='/Signup' className='links animate'><span></span>Sign up</Link>
        </div>
        <WaveAnimate />
    </div>
  );
}