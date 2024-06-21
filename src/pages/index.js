import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import { Typewriter } from 'react-simple-typewriter';
import WaveAnimate from '../components/WaveAnimate'
import triangle from '../../public/triangle';
import Image from 'next/image';
import triangleSvg from '../../public/triangle.svg';

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
            <p style={{color: '#8185ab'}}>- or -</p>
            <Link href='/Signup' className='links animate'><span></span>Sign up</Link>
        </div>
        <WaveAnimate />
    </div>
  );
}