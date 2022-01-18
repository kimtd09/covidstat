import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { Line } from "react-chartjs-2";
import { COLORS } from "../assets/data/colors";
import { capitalize, formatDate, options_all, options_default, _loadingSVG } from "../tools";
import Search from "./Search";

function Compare() {

    const [apiresult, setApiResult] = useState("");
    const [data] = useState({ labels: [""], datasets: [{ label: "", data: [] }] });
    const [days, setDays] = useState("30");
    const [country] = useState([]);
    const [countryData, setCountryData] = useState([]);
    const [dataCases, setDataCases] = useState([]);
    const [dataDeaths, setDataDeaths] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refresh, setRefresh] = useState(false);
    const [usedColor, setUsedColors] = useState([]);
    const [options, setOptions] = useState(options_default);
    const [dataType, setDataType] = useState("Cases");

    const refLineChart = useRef();

    useEffect(() => {
        document.querySelectorAll(".loading-svg")[1].innerHTML = _loadingSVG;
    }, [])

    async function fetchDataAPI(c, d) {
        const _url = `https://disease.sh/v3/covid-19/historical/${c}?lastdays=${d}`;

        try {
            const response = await axios.get(_url);

            if (!country.includes(response.data.country.toLowerCase())) {

                document.getElementById("form2").reset();

                const labelArray = Object.keys(response.data.timeline.cases);
                const caseArray = Object.values(response.data.timeline.cases);
                const deathArray = Object.values(response.data.timeline.deaths);

                labelArray.forEach((e, i) => {
                    labelArray[i] = formatDate(e);
                });

                const name = capitalize(response.data.country);
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

                country.push(response.data.country.toLowerCase());
                countryData.push(obj);
                dataCases.push(obj.cases.datasets[0]);
                dataDeaths.push(obj.deaths.datasets[0]);
                setDays(() => d);

                if (countryData.length === 1) {
                    if (dataType === "Cases") {
                        refLineChart.current.data = obj.cases;
                    }
                    else if (dataType === "Deaths") {
                        refLineChart.current.data = obj.deaths;
                    }
                    else if (dataType === "New Cases") {
                        refLineChart.current.data = obj.newCases;
                    }
                    else if (dataType === "New Deaths") {
                        refLineChart.current.data = obj.newDeaths;
                    }
                }
                else {
                    if (dataType === "Cases") {
                        refLineChart.current.data.datasets.push(obj.cases.datasets[0]);
                    }
                    else if (dataType === "Deaths") {
                        refLineChart.current.data.datasets.push(obj.deaths.datasets[0]);
                    }
                    else if (dataType === "New Cases") {
                        refLineChart.current.data.datasets.push(obj.newCases.datasets[0]);
                    }
                    else if (dataType === "New Deaths") {
                        refLineChart.current.data.datasets.push(obj.newDeaths.datasets[0]);
                    }

                }
                refLineChart.current.update();
                setRefresh(() => !refresh);
            }

        } catch (e) {
            console.log(e);
            setApiResult(() => c + ": country not found");
        } finally {
            setLoading(() => false);
            refreshState();
        }

    }

    function refreshState() {
        setRefresh(() => !refresh);
    }

    function getColor() {
        const colors = Object.keys(COLORS);
        if (usedColor.length === 0) {
            usedColor.push(colors[0]);
            return colors[0];
        }
        else {
            for (let i = 0; i < colors.length; i++) {
                if (!usedColor.includes(colors[i])) {
                    usedColor.push(colors[i]);
                    return colors[i];
                }
            }
        }

        return colors.lastItem;
    }

    async function fetchData(c, d) {
        setLoading(() => true);
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
        if (_days === "all") {
            setOptions(() => options_all);
        } else {
            setOptions(() => options_default);
        }

        const array = country.slice(0, country.length);
        const toRemove = document.querySelectorAll(".compare-titles span");

        toRemove.forEach(e => {
            removeData({ target: e });
        })

        array.forEach(e => {
            // promise concurrence!
            fetchData(e, _days)
        })
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
                usedColor.splice(i, 1);
                refLineChart.current.data.datasets.splice(i, 1);
                return;
            }
        });

        refLineChart.current.update();
    }

    function changeData(type) {
        refLineChart.current.data.datasets = [];

        if (type === "Cases") {
            dataCases.forEach(e => {
                refLineChart.current.data.datasets.push(e);
            })
        }
        else if (type === "Deaths") {
            dataDeaths.forEach(e => {
                refLineChart.current.data.datasets.push(e);
            })
        }


        countryData.forEach(e => {
            // if (type === "Cases") {
            //     if(e.cases.datasets[0])
            //     refLineChart.current.data.datasets.push(e.cases.datasets[0]);
            // }
            // else 
            // if (type === "Deaths") {
            //     refLineChart.current.data.datasets.push(e.deaths.datasets[0]);
            // }
            // else 
            if (type === "New Cases") {
                refLineChart.current.data.datasets.push(e.newCases.datasets[0]);
            }
            else if (type === "New Deaths") {
                refLineChart.current.data.datasets.push(e.newDeaths.datasets[0]);
            }
        })

        setDataType(() => type);
        refLineChart.current.update();
    }

    return <div>
        <Search submitCallback={addCountry} resetCallback={resetSuggestions} suggestionSubmit={suggestionSubmit} apiresult={apiresult} id="2" key="2" />
        {/* <div className="debug">
            {countryData.length}
        </div> */}
        <div className="country-title">
            <h3 className="compare-titles" data-refresh={refresh}>{countryData.map((e, i) => {
                return <span className={e.name.length <= 3 ? "capitalize" : ""} onClick={removeData} key={i}>{e.name}</span>;
            })}</h3>
            <div className={loading ? "" : "stop-loading"}>
                <span>loading data</span>
                <div className="loading-svg">
                </div>
            </div>
        </div>
        <div className="country-chart-container">
            <ul className="country-filters">
                <div className="dropmenu-container">
                    <div className="compare-dropmenu">
                        <label className="li-selected" htmlFor="drop">
                            {dataType}
                            <input id="drop" type="checkbox" style={{ display: "none" }}></input>
                            <ul>
                                <li className={dataType === "Cases" ? "data-selected" : ""} onClick={() => changeData("Cases")}>Cases</li>
                                <li className={dataType === "Deaths" ? "data-selected" : ""} onClick={() => changeData("Deaths")}>Deaths</li>
                                <li className={dataType === "New Cases" ? "data-selected" : ""} onClick={() => changeData("New Cases")}>New Cases</li>
                                <li className={dataType === "New Deaths" ? "data-selected" : ""} onClick={() => changeData("New Deaths")}>New Deaths</li>
                            </ul>
                        </label>
                    </div>
                </div>
                <div>
                    <li className={days === "all" ? "li-selected" : ""} onClick={() => { changeDays("all") }}>all</li>
                    <li className={days === "90" ? "li-selected" : ""} onClick={() => { changeDays("90") }}>last 3 months</li>
                    <li className={days === "30" ? "li-selected" : ""} onClick={() => { changeDays("30") }}>last 30 days</li>
                </div>
            </ul>
            <Line data={data} options={options} ref={refLineChart} />
        </div>
    </div>
}

export default Compare;