import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { Line } from "react-chartjs-2";
import { COLORS } from "../assets/data/colors";
import { countriesList } from "../assets/data/countries";
import loadingSVG from "../assets/svg/loading.svg";
import Search from "./Search";

function Country() {

    const [country, setCountry] = useState("France");
    const [days, setDays] = useState("30");
    const [data, setData] = useState({ labels: ["J", "F"], datasets: [{ label: "a", backgroundColor: COLORS.yellow.border, borderColor: COLORS.yellow.border, data: [1, 2] }] });
    const [scale, setScale] = useState(1);
    const [loading, setLoading] = useState(false);
    const [apiresult, setApiResult] = useState("");
    // const [ratio, setRatio] = useState({maintainAspectRatio: true});

    const refLineChart0 = useRef(null);
    const refLineChart1 = useRef(null);
    const refLineChart2 = useRef(null);

    const options_all = {
        resizeDelay: 200,
        animation: false,
        elements: {
            point: {
                radius: 0.5,
            },
            line: {
                borderWidth: 1,
            }
        }
    };

    const options_default = {
        elements: {
            point: {
                radius: 2,
            },
            line: {
                borderWidth: 2,
            }
        }
    };

    const [options, setOptions] = useState(options_default);


    function fetchData(c, d) {
        // for perf measurement
        // var start = performance.now();
        setLoading(() => true);
        fetchDataAPI2(c, d).then(() => {
            setLoading(() => false);
            // var end = performance.now();
            // var timeTaken = end - start;
            // console.log(timeTaken);
        });
    }

    async function fetchDataAPI1(_country, _days) {
        const _url0 = `https://api.covid19api.com/total/dayone/country/${_country}`;
        const _url = `https://corona.lmao.ninja/v2/historical/${_country}?lastdays=${_days}`;


        try {
            const response = await axios.get(_url);
            setCountry(_country);
            document.querySelector("form").reset();
            setDays(() => _days);
            const labelArray = Object.keys(response.data.timeline.cases);
            const caseArray = Object.values(response.data.timeline.cases);
            const deathArray = Object.values(response.data.timeline.deaths);

            const _newLineData = {
                labels: labelArray, datasets: [
                    { label: "Total Cases", backgroundColor: COLORS.yellow.border, borderColor: COLORS.yellow.border, data: caseArray }
                ]
            };
            const _newLineData2 = {
                labels: labelArray, datasets: [
                    { label: "Total Deaths", backgroundColor: COLORS.blue.border, borderColor: COLORS.blue.border, data: deathArray }
                ]
            };

            const caseIncrementArray = [];
            const deathIncrementArray = [];

            for (let i = 0; i < caseArray.length; i++) {
                if (i === 0) {
                    caseIncrementArray.push(0);
                    deathIncrementArray.push(0);
                } else {
                    caseIncrementArray.push(caseArray[i] - caseArray[i - 1]);
                    deathIncrementArray.push(deathArray[i] - deathArray[i - 1]);
                }
            }

            const start = labelArray.length - _days;
            const end = labelArray.length + 1;
            const _newLineData0 = {
                labels: labelArray.slice(start, end), datasets: [
                    { label: "New Cases", backgroundColor: COLORS.green.border, borderColor: COLORS.green.border, data: caseIncrementArray.slice(start, end) },
                    { label: "New Deaths", backgroundColor: COLORS.gray.border, borderColor: COLORS.gray.border, data: deathIncrementArray.slice(start, end) }
                ]
            };

            refLineChart0.current.data = _newLineData0;
            refLineChart0.current.update();



            refLineChart1.current.data = _newLineData;
            refLineChart2.current.data = _newLineData2;
            refLineChart1.current.update();
            refLineChart2.current.update();
        } catch (e) {
            // console.log(e);
            setApiResult(() => _country + ": country not found");
        }
    }

    async function fetchDataAPI2(_country, _days) {

        const _url1 = `https://disease.sh/v3/covid-19/countries/${_country}`;
        const _url2 = `https://disease.sh/v3/covid-19/historical/${_country}?lastdays=${_days}`;

        try {
            const response = await axios.get(_url1);
            const d = response.data;
            const _container = document.querySelector(".country-summary");
            _container.innerHTML = `
            <div><img src="${d.countryInfo.flag}" alt="${d.country}"></img></div>
            <div class="summary-case"><span>Population</span><span>${d.population.toLocaleString()}</span></div>
            <div class="summary-case"><span>active</span><span>${d.active.toLocaleString()}</span></div>
            <div class="summary-case"><span>new cases</span><span>${d.todayCases.toLocaleString()}</span></div>
            <div class="summary-case"><span>new Deaths</span><span>${d.todayDeaths.toLocaleString()}</span></div>
            <div class="summary-case"><span>new Recovered</span><span>${d.todayRecovered.toLocaleString()}</span></div>
            <div class="summary-case"><span>cases</span><span>${d.cases.toLocaleString()}</span></div>
            <div class="summary-case"><span>deaths</span><span>${d.deaths.toLocaleString()}</span></div>
            <div class="summary-case"><span>recovered</span><span>${d.recovered.toLocaleString()}</span></div>
            <div class="summary-case"><span>tests</span><span>${d.tests.toLocaleString()}</span></div>
            <div class="summary-case"><span>lethality rate</span><span>${(d.deaths / d.cases).toFixed(3) + "%"}</span></div>
            `;

        } catch (e) {
            // console.log(e);
            setApiResult(() => _country + ": country not found");
        }

        try {
            const response = await axios.get(_url2);
            setCountry(_country);
            document.querySelector("form").reset();
            setDays(() => _days);
            const labelArray = Object.keys(response.data.timeline.cases);
            const caseArray = Object.values(response.data.timeline.cases);
            const deathArray = Object.values(response.data.timeline.deaths);

            labelArray.forEach((e, i) => {
                labelArray[i] = formatDate(e);
            })

            const _newLineData1 = {
                labels: labelArray, datasets: [
                    { label: "Total Cases", backgroundColor: COLORS.yellow.border, borderColor: COLORS.yellow.border, data: caseArray }
                ]
            };
            const _newLineData2 = {
                labels: labelArray, datasets: [
                    { label: "Total Deaths", backgroundColor: COLORS.blue.border, borderColor: COLORS.blue.border, data: deathArray }
                ]
            };

            const caseIncrementArray = [];
            const deathIncrementArray = [];

            for (let i = 0; i < caseArray.length; i++) {
                if (i === 0) {
                    caseIncrementArray.push(0);
                    deathIncrementArray.push(0);
                } else {
                    caseIncrementArray.push(caseArray[i] - caseArray[i - 1]);
                    deathIncrementArray.push(deathArray[i] - deathArray[i - 1]);
                }
            }

            const start = labelArray.length - _days;
            const end = labelArray.length + 1;
            const _newLineData0 = {
                labels: labelArray.slice(start, end), datasets: [
                    { label: "New Cases", backgroundColor: COLORS.green.border, borderColor: COLORS.green.border, data: caseIncrementArray.slice(start, end) },
                    { label: "New Deaths", backgroundColor: COLORS.gray.border, borderColor: COLORS.gray.border, data: deathIncrementArray.slice(start, end) }
                ]
            };

            refLineChart0.current.data = _newLineData0;
            refLineChart1.current.data = _newLineData1;
            refLineChart2.current.data = _newLineData2;
            refLineChart0.current.update();
            refLineChart1.current.update();
            refLineChart2.current.update();
        } catch (e) {
            // console.log(e);
            setApiResult(() => _country + ": country not found");
        }
    }
    const _loadingSVG = `<svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
    width="26.349px" height="26.35px" viewBox="0 0 26.349 26.35" style="enable-background:new 0 0 26.349 26.35;"
    xml:space="preserve">
<g>
   <g>
       <circle cx="13.792" cy="3.082" r="3.082"/>
       <circle cx="13.792" cy="24.501" r="1.849"/>
       <circle cx="6.219" cy="6.218" r="2.774"/>
       <circle cx="21.365" cy="21.363" r="1.541"/>
       <circle cx="3.082" cy="13.792" r="2.465"/>
       <circle cx="24.501" cy="13.791" r="1.232"/>
       <path d="M4.694,19.84c-0.843,0.843-0.843,2.207,0,3.05c0.842,0.843,2.208,0.843,3.05,0c0.843-0.843,0.843-2.207,0-3.05
           C6.902,18.996,5.537,18.988,4.694,19.84z"/>
       <circle cx="21.364" cy="6.218" r="0.924"/>
   </g>
</g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g>
</svg>`;

    useEffect(() => {
        fetchData("France", "30");


        document.querySelector(".loading-svg").innerHTML = _loadingSVG;
    }, [])

    function formatDate(s) {
        const date = new Date(s);
        const options = { month: 'short' };
        const newDate = (date.getDate()) + "-" + (new Intl.DateTimeFormat('en-US', options).format(date)) + "-" + date.getFullYear();
        return newDate;
    }

    function changeCountry(e) {
        e.preventDefault();
        setApiResult(() => "");
        resetSuggestions();
        if (e.target.firstChild.value.length > 0) {
            fetchData(e.target.firstChild.value, "30");
        }
    }

    function changeDays(_days) {
        if (_days === "all") {
            setOptions(() => options_all);
        } else {
            setOptions(() => options_default);
        }

        fetchData(country, _days);
    }

    function resetSuggestions() {
        setApiResult(() => "");
        const span = document.querySelector(".search-container span");
        while (span.firstChild) { span.removeChild(span.firstChild); }
    }

    function suggestionSubmit() {
        // console.log(this.value);
        resetSuggestions();
        setOptions(() => options_default);
        fetchData(this.value, "30");
    }

    return <>
        <Search submitCallback={changeCountry} resetCallback={resetSuggestions} suggestionSubmit={suggestionSubmit} apiresult={apiresult} />

        <div className="country-title">
            <h2>{country}</h2>
            <div className={loading ? "" : "stop-loading"}>
                <span>loading data</span>
                <div className="loading-svg">
                    {_loadingSVG}
                </div>
            </div>
        </div>
        <section className="country-summary">
            <div><img src="https://disease.sh/assets/img/flags/fr.png" alt="france"></img></div>
            <div className="summary-case"><span>Population</span><span>65494103</span></div>
            <div className="summary-case"><span>active</span><span>4045100</span></div>
            <div className="summary-case"><span>todayCases</span><span>361719</span></div>
            <div className="summary-case"><span>todayDeaths</span><span>246</span></div>
            <div className="summary-case"><span>todayRecovered</span><span>246</span></div>
            <div className="summary-case"><span>cases</span><span>12934982</span></div>
            <div className="summary-case"><span>deaths</span><span>126305</span></div>
            <div className="summary-case"><span>recovered</span><span>126305</span></div>
            <div className="summary-case"><span>tests</span><span>126305</span></div>
            <div className="summary-case"><span>lethality rate</span><span>126305</span></div>

        </section>


        <div className="country-chart-container">
            <ul className="country-filters">
                <div>
                </div>
                <div>
                    <li className={days === "all" ? "li-selected" : ""} onClick={() => { changeDays("all") }}>all</li>
                    <li className={days === "90" ? "li-selected" : ""} onClick={() => { changeDays("90") }}>last 3 months</li>
                    <li className={days === "30" ? "li-selected" : ""} onClick={() => { changeDays("30") }}>last 30 days</li>
                </div>
            </ul>
            <div><div className={scale === 2 ? "scale2" : ""}><Line data={data} options={options} ref={refLineChart0} /></div></div>
            <Line data={data} options={options} ref={refLineChart1} />
            <Line data={data} options={options} ref={refLineChart2} />
        </div>
    </>
}

export default Country;