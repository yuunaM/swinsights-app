import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import loading from '../../public/loading.json';

const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

const Loading = () => {
    const [animate, setAnimate] = useState(false);

    useEffect(() => {
        setAnimate(true);
    }, []);

    if (!animate) {
        return null;
    }
  
    return (
        <div className='loading_wrap'>
            <Lottie animationData={loading} />
        </div>
    )
};

export default Loading;