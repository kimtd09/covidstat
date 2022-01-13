function formatDate(s) {
    const date = new Date(s);
    const options = { month: 'short' };
    const newDate = (date.getDate()) + "-" + (new Intl.DateTimeFormat('en-US', options).format(date)) + "-" + date.getFullYear();
    return newDate;
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

function capitalize(s) {
    if(s.length <= 3) {
        return s.toUpperCase();
    }

    return capitalizeFirstLetter(s);
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

export {formatDate, _loadingSVG, options_all, options_default, capitalize};