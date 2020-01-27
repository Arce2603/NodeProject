function loadStudents() {
    let url = '/api/students';
    let settings = {
        method: "GET"
    };
    fetch(url, settings)
        .then( response => {
            if (response.ok) {
                return response.json();
            }
        })
        .then(responseJSON => {
            displayResults(responseJSON);
        });
}

function displayResults(responseJSON) {
    $('#studentList').empty();
    console.log('w');
    for (let i = 0; i < responseJSON.length; i++) {
        $('#studentList').append(
            `<li>
                 ${responseJSON[i].nombre}  ${responseJSON[i].apellido}
            </li>
        `);
    }
}


function init() {
    loadStudents();
}

init();
