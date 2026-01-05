// Chart.js を使用したチャート描画モジュール

const ChartManager = {
    trendChart: null,
    seasonalChart: null,

    // グラデーション作成
    createGradient(ctx, colorStart, colorEnd) {
        const gradient = ctx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, colorStart);
        gradient.addColorStop(1, colorEnd);
        return gradient;
    },

    // トレンドチャートを初期化・更新
    updateTrendChart(labels, data) {
        const ctx = document.getElementById('trendChart').getContext('2d');

        if (this.trendChart) {
            this.trendChart.destroy();
        }

        const gradient = this.createGradient(ctx, 'rgba(102, 126, 234, 0.5)', 'rgba(102, 126, 234, 0.0)');

        this.trendChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: '検索ボリューム',
                    data: data,
                    borderColor: '#667eea',
                    backgroundColor: gradient,
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointBackgroundColor: '#667eea',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        titleColor: '#1f2937',
                        bodyColor: '#4b5563',
                        borderColor: '#e5e7eb',
                        borderWidth: 1,
                        padding: 12,
                        displayColors: false,
                        callbacks: {
                            label: function(context) {
                                return '検索ボリューム: ' + context.raw.toLocaleString();
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#9ca3af',
                            font: {
                                size: 11
                            }
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                            color: '#9ca3af',
                            font: {
                                size: 11
                            },
                            callback: function(value) {
                                if (value >= 1000000) {
                                    return (value / 1000000).toFixed(1) + 'M';
                                } else if (value >= 1000) {
                                    return (value / 1000).toFixed(0) + 'K';
                                }
                                return value;
                            }
                        }
                    }
                }
            }
        });
    },

    // 季節性チャートを初期化・更新
    updateSeasonalChart(labels, data) {
        const ctx = document.getElementById('seasonalChart').getContext('2d');

        if (this.seasonalChart) {
            this.seasonalChart.destroy();
        }

        this.seasonalChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: '季節指数',
                    data: data,
                    backgroundColor: data.map((val, i) => {
                        const hue = 260 + (i * 8);
                        return `hsla(${hue}, 70%, 60%, 0.7)`;
                    }),
                    borderRadius: 4,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        titleColor: '#1f2937',
                        bodyColor: '#4b5563',
                        borderColor: '#e5e7eb',
                        borderWidth: 1,
                        padding: 10,
                        displayColors: false
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#9ca3af',
                            font: {
                                size: 10
                            }
                        }
                    },
                    y: {
                        display: false,
                        min: 0,
                        max: 100
                    }
                }
            }
        });
    },

    // チャートを破棄
    destroyAll() {
        if (this.trendChart) {
            this.trendChart.destroy();
            this.trendChart = null;
        }
        if (this.seasonalChart) {
            this.seasonalChart.destroy();
            this.seasonalChart = null;
        }
    }
};

// グローバルに公開
window.ChartManager = ChartManager;
