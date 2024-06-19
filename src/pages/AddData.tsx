import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import Footer from "../components/Footer";
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import Modal from 'react-modal';
import { db } from '../config/firebase';
import dynamic from 'next/dynamic';
import success from '../../public/success.json';
import Loading from '../components/Loading';

Modal.setAppElement('#__next');
const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

export default function AddData() {
    const { currentUser } = useAuth();
    const router = useRouter();
    const [contactType, setContactType] = useState(''); // 問い合わせ種類
    const [source, setSource] = useState(''); // 流入元
    const [genre, setGenre] = useState(''); //商品タイプ
    const [amount, setAmount] = useState(''); // 売上
    const [cost, setCost] = useState(''); // 仕入れ
    const [profit, setProfit] = useState(''); // 粗利
    const [modalIsOpen, setModalIsOpen] = useState(false); // モーダル用
    const [isFormValid, setIsFormValid] = useState(false); // 送信ボタン
    const [modalMessage, setModalmessage] = useState('') // モーダル内メッセージ
    const [isLottie, setIsLottie] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!currentUser) { // もしログインしていなければ
            router.push('/Login'); // ログインページにリダイレクト
        }
    }, [currentUser, router]);

    useEffect(() => {
        setIsLottie(true);
    },[]);

    // 全ての項目が入力されれば送信ボタンが押せる
    useEffect(() => {
        if (contactType && source && genre && amount && cost && profit) {
            setIsFormValid(true);
        } else {
            setIsFormValid(false);
        }
    },[contactType, source, genre, amount, cost, profit]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (contactType) {
                // 問い合わせ方法の追加
                await addDoc(collection(db, 'data', 'by_contact', 'contact_sub'), {
                    contactType: contactType,
                    userId: currentUser.uid,
                    createdAt: serverTimestamp()
                });

                // 流入元別の粗利の追加
                if (source && profit) {
                    await addDoc(collection(db, 'data', 'source_profit', 'profit'), {
                        source: source,
                        profit: parseFloat(profit),
                        createdAt: serverTimestamp(),
                        userId: currentUser.uid
                    });
                }

                // アイテムジャンル別の粗利の追加
                if (genre && profit) {
                    await addDoc(collection(db, 'data', 'genre_profit', 'profit'), {
                        genre: genre,
                        profit: parseFloat(profit),
                        createdAt: serverTimestamp(),
                        userId: currentUser.uid
                    });
                }

                // Profit rateへの追加
                if (amount && cost && profit) {
                    await addDoc(collection(db, 'data', 'ProfitRate', 'ProfitRate_sub'), {
                        amount: parseFloat(amount),
                        cost: parseFloat(cost),
                        profit: parseFloat(profit),
                        userId: currentUser.uid,
                        createdAt: serverTimestamp()
                    });
                }

                // フォームをリセット
                setContactType('');
                setSource('');
                setGenre('');
                setAmount('');
                setCost('');
                setProfit('');
                setModalmessage('The data has been reflected in the graph！');

            } else {
                console.error('Form fields cannot be empty');
            }
        } catch (error) {
            setModalmessage('Error adding document');
        } finally {
            setLoading(false);
        }

        setModalIsOpen(true);
    };

    const handlemove = () => {
        router.push('/Graph');
        setModalIsOpen(false);
    };

    // 認証が確認されるまでコンテンツをレンダリングしない
    if (!currentUser) {
        return null;
    }

    return (
        <div className='wrap'>
            {loading ? (
                <Loading />
            ) : (
                <>
                    <div className='flex header'>
                        <h2>Add your Data</h2>
                        <button onClick={handlemove} className='animate'><span></span>Back</button>
                    </div>
                    <form onSubmit={handleSubmit} className='addData_form' >
                        <div>
                            <h4>Contact Type</h4>
                            <p>
                                <label>
                                    <input type='radio' name='contact_type' value='Call' onChange={(e) => setContactType(e.target.value)} checked={contactType === 'Call'} />Call
                                </label>
                                <label>
                                    <input type='radio' name='contact_type' value='Mail' onChange={(e) => setContactType(e.target.value)} checked={contactType === 'Mail'} />Mail
                                </label>
                                <label>
                                    <input type='radio' name='contact_type' value='Visit' onChange={(e) => setContactType(e.target.value)} checked={contactType === 'Visit'} />Visit
                                </label>
                            </p>
                        </div>
                        <div>
                            <h4>Contact Source</h4>
                            <p>
                                <label>
                                    <input type='radio' name='source' value='Facebook' onChange={(e) => setSource(e.target.value)} checked={source === 'Facebook'} />Facebook
                                </label>
                                <label>
                                    <input type='radio' name='source' value='ikkman' onChange={(e) => setSource(e.target.value)} checked={source === 'ikkman'} />ikkman.lk
                                </label>
                                <label>
                                    <input type='radio' name='source' value='Shop' onChange={(e) => setSource(e.target.value)} checked={source === 'Shop'} />Shop
                                </label>
                            </p>
                        </div>
                        <div>
                            <h4>Item Genre</h4>
                            <p>
                                <label>
                                    <input type='radio' name='genre' value='Parts' onChange={(e) => setGenre(e.target.value)} checked={genre === 'Parts'} />Parts
                                </label>
                                <label>
                                    <input type='radio' name='genre' value='Gem' onChange={(e) => setGenre(e.target.value)} checked={genre === 'Gem'} />Gem
                                </label>
                            </p>
                        </div>
                        <div>
                            <h4>Amount</h4>
                            <input type='number' value={amount} onChange={(e) => setAmount(e.target.value)} />
                        </div>
                        <div>
                            <h4>Cost</h4>
                            <input type='number' value={cost} onChange={(e) => setCost(e.target.value)} />
                        </div>
                        <div>
                            <h4>Profit</h4>
                            <input type='number' value={profit} onChange={(e) => setProfit(e.target.value)} />
                        </div>
                    </form>
                    <button type='submit' onClick={handleSubmit} disabled={!isFormValid} className='submit_btn animate'><span></span>Send Data</button>
                    <Modal isOpen={modalIsOpen} onRequestClose={handlemove}>
                        <h3>Success!</h3>
                        <p className='modal_ttr'>{modalMessage}</p>
                        <p className='lottie_wrap'><Lottie animationData={success} loop={false} /></p>
                        <button onClick={handlemove} className='animate'><span></span>Go to Graphpage</button>
                    </Modal>
                    <Footer />
                </>
            )}
        </div>
    );
}


