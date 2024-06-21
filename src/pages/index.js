import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import { Typewriter } from 'react-simple-typewriter';
import WaveAnimate from '../components/WaveAnimate'
import Loading from '../components/Loading';
import Image from 'next/image';
import triangleSvg from '../../public/triangle.svg';

export default function Home() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const authAreaRef = useRef(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ページが完全にロードされたら、loading を false に設定
    const handleComplete = () => setLoading(false);
    if (document.readyState === 'complete') {
      handleComplete();
    } else {
      window.addEventListener('load', handleComplete);
      return () => window.removeEventListener('load', handleComplete);
    }
  }, []);

  useEffect(() => {
    if (!loading && authAreaRef.current) {
      requestAnimationFrame(() => {
        if (authAreaRef.current) {
          authAreaRef.current.classList.add('fade-Up');
        }
      });
    }
  }, [loading]);

  if (currentUser) {
    router.push('/Graph');
    return null;
  }

  if (loading) {
      return (
        <>
            <div className='auth_wrap'>
                <Loading />
            </div>
        </>
    )
  }

  return (
    <div className='auth_wrap'>
      <Image src={triangleSvg} alt='triangleSvg' className='triangle_wrap' />
      <div className='auth_area wel' ref={authAreaRef}>
        <h1><Typewriter
          words={['Wellcome to', 'SwinSightS']}
          loop={1}
          cursor
          cursorStyle='|'
          typeSpeed={150}
          deleteSpeed={100}
          delaySpeed={800}
          cursorClassName="typewriter-cursor"
        /></h1>
        <Link href='/Login' className='links animate'><span></span>Login</Link>
        <p style={{ color: '#8185ab' }}>- or -</p>
        <Link href='/Signup' className='links animate'><span></span>Sign up</Link>
      </div>
      <WaveAnimate />
    </div>
  );
}