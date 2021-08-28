let userNameImput = document.getElementById(`userName`);
let userPrefImput = document.getElementById(`userPref`);
let userAgeImput = document.getElementById(`userAge`);
let userVacImput = document.getElementById(`userVac`);
let riskCalcButton = document.getElementById(`riskCalc`);
let outputDivided = document.getElementById(`output-area`);
let resultDivided = document.getElementById(`result-area`);
let infoDivided = document.getElementById(`info-area`);
let tweetDivided = document.getElementById(`tweet-area`);
let datasD = [];
let uName =0;
let uPref =0;
let uAge =0;
let uVac =0;
let ageG =0;
let outputD=0;
let outputV=0;


getCSV = () => {
  let lines = [];
  let csvData = new XMLHttpRequest();
  csvData.addEventListener('load', (event) => {
    const response = event.target.responseText;
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
    riskFlag = '高水準のリスクです。感染に備え、ワクチン摂取で発症予防発効する対策が有効です。';
  } else {
    riskFlag = '同水準です';
  }

  outputD = `${ageG}陽性者累計数:${testedPositive}, 致死症例数:${fatal}(= 重症者:${serious} + 死者累計:${death})<br> ★国内${ageG}のCovid-19感染致死率は${fatality +'%'}です。昨年度交通事故死亡率:${TAfatality2020 +'%'}と比べて${riskFlag}。（${dateD}集計）`;
  return outputD;
}


function processV(){
  switch(uVac) {
    case "phizer":
      outputV = `ファイザーはmRNA型ワクチンで発症予防効果率は約95%です。<br>痛みや発熱等の副反応が確認されています。<br>重篤副反応（アナフィキラシー等）発生率は0.3％です。(厚労省8/4報告資料より)`;
      break;
    case "moderna":
      outputV = 
      `モデルナはmRNA型ワクチンで発症予防効果率は約94%です。<br>副反応が確認されておりファイザーに比べて痛みや発熱等症状の発生率が(5〜20pt)高めです。<br>重篤副反応（アナフィキラシー等）発生率は0.3％です。(厚労省8/4報告資料より)`;
      break;
    case "astra-zeneca":
      outputV = 
      `アストラゼネカはウイルスベクター型ワクチンで発症予防効果率は約70%です。<br>副反応および重篤副反応発生率に関する公開データはありません。(厚労省8/4報告資料より)`;
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

function removeAllchildren(element){
    while(element.firstChild){
        element.removeChild(element.firstChild);    //エレメントに子要素がある限り削除
    }
}


riskCalcButton.onclick = () => {
  removeAllchildren(resultDivided);   //演算結果があれば消す
  uName = userNameImput.value;
  uPref = userPrefImput.value;
  uAge = userAgeImput.value;
  uVac = userVacImput.value;
  
  riskCalcD();
  
  let header4 = document.createElement(`h4`);
  header4.innerHTML = `${uName}さんのcovid19感染致死リスク状況<br>【死亡リスク状況】<br>${outputD} <br>【ワクチン公開情報】<br>${outputV}`;  
  resultDivided.appendChild(header4);
  
  infoDivided.innerHTML = `【オープンデータ掲載ソースを確認する】<br>
 <a href="https://www.e-stat.go.jp/stat-search/files?page=1&layout=datalist&toukei=00130002&tstat=000001032793&cycle=7&year=20200&month=0">令和２年中の交通事故死者について | 警察庁交通局交通企画課</a><br>
 <a href="https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/vaccine_00184.html">新型コロナワクチンについて | 厚生労働省</a><br>
 <a href="https://github.com/kaz-ogiwara/covid19">kaz-ogiwaraさんのリポジトリ（CSVデータ参照元）GitHub - kaz-ogiwara/covid19</a><br>
 <a href="https://toyokeizai.net/sp/visual/tko/covid19/">『東洋経済オンライン「新型コロナウイルス 国内感染の状況」制作：荻原和樹』</a><br>
 `;

}
