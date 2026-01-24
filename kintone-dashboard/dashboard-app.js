(function() {
  'use strict';

  // ===========================================
  // 設定 - kintone環境に合わせて変更してください
  // ===========================================
  const CONFIG = {
    APP_ID: 124,  // あなたのkintoneアプリID
    FIELD_CODES: {
      name: '文字列__1行__20',       // 顧客名フィールドコード
      stage: 'ドロップダウン_55',     // 顧客ステージフィールドコード
      date: '日付_15',               // 案件化日フィールドコード
      disability: 'ドロップダウン_5'  // 障害属性フィールドコード
    },
    WEEKS_TO_DISPLAY: 12  // 表示する週数
  };

  // カラーパレット
  const COLORS = [
    'rgba(54, 162, 235, 0.8)',   // 青
    'rgba(255, 99, 132, 0.8)',   // 赤
    'rgba(75, 192, 192, 0.8)',   // 緑
    'rgba(255, 206, 86, 0.8)',   // 黄
    'rgba(153, 102, 255, 0.8)',  // 紫
    'rgba(255, 159, 64, 0.8)',   // オレンジ
    'rgba(199, 199, 199, 0.8)',  // グレー
    'rgba(83, 102, 255, 0.8)',   // インディゴ
    'rgba(255, 99, 255, 0.8)',   // ピンク
    'rgba(99, 255, 132, 0.8)'    // ライトグリーン
  ];

  // ===========================================
  // ユーティリティ関数
  // ===========================================

  function getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  function formatWeekLabel(date) {
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${month}/${day}`;
  }

  function generateWeeksList(weeksCount) {
    const weeks = [];
    const today = new Date();
    const currentWeekStart = getWeekStart(today);

    for (let i = weeksCount - 1; i >= 0; i--) {
      const weekStart = new Date(currentWeekStart);
      weekStart.setDate(weekStart.getDate() - (i * 7));
      weeks.push(weekStart);
    }
    return weeks;
  }

  // ===========================================
  // データ取得・集計
  // ===========================================

  async function fetchRecords() {
    const records = [];
    let offset = 0;
    const limit = 500;

    while (true) {
      const response = await kintone.api('/k/v1/records', 'GET', {
        app: CONFIG.APP_ID,
        query: `order by ${CONFIG.FIELD_CODES.date} asc limit ${limit} offset ${offset}`
      });

      records.push(...response.records);

      if (response.records.length < limit) {
        break;
      }
      offset += limit;
    }

    return records;
  }

  function aggregateData(records, categoryField, weeks) {
    const weekStrings = weeks.map(w => w.toISOString().split('T')[0]);
    const categories = new Set();
    const data = {};

    weekStrings.forEach(week => {
      data[week] = {};
    });

    records.forEach(record => {
      const dateValue = record[CONFIG.FIELD_CODES.date]?.value;
      const categoryValue = record[categoryField]?.value || '未設定';

      if (!dateValue) return;

      const recordDate = new Date(dateValue);
      const weekStart = getWeekStart(recordDate);
      const weekKey = weekStart.toISOString().split('T')[0];

      if (weekStrings.includes(weekKey)) {
        categories.add(categoryValue);
        if (!data[weekKey][categoryValue]) {
          data[weekKey][categoryValue] = 0;
        }
        data[weekKey][categoryValue]++;
      }
    });

    return {
      categories: Array.from(categories).sort(),
      data: data,
      weekStrings: weekStrings
    };
  }

  function createChartDatasets(aggregatedData, weeks) {
    const { categories, data, weekStrings } = aggregatedData;
    const labels = weeks.map(w => formatWeekLabel(w));

    const datasets = categories.map((category, index) => ({
      label: category,
      data: weekStrings.map(week => data[week][category] || 0),
      backgroundColor: COLORS[index % COLORS.length],
      borderColor: COLORS[index % COLORS.length].replace('0.8', '1'),
      borderWidth: 1
    }));

    return { labels, datasets };
  }

  // ===========================================
  // UI生成（アプリ一覧用）
  // ===========================================

  function createDashboardHTML() {
    return `
      <div id="kintone-app-dashboard" style="
        padding: 20px;
        background: #f5f5f5;
        margin: 20px 0;
        border-radius: 8px;
      ">
        <h2 style="
          margin: 0 0 20px 0;
          color: #333;
          font-size: 16px;
          border-bottom: 2px solid #3498db;
          padding-bottom: 10px;
        ">📊 週別 顧客数推移</h2>

        <div style="display: flex; flex-wrap: wrap; gap: 20px;">
          <div style="
            flex: 1;
            min-width: 350px;
            background: white;
            padding: 15px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          ">
            <h3 style="margin: 0 0 15px 0; font-size: 13px; color: #666;">
              顧客ステージ別
            </h3>
            <canvas id="app-chart-by-stage"></canvas>
          </div>

          <div style="
            flex: 1;
            min-width: 350px;
            background: white;
            padding: 15px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          ">
            <h3 style="margin: 0 0 15px 0; font-size: 13px; color: #666;">
              障害属性別
            </h3>
            <canvas id="app-chart-by-disability"></canvas>
          </div>
        </div>

        <p style="
          margin: 15px 0 0 0;
          font-size: 10px;
          color: #999;
          text-align: right;
        ">
          最終更新: <span id="app-dashboard-update-time"></span>
        </p>
      </div>
    `;
  }

  function renderChart(canvasId, chartData) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    new Chart(ctx, {
      type: 'bar',
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              boxWidth: 10,
              padding: 10,
              font: { size: 10 }
            }
          },
          tooltip: {
            mode: 'index',
            intersect: false
          }
        },
        scales: {
          x: {
            stacked: true,
            title: {
              display: true,
              text: '週（開始日）',
              font: { size: 10 }
            }
          },
          y: {
            stacked: true,
            beginAtZero: true,
            title: {
              display: true,
              text: '顧客数',
              font: { size: 10 }
            },
            ticks: {
              stepSize: 1
            }
          }
        }
      }
    });
  }

  // ===========================================
  // メイン処理（アプリ一覧画面用）
  // ===========================================

  async function initAppDashboard(event) {
    try {
      // 既に追加済みの場合はスキップ
      if (document.getElementById('kintone-app-dashboard')) {
        return event;
      }

      // テーブル要素を探す
      const table = document.querySelector('table');

      if (table) {
        // テーブルの後に追加
        table.insertAdjacentHTML('afterend', createDashboardHTML());
        console.log('テーブルの後にダッシュボードを追加しました');
      } else {
        // フォールバック: ページャーの後に追加
        const pager = document.querySelector('.gaia-argoui-app-index-pager') ||
                     document.querySelector('[class*="pager"]');

        if (pager) {
          pager.insertAdjacentHTML('afterend', createDashboardHTML());
          console.log('ページャーの後にダッシュボードを追加しました');
        } else {
          console.error('ダッシュボードの挿入先が見つかりません');
          return event;
        }
      }

      // 更新時刻を表示
      document.getElementById('app-dashboard-update-time').textContent =
        new Date().toLocaleString('ja-JP');

      // データを取得
      const records = await fetchRecords();
      const weeks = generateWeeksList(CONFIG.WEEKS_TO_DISPLAY);

      // グラフを描画
      const stageData = aggregateData(records, CONFIG.FIELD_CODES.stage, weeks);
      const stageChartData = createChartDatasets(stageData, weeks);
      renderChart('app-chart-by-stage', stageChartData);

      const disabilityData = aggregateData(records, CONFIG.FIELD_CODES.disability, weeks);
      const disabilityChartData = createChartDatasets(disabilityData, weeks);
      renderChart('app-chart-by-disability', disabilityChartData);

    } catch (error) {
      console.error('ダッシュボードの初期化に失敗しました:', error);
    }

    return event;
  }

  // アプリ一覧画面表示時にダッシュボードを初期化
  kintone.events.on('app.record.index.show', initAppDashboard);

})();
