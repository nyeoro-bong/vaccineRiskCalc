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
    var datas = prefectures.filter(i => i[4] == targetP); // 指定した自治体のデータを抽出

    // texts[２]で指定された年齢から同世代感染状況の最新データを取得
    var targetD = texts[2];
    targetD = Math.floor(targetD / 10);
    var ageG;
    switch (targetD) {
      case 0:
        ageG = demography[1][3];
        break;
      case 1:
        ageG = demography[2][3];
        break;
      case 2:
        ageG = demography[3][3];
        break;
      case 3:
        ageG = demography[4][3];
        break;
      case 4:
        ageG = demography[5][3];
        break;
      case 5:
        ageG = demography[6][3];
        break;
      case 6:
        ageG = demography[7][3];
        break;
      case 7:
        ageG = demography[8][3];
        break;
      case 8:
        ageG = demography[9][3];
        break;
      default:
        ageG = demography[10][3];
        break;
    }

    var datasD = demography.filter(i => i[3] == ageG); // 同世代の感染状況データを抽出

    var targetV = texts[3];
    var uVac;
    if (targetV === 'f') {
      uVac =
        `ファイザーはmRNA型ワクチンで発症予防効果率は約95%です。痛みや発熱等の副反応が確認されています。重篤副反応（アナフィキラシー等）発生率は0.3％です。(厚労省8/4報告資料より)`;
    } else if (targetV === 'm') {
      uVac = `モデルナはmRNA型ワクチンで発症予防効果率は約94%です。副反応が確認されておりファイザーに比べて痛みや発熱等症状の発生率が(5〜20pt)高めです。重篤副反応（アナフィキラシー等）発生率は0.3％です。(厚労省8/4報告資料より)`;
    } else if (targetV === 'a') {
      uVac = `アストラゼネカはウイルスベクター型ワクチンで発症予防効果率は約70%です。副反応および重篤副反応発生率に関する公開データはありません。(厚労省8/4報告資料より)`;
    } else {
      uVac = ``
    }

    var latest = datas.pop(); // prefecturesから最新データ列latestを取得
    var date = latest[0] + '/' + latest[1] + '/' + latest[2]; // latestから最新日付を取得
    var eRNumber = latest[11]; // latestからR0　実行再生算数を取得
    var eRNComment = 0; // 実行再生算数コメント用に変数　eRNComment　を作成して初期化
    if (eRNumber < 1) {
      eRNComment = '減少傾向';
    } else if (1 <= eRNumber && eRNumber < 1.1) {
      eRNComment = 'やや増加傾向';
    } else if (1.1 <= eRNumber && eRNumber < 1.3) {
      eRNComment = '増加傾向';
    } else {
      eRNComment = '急速な増加傾向';
    }

    var dateD = datasD[datasD.length - 1][0] + '/' + datasD[datasD.length - 1][1] + '/' + datasD[datasD.length - 1][2]; // demographyから最新日付を取得
    var ageGroup = datasD[datasD.length - 1][3]; //demographyから世代グループ名を取得
    var testedPositive = datasD[datasD.length - 1][4]; //demographyから世代陽性者累計を取得
    var serious = datasD[datasD.length - 1][6]; //demographyから同世代重症者数を取得
    var death = datasD[datasD.length - 1][7]; //demographyから同世代死者累計を取得
    testedPositive = parseInt(testedPositive);
    serious = parseInt(serious);
    death = parseInt(death);
    var fatal = serious + death; //serious と　death から最新日付の同世代致死症例数を計算
    var fatality = (fatal / testedPositive) * 100; //致死リスク率を計算
    fatality = fatality.toFixed(2); //小数点第2位の数値に成型

    var trafficAccident2020 = 309000; //出典　警察庁交通局交通企画課「令和２年中の交通事故死者について」2021/1/6
    var deathTrafficAccident2020 = 2839; //参照元　https://www.e-stat.go.jp/stat-search/file-download?statInfId=000032035150&fileKind=1
    var TAfatality2020 = (deathTrafficAccident2020 / trafficAccident2020) * 100; //２０２０年度交通事故致死リスク率を計算
    TAfatality2020 = TAfatality2020.toFixed(2); //小数点第2位の数値に成型

    var riskFlag = 0;
    if (fatality < TAfatality2020) {
      riskFlag = '低水準です';
    } else if (fatality > TAfatality2020) {
      riskFlag = '高水準のリスクです。ワクチン優先摂取が有効です。';
    } else {
      riskFlag = '同水準です。ワクチン摂取時期を検討するタイミングです';
    }

    var message = `【${targetP}在住${texts[2]}歳のcovid-19感染致死リスク状況】  【死亡リスク】${ageGroup}陽性者累計数:${testedPositive}, 致死症例数:${fatal}(= 重症者:${serious} + 死者累計:${death}), ★国内${ageGroup}のCovid-19感染致死率は${fatality + '%'}です。昨年の交通事故死亡率:${TAfatality2020 + '%'}と比べて${riskFlag}。（${dateD}集計） 【流行状況】${targetP}の${date}の実効再生産数R0は${eRNumber}で★身近の感染リスクは${eRNComment}です。 【ワクチン公開情報】${uVac}`;

    // Slack に送信
    var options = {
      "method": "POST",
      "headers": { "Content-type": "application/json" },
      "payload": '{"text":"' + message + '"}',
    };

    var webhookUrl = "https://hooks.slack.com/services/";
    UrlFetchApp.fetch(webhookUrl, options);
  }
}