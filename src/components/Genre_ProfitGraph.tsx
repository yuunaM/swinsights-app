import React, { useState, useEffect, useRef } from 'react';
import { collection, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import moment from 'moment';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const getWeekStartDate = (date) => {
    return moment(date).startOf('isoWeek').format('YYYY-MM-DD');
};

const getMonthStartDate = (date) => {
    return moment(date).startOf('month').format('YYYY-MM-DD');
};

const getYearStartDate = (date) => {
    return moment(date).startOf('year').format('YYYY-MM-DD');
};

export default function Genre_ProfitGraph() {
    const [genreData, setGnreData] = useState([]);
    const [genreLabels, setGenreLabels] = useState([]);
    const [genrePeriod, setGenrePeriod] = useState('week');
    const chartRef = useRef(null);

    useEffect(() => {
        const fetchData = async () => {
        try {
            const snapshot = await getDocs(collection(db, 'data', 'genre_profit', 'profit'));
            const dataSet = snapshot.docs.map(doc => {
                const data = doc.data();
                if(data.createdAt) {
                    return {
                        genre: data.genre,
                        profit: data.profit,
                        date: data.createdAt.toDate()
                    }
                }
                return null;
            }).filter(item => item !== null);

            const groupedData = groupDataByPeriod(dataSet, genrePeriod);
            const labels = Object.keys(groupedData).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
            const sortedData = labels.map(label => groupedData[label]);

            setGenreLabels(labels);
            setGnreData(sortedData);

        } catch (error) {
            console.error('Error fetching data: ', error);
        }
    };
        fetchData();
    }, [genrePeriod]);

    const GraphGradients = [
        { start: '#f4ff16', end: '#2fd4b5' },  // Parts用のグラデーション
        { start: '#39ceff', end: '#9b39ff' }  // Gem用のグラデーション
    ];

    const groupDataByPeriod = (data, period) => {
        const dayGroupData = {};

        data.forEach(item => {
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

            if (!dayGroupData[key]) {
                dayGroupData[key] = {
                    Gem: 0,
                    Parts: 0
                };
            }

            dayGroupData[key][item.genre] += item.profit;
        });

        return dayGroupData;
    };

    const createGradient = (ctx, chartArea, color1, color2) => {
        const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
        gradient.addColorStop(0, color1);
        gradient.addColorStop(1, color2);
        return gradient;
    };

    const datasets = () => {
        const dataValues = Object.values(genreData);

        return ['Gem', 'Parts'].map((genre, index) => {
            let gradient;
            if (chartRef.current) {
                const chart = chartRef.current;
                const ctx = chart.ctx;
                const chartArea = chart.chartArea;
                gradient = createGradient(ctx, chartArea, GraphGradients[index].start, GraphGradients[index].end);
            }
            return {
                label: genre,
                data: dataValues.map(data => data[genre] || 0),
                backgroundColor: gradient,
                borderWidth: 1
            };
        });
    };

    return (
        <div className='graph_wrap'>
            <div className='flex graph_head'>
                <h3>Genre Profit</h3>
                <div className='select'>
                    <label>Period: </label>
                    <select onChange={(e) => setGenrePeriod(e.target.value)} value={genrePeriod}>
                        <option value="day">Day</option>
                        <option value="week">Week</option>
                        <option value="month">Month</option>
                        <option value="year">Year</option>
                    </select>
                </div>
            </div>
            {genreData.length > 0 ? (
                <Bar
                    ref={chartRef}
                    data={{
                        labels: genreLabels,
                        datasets: datasets()
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
                                    text: 'Profit',
                                    color: '#8185ab'
                                },
                            },
                            x: {
                                ticks: {
                                    color: '#8185ab'
                                },
                                grid: {
                                    color: 'rgba(255, 255, 255, 0.2)'
                                },
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
                                        dataset.backgroundColor = gradient;
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
