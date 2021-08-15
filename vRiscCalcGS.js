function doPost(e) {
  // Slack Event Subscription 認証用のレスポンス
  var params = JSON.parse(e.postData.getDataAsString());
    if (params.type == "url_verification") {
    return ContentService.createTextOutput(params.challenge);
   }
  
  var texts = params.event.text.split(" ");
  if (texts[0] == "covid") {
    // 感染状況データを取得    
    var urlData = "https://toyokeizai.net/sp/visual/tko/covid19/csv/" //kaz-ogiwaraさんのリポジトリよりcovid19のマスターデータを取得
    var prefecturesCsv = UrlFetchApp.fetch(urlData + 'prefectures.csv').getContentText("UTF-8");
    var prefectures = Utilities.parseCsv(prefecturesCsv);
    var demographyCsv = UrlFetchApp.fetch(urlData + 'demography.csv').getContentText("UTF-8");
    var demography = Utilities.parseCsv(demographyCsv);
    var rNumberCsv = UrlFetchApp.fetch(urlData + 'effective_reproduction_number.csv').getContentText("UTF-8");
    var rNumber = Utilities.parseCsv(rNumberCsv);

    
    // 選択された都道府県の最新データを取得
    var targetP = texts[1];
    if (texts[1] == null) {
      targetP = 'Tokyo' //'covid19'とだけ入力されたときに’Tokyo'を自動補足する処理
      var datas = prefectures.filter(i => i[4] == targetP); // 東京都のデータを抽出
    }else{
      var datas = prefectures.filter(i => i[4] == targetP ); // 指定した自治体のデータを抽出
    }

    var targetD = texts[2];
    targetD = parseInt(targetD);
    if (targetD < 10) {
      targetD = demography[1][4];
      var datasD = demography.filter(i => i[4] == targetD); // 東京都のデータを抽出
    }else if(10<= targetD && targetD <20){
      targetD = demography[2][4]; 
      var datasD = demography.filter(i => i[4] == targetD); // 東京都のデータを抽出
    }else if(20<= targetD && targetD <30){
        targetD = demography[3][4]; 
        var datasD = demography.filter(i => i[4] == targetD); // 東京都のデータを抽出
    }else if(30<= targetD && targetD <40){
        targetD = demography[4][4]; 
        var datasD = demography.filter(i => i[4] == targetD); // 東京都のデータを抽出
    }else if(40<= targetD && targetD <50){
        targetD = demography[5][4]; 
        var datasD = demography.filter(i => i[4] == targetD); // 東京都のデータを抽出
    }else if(50<= targetD && targetD <60){
        targetD = demography[6][4]; 
        var datasD = demography.filter(i => i[4] == targetD); // 東京都のデータを抽出
    }else if(60<= targetD && targetD <70){
        targetD = demography[7][4]; 
        var datasD = demography.filter(i => i[4] == targetD); // 東京都のデータを抽出
    }else if(70<= targetD && targetD <80){
        targetD = demography[8][4]; 
        var datasD = demography.filter(i => i[4] == targetD); // 東京都のデータを抽出
    }else if(80<= targetD){
        targetD = demography[9][4]; 
        var datasD = demography.filter(i => i[4] == targetD); // 東京都のデータを抽出
    }else if(targetD === mull){
        targetD = demography[10][4]; 
        var datasD = demography.filter(i => i[4] == targetD); // 東京都のデータを抽出
    }


    var latest = datas.pop(); // 最新データ
    var date = latest[0] + '/' + latest[1] + '/' + latest[2]; // 最新日付
    var eRNumber = latest[11];  

    var testedPositive = datasD[datasD.length-1][4]; //demographyから最新日付の死者数を所得
    var serious = datasD[datasD.length-1][6]; //demographyから最新日付の死者数を所得   
    var death = datasD[datasD.length-1][7]; //demographyから最新日付の死者数を所得
    var fatal = serious + death; //demographyから最新日付の死者数を所得
    var fatality = fatal/testedPositive*100; //死亡率を計算
    fatality = fatality.toFixed(1); //小数点第１位の数値に成型


//     
//     var sumToday = demography[demography.length-1][3]; //demographyから最新日付の累計陽性者数を所得
//     var sum1wAgo = demography[demography.length-8][3]; //最新日付の１週間前のデータを
//     var sum2wAgo = demography[demography.length-15][3]; //最新日付の２週間前のデータを所得
//     var death = demography[demography.length-1][8]; //demographyから最新日付の死者数を所得
//     var change1w = sumToday - sum1wAgo; //直近１週間の増加数を計算
//     var change1wb = sum1wAgo - sum2wAgo; //上記の前の週の増加数を計算
//     var rNumber = (change1w / change1wb)**(4.2 / 6.3);　//ＲＯ計算式：（直近7日間の新規陽性者数／その前7日間の新規陽性者数）^（平均世代時間／報告間隔）
//     rNumber = rNumber.toFixed(2);　//平均世代時間を4.2、報告間隔を6.3として簡易的に計算した値を小数点第２位の数値に成型
//     var testedPositiveRatio = testedPositive / tested *100;//検査陽性率を計算
//     if (tested == 0){
//       testedPositiveRatio = 'N/A'; //検査人数がゼロの時は'N/A'を代入
//     }else{
//       testedPositiveRatio = testedPositiveRatio.toFixed(1); //小数点第１位の数値に成型
//     }
//     var mortality = death/sumToday*100; //死亡率を計算
//     mortality = mortality.toFixed(1); //小数点第１位の数値に成型
    
    var message = `【${targetP}在住${targetD}のcovid-19感染リスク状況】[${date}] 世代陽性者累計: ${testedPositive}, 重症者: ${serious}, 死者累計: ${death}, 致死リスク率: ${fatality +'%'}, です。${targetP}の実効姿勢算数はR0： ${eRNumber} で`; //死亡率とR0を追加
  
    // Slack に送信
    var options = {
      "method" : "POST",
      "headers": {"Content-type": "application/json"},
      "payload" : '{"text":"' + message + '"}',
    };
    var webhookUrl = "your webhookUrl　//Slackから取得した webhook の URL を設定";
    UrlFetchApp.fetch(webhookUrl, options);
    }
}