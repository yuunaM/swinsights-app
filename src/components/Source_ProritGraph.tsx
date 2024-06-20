import React, { useState, useEffect, useRef } from 'react';
import { collection, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Bar } from 'react-chartjs-2';
import moment from 'moment';

const getWeekStartDate = (date) => {
    // Timestamp情報をmoment式に変換し、その日が含まれる週の月曜日を返す。
    return moment(date).startOf('isoWeek').format('YYYY-MM-DD');
};

const getMonthStartDate = (date) => {
    return moment(date).startOf('month').format('YYYY-MM-DD');
};

const getYearStartDate = (date) => {
    return moment(date).startOf('year').format('YYYY-MM-DD');
};

export default function Source_ProritGraph() {
    const [sourceGraphData, setSourceGraphData] = useState([]);
    const [sourceLabels, setSourceLabels] = useState([]); // グラフX軸用ラベル
    const [sourcePeriod, setSourcePeriod] = useState('week'); // 期間のステート
    const chartRef = useRef(null);

    const GraphGradients = [
        { start: '#f4ff16', end: '#2fd4b5' }, 
        { start: '#ff3995', end: '#b139ff' },
        { start: '#9b39ff', end: '#39ceff' }
    ];

    useEffect(() => {
        const fetchSourceData = async () => {
            try {
                // data > genre_profit内のコレクションデータを全てを取得しgenreSnapshotに代入
                const genreSnapshot = await getDocs(collection(db, 'data', 'source_profit', 'profit')); 
                // genreSnapshot.docs（ドキュメントのID、パス、メタデータ、ドキュメントのフィールドとその値）からdoc（ドキュメントのフィールドとその値）のみを取り出し配列化
                const sourceData = genreSnapshot.docs.map(doc => { 
                    const data = doc.data();
                    if (data.createdAt) { // createdAtフィールド（Timestamp）が存在するか
                        return {
                            source: data.source,
                            profit: data.profit,
                            date: data.createdAt.toDate()
                        };
                    }
                    return null; // Timestampフィールドが存在しない場合はnullを返す
                }).filter(item => item !== null); // Timestampフィールドが存在しない配列を除外
    
                const groupedData = groupDataByPeriod(sourceData, sourcePeriod);
                const labels = Object.keys(groupedData).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());// ラベルを日付順にソート
                const sortedData = labels.map(label => groupedData[label]); // ソートされたラベルに従ってデータを並び替える
    
                setSourceLabels(labels); // 日付順にソートされたデータをステートにセットし更新。グラフ描画時のlabelsで呼び出す
                setSourceGraphData(sortedData); // ソートされたデータをステートにセットし更新。グラフ描画時のdatasetsで呼び出す
            } catch (error) {
                console.error('Error fetching genre data: ', error);
            }
        };
        fetchSourceData();
    }, [sourcePeriod]);

    const groupDataByPeriod = (data, period) => {
        const dayGroupdata = {};
    
        data.forEach(item => { // sourceData（profitサブコレ内のドキュメントの数だけループ処理）
            let key;
            const date = item.date;

            // day, week, month, year毎にkey(日付)をフォーマットする
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
                    Facebook: 0,
                    ikkman: 0,
                    Shop: 0
                };
            }
            // dayGroupdataオブジェクト > key > の値、item.genreプロパティに対してitem.profitを設定する
            dayGroupdata[key][item.source] += item.profit;
            // dayGroupdata[key][item.genre] = { 2024-06-01: Gem, Parts } この状態から
            // += item.profitによってこうなる　{ 2024-06-01: { Gem: ◯◯◯円, Parts: ◯◯◯円 }} 
        });
        return dayGroupdata;
    };

    const createGradient = (ctx, chartArea, color1, color2) => {
        const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
        gradient.addColorStop(0, color1);
        gradient.addColorStop(1, color2);
        return gradient;
    };

    const datasets = () => {
        const dataValues = Object.values(sourceGraphData);

        return ['Facebook', 'ikkman', 'Shop'].map((source, index) => {
            let gradient;
            if (chartRef.current) {
                const chart = chartRef.current;
                const ctx = chart.ctx;
                const chartArea = chart.chartArea;
                gradient = createGradient(ctx, chartArea, GraphGradients[index].start, GraphGradients[index].end);
            }
            return {
                label: source,
                data: dataValues.map(data => data[source] || 0),
                backgroundColor: gradient,
                borderWidth: 1
            };
        });
    };

    return (
        <div className='graph_wrap'>
            <div className='flex graph_head'>
            <h3>Source Profit</h3>
            <div className='select'>
                <label>Period: </label>
                <select onChange={(e) => setSourcePeriod(e.target.value)} value={sourcePeriod}>
                    <option value="day">Day</option>
                    <option value="week">Week</option>
                    <option value="month">Month</option>
                    <option value="year">Year</option>
                </select>
            </div>
        </div>
        {sourceGraphData.length > 0 ? (
            <>
                <Bar
                    ref={chartRef}
                    data={{
                        labels: sourceLabels,
                        datasets: datasets()
                    }}
                    options={{
                        scales: {
                            y: {
                                title: {
                                    display: true,
                                    text: 'Profit',
                                    color: '#8185ab'
                                },
                                beginAtZero: true,
                                stacked: false,
                                ticks: {
                                    color: '#8185ab'
                                },
                                grid: {
                                    color: '#8185ab'
                                }
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
                            }
                        },
                        animation: {
                            onComplete: () => {
                                if (chartRef.current) {
                                    const chart = chartRef.current;
                                    chart.data.datasets.forEach((dataset, i) => {
                                        const gradient = createGradient(chart.ctx, chart.chartArea, GraphGradients[i].start, GraphGradients[i].end);
                                        dataset.backgroundColor = gradient;
                                    });
                                    chart.update();
                                }
                            }
                        }
                    }}
                />
            </>
        ) : (
            <p style={{ color: '#8185ab' }}>Loading data...</p>
        )}
        </div>
    )
}