//const search = document.querySelector('.search');
const gpa = document.querySelector('.gpa');
const addCourseBtn = document.querySelector('.addCourse');
const closeFormBtn = document.querySelector('.close');
const form = document.querySelector('form');

const formName = document.querySelector('#name');
const formYear = document.querySelector('#year');
const formGrade = document.querySelector('#grade');
const formCredits = document.querySelector('#credits');
const submitBtn = document.querySelector('.submit');
const table = document.querySelector('table');

const creditsError = document.querySelector("#credits + span.error");

let db;
const openRequest = window.indexedDB.open("grades_list", 1);

openRequest.addEventListener("error", () =>
  console.error("Database failed to open")
);

openRequest.addEventListener("success", () => {
  console.log("Database opened successfully");
  db = openRequest.result;
  displayTable();
});

openRequest.addEventListener("upgradeneeded", (e) => {
  db = e.target.result;
  const objectStore = db.createObjectStore("grades_os", {
    keyPath: "id",
    autoIncrement: true,
  });
  objectStore.createIndex("name", "name", { unique: false });
  objectStore.createIndex("year", "year", { unique: false });
  objectStore.createIndex("grade", "grade", { unique: false });
  objectStore.createIndex("credits", "credits", { unique: false });
  console.log("Database setup complete");
});

form.addEventListener("submit", addData);

function addData(e) {
  e.preventDefault();
  const course = { name: formName.value, year: formYear.value, grade: formGrade.value.charAt(0).toUpperCase() + formGrade.value.slice(1), credits: formCredits.value };
  const transaction = db.transaction(["grades_os"], "readwrite");
  const objectStore = transaction.objectStore("grades_os");
  const addRequest = objectStore.add(course);

  /*addRequest.addEventListener("success", () => {
    form.reset();
  });*/

  transaction.addEventListener("complete", () => {
    console.log("Transaction completed: database modification finished.");
    displayTable();
  });

  transaction.addEventListener("error", () =>
    console.log("Transaction not opened due to error")
  );
}

function displayTable() {
  while (table.childNodes.length > 2) {
    table.removeChild(table.lastChild);
  }
  let totalCredits = 0;
  let gpaCalc = 0;
  const objectStore = db.transaction("grades_os").objectStore("grades_os");
  objectStore.openCursor().addEventListener("success", (e) => {
    const cursor = e.target.result;

    if (cursor) {
      const tableRow = document.createElement("tr");
      const tableName = document.createElement("td");
      const tableYear = document.createElement("td");
      const tableGrade = document.createElement("td");
      const tableCredits = document.createElement("td");

      tableRow.appendChild(tableYear);
      tableRow.appendChild(tableName);
      tableRow.appendChild(tableGrade);
      tableRow.appendChild(tableCredits);
      table.appendChild(tableRow);

      tableName.textContent = cursor.value.name;
      tableYear.textContent = cursor.value.year;
      tableGrade.textContent = cursor.value.grade;
      tableCredits.textContent = cursor.value.credits;

      tableRow.setAttribute("id", cursor.value.id);

      const deleteBtn = document.createElement("button");
      tableRow.appendChild(deleteBtn);
      deleteBtn.textContent = "Delete"; //change to edit later

      deleteBtn.addEventListener("click", deleteItem);

      gpaCalc += Number(cursor.value.credits) * gradeToPoint(cursor.value.grade);
      totalCredits += Number(cursor.value.credits); 

      cursor.continue();
    } 
    else {
      if (table.childNodes.length < 3) {
        //console.log("No courses in db");
        gpa.textContent = "0.0";
      }
      else {
        console.log("Courses all displayed");
        let finalGPA = gpaCalc/totalCredits;
        finalGPA = Math.round(finalGPA * 10) / 10;
	      finalGPA = finalGPA.toFixed(1);
        gpa.textContent = `${finalGPA}`;
      }
    }
  });
}

function deleteItem(e) {
  const courseId = Number(e.target.parentNode.getAttribute("id"));

  const transaction = db.transaction(["grades_os"], "readwrite");
  const objectStore = transaction.objectStore("grades_os");
  const deleteRequest = objectStore.delete(courseId);

  transaction.addEventListener("complete", () => {
    e.target.parentNode.parentNode.removeChild(e.target.parentNode);
    console.log(`Course ${courseId} deleted.`);

    if (table.childNodes.length < 3) {
      console.log("No courses in db");
      gpa.textContent = "0.0";
    }
    displayTable();
  });
}

function gradeToPoint(grade) {
  switch(grade){
    case('F'):
      return 0;
    case('D-'):
      return 1;
    case('D'):
      return 2;
    case('D+'):
      return 3;
    case('C-'):
      return 4;
    case('C'):
      return 5;
    case('C+'):
      return 6;
    case('B-'):
      return 7;
    case('B'):
      return 8;
    case('B+'):
      return 9;
    case('A-'):
      return 10;
    case('A'):
      return 11;
    default:
      return 12;
  }
}


//parameters are table data
function showCourseForm() {
  if (getComputedStyle(form).display === 'none') {
    form.style.display = 'block';
  }
}


function validateCredits() {
  var creds = Number(credits.value);
  console.log(creds);
  if (credits.validity.valueMissing) {
    creditsError.textContent = "Enter the number of credits for this course";
    creditsError.className = 'error active';
    submitBtn.disabled = true;
  }
  else if (isNaN(creds)) {
    creditsError.textContent = "Enter a valid number greater than or equal to 1";
    creditsError.className = 'error active';
    submitBtn.disabled = true;
  }
  else if (creds < 1) {
    creditsError.textContent = "Enter a valid number greater than or equal to 1";
    creditsError.className = 'error active';
    submitBtn.disabled = true;
  }
  else {
    creditsError.textContent = '';
    creditsError.className = 'error';
    submitBtn.disabled = false;
  }
}

//search.addEventListener('keypress', searchTable);
addCourseBtn.addEventListener('click', showCourseForm);
closeFormBtn.addEventListener('click', () => {
  creditsError.textContent = '';
  creditsError.className = 'error';
  submitBtn.disabled = false;
  form.style.display = 'none';
  form.reset();
});
credits.addEventListener('input', validateCredits);