import { Bar, Doughnut, Line } from 'react-chartjs-2';
import Chart from 'chart.js/auto';
import axios from 'axios';
import "./assets/css/style.css";
import { useEffect, useRef, useState } from 'react';

function CovidStat() {
    document.title = "COVID-19 Statistics";

    const _url_global = "https://api.covid19api.com/summary";

    const [date, setDate] = useState("");
    const [globalData, setGlobalData] = useState({ NewConfirmed: "", NewDeaths: "", TotalConfirmed: "", TotalDeaths: "", lehtalrate: "" });
    const [countriesData, setCountriesData] = useState({ labels: null, cases: null, deaths: null });
    const [data, setData] = useState({ labels: [], datasets: [] });
    const [filter1, setFilter1] = useState(false);
    const [filter2, setFilter2] = useState(false);
    const [filter3, setFilter3] = useState(false);
    const [filter4, setFilter4] = useState(false);
    const [page, setPage] = useState(1);

    const chartCaseRef = useRef(null);
    const chartDeathRef = useRef(null);

    async function fetchData() {
        const response = await axios.get(_url_global);
        setGlobalData(() => response.data.Global);
        setGlobalData((d) => { return { ...d, lethalrate: (response.data.Global.TotalDeaths / response.data.Global.TotalConfirmed).toFixed(3) + "%" } });
        setDate(() => new Date(response.data.Date).toLocaleString());

        const labelArray = [];
        const caseArray = [];
        const deathArray = [];

        response.data.Countries.forEach((e) => {
            labelArray.push(e.Country);
            caseArray.push(e.TotalConfirmed);
            deathArray.push(e.TotalDeaths);
        })

        setCountriesData(() => { return { labels: labelArray, cases: caseArray, deaths: deathArray }; });
        // console.log(response.data);

        const _case = { labels: labelArray, datasets: [{ label: "Total Cases", backgroundColor: 'rgba(255, 99, 132, 0.5)', borderColor: 'rgb(255, 99, 132)', data: caseArray }] };
        const _death = { labels: labelArray, datasets: [{ label: "Total Deaths", backgroundColor: 'rgba(153, 102, 255, 0.5)', borderColor: 'rgb(153, 102, 255)', data: deathArray }] };
        chartCaseRef.current.data = _case;
        chartDeathRef.current.data = _death;
        chartCaseRef.current.update();
        chartDeathRef.current.update();
    }

    useEffect(() => {
        fetchData();
    }, []);

    // const dataCase = { labels: countriesData.labels, datasets: [{ label: "Total Cases", backgroundColor: 'rgba(255, 99, 132, 0.5)', borderColor: 'rgb(255, 99, 132)', data: countriesData.cases }] };

    const options = {
        indexAxis: 'x',
        // Elements options apply to all of the options unless overridden in a dataset
        // In this case, we are setting the border of each horizontal bar to be 2px wide
        elements: {
            bar: {
                borderWidth: 2,
            }
        },
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: false,
                text: 'COVID-19 Total Cases'
            }
        }
    };

    const sort = [
        {
            name: "Alphabetical",
            handler(chart) {
                sortF(chart, (a, b) => {
                    if (b.label < a.label) { return 1; }
                    return -1;
                })
            }
        },
        {
            name: "Highest",
            handler(chart) {
                sortF(chart, (a, b) => {
                    if (b.data > a.data) { return 1; }
                    return -1;
                })
            }
        },
        {
            name: "Lowest",
            handler(chart) {
                sortF(chart, (a, b) => {
                    if (b.data < a.data) { return 1; }
                    return -1;
                })
            }
        },
    ];

    function sortF(chart, callback) {
        let arrayOfObj = []

        chart.data.labels.forEach(function (d, i) {
            arrayOfObj.push({
                label: d,
                data: chart.data.datasets[0].data[i] || 0
            });
        });

        let sortedArrayOfObj = arrayOfObj.sort(callback);
        const newArrayLabel = [];
        const newArrayData = [];
        sortedArrayOfObj.forEach(function (d) {
            newArrayLabel.push(d.label);
            newArrayData.push(d.data);
        });

        chart.data.labels = newArrayLabel;
        chart.data.datasets[0].data = newArrayData;
        chart.update();
    }

    useEffect(() => {
        sort.forEach((a, i) => {
            let button = document.createElement("button");
            button.id = "button" + i;
            button.innerText = a.name;
            button.onclick = () => a.handler(chartCaseRef.current);
            document.querySelector(".sort").appendChild(button);
        });

        sort.forEach((a, i) => {
            let button = document.createElement("button");
            button.id = "button" + i;
            button.innerText = a.name;
            button.onclick = () => a.handler(chartDeathRef.current);
            document.querySelectorAll(".sort")[1].appendChild(button);
        });
    }, [])

    function filterAllCountries(ref, setFilter1) {
        const chart = ref.current;
        chart.data.labels = countriesData.labels;
        chart.data.datasets[0].label = "All countries";
        chart.data.datasets[0].data = ref === chartCaseRef ? countriesData.cases : countriesData.deaths;
        chart.canvas.parentElement.classList.remove("canvas-smaller");
        chart.update();
    }

    function filterTop10(ref) {
        let arrayOfObj = []
        const chart = ref.current;

        countriesData.labels.forEach(function (d, i) {
            arrayOfObj.push({
                label: d,
                data: ref === chartCaseRef ? countriesData.cases[i] : countriesData.deaths[i]
            });
        });

        let sortedArrayOfObj = arrayOfObj.sort(function (a, b) {
            return b.data > a.data;
        });

        let newArrayLabel = [];
        let newArrayData = [];
        sortedArrayOfObj.forEach(function (d) {
            newArrayLabel.push(d.label);
            newArrayData.push(d.data);
        });

        chart.data.labels = newArrayLabel.slice(0, 9);
        chart.data.datasets[0].label = "Top 10";
        chart.data.datasets[0].data = newArrayData.slice(0, 9);
        chart.canvas.parentElement.classList.toggle("canvas-smaller", true);
        chart.update();
    }

    function filterOverOneMillion(ref) {
        const chart = ref.current;
        const newLabelArray = [];
        const newDataArray = [];

        const v = ref === chartCaseRef ? countriesData.cases : countriesData.deaths;

        v.forEach(function (d, i) {
            if (d > 1000000) {
                newLabelArray.push(countriesData.labels[i]);
                newDataArray.push(d);
            }
        });

        chart.data.labels = newLabelArray;
        chart.data.datasets[0].label = "1+ million cases";
        chart.data.datasets[0].data = newDataArray;

        chart.canvas.parentElement.classList.toggle("canvas-smaller", true);
        chart.update();
    }

    function filterOver100k(ref) {
        const chart = ref.current;
        const newLabelArray = [];
        const newDataArray = [];

        const v = ref === chartCaseRef ? countriesData.cases : countriesData.deaths;

        v.forEach(function (d, i) {
            if (d > 100000) {
                newLabelArray.push(countriesData.labels[i]);
                newDataArray.push(d);
            }
        });

        chart.data.labels = newLabelArray;
        chart.data.datasets[0].label = "100k+ cases";
        chart.data.datasets[0].data = newDataArray;

        chart.canvas.parentElement.classList.toggle("canvas-smaller", true);
        chart.update();
    }

    function showFilters(mainFilter, otherFilter) {
        mainFilter(d => !d);
        otherFilter(() => false);
    }

    return <>
        <header>
            <div><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                <path className="a"
                    d="M46.5,19A1.49977,1.49977,0,0,0,45,20.5V22H40.87225a16.9,16.9,0,0,0-3.53-8.51367l2.92121-2.92139,1.17582.99561a1.49993,1.49993,0,1,0,2.12134-2.1211l-4.99991-5a1.4999,1.4999,0,0,0-2.12127,2.1211l.99565,1.17578-2.92139,2.92138A16.90205,16.90205,0,0,0,26,7.12793V3h1.5a1.5,1.5,0,0,0,0-3h-7a1.5,1.5,0,0,0,0,3H22V7.12793a16.90205,16.90205,0,0,0-8.51367,3.52978L10.56494,7.73633l.99565-1.17578a1.4999,1.4999,0,0,0-2.12127-2.1211l-4.88475,5a1.49993,1.49993,0,0,0,2.12133,2.1211l1.06067-.99561,2.92121,2.92139A16.9,16.9,0,0,0,7.12775,22H3V20.5a1.5,1.5,0,0,0-3,0v7a1.5,1.5,0,0,0,3,0V26H7.12775a16.9,16.9,0,0,0,3.53,8.51367L7.73657,37.43506l-1.17582-.99561a1.49993,1.49993,0,0,0-2.12134,2.1211l4.99991,5a1.4999,1.4999,0,1,0,2.12127-2.1211l-.99565-1.17578,2.92127-2.92138A16.902,16.902,0,0,0,22,40.87207V45H20.5a1.5,1.5,0,0,0,0,3h7a1.5,1.5,0,0,0,0-3H26V40.87207a16.902,16.902,0,0,0,8.51379-3.52978l2.92127,2.92138-.99565,1.17578a1.4999,1.4999,0,0,0,2.12127,2.1211l4.99991-5a1.49993,1.49993,0,1,0-2.12134-2.1211l-1.17582.99561-2.92121-2.92139A16.9,16.9,0,0,0,40.87225,26H45v1.5a1.5,1.5,0,0,0,3,0v-7A1.49977,1.49977,0,0,0,46.5,19Zm-28,1A3.5,3.5,0,1,1,22,16.5,3.49994,3.49994,0,0,1,18.5,20ZM30,33a2,2,0,1,1,2-2A2.00006,2.00006,0,0,1,30,33Z" />
            </svg></div>
            <h1>Covid Statistics</h1>
        </header>
        <main>
            <nav><ul>
                <li className={page === 1 ? "page-selected" : ""} onClick={() => setPage(() => 1)}>Worldwide</li>
                <li className={page === 2 ? "page-selected" : ""} onClick={() => setPage(() => 2)}>Per Country</li>
            </ul></nav>
            <div className='page' style={{ display: `${page === 1 ? "flex" : "none"}` }}>
                <section className='global'>
                    <div className="global-container">
                        <span>last updated: {date}</span>
                        <div className='daily'>
                            <h3>Daily report</h3>
                            <div className='case-container'>
                                <div className='case'><div>new cases</div><div>{globalData.NewConfirmed.toLocaleString()}</div></div>
                                <div className='case'><div>new deaths</div><div>{globalData.NewDeaths.toLocaleString()}</div></div>
                            </div>
                        </div>
                        <div className='total'>
                            <h3>Total count</h3>
                            <div className='case-container'>
                                <div className='case'><div>total cases</div><div>{globalData.TotalConfirmed.toLocaleString()}</div></div>
                                <div className='case'><div>total deaths</div><div>{globalData.TotalDeaths.toLocaleString()}</div></div>
                            </div>
                        </div>
                        <div>
                            <h3>Lethality Rate</h3>
                            <div className='case-container'>
                                <div className='case'><div></div><div>{globalData.lethalrate}</div></div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className='chart-section'>
                    <div className='chart-toprow'>
                        <h3>COVID-19 Total Cases</h3>
                        <div className='chart-buttons'>
                            <div className='chart-button' onClick={() => showFilters(setFilter1, setFilter2)}>
                                <div>
                                    <div><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z" /></svg></div>
                                    <span>Filter</span>
                                </div>
                                <div style={{ transform: `${filter1 ? "scaley(1)" : "scaley(0)"}` }}>
                                    <button onClick={() => filterAllCountries(chartCaseRef)}>All Countries</button>
                                    <button onClick={() => filterTop10(chartCaseRef)}>Top 10</button>
                                    <button onClick={() => filterOverOneMillion(chartCaseRef)}>1M+</button>
                                </div>
                            </div>
                            <div className='chart-button' onClick={() => showFilters(setFilter2, setFilter1)}>
                                <div>
                                    <div>
                                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M3 18h6v-2H3v2zM3 6v2h18V6H3zm0 7h12v-2H3v2z" /></svg>
                                    </div>
                                    <span>Sort</span>
                                </div>
                                <div className='sort' style={{ transform: `${filter2 ? "scaley(1)" : "scaley(0)"}` }}></div>
                            </div>
                        </div>
                    </div>
                    {/* <hr /> */}
                    <div className='chart-container'>
                        <div className='chart-subcontainer'>
                            <Bar data={data} options={options} ref={chartCaseRef} />
                        </div>
                    </div>
                </section>

                <section className='chart-section'>
                    <div className='chart-toprow'>
                        <h3>COVID-19 Total Deaths</h3>
                        <div className='chart-buttons'>
                            <div className='chart-button' onClick={() => showFilters(setFilter3, setFilter4)}>
                                <div>
                                    <div><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z" /></svg></div>
                                    <span>Filter</span>
                                </div>
                                <div style={{ transform: `${filter3 ? "scaley(1)" : "scaley(0)"}` }}>
                                    <button onClick={() => filterAllCountries(chartDeathRef)}>All Countries</button>
                                    <button onClick={() => filterTop10(chartDeathRef)}>Top 10</button>
                                    <button onClick={() => filterOver100k(chartDeathRef)}>100k+</button>
                                </div>
                            </div>
                            <div className='chart-button' onClick={() => showFilters(setFilter4, setFilter3)}>
                                <div>
                                    <div>
                                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M3 18h6v-2H3v2zM3 6v2h18V6H3zm0 7h12v-2H3v2z" /></svg>
                                    </div>
                                    <span>Sort</span>
                                </div>
                                <div className='sort' style={{ transform: `${filter4 ? "scaley(1)" : "scaley(0)"}` }}></div>
                            </div>
                        </div>
                    </div>
                    <div className='chart-container'>
                        <div className='chart-subcontainer'>
                            <Bar data={data} options={options} ref={chartDeathRef} />
                        </div>
                    </div>
                </section>
            </div>
            <div className='' style={{ display: `${page === 2 ? "block" : "none"}` }}>
                TODO
            </div>
        </main>
        <footer>
        </footer>
    </>
}

export default CovidStat;