import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { Line } from "react-chartjs-2";
import { COLORS } from "../assets/data/colors";
import { countriesList } from "../assets/data/countries";

function Country() {

    const [country, setCountry] = useState("France");
    const [days, setDays] = useState("30");
    const [apiresult, setApiResult] = useState("");
    const [data, setData] = useState({ labels: ["J", "F"], datasets: [{ label: "a", backgroundColor: COLORS.yellow.border, borderColor: COLORS.yellow.border, data: [1, 2] }] });
    const [scale, setScale] = useState(1);
    // const [ratio, setRatio] = useState({maintainAspectRatio: true});

    const refLineChart0 = useRef(null);
    const refLineChart1 = useRef(null);
    const refLineChart2 = useRef(null);

    const options_all = {
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
        fetchDataAPI2(c, d);
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

    useEffect(() => {
        fetchData("France", "30");
    }, [])

    function changeCountry(e) {
        e.preventDefault();
        setApiResult(() => "");
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

    function suggest(e) {
        resetSuggestions();
        const span = document.querySelector(".search-container span");

        if (e.target.value.length > 2) {
            span.innerHTML = "<span>suggestions:</span>";
            countriesList.forEach(c => {
                if (c.Country.toLowerCase().startsWith(e.target.value.toLowerCase())) {
                    const b = document.createElement("button");
                    b.value = c.Country;
                    b.innerText = c.Country;
                    b.onclick = suggestionSubmit;
                    span.appendChild(b);
                }
            })
        }
    }

    function suggestionSubmit() {
        // console.log(this.value);
        resetSuggestions();
        fetchData(this.value, "30");
    }

    // function changeScale(x) {
    //     setScale(() => x);
    //     let bool=false;

    //     if( x === 1 ) {
    //         bool = true;
    //     }
    //     setRatio(() => {return { maintainAspectRatio: bool}} );
    // }

    return <>
        <section className="search-container">
            <form method="post" onSubmit={changeCountry} onReset={resetSuggestions}>
                <input placeholder="search country" onChange={suggest}></input><button type="submit">OK</button><button type="reset">X</button>
            </form>
            <div className="api_result">{apiresult}</div>
            <span></span>
        </section>
        <h2>{country}</h2>

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
                    {/* <li className={scale === 1 ? "li-selected" : ""} onClick={() => changeScale(1)}>1x</li>
                <li className={scale === 2 ? "li-selected" : ""} onClick={() => changeScale(2)}>2x</li> */}
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