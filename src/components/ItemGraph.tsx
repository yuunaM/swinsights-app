import React, { useState, useEffect, useRef } from 'react';
import { collection, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Chart as ChartJS, Filler, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import moment from 'moment';

const getWeekStartDate = (date: Timestamp) => {
    // Timestamp情報をmoment式に変換し、その日が含まれる週の月曜日を返す。
    return moment(date).startOf('isoWeek').format('YYYY-MM-DD');
};

const getMonthStartDate = (date: Timestamp) => {
    return moment(date).startOf('month').format('YYYY-MM-DD');
};

const getYearStartDate = (date: Timestamp) => {
    return moment(date).startOf('year').format('YYYY-MM-DD');
};

ChartJS.register(CategoryScale, Filler, LinearScale, BarElement, Title, Tooltip, Legend);

export default function ItemGraph() {
    const [itemData, setItemData] = useState([]);
    const [itemLavel, setItemLavel] = useState([]);
    const [ItemPeriod, setItemPeriod] = useState('week');
    const chartRef = useRef(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const snapShot = await getDocs(collection(db, 'data', 'genre_profit', 'profit'));
                const dataSet = snapShot.docs.map(doc => {
                    if(doc.data().createdAt) {
                        return {
                            genre: doc.data().genre,
                            date: doc.data().createdAt.toDate()
                        }
                    }
                    return null; // Timestampフィールドが存在しない場合はnullを返す
                }).filter(item => item !== null); // Timestampフィールドが存在しない配列を除外
    
                const groupData = groupDataPeriod(dataSet, ItemPeriod);
                const labels = Object.keys(groupData).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
                const sortedData = labels.map(label => groupData[label]);
    
                setItemLavel(labels);
                setItemData(sortedData);
    
            } catch (erro) {
                console.log(erro);
            }
        }
        fetchData();
    }, [ItemPeriod])

    const GraphGradients = [
        { start: 'rgba(89, 242, 199, 1)', end: 'rgba(47, 114, 212, 1)', point: '#21e59c' }, // Gem用のグラデーション
        { start: 'rgba(242, 89, 89, 1)', end: 'rgba(121, 47, 212, 1)', point: '#f25989' }  // Parts用のグラデーション
    ];

    const groupDataPeriod = (data, period) => {
        const dayGroupdata = {};

        data.forEach(item => { // sourceData（profitサブコレ内のドキュメントの数だけループ処理）
            let key;
            const date = item.date;

            if (period === 'day') {
                key = moment(date).format('YYYY-MM-DD');
            } else if (period === 'week') {
                key = getWeekStartDate(date);
            } else if (period === 'month') {
                key = getMonthStartDate(date);
            } else if (period === 'year') {
                key = getYearStartDate(date);
            }
    
            if (!dayGroupdata[key]) { // 期間内で利益が出なかった時は0を設定
                dayGroupdata[key] = {
                    Gem: 0,
                    Parts: 0
                };
            }
            // dayGroupdataオブジェクト > key > の値、item.genreプロパティに対してitem.profitを設定する
            dayGroupdata[key][item.genre] += 1;

        });
        return dayGroupdata;
    } 

    // グラデーションを作成する関数
    const createGradient = (ctx, chartArea, color1, color2) => {
        const gradient = ctx.createLinearGradient(chartArea.left, 0, chartArea.right, 0);
        gradient.addColorStop(0, color1);
        gradient.addColorStop(1, color2);
        return gradient;
    };

    return (
        <div className='graph_wrap'>
        <div className='flex graph_head'>
            <h3>Item</h3>
            <div className='select'>
                <label>Period: </label>
                <select onChange={(e) => setItemPeriod(e.target.value)} value={ItemPeriod}>
                    <option value="day">Day</option>
                    <option value="week">Week</option>
                    <option value="month">Month</option>
                    <option value="year">Year</option>
                </select>
            </div>
        </div>
        {itemData.length > 0 ? (
            <Line
                ref={chartRef}
                data={{
                    labels: itemLavel,
                    datasets: ['Gem', 'Parts'].map((genre, i) => {
                        let gradient;
                        if (chartRef.current) {
                            const chart = chartRef.current;
                            const ctx = chart.ctx;
                            const chartArea = chart.chartArea;
                            gradient = createGradient(ctx, chartArea, GraphGradients[i].start, GraphGradients[i].end);
                        }
                        return {
                            label: genre,
                            data: itemData.map(data => data[genre]),
                            backgroundColor: 'rgb(26 28 48 / 30%)',
                            borderColor: gradient,
                            pointBackgroundColor: gradient,
                            borderWidth: 1,
                            fill: true
                        };
                    })
                }}
                options={{
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                color: '#8185ab'
                            },
                            grid: {
                                color: '#8185ab'
                            },
                            title: {
                                display: true,
                                text: 'Count',
                                color: '#8185ab'
                            },
                        },
                        x: {
                            ticks: {
                                color: '#8185ab'
                            },
                            grid: {
                                color: 'rgba(255, 255, 255, 0.2)'
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            labels: {
                                color: '#8185ab'
                            }
                        },
                        tooltip: {
                            titleColor: '#000',
                            bodyColor: '#000',
                            backgroundColor: 'rgba(225, 225, 225, 0.7)'
                        }
                    },
                    animation: {
                        onComplete: () => {
                            if (chartRef.current) {
                                const chart = chartRef.current;
                                chart.data.datasets.forEach((dataset, i) => {
                                    const gradient = createGradient(chart.ctx, chart.chartArea, GraphGradients[i].start, GraphGradients[i].end);
                                    dataset.borderColor = gradient;
                                });
                                chart.update();
                            }
                        }
                    }
                }}
            />
        ) : (
            <p style={{ color: '#8185ab' }}>Loading data...</p>
        )}
    </div>
    );
}