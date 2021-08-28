// let userNameImput = document.getElementById(`userName`);
let userAgeImput = document.getElementById(`userAge`);
let userVacImput = document.getElementById(`userVac`);
let riskCalcButton = document.getElementById(`riskCalc`);
let outputDivided = document.getElementById(`output-area`);
let resultDivided = document.getElementById(`result-area`);
let infoDivided = document.getElementById(`info-area`);
let tweetDivided = document.getElementById(`tweet-area`);
let datasD = [];
let uName =0;
let uAge =0;
let uVac =0;
let ageG =0;
let outputD=0;


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

function processD(){
  var dateD = datasD[datasD.length-1][0] + '/' + datasD[datasD.length-1][1] + '/' + datasD[datasD.length-1][2]; // datasDから最新日付を取得
  var testedPositive = datasD[datasD.length-1][4]; //datasDから世代陽性者累計を取得
  var serious = datasD[datasD.length-1][6]; //datasDから同世代重症者数を取得
  var death = datasD[datasD.length-1][7]; //datasDから同世代死者累計を取得
  testedPositive = parseInt(testedPositive);
  serious = parseInt(serious);
  death = parseInt(death);
  var fatal = serious + death ; //serious と　death から最新日付の同世代致死症例数を計算
  var fatality = (fatal / testedPositive)*100; //致死リスク率を計算
  fatality = fatality.toFixed(2); //小数点第2位の数値に成型
  var trafficAccident2020 = 309000; //出典　警察庁交通局交通企画課「令和２年中の交通事故死者について」2021/1/6
  var deathTrafficAccident2020 = 2839; //参照元　https://www.e-stat.go.jp/stat-search/file-download?statInfId=000032035150&fileKind=1
  var TAfatality2020 = (deathTrafficAccident2020 / trafficAccident2020)*100; //２０２０年度交通事故致死リスク率を計算
  TAfatality2020 = TAfatality2020.toFixed(2); //小数点第2位の数値に成型
  
  var riskFlag =0;
  if (fatality < TAfatality2020){
    riskFlag = '低い水準です';
  } else if (fatality > TAfatality2020){
    riskFlag = '高水準のリスクです';
  } else {
    riskFlag = '同水準です';
  }

  outputD = `【死亡リスク】${ageG}陽性者累計数:${testedPositive}, 致死症例数:${fatal}(= 重症者:${serious} + 死者累計:${death}), ★国内${ageG}のCovid-19感染致死率は${fatality +'%'}です。昨年度交通事故死亡率:${TAfatality2020 +'%'}と比べて${riskFlag}。（${dateD}集計）`;
  return outputD;
}


function processV(){
  switch(uVac) {
    case "phizer":
      outputV = `ファイザーはmRNA型ワクチンで発症予防効果率は約95%です。痛みや発熱等の副反応が確認されています。重篤副反応（アナフィキラシー等）発生率は0.3％です。(厚労省8/4報告資料より)`;
      break;
    case "moderna":
      outputV = 
      `モデルナはmRNA型ワクチンで発症予防効果率は約94%です。副反応が確認されておりファイザーに比べて痛みや発熱等症状の発生率が(5〜20pt)高めです。重篤副反応（アナフィキラシー等）発生率は0.3％です。(厚労省8/4報告資料より)`;
      break;
    case "astra-zeneca":
      outputV = 
      `アストラゼネカはウイルスベクター型ワクチンで発症予防効果率は約70%です。副反応および重篤副反応発生率に関する公開データはありません。(厚労省8/4報告資料より)`;
      break;
    default:
      outputV = ""
      break;
  }
  return outputV;
}


function riskCalcD() {
  switch (uAge) {
    case "10th":
      ageG = datasD[2][3];
      console.log(`年代は ${ageG} です`);
      break;
    case "20th":
      ageG = datasD[3][3];
      console.log(`年代は ${ageG} です`);
      break;
    case "30th":
      ageG = datasD[4][3]; 
      console.log(`年代は ${ageG} です`);
      break;
    case "40th":
      ageG = datasD[5][3]; 
      console.log(`年代は ${ageG} です`);
      break;
    case "50th":
      ageG = datasD[6][3]; 
      console.log(`年代は ${ageG} です`);
      break;
    case "60th":
      ageG = datasD[7][3];
      console.log(`年代は ${ageG} です`);
      break;
    case "70th":
      ageG = datasD[8][3]; 
      console.log(`年代は ${ageG} です`);
      break;
    case "80th":
      ageG = datasD[9][3];
      console.log(`年代は ${ageG} です`);
      break;
    case "0th":
      ageG = datasD[1][3];
      console.log(`年代は ${ageG} です`);
      break;
  }
  datasD = datasD.filter(i => i[3] == ageG); // 同世代の感染状況データを抽出
  processD(datasD);
  processV();

}

riskCalcButton.onclick = () => {
//   uName = userNameImput.value;
  uAge = userAgeImput.value;
  uVac = userVacImput.value;

  riskCalcD();
  
  resultDivided.innerHTML = `<br>${outputD} <br>${outputV}`;

//   resultDivided.innerHTML = `あなたの${ageG}世代です。摂取検討ワクチンは${uVac}です。`;

}
