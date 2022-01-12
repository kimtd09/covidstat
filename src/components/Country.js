import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { Line } from "react-chartjs-2";
import { COLORS } from "../assets/data/colors";

function Country() {

    const [country, setCountry] = useState("France");
    const [days, setDays] = useState(30);
    const [apiresult, setApiResult] = useState("");
    const [data, setData] = useState({ labels: ["J", "F"], datasets: [{ label: "a", backgroundColor: COLORS.yellow.border, borderColor: COLORS.yellow.border, data: [1, 2] }] });

    const refLineChart0 = useRef(null);
    const refLineChart1 = useRef(null);
    const refLineChart2 = useRef(null);


    async function fetchData(_country, _days) {
        const _url0 = `https://api.covid19api.com/total/dayone/country/${_country}`;
        const _url = `https://corona.lmao.ninja/v2/historical/${_country}?lastdays=${_days}`;

        try {
            const response = await axios.get(_url0);
            const labelArray = [];
            const caseArray = [];
            console.log(response.data);

            response.data.forEach(element => {
                const date = new Date(element.Date);
                labelArray.push(date.toLocaleDateString());
                caseArray.push(element.Confirmed);
            });

            const caseIncrementArray = [];

            for(let i=0, end=caseArray.length-1; i<caseArray.length; i++) {
                if(i === 0) {
                    caseIncrementArray.push(caseArray[i]);
                }else {
                    caseIncrementArray.push(caseArray[i]-caseArray[i-1]);
                }
            }

            console.log(labelArray);
            console.log(caseArray);
            console.log(caseIncrementArray);

            const _newLineData = {
                labels: labelArray.slice(labelArray.length-days,labelArray.length+1), datasets: [
                    { label: "New Cases", backgroundColor: COLORS.green.border, borderColor: COLORS.green.border, data: caseIncrementArray.slice(labelArray.length-days,labelArray.length+1) }
                ]
            };

            refLineChart0.current.data = _newLineData;
            refLineChart0.current.update();
        } catch (e) {
            console.log(e);
            setApiResult((d) => e.message);
        }


        try {
            const response = await axios.get(_url);
            setCountry(_country);
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

            refLineChart1.current.data = _newLineData;
            refLineChart2.current.data = _newLineData2;
            refLineChart1.current.update();
            refLineChart2.current.update();
        } catch (e) {
            console.log(e);
            setApiResult((d) => d + e.message);
        }
    }

    useEffect(() => {
        fetchData("France");
    }, [])

    function changeCountry(e) {
        e.preventDefault();
        if (e.target.firstChild.value.length > 0) {
            fetchData(e.target.firstChild.value);
        }
    }

    function changeDays(_days) {
        setDays(() => _days);
        fetchData(country, _days);
    }

    return <>
        <section className="search-container">
            <form method="post" onSubmit={changeCountry}>
                <input placeholder="search country"></input><button type="submit">OK</button><button type="reset">reset</button>
            </form>
            <div className="api_result">{apiresult}</div>
        </section>
        <h2>{country}</h2>
        <ul>
            <li onClick={() => changeDays("all")}>all</li>
            <li onClick={() => changeDays("90")}>last 3 months</li>
            <li onClick={() => changeDays("30")}>last 30 days</li>
        </ul>
        <hr />
        <div className="country-chart-container">
            <Line data={data} ref={refLineChart0} />
            <Line data={data} ref={refLineChart1} />
            <Line data={data} ref={refLineChart2} />
        </div>
    </>
}

export default Country;