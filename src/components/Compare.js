import axios from "axios";
import { useRef, useState } from "react";
import { Line } from "react-chartjs-2";
import { COLORS } from "../assets/data/colors";
import { formatDate, _loadingSVG } from "../tools";
import Search from "./Search";

function Compare() {

    const [apiresult, setApiResult] = useState("");
    const [data] = useState({ labels: [""], datasets: [{ label: "", data: [] }] });
    const [days, setDays] = useState("30");
    const [country] = useState([]);
    const [countryData, setCountryData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refresh, setRefresh] = useState(false);
    const [usedColor, setUsedColors] = useState([]);

    const refLineChart = useRef();

    async function fetchDataAPI(c, d) {
        const _url = `https://disease.sh/v3/covid-19/historical/${c}?lastdays=${d}`;

        try {
            if (!country.includes(c.toLowerCase())) {
                const response = await axios.get(_url);

                country.push(response.data.country.toLowerCase());

                document.getElementById("form2").reset();
                setDays(() => d);

                const labelArray = Object.keys(response.data.timeline.cases);
                const caseArray = Object.values(response.data.timeline.cases);
                const deathArray = Object.values(response.data.timeline.deaths);

                labelArray.forEach((e, i) => {
                    labelArray[i] = formatDate(e);
                });

                const name = response.data.country.toLowerCase();
                const obj = { name: name };

                const color = getColor();

                obj.color = color;

                obj.cases = {
                    labels: labelArray, datasets: [
                        { label: name, backgroundColor: COLORS[color].border, borderColor: COLORS[color].border, data: caseArray }
                    ]
                };

                obj.deaths = {
                    labels: labelArray, datasets: [
                        { label: name, backgroundColor: COLORS[color].border, borderColor: COLORS[color].border, data: deathArray }
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

                const start = labelArray.length - d;
                const end = labelArray.length + 1;
                obj.newCases = {
                    labels: labelArray.slice(start, end), datasets: [
                        { label: name, backgroundColor: COLORS[color].border, borderColor: COLORS[color].border, data: caseIncrementArray.slice(start, end) },
                    ]
                };

                obj.newDeaths = {
                    labels: labelArray.slice(start, end), datasets: [
                        { label: name, backgroundColor: COLORS[color].border, borderColor: COLORS[color].border, data: deathIncrementArray.slice(start, end) }
                    ]
                };

                countryData.push(obj);

                if (countryData.length === 1) {
                    refLineChart.current.data = obj.deaths;
                }
                else {
                    refLineChart.current.data.datasets.push(obj.deaths.datasets[0]);
                }
                refLineChart.current.update();
                setRefresh(() => !refresh);
            }

        } catch (e) {
            console.log(e);
            setApiResult(() => c + ": country not found");
        }

    }

    function getColor() {
        const colors = Object.keys(COLORS);
        if (usedColor.length === 0) {
            usedColor.push(colors[0]);
            return colors[0];
        }
        else {
            for(let i=0; i<colors.length; i++) {
                if(!usedColor.includes(colors[i])) {
                    usedColor.push(colors[i]);
                    return colors[i];
                }
            }
        }

        return colors.lastItem;
    }

    function fetchData(c, d) {
        fetchDataAPI(c, d);
    }

    function addCountry(e) {
        e.preventDefault();
        resetSuggestions();
        fetchData(e.target.firstChild.value, "30");
    }

    function resetSuggestions() {
        setApiResult(() => "");
        const span = document.getElementById("2");
        while (span.firstChild) { span.removeChild(span.firstChild); }
    }

    function suggestionSubmit() {
        // console.log(this.value);
        resetSuggestions();
        // setOptions(() => options_default);
        fetchData(this.value, "30");
    }

    function changeDays(_days) {
        // if (_days === "all") {
        //     setOptions(() => options_all);
        // } else {
        //     setOptions(() => options_default);
        // }

        // fetchData(country, _days);
    }

    function removeData(e) {



        country.forEach((element, i) => {
            if (element.toLowerCase() === e.target.innerText.toLowerCase()) {
                country.splice(i, 1)
                return;
            }
        });

        countryData.forEach((element, i) => {
            if (element.name.toLowerCase() === e.target.innerText.toLowerCase()) {
                countryData.splice(i, 1)
                setRefresh(() => !refresh);
                return;
            }
        });

        refLineChart.current.data.datasets.forEach((element, i) => {
            if (element.label.toLowerCase() === e.target.innerText.toLowerCase()) {
                usedColor.splice(i,1);
                refLineChart.current.data.datasets.splice(i, 1);
                return;
            }
        });

        refLineChart.current.update();
    }

    return <div>
        <Search submitCallback={addCountry} resetCallback={resetSuggestions} suggestionSubmit={suggestionSubmit} apiresult={apiresult} id="2" />
        <div className="debug">
            {countryData.length}
        </div>
        <div className="country-title">
            <h2 className="compare-titles" data-refresh={refresh}>{countryData.map(e => {
                return <span onClick={removeData}>{e.name}</span>;
            })}</h2>
            <div className={loading ? "" : "stop-loading"}>
                <span>loading data</span>
                <div className="loading-svg">
                    {_loadingSVG}
                </div>
            </div>
        </div>
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
            <Line data={data} ref={refLineChart} />
        </div>
    </div>
}

export default Compare;