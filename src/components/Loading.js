import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
// import loading from '../../public/loading.json';
import triangle from '../../public/triangle.json';

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
            <Lottie animationData={triangle} />
        </div>
    )
};

export default Loading;