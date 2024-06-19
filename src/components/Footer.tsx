import React from 'react';
import { signOut } from 'firebase/auth';
import { useAuth } from '../context/AuthContext';
import { auth } from '../config/firebase';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Footer() {
    const { currentUser } = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
        try {
          await signOut(auth);
        } catch (error) {
          console.error("Error signing out: ", error);
        }
    };

    if (!currentUser) { 
        return null;
    }

    return (
        <div className='footer'>
            <Link href='/Login' onClick={handleLogout} className='logout'>Log out</Link>
        </div>
    );
}
