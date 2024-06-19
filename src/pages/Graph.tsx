import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import Footer from "../components/Footer";
import Genre_ProfitGraph from '../components/Genre_ProfitGraph';
import Source_ProritGraph from '../components/Source_ProritGraph';
import ContactTypeGraph from '../components/ContactTypeGraph';
import ProfitRateGraph from '../components/ProfitRateGraph';
import SourceGraph from '../components/SourceGraph';
import ItemGraph from '../components/ItemGraph';

export default function Graph() {
    const { currentUser } = useAuth(); // 認証ユーザー情報の取得
    const router = useRouter(); // routerをインストール

    useEffect(() => {
        if (!currentUser) {
            router.push('/Login');
        } 
    }, [currentUser, router]);

    if (!currentUser) {
        return null;
    }

    const handlemove = () => {
        router.push('/AddData');
    };
    
    return (
        <div className='wrap'>
            <div className='flex header'>
                <h2>KPI Graph</h2>
                <button onClick={handlemove} className='gotoadd animate'><span></span>Add Data</button>
            </div>
            <div className='min_flex'>
                <Genre_ProfitGraph />
                <Source_ProritGraph />
            </div>
            <div className='min_flex'>
                <ContactTypeGraph />
                <ProfitRateGraph />
            </div>
            <div className='min_flex'>
                <SourceGraph />
                <ItemGraph />
            </div>
            <Footer />
        </div>
    );
}
