import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { Line } from "react-chartjs-2";
import { COLORS } from "../assets/data/colors";

function Country() {

    const [country, setCountry] = useState("France");
    const [apiresult, setApiResult] = useState("");
    const [data, setData] = useState({ labels: ["J", "F"], datasets: [{ label: "a", backgroundColor: COLORS.yellow.border, borderColor: COLORS.yellow.border, data: [1, 2] }] });

    const refLineChart = useRef(null);
    const refLineChart2 = useRef(null);


    async function fetchData(_country) {
        const _url = `https://corona.lmao.ninja/v2/historical/${_country}?lastdays=30`;

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

            refLineChart.current.data = _newLineData;
            refLineChart2.current.data = _newLineData2;
            refLineChart.current.update();
            refLineChart2.current.update();
        } catch (e) {
            console.log(e);
            setApiResult(() => e.message);
        }
    }

    useEffect(() => {
        fetchData("France");
    }, [])

    function changeCountry(e) {
        e.preventDefault();
        fetchData(e.target.firstChild.value);
    }

    return <>
        <section className="search-container">
            <form method="post" onSubmit={changeCountry}>
                <input placeholder="search country"></input>
            </form>
            <div className="api_result">{apiresult}</div>
        </section>
        <h2>{country}</h2>
        <div className="country-chart-container">
            <Line data={data} ref={refLineChart} />
            <Line data={data} ref={refLineChart2} />
        </div>
    </>
}

export default Country;