let userNameImput = document.getElementById(`userName`);
let userAgeImput = document.getElementById(`userAge`);
let userVacImput = document.getElementById(`userVac`);
let riskCalcButton = document.getElementById(`riskCalc`);
let outputDivided = document.getElementById(`output-area`);
let resultDivided = document.getElementById(`result-area`);
let infoDivided = document.getElementById(`info-area`);
let tweetDivided = document.getElementById(`tweet-area`);

getCSV = () => {
  let datasD = [];
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
    return datasD;
  });
  csvData.open('GET','demography.csv',true);
  csvData.send();
}

getCSVR = () => {
  let datasR = [];
  let linesR = [];
  let csvDataR = new XMLHttpRequest();
  csvDataR.addEventListener('load', (event) => {
    const responseR = event.target.responseText;
    linesR = responseR.split('\n');
    
    // 各行ごとにカンマで区切った文字列を要素とした二次元配列を生成
    for (let i = 0; i < linesR.length ; ++i) {
      datasR[i] = linesR[i].split(',');
    }
    return datasR;
  });
  csvDataR.open('GET','eRNumber.csv',true);
  csvDataR.send();
  
}

riskCalcR = () => {
  var latest = datasR.pop(); // prefecturesから最新データ列latestを取得
  var date = latest[0] + '/' + latest[1] + '/' + latest[2]; // latestから最新日付を取得
  var eRNumber = latest[3]; // latestからR0　実行再生算数を取得
  var eRNComment = 0; // 実行再生算数コメント用に変数　eRNComment　を作成して初期化
  if (eRNumber < 1){
    eRNComment = '減少傾向';
  }  else if  (1 <= eRNumber && eRNumber < 1.1){
    eRNComment = 'やや増加傾向';
  }  else if  (1.1 <= eRNumber && eRNumber < 1.3){
    eRNComment = '増加傾向';
  } else {
    eRNComment = '急速な増加傾向';
  }

  var outputR = `実行再生算数R0は${eRNumber}で、感染リスクは${eRNComment}です。(${date}現在)`;

  return outputR;
}

riscCalcD = () => {
  // uAgeで指定された年齢から同世代感染状況の最新データを取得
  var ageG;
  switch(uAge) {
    case 10th :
      ageG = demography[2][3];
      console.log(`年代は ${uAge} です`);
      break;
    case "20th":
      ageG = demography[3][3];
      console.log(`年代は ${uAge} です`);
      break;
    case "30th":
      ageG = demography[4][3]; 
      console.log(`年代は ${uAge} です`);
      break;
    case "40th":
      ageG = demography[5][3]; 
      console.log(`年代は ${uAge} です`);
      break;
    case "50th":
      ageG = demography[6][3]; 
      console.log(`年代は ${uAge} です`);
      break;
    case "60th":
      ageG = demography[7][3];
      console.log(`年代は ${uAge} です`);
      break;
    case "70th":
      ageG = demography[8][3]; 
      console.log(`年代は ${uAge} です`);
      break;
    case "80th":
      ageG = demography[9][3];
      console.log(`年代は ${uAge} です`);
      break;
    case "0th":
      ageG = demography[1][3];
      console.log(`年代は ${uAge} です`);
      break;
  }
    
  var datasD = demography.filter(i => i[3] == ageG); // 同世代の感染状況データを抽出
  var dateD = datasD[datasD.length-1][0] + '/' + datasD[datasD.length-1][1] + '/' + datasD[datasD.length-1][2]; // demographyから最新日付を取得
  var ageGroup = datasD[datasD.length-1][3]; //demographyから世代グループ名を取得
  var testedPositive = datasD[datasD.length-1][4]; //demographyから世代陽性者累計を取得
  var serious = datasD[datasD.length-1][6]; //demographyから同世代重症者数を取得
  var death = datasD[datasD.length-1][7]; //demographyから同世代死者累計を取得
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

  var outputD = `【死亡リスク】${ageGroup}陽性者累計数:${testedPositive}, 致死症例数:${fatal}(= 重症者:${serious} + 死者累計:${death}), ★国内${ageGroup}のCovid-19感染致死率は${fatality +'%'}です。昨年度交通事故死亡率:${TAfatality2020 +'%'}と比べて${riskFlag}。（${dateD}集計）`;
  return outputD;
}

riskCalcV = () => {
  var outputV;
  if ( userVac === "phizer"){
    outputV = 
    `ファイザーはmRNA型ワクチンで発症予防効果は約95%です。痛みや発熱等の副反応が確認されています。重篤反応（アナフィキラシー等）発生率は0.3％です。(厚労省8/4報告資料より)`;
  } else if ( userVac === 'mmoderna'){
    outputV = `モデルナはmRNA型ワクチンで発症予防効果は約94%です。副反応が確認されておりファイザーに比べ痛みや発熱等症状の発生率が(5〜20pt)高めです。重篤反応（アナフィキラシー等）発生率は0.3％です。(厚労省8/4報告資料より)`;
  } else if ( userVac === 'astra-zeneca'){
    outputV = `アストラゼネカはウイルスベクター型ワクチンで発症予防効果は約70%です。副反応および重篤反応発生率に関するデータはありません。`;
  } else {
    outputV = ``
  }
  return outputV;
}

getCSV();
getCSVR();

riskCalcButton.onclick = () => {
  let uName = userNameImput.value;
  let uAge = userAgeImput.value;
  let outputV = userVacImput.value;

  riscCalcD();
  riskCalcV();

  let comment = `
  【${uPref}在住${uAge}歳${uName}のcovid-19感染致死リスク状況】<br>
  ${outputD}<br>
  ${outputP}<br>
  ${outputV}<br>

  <a href="https://www.e-stat.go.jp/stat-search/file-download?statInfId=000032035150&fileKind=1">警察庁交通局交通企画課「令和２年中の交通事故死者について」</a><br>
  <a href="https://www.google.com/search?q=${uVac}+%E5%89%AF%E5%8F%8D%E5%BF%9C&rlz=1C5CHFA_enJP936JP936&sxsrf=ALeKk02wzlbwQmI0KOTT9kWPAHRr5Gx5Cg%3A1629618378179&ei=ygAiYZG8CqOFr7wPk-2omAo&oq=uVac+%E5%89%AF%E5%8F%8D%E5%BF%9C&gs_lcp=Cgdnd3Mtd2l6EAM6CggAEIAEELADEAQ6CwgAELEDEIMBELADOgkIABCwAxAEEAM6EAgAEIAEELEDELEDELADEAQ6DQgAEIAEELEDELEDEAQ6BwgAEIAEEAQ6CAgAELEDEIMBOgYIABAEEAM6BAgjECc6BAgAEEM6EwgAEIAEELEDEIMBELEDEIMBEAQ6EAgAELEDEIMBELEDEIMBEEM6CggAEIAEELEDEAQ6BwgjEOoCECc6BggjECcQEzoNCAAQgAQQsQMQgwEQBDoFCAAQgAQ6CAgAEIAEELEDOgQIABAeOgkIABCABBAEEAo6BAgAEBM6BggAEB4QEzoFCCEQoAE6BQgAEM0COgYIIRAKECpKBAhBGAFQi7-NAViIsY4BYO61jgFoA3AAeACAAYwCiAHBFJIBBzEzLjExLjGYAQCgAQGwAQrIAQjAAQE&sclient=gws-wiz&ved=0ahUKEwiRybPEkcTyAhWjwosBHZM2CqMQ4dUDCA4&uact=5">google”ワクチン名” + ”副反応”の検索結果</a>
  `;

  resultDivided.innerHTML = comment;

  console.log(`ユーザー名は ${uName} さんです`);
  console.log(`地域は ${uPref} です`);
  console.log(`ワクチン種は ${uVac} です`);

}
