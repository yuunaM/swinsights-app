import React, { useState, useEffect, useRef } from 'react';
import moment from 'moment';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Line } from 'react-chartjs-2';
import { Chart, CategoryScale, LineElement, PointElement, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

Chart.register(CategoryScale, LineElement, PointElement, LinearScale, BarElement, Title, Tooltip, Legend);

const getWeekStartDate = (date) => {
    return moment(date).startOf('isoWeek').format('YYYY-MM-DD');
};

const getMonthStartDate = (date) => {
    return moment(date).startOf('month').format('YYYY-MM-DD');
};

const getYearStartDate = (date) => {
    return moment(date).startOf('year').format('YYYY-MM-DD');
};

function ContactTypeGraph() {
    const [CTGraphData, setCTGraphData] = useState([]);
    const [CTLabels, setCTLabels] = useState([]);
    const [CTPeriod, setCTPeriod] = useState('week');
    const chartRef = useRef(null);

    const GraphGradients = [
        { start: '#f4ff16', end: '#2fd4b5' }, 
        { start: '#9b39ff', end: '#39ceff' },
        { start: '#ff3995', end: '#b139ff' }
    ];

    useEffect(() => {
        const fetchSourceData = async () => {
            try {
                const genreSnapshot = await getDocs(collection(db, 'data', 'by_contact', 'contact_sub'));
                const sourceData = genreSnapshot.docs.map(doc => {
                    return {
                        contactType: doc.data().contactType,
                        date: doc.data().createdAt.toDate()
                    };
                });
                const groupedData = groupDataByPeriod(sourceData, CTPeriod);
                const labels = Object.keys(groupedData).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
                const sortedData = labels.map(label => groupedData[label]);
    
                setCTLabels(labels);
                setCTGraphData(sortedData);
            } catch (error) {
                console.error('Error fetching genre data: ', error);
            }
        };
        fetchSourceData();
    }, [CTPeriod]);

    const groupDataByPeriod = (data, period) => {
        const groupedData = {};
    
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
    
            if (!groupedData[key]) {
                groupedData[key] = {
                    Call: 0,
                    Mail: 0,
                    Visit: 0
                };
            }
    
            groupedData[key][item.contactType] += 1;
        });

        return groupedData;
    };

    const createGradient = (ctx, chartArea, color1, color2) => {
        if (!ctx || !chartArea) {
            return null; // もしくは適切なデフォルト値を返す
        }

        const gradient = ctx.createLinearGradient(chartArea.left, 0, chartArea.right, 0);
        gradient.addColorStop(0, color1);
        gradient.addColorStop(1, color2);
        return gradient;
    };
    
    const data = {
        labels: CTLabels,
        datasets: [
            {
                label: 'Call',
                data: CTGraphData.map(data => data['Call'] || 0),
                backgroundColor: createGradient(chartRef.current?.ctx, chartRef.current?.chartArea, GraphGradients[0].start, GraphGradients[0].end),
                borderColor: createGradient(chartRef.current?.ctx, chartRef.current?.chartArea, GraphGradients[0].start, GraphGradients[0].end),
                borderWidth: 2,
                fill: false,
                tension: 0.4
            },
            {
                label: 'Mail',
                data: CTGraphData.map(data => data['Mail'] || 0),
                backgroundColor: createGradient(chartRef.current?.ctx, chartRef.current?.chartArea, GraphGradients[1].start, GraphGradients[1].end),
                borderColor: createGradient(chartRef.current?.ctx, chartRef.current?.chartArea, GraphGradients[1].start, GraphGradients[1].end),
                borderWidth: 2,
                fill: false,
                tension: 0.4
            },
            {
                label: 'Visit',
                data: CTGraphData.map(data => data['Visit'] || 0),
                backgroundColor: createGradient(chartRef.current?.ctx, chartRef.current?.chartArea, GraphGradients[2].start, GraphGradients[2].end),
                borderColor: createGradient(chartRef.current?.ctx, chartRef.current?.chartArea, GraphGradients[2].start, GraphGradients[2].end),
                borderWidth: 2,
                fill: false,
                tension: 0.4
            }
        ]
    };

    return (
        <div className='graph_wrap'>
            <div className='flex graph_head'>
                <h3>Contact Type</h3>
                <div className='select'>
                    <label>Period: </label>
                    <select onChange={(e) => setCTPeriod(e.target.value)} value={CTPeriod}>
                        <option value="day">Day</option>
                        <option value="week">Week</option>
                        <option value="month">Month</option>
                        <option value="year">Year</option>
                    </select>
                </div>
            </div>
            {CTGraphData.length > 0 ? (
                <Line
                    ref={chartRef}
                    data={data}
                    options={{
                        scales: {
                            y: {
                                title: {
                                    display: true,
                                    text: 'Count',
                                    color: '#8185ab'
                                },
                                beginAtZero: true,
                                stacked: false,
                                ticks: {
                                    color: '#8185ab',
                                    font: {
                                        size: 20,
                                    }
                                },
                                grid: {
                                    color: '#8185ab'
                                }
                            },
                            x: {
                                ticks: {
                                    color: '#8185ab',
                                    font: {
                                        size: 20,
                                    }
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
                                    chart.data.datasets.forEach((dataset, i) => {
                                        const gradient = createGradient(chart.ctx, chart.chartArea, GraphGradients[i].start, GraphGradients[i].end);
                                        dataset.borderColor = gradient;
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
export default ContactTypeGraph