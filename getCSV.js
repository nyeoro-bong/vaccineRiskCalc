getCSV = () => {
  let datasD = [];
  let lines = [];A
  let csvData = new XMLHttpRequest();
  csvData.addEventListener('load', (event) => {
    let response = event.target.responseText;
    outputDivided.innerHTML = response;
    lines = response.split('\n');
    
    // 各行ごとにカンマで区切った文字列を要素とした二次元配列を生成
    for (let i = 0; i < lines.length ; ++i) {
      datasD[i] = lines[i].split(',');
    }
  });
  csvData.open('GET','demography.csv',true);　//東洋経済オンラインkaz-ogiwaraさんリポジトリよりcovid19のマスターデータdemography.csvをDLして保存
  csvData.send();
  return datasD;
}
