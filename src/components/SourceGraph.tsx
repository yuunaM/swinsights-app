import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Doughnut } from 'react-chartjs-2';
import { Chart, ArcElement } from 'chart.js';

Chart.register(ArcElement);

export default function SourceGraph() {
    const [sourceData, setSourceData] = useState([]);

    useEffect(() => {
        fetchSourceData();
    }, []);

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
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }

    // 各値の合計値を算出し、配列として返す
    const totalValCal = (data) => {
        let totals = {};

        data.forEach((item) => {
            if (!totals[item.source]) {
                totals[item.source] = 0;
            }
            totals[item.source] += 1;
        });

        // オブジェクトから配列に変換する
        const dataArray = Object.keys(totals).map((key) => ({
            source: key,
            count: totals[key]
        }));

        return dataArray;
    };

    // データ配列を値とキーに分ける
    const labels = sourceData.map((item) => item.source);
    const dataValues = sourceData.map((item) => item.count);

    return (
        <div className='graph_wrap'>
            <div className='flex graph_head'>
                <h3>Source<span>(Total)</span></h3>
            </div>
            {dataValues.reduce((a, b) => a + b, 0) > 0 ? (
                <div className='donut'>
                    <Doughnut
                        data={{
                            labels: labels,
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
                                    titleColor: '#fff',
                                    bodyColor: '#fff',
                                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
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
