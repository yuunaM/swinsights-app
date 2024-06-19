import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Doughnut } from 'react-chartjs-2';
import {Chart, ArcElement} from 'chart.js'

Chart.register(ArcElement);

export default function SourceGraph() {
    const [SourceData, setSourceData] = useState([]);

    useEffect(() => {
        fetchSourceData();
    },[]);

    // dbからデータを取得
    const fetchSourceData = async () => {
        try {
            const onSnapshot = await getDocs(collection(db, 'data', 'source_profit', 'profit'));
            const graphData = onSnapshot.docs.map((doc) => {
                return {
                    source: doc.data().source
                };
            });
            const totalData = totalValCal(graphData);
            setSourceData(totalData);
        } catch (erro) {
            console.log(erro);
        }
    }

    // 各値の合計値を算出
    const totalValCal = (data) => {
    let totals = {};

        data.forEach((item) => {
            if (!totals[item.source]) {
                totals[item.source] = 0; // 初回はtotals配列に各item.source(ここではFacebook, ikkuman, Shop)をキーとして追加し、値を0に設定
            }
            totals[item.source] += 1; // totals[Facebook], totals[ikkuman], totals[Shop]それぞれのキーをカウント
        });

        return totals;
    };

    // データ配列を値とキーに分ける
    // Chart.jsを扱うためにはこの作業は必須
    const labels = Object.keys(SourceData); // キー
    const dataValues = Object.values(SourceData); // 値

    return (
        <div className='graph_wrap'>
            <div className='flex graph_head'>
                <h3>Source<span>(Total)</span></h3>
            </div>
        {dataValues.reduce((a, b) => a + b, 0) > 0 ? (
            <div className='donut'>
                <Doughnut
                    data={{
                        labels: labels, // X軸用ラベル
                        datasets: [{
                            label: 'Source Profit',
                            data: dataValues,
                            backgroundColor: ['#59f2c7', '#41afce', '#2f7cd4'],
                            borderColor: 'rgba(255, 255, 255, 0)',
                            borderWidth: 1,
                        }],
                    }}
                    options={{
                        plugins: {
                            legend: {
                                labels: {
                                    color: '#8185ab' 
                                }
                            },
                            tooltip: {
                                titleColor: '#fff', // ツールチップのタイトルカラー
                                bodyColor: '#fff', // ツールチップの本文カラー
                                backgroundColor: 'rgba(0, 0, 0, 0.7)', // ツールチップの背景色
                            }
                        }
                    }}
                />
            </div>
        ) : (
            <p style={{ color: '#8185ab' }}>Loading data...</p>
        )}
        </div>
    );
}