function addPayEvent() {
    let paymentValue = document.getElementById("pay");
    let payBox = document.getElementById("payRate");
    let hiring = document.getElementById("queryType3");
    let comments = document.getElementById("queryType2");
    let questions = document.getElementById("queryType1");
    hiring.addEventListener('click', function() {
        paymentValue.value = "";
        payBox.hidden = false;
    });
    comments.addEventListener('change', function() {
        payBox.hidden = true;
        paymentValue.value = 0; // -1 means not for hiring
    });
    questions.addEventListener('change', function() {
        payBox.hidden = true;
        paymentValue.value = 0; // -1 means not for hiring
    });
}

function setRequiredMarkup() {
    let requiredFields = document.querySelectorAll('.required'); // required attribute is on labels
    for (let field of requiredFields) {
        field.innerHTML += "*";
    }
}

function notEmpty(value) {
    if (value.trim().length === 0) { 
        alert("Please don't enter empty text!\n");
        return false;
    }
    return true;

}

/* Checking for empty inputs (just spaces), rest is covered in HTML itself */
function formValidation() {
    let inputs = (document.querySelector("#contactForm").querySelectorAll("input[type='text'], textarea"));
    document.getElementById("contactForm").onsubmit = function() {
        let rv = true;
        for (let input of inputs) {
            if (!notEmpty(input.value)) {
                input.value = "";
                input.focus();
                rv = false;
            }
        }
        return rv;
    };
}

function setClock() {
    setInterval(() => {
        document.getElementById('date').innerHTML = (new Date).toDateString() + ", " + (new Date).toLocaleTimeString();
    }, 1000*1);
}

window.onload = function() {
    // Setting Date
    setClock();
    // Setting Required fields markup
    setRequiredMarkup();
    // Dynamic Textbox
    addPayEvent();
    // Form Validation Event
    formValidation();
}
