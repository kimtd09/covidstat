const _url1 = "https://api.covid19api.com/summary";

let myChart;
let labels = [];
let dataArray = [];
const dataDeathArray = [];

document.querySelector(".search").addEventListener("change", (e) => {
    let newArrayLabel = [];
    let newArrayData = [];

   labels.forEach(function (d, i) {
        if (d.toLowerCase().startsWith(e.target.value.toLowerCase())) {
            newArrayLabel.push(d);
            newArrayData.push(dataArray[i]);
        }

        myChart.data.labels = newArrayLabel;
        myChart.data.datasets[0].data = newArrayData;
        myChart.canvas.classList.toggle("canvas-smaller", true);
        myChart.update();
    });

    // console.log(labels.filter(w => w.toLowerCase().startsWith(e.target.value)));
})

async function loadUrl() {
    const r = await fetch(_url1);
    const d = await r.json();
    // console.log(d);
    const _date = new Date(d.Date);
    const e = document.querySelector(".global-container");
    e.innerHTML += `<div>Last updated: ${_date.toLocaleDateString()} ${_date.toLocaleTimeString()}</div>`;
    e.innerHTML += "<br/>";
    e.innerHTML += `<div>+${formatNumber(d.Global.NewConfirmed)} new cases</div>`;
    e.innerHTML += `<div>+${formatNumber(d.Global.NewDeaths)} new deaths</div>`;
    e.innerHTML += "<br/>";
    e.innerHTML += `<div>${formatNumber(d.Global.TotalConfirmed)} total cases</div>`;
    e.innerHTML += `<div>${formatNumber(d.Global.TotalDeaths)} total deaths</div>`;
    e.innerHTML += "<br/>";
    e.innerHTML += `<div>Lethality Rate: ${formatPercentage(d.Global.TotalDeaths / d.Global.TotalConfirmed)}</div>`;

    d.Countries.forEach(e => {
        if (e.TotalConfirmed > 0) {
            labels.push(e.Country);
            dataArray.push(e.TotalConfirmed);
            dataDeathArray.push(e.TotalDeaths);
        }
    })

    // eslint-disable-next-line no-undef
    myChart = new Chart(
        document.querySelector('.myChart'),
        config
    )

}

loadUrl();

/*
    Convert and format a number to a readable string
*/
function formatNumber(n) {
    if (n > 1000000) {
        return (n / 1000000).toFixed(2) + " millions";
    }

    return n;
}

function formatPercentage(n) {
    return n.toFixed(3) + "%";
}


/*
https://www.chartjs.org/docs/latest/samples/bar/vertical.html
*/

const data = {
    labels: labels,
    datasets: [
        {
            label: 'All countries',
            backgroundColor: 'rgb(255, 99, 132)',
            borderColor: 'rgb(255, 99, 132)',
            data: dataArray,
        }
        // ,
        // {
        //     label: 'Total Deaths',
        //     data: dataDeathArray,
        //     borderColor: 'rgb(0, 0, 0)',
        //     backgroundColor: 'rgb(0, 0, 0)',
        // }
    ]
};

// dataJson.map(element => {
//     labels.push(element.Country);
// });

const config = {
    type: 'bar',
    data: data,
    options: {
        indexAxis: 'y',
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
    },
};

const actions = [
    {
        name: "All Countries",
        handler(chart) {
            chart.data.labels = labels;
            chart.data.datasets[0].label = "All countries";
            chart.data.datasets[0].data = dataArray;

            chart.canvas.classList.remove("canvas-smaller");
            chart.canvas.style.height = "4000px";
            chart.update();
        }
    },
    {
        name: 'Top 10',
        handler(chart) {
            let arrayOfObj = []

            labels.forEach(function (d, i) {
                arrayOfObj.push({
                    label: d,
                    data: dataArray[i] || 0
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
            chart.canvas.classList.toggle("canvas-smaller", true);
            chart.update();
        }
    }
    , {
        name: "Over 1 million",
        handler(chart) {
            const newLabelArray = [];
            const newDataArray = [];

            dataArray.forEach(function (d, i) {
                if (d > 1000000) {
                    newLabelArray.push(labels[i]);
                    newDataArray.push(d);
                }
            });

            chart.data.labels = newLabelArray;
            chart.data.datasets[0].label = "1+ million cases";
            chart.data.datasets[0].data = newDataArray;
            chart.canvas.classList.remove("canvas-smaller");
            chart.canvas.style.height = "1000px";
            chart.update();
        }
    }
];

const sort = [
    {
        name: "Alphabetical",
        handler(chart) {
            sortF(chart, (a, b) => {
                if( b.label < a.label ) { return 1; }
                return -1;
            })
        }
    },
    {
        name: "Highest",
        handler(chart) {
            sortF(chart, (a, b) => {
                if( b.data > a.data ) { return 1; }
                return -1;
            })
        }
    },
    {
        name: "Lowest",
        handler(chart) {
            sortF(chart, (a, b) => {
                if( b.data < a.data ) { return 1; }
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

/*
    https://codepen.io/jeremybradbury/pen/xxdddoB
*/
actions.forEach((a, i) => {
    let button = document.createElement("button");
    button.id = "button" + i;
    button.innerText = a.name;
    button.onclick = () => a.handler(myChart);
    document.querySelector(".buttons").appendChild(button);
});

sort.forEach((a, i) => {
    let button = document.createElement("button");
    button.id = "button" + i;
    button.innerText = a.name;
    button.onclick = () => a.handler(myChart);
    document.querySelector(".sort").appendChild(button);
});