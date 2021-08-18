#!/bin/bash
filename1="prefectures.csv"
filename2="demography.csv"
curl -s -o $filename1 -H "User-Agent: CrawlBot; nyolobong@gmail.com" https://toyokeizai.net/sp/visual/tko/covid19/csv/prefectures.csv
echo "保存しました: $filename1"
curl -s -o $filename2 -H "User-Agent: CrawlBot; nyolobong@gmail.com" https://toyokeizai.net/sp/visual/tko/covid19/csv/demography.csv
echo "保存しました: $filename2"