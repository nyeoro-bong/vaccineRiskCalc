let userNameImput = document.getElementById(`userName`);
let userAgeImput = document.getElementById(`userAge`);
let userPrefImput = document.getElementById(`userPref`);
let userVacImput = document.getElementById(`userVac`);
let riskCalcButton = document.getElementById('riskCalc');
let resultDivided = document.getElementById('result-area');
let tweetDivided = document.getElementById('tweet-area');
let outputElement = document.getElementById('output_csv');
let message = 0;
let demCSV = 0;

riskCalcButton.onclick = () => {
  let uName = userNameImput.value;
  let uAge = userAgeImput.value;
  let uPref = userPrefImput.value;
  let uVac = userVacImput.value;



  console.log(`ユーザー名は ${uName} さんです`);
  console.log(`年代は ${uAge} です`);
  console.log(`地域は ${uPref} です`);
  console.log(`ワクチン種は ${uVac} です`);



  // function doPost(e) {
  //   // Slack Event Subscription 認証用のレスポンス
  //   let params = JSON.parse(e.postData.getDataAsString());
  //     if (params.type == "url_verification") {
  //     return ContentService.createTextOutput(params.challenge);
  //    }

  // let texts = params.event.text.split(" ");
  // if (texts[0] == "covid19") {
  //   // 感染状況データを取得

  // const outputElement = document.getElementById('output_csv');

  // function getdata(dataPath) {
  //  const request = new XMLHttpRequest();
  //  request.addEventListener('load', (event) => {
  //   const response = event.target.responseText;
  //   outputElement.innerHTML = response;
  //  });
  //  request.open('GET', dataPath, true);
  //  request.send();
  // }

  // getdata('./example.csv');    


  function getCSV() {
    let csvData = [];
    let data = new XMLHttpRequest();
    data.open('GET', 'demography.csv', false);
    data.send(null);
 
    let lines = data.responseText.split("\n"); // 改行を区切り文字として行を要素とした配列を生成

    // 各行ごとにカンマで区切った文字列を要素とした二次元配列を生成
    for (let i = 0; i < lines.length; ++i) {
      csvData[i] = lines[i].split(',');
    };
    return csvData;
    // alert(result[1][2]); // 300yen
  };

  outputElement.innerHTML = csvData[0][1];

  console.log(csvData[0]);
  console.log(csvData[1]);
  console.log(csvData[2]);
  // console.log(demCSV);


  getCSV();





  //     let urlData = "https://toyokeizai.net/sp/visual/tko/covid19/csv/";
  //     let prefecturesCsv = UrlFetchApp.fetch(urlData + 'prefectures.csv').getContentText("UTF-8");
  //     let prefectures = Utilities.parseCsv(prefecturesCsv);
  //     let demographyCsv = UrlFetchApp.fetch(urlData + 'demography.csv').getContentText("UTF-8");
  //     let demography = Utilities.parseCsv(demographyCsv);
  //     
  //     let a0 = demography.pop(); // 東京都のデータを抽出

  // // 選択された都道府県の最新データを取得
  // let target = texts[1];
  // if (texts[1] == null) {
  //   target = 'Tokyo'; //'covid19'とだけ入力されたときに’Tokyo'を自動補足する処理
  //       let datas = prefectures.filter(i => i[4] == uPref); // 東京都のデータを抽出
  // }else{
  //   let datas = prefectures.filter(i => i[4] == target ); // 指定した自治体のデータを抽出
  // }

  //     let latest = datas.pop(); // 最新データ
  //     let pre = datas.pop(); // 最新1日前のデータ
  //     let date = latest[0] + '/' + latest[1] + '/' + latest[2]; // 最新日付
  //     let testedPositive = latest[5] - pre[5]; // 検査陽性人数（累計値なので差分を取得）
  //     let tested = latest[6] - pre[6];  // 検査人数
  //     
  //     let sumToday = datas[datas.length-1][5]; //datasから最新日付の累計陽性者数を所得
  //     let sum1wAgo = datas[datas.length-8][5]; //最新日付１週間前のデータを所得
  //     let sum2wAgo = datas[datas.length-15][5]; //最新日付２週間前のデータを所得
  //     // let death = datas[datas.length-1][8]; //datasから最新日付の死者数を所得
  //     let change1w = sumToday - sum1wAgo; //直近１週間の増加数を計算
  //     let change1wb = sum1wAgo - sum2wAgo; //上記の前の週の増加数を計算
  //     let rNumber = (change1w / change1wb)**(4.2 / 6.3);　//ＲＯ計算式：（直近7日間の新規陽性者数／その前7日間の新規陽性者数）^（平均世代時間／報告間隔）
  //     rNumber = rNumber.toFixed(2);　//計算した値を小数点第二位の数値に成型
  //     // let testedPositiveRatio = testedPositive / tested *100;
  //     // if (tested == 0){
  //     //   testedPositiveRatio = 'N/A';
  //     // }else{
  //     //   testedPositiveRatio = testedPositiveRatio.toFixed(1);
  //     // }
  //     let mortality = death/sumToday*100;
  //     mortality = mortality.toFixed(1);
  //     
  //     message = `【${uPref} のcovid-19感染状況】[${date}] 陽性: ${testedPositive}, 検査人数: ${tested}, 検査陽性率: ${testedPositiveRatio +'%'}, 【国内】死亡率: ${mortality +'%'},  R0: ${rNumber}  `; //R0表示欄を追加

  //     console.log(`${message}`);
  //   }


  //     // Slack に送信
  //     let options = {
  //       "method" : "POST",
  //       "headers": {"Content-type": "application/json"},
  //       "payload" : '{"text":"' + message + '"}',
  //     }
  //     let webhookUrl = "https://hooks.slack.com/services/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";
  //     UrlFetchApp.fetch(webhookUrl, options);
  //     }
};
