let userNameImput = document.getElementById(`userName`);
let userAgeImput = document.getElementById(`userAge`);
let userVacImput = document.getElementById(`userVac`);
let riskCalcButton = document.getElementById(`riskCalc`);
let outputDivided = document.getElementById(`output-area`);
let resultDivided = document.getElementById(`result-area`);
let infoDivided = document.getElementById(`info-area`);
let tweetDivided = document.getElementById(`tweet-area`);
let datasD = [];

getCSV = () => {
  let lines = [];
  let csvData = new XMLHttpRequest();
  csvData.addEventListener('load', (event) => {
    const response = event.target.responseText;
    outputDivided.innerHTML = response;
    lines = response.split('\n');
    
    // 各行ごとにカンマで区切った文字列を要素とした二次元配列を生成
    for (let i = 0; i < lines.length ; ++i) {
      datasD[i] = lines[i].split(',');
    }
  });
  csvData.open('GET','demography.csv',true);
  csvData.send();
  console.log(datasD);
  return datasD;
}

getCSV();

function riskCalcD() {
  let ageG = datasD[2][3];
}

riskCalcButton.onclick = () => {
  let uName = userNameImput.value;
  let uAge = userAgeImput.value;
  let uVac = userVacImput.value;

  riskCalcD();

  resultDivided.innerHTML = `年代は${ageG}です。`;

}
