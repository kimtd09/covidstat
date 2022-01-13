import { countriesList } from "../assets/data/countries";

function Search(args) {

    function suggest(e) {
        args.resetCallback();
        const span = document.getElementById(args.id);

        if (e.target.value.length > 2) {
            span.innerHTML = "<span>suggestions:</span>";
            countriesList.forEach(c => {
                if (c.Country.toLowerCase().startsWith(e.target.value.toLowerCase())) {
                    const b = document.createElement("button");
                    b.value = c.Country;
                    b.innerText = c.Country;
                    b.onclick = args.suggestionSubmit;
                    span.appendChild(b);
                }
            })
        }
    }

    return <>
        <section className="search-container">
            <form id={"form"+args.id} method="post" onSubmit={args.submitCallback} onReset={args.resetCallback}>
                <input placeholder="search country" onChange={suggest}></input><button type="submit">OK</button><button type="reset">X</button>
            </form>
            <div className="api_result">{args.apiresult}</div>
            <span id={args.id}></span>
        </section>
    </>
}

export default Search;