function doPost(e) {
    // Slack Event Subscription 認証用のレスポンス
    var params = JSON.parse(e.postData.getDataAsString());
      if (params.type == "url_verification") {
      return ContentService.createTextOutput(params.challenge);
     }
    
    var texts = params.event.text.split(" ");
    if (texts[0] == "covid") {
      // 感染状況データを取得    
      var urlData = "https://toyokeizai.net/sp/visual/tko/covid19/csv/" //東洋経済オンラインkaz-ogiwaraさんリポジトリよりcovid19のマスターデータを取得
      var prefecturesCsv = UrlFetchApp.fetch(urlData + 'prefectures.csv').getContentText("UTF-8");
      var prefectures = Utilities.parseCsv(prefecturesCsv);
      var demographyCsv = UrlFetchApp.fetch(urlData + 'demography.csv').getContentText("UTF-8");
      var demography = Utilities.parseCsv(demographyCsv);
      
      // texts[1]で指定された都道府県の最新データを取得
      var targetP = texts[1];
      if (texts[1] == null) {
        targetP = 'Tokyo' //都道府県未入力の場合に’Tokyo'を自動補足する処理
      }
      var datas = prefectures.filter(i => i[4] == targetP ); // 指定した自治体のデータを抽出
  
      // texts[２]で指定された年齢から同世代感染状況の最新データを取得
      var targetD = texts[2];
      targetD = parseInt(targetD);
      var ageG;
      if (targetD < 10) {
          ageG = demography[1][3];
        }else　if(10<= targetD && targetD <20){
          ageG = demography[2][3];
        }else if(20<= targetD && targetD <30){
          ageG = demography[3][3];
        }else if(30<= targetD && targetD <40){
          ageG = demography[4][3]; 
        }else if(40<= targetD && targetD <50){
          ageG = demography[5][3]; 
        }else if(50<= targetD && targetD <60){
          ageG = demography[6][3]; 
        }else if(60<= targetD && targetD <70){
          ageG = demography[7][3]; 
        }else if(70<= targetD && targetD <80){
          ageG = demography[8][3]; 
        }else if(80<= targetD){
          ageG = demography[9][3]; 
        }else{
          ageG = demography[10][3]; 
      }
      var datasD = demography.filter(i => i[3] == ageG); // 同世代の感染状況データを抽出
  
      var latest = datas.pop(); // prefecturesから最新データ列latestを取得
      var date = latest[0] + '/' + latest[1] + '/' + latest[2]; // latestから最新日付を取得
      var eRNumber = latest[11]; // latestからR0　実行再生算数を取得
      var eRNComment = 0; // 実行再生算数コメント用に変数　eRNComment　を作成して初期化
      if (eRNumber < 1){
        eRNComment = '減少傾向';
      } else if (1 <= eRNumber && eRNumber < 1.1){
        eRNComment = 'やや増加傾向';
      } else if (1.1 <= eRNumber && eRNumber < 1.3){
        eRNComment = '増加傾向';
      } else {
        eRNComment = '急速な増加傾向';
      }
      
      var ageGroup = datasD[datasD.length-1][3]; //demographyから世代グループ名を取得
      var testedPositive = datasD[datasD.length-1][4]; //demographyから最新日付の世代陽性者累計を取得
      var serious = datasD[datasD.length-1][6]; //demographyから最新日付の同世代重症者数を取得
      var death = datasD[datasD.length-1][7]; //demographyから最新日付の同世代死者累計を取得
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
      if(fatality < TAfatality2020){
        riskFlag = '低い水準です';
      }else if(fatality > TAfatality2020){
        riskFlag = '高水準のリスクです';
      }else{
        riskFlag = '同水準です';
      }
      
      var message = `【${targetP}在住${ageGroup}のcovid-19感染致死リスク状況】[${date}] 国内${ageGroup}陽性者累計数: ${testedPositive}, 致死症例数: ${fatal} (= 重症者:${serious} + 死者累計数:${death})  , 直近感染致死率:${fatality +'%'}です。昨年度交通事故死亡率:${TAfatality2020 +'%'}と比較して${riskFlag}。${targetP}の実効再生産数:R0は ${eRNumber} で周囲の感染リスク（感染増加スピード）は${eRNComment}です。`; //死亡率とR0を追加
    
      // Slack に送信
      var options = {
        "method" : "POST",
        "headers": {"Content-type": "application/json"},
        "payload" : '{"text":"' + message + '"}',
      };
      var webhookUrl = "https://hooks.slack.com/services/";
      UrlFetchApp.fetch(webhookUrl, options);
    }
  }