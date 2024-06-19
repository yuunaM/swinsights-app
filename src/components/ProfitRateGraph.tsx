import React, { useState, useEffect, useRef } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Line } from 'react-chartjs-2';
import { Chart, CategoryScale, LineElement, PointElement, LinearScale, Title, Tooltip, Legend } from 'chart.js';
import moment from 'moment';

Chart.register(CategoryScale, LineElement, PointElement, LinearScale, Title, Tooltip, Legend);

const getWeekStartDate = (date) => {
    return moment(date).startOf('isoWeek').format('YYYY-MM-DD');
};

const getMonthStartDate = (date) => {
    return moment(date).startOf('month').format('YYYY-MM-DD');
};

const getYearStartDate = (date) => {
    return moment(date).startOf('year').format('YYYY-MM-DD');
};

export default function ProfitRateGraph() {
    const [profitGraphData, setProfitGraphData] = useState([]);
    const [profitLabels, setProfitLabels] = useState([]);
    const [profitPeriod, setProfitPeriod] = useState('week');
    const [grossProfitGraphData, setGrossProfitGraphData] = useState([]);
    const [cost, setCost] = useState([]);
    const chartRef = useRef(null);

    const GraphGradients = [
        { start: '#f4ff16', end: '#f4ff16' }, 
        { start: '#ff3995', end: '#b139ff' },
        { start: '#39ceff', end: '#9b39ff' }
    ];
 
    useEffect(() => {
        fetchProfitData();
    }, [profitPeriod]);

    const fetchProfitData = async () => {
        try {
            const snapshot = await getDocs(collection(db, 'data', 'ProfitRate', 'ProfitRate_sub'));
            const genreData = snapshot.docs.map(doc => { 
                const data = doc.data();
                if (data.createdAt) {
                    return {
                        amount: data.amount,
                        profit: data.profit,
                        cost: data.cost,
                        date: data.createdAt
                    };
                }
                return null; // Timestampフィールドが存在しない場合はnullを返す
            }).filter(item => item !== null); // Timestampフィールドが存在しない配列を除外

            const groupedData = groupDataByPeriod(genreData, profitPeriod); // 日付順に並べた売上、粗利、仕入れ値のデータ配列
            const labels = Object.keys(groupedData).sort((a, b) => new Date(a).getTime() - new Date(b).getTime()); // 日付をソート
            const profitMargins = labels.map((label) => {
                const data = groupedData[label]; // 日付毎の配列データを取得
                return calculateMargin(data); // 配列データ毎にcalculateMargin関数を実行し、その結果を返す
            });

            const grossProfits = labels.map((label) => {
                const data = groupedData[label];
                return calculateTotalGrossProfit(data);
            });

            const costData = labels.map((label) => {
                const data = groupedData[label];
                return fetchCost(data);
            })

            setCost(costData);
            setProfitLabels(labels);
            setProfitGraphData(profitMargins);
            setGrossProfitGraphData(grossProfits);

        } catch (error) {
            console.error('Error fetching profit data: ', error);
        }
    };

    const groupDataByPeriod = (data, profitPeriod) => {
        const groupedData = {};

        data.forEach(item => {
            let key;
            let date = item.date;

            if (date.toDate) {
                date = date.toDate();
            }

            if (profitPeriod === 'day') {
                key = moment(date).format('YYYY-MM-DD');
            } else if (profitPeriod === 'week') {
                key = getWeekStartDate(date);
            } else if (profitPeriod === 'month') {
                key = getMonthStartDate(date);
            } else if (profitPeriod === 'year') {
                key = getYearStartDate(date);
            }

            if (!groupedData[key]) {
                groupedData[key] = [];
            }
            groupedData[key].push(item);
        });

        return groupedData;
    };

    const calculateMargin = (data) => {
        let totalProfit = 0;
        let totalAmount = 0;
    
        data.forEach(item => {
            totalProfit += item.profit;
            totalAmount += item.amount;
        });
        if (totalAmount === 0) { //NaNの発生するのを防ぐため、売上が0の時は売上合計を0に
            return 0;
        }
        return (totalProfit / totalAmount) * 100;
    };

    const calculateTotalGrossProfit = (data) => {
        let totalGrossProfit = 0;

        data.forEach(item => {
            totalGrossProfit += item.profit;
        });
        
        return totalGrossProfit;
    };

    const fetchCost = (data) => {
        let costArray = 0;

        data.forEach(item => {
            costArray += item.cost;
         });

         return costArray;
    }

    const createGradient = (ctx, chartArea, color1, color2) => {
        const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
        gradient.addColorStop(0, color1);
        gradient.addColorStop(1, color2);
        return gradient;
    };

    const datasets = () => {
        let profitMarginGradient, grossProfitGradient, costGradient;
    
        if (chartRef.current) {
            const chart = chartRef.current;
            const ctx = chart.ctx;
            const chartArea = chart.chartArea;
            profitMarginGradient = createGradient(ctx, chartArea, GraphGradients[0].start, GraphGradients[0].end);
            grossProfitGradient = createGradient(ctx, chartArea, GraphGradients[1].start, GraphGradients[1].end);
            costGradient = createGradient(ctx, chartArea, GraphGradients[2].start, GraphGradients[2].end);
        }
    
        return [
            {
                type: 'line' as const,
                label: 'Profit rate(%)',
                data: profitGraphData,
                borderColor: profitMarginGradient,
                backgroundColor: profitMarginGradient,
                borderWidth: 2,
                pointRadius: 3,
                pointHoverRadius: 5,
                pointBackgroundColor: '#03241A',
                tension: 0.1,
                yAxisID: 'y2',
            },
            {
                type: 'line' as const,
                label: 'Profit',
                data: grossProfitGraphData,
                backgroundColor: grossProfitGradient,
                yAxisID: 'y1',
            },
            {
                type: 'line' as const,
                label: 'Cost',
                data: cost,
                backgroundColor: costGradient,
                yAxisID: 'y1',
            }
        ];
    };
    
    

    return (
        <div className='graph_wrap'>
            <div className='flex graph_head'>
                <h3>Profit Margin</h3>
                <div className='select'>
                    <label>Period: </label>
                    <select onChange={(e) => setProfitPeriod(e.target.value)} value={profitPeriod}>
                        <option value="day">Day</option>
                        <option value="week">Week</option>
                        <option value="month">Month</option>
                        <option value="year">Year</option>
                    </select>
                </div>
            </div>
            {profitGraphData.length > 0 && grossProfitGraphData.length > 0 ? (
                <Line
                    ref={chartRef}
                    data={{
                        labels: profitLabels,
                        datasets: datasets()
                    }}
                    options={{
                        scales: {
                            y1: {
                                type: 'linear',
                                display: true,
                                position: 'left',
                                beginAtZero: true,
                                ticks: {
                                    color: '#8185ab'
                                },
                                grid: {
                                    color: '#393b4d'
                                },
                                title: {
                                    display: true,
                                    text: 'Profit',
                                    color: '#8185ab'
                                }
                            },
                            y2: {
                                type: 'linear',
                                display: true,
                                position: 'right',
                                ticks: {
                                    color: '#8185ab'
                                },
                                grid: {
                                    drawOnChartArea: false
                                },
                                title: {
                                    display: true,
                                    text: 'Profit rate(%)',
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
                                position: 'top',
                                labels: {
                                    color: '#8185ab'
                                }
                            },
                            tooltip: {
                                mode: 'index',
                                intersect: false,
                            }
                        },
                        animation: {
                            onComplete: () => {
                                if (chartRef.current) {
                                    const chart = chartRef.current;
                                    const profitMarginGradient = createGradient(chart.ctx, chart.chartArea, GraphGradients[0].start, GraphGradients[0].end);
                                    const grossProfitGradient = createGradient(chart.ctx, chart.chartArea, GraphGradients[1].start, GraphGradients[1].end);
                                    const costGradient = createGradient(chart.ctx, chart.chartArea, GraphGradients[2].start, GraphGradients[2].end);

                                    chart.data.datasets[0].borderColor = profitMarginGradient;
                                    chart.data.datasets[0].backgroundColor = profitMarginGradient;
                                    chart.data.datasets[1].backgroundColor = grossProfitGradient;
                                    chart.data.datasets[2].backgroundColor = costGradient;

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
