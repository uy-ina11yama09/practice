// メインアプリケーションモジュール

const App = {
    currentKeyword: '',
    currentSites: [],
    recentSearches: [],

    // 初期化
    init() {
        this.loadRecentSearches();
        this.setupEventListeners();
        this.renderRecentSearches();
    },

    // イベントリスナーの設定
    setupEventListeners() {
        // 検索ボタン
        document.getElementById('analyzeBtn').addEventListener('click', () => {
            this.analyze();
        });

        // Enterキーで検索
        document.getElementById('keywordInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.analyze();
            }
        });

        // 入力時のサジェスト
        document.getElementById('keywordInput').addEventListener('input', (e) => {
            this.showSuggestions(e.target.value);
        });

        // サジェストの外クリックで閉じる
        document.addEventListener('click', (e) => {
            if (!e.target.closest('#keywordInput') && !e.target.closest('#suggestions')) {
                document.getElementById('suggestions').classList.add('hidden');
            }
        });

        // 期間切り替え
        document.querySelectorAll('.trend-period').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.trend-period').forEach(b => {
                    b.classList.remove('bg-purple-100', 'text-purple-600');
                    b.classList.add('text-gray-500');
                });
                e.target.classList.add('bg-purple-100', 'text-purple-600');
                e.target.classList.remove('text-gray-500');

                const months = parseInt(e.target.dataset.period);
                this.updateTrendChart(months);
            });
        });

        // ソート切り替え
        document.querySelectorAll('.sort-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.sort-btn').forEach(b => {
                    b.classList.remove('bg-purple-100', 'text-purple-600');
                    b.classList.add('text-gray-500');
                });
                e.target.classList.add('bg-purple-100', 'text-purple-600');
                e.target.classList.remove('text-gray-500');

                const sortType = e.target.dataset.sort;
                this.sortAndRenderSites(sortType);
            });
        });

        // モーダル閉じる
        document.getElementById('closeModal').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('seoModal').addEventListener('click', (e) => {
            if (e.target.id === 'seoModal') {
                this.closeModal();
            }
        });

        // ESCキーでモーダル閉じる
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
    },

    // 分析を実行
    async analyze() {
        const keyword = document.getElementById('keywordInput').value.trim();
        if (!keyword) {
            this.showToast('キーワードを入力してください');
            return;
        }

        this.currentKeyword = keyword;
        this.showLoading(true);
        this.saveRecentSearch(keyword);

        // 擬似的な遅延（実際のAPI呼び出しを模倣）
        await this.simulateAPICall();

        // データ生成
        const volume = SearchData.generateMonthlyVolume(keyword);
        const competition = SearchData.generateCompetition(keyword);
        const cpc = SearchData.generateCPC(keyword);
        const seoDifficulty = SearchData.generateSEODifficulty(keyword);

        // 結果を表示
        this.displayResults(volume, competition, cpc, seoDifficulty);

        // トレンドチャート
        this.updateTrendChart(12);

        // 季節性チャート
        const seasonal = SearchData.generateSeasonalData(keyword);
        ChartManager.updateSeasonalChart(seasonal.labels, seasonal.data);

        // 関連キーワード
        this.displayRelatedKeywords();

        // 検索者ペルソナ
        this.displayPersona();

        // 検索意図
        this.displaySearchIntent();

        // トップサイト
        this.currentSites = SearchData.generateTopSites(keyword);
        this.renderSites();

        // 結果セクションを表示
        document.getElementById('resultsSection').classList.remove('hidden');

        this.showLoading(false);

        // スクロール
        document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth' });
    },

    // ローディング状態を切り替え
    showLoading(show) {
        const overlay = document.getElementById('loadingOverlay');
        if (show) {
            overlay.classList.remove('hidden');
            this.animateLoadingMessage();
        } else {
            overlay.classList.add('hidden');
        }
    },

    // ローディングメッセージをアニメーション
    async animateLoadingMessage() {
        const messages = [
            'キーワードデータを収集しています',
            '検索ボリュームを分析中',
            '競合サイトを調査中',
            'AIがデータを解析中',
            'レポートを生成中'
        ];
        const msgEl = document.getElementById('loadingMessage');

        for (const msg of messages) {
            if (document.getElementById('loadingOverlay').classList.contains('hidden')) break;
            msgEl.textContent = msg;
            await new Promise(r => setTimeout(r, 400));
        }
    },

    // 擬似API呼び出し
    async simulateAPICall() {
        await new Promise(r => setTimeout(r, 1500));
    },

    // 結果を表示
    displayResults(volume, competition, cpc, seoDifficulty) {
        // 月間ボリューム
        document.getElementById('monthlyVolume').textContent = volume.toLocaleString();

        // 競合度
        document.getElementById('competition').textContent = competition;
        const compBadge = document.getElementById('competitionBadge');
        if (competition >= 70) {
            compBadge.textContent = '高';
            compBadge.className = 'bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full';
        } else if (competition >= 40) {
            compBadge.textContent = '中';
            compBadge.className = 'bg-yellow-100 text-yellow-600 text-xs px-2 py-1 rounded-full';
        } else {
            compBadge.textContent = '低';
            compBadge.className = 'bg-green-100 text-green-600 text-xs px-2 py-1 rounded-full';
        }

        // CPC
        document.getElementById('cpc').textContent = '¥' + cpc;

        // SEO難易度
        document.getElementById('seoDifficulty').textContent = seoDifficulty;
        const seoBadge = document.getElementById('seoBadge');
        if (seoDifficulty >= 70) {
            seoBadge.textContent = '難';
            seoBadge.className = 'bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full';
        } else if (seoDifficulty >= 40) {
            seoBadge.textContent = '普通';
            seoBadge.className = 'bg-yellow-100 text-yellow-600 text-xs px-2 py-1 rounded-full';
        } else {
            seoBadge.textContent = '易';
            seoBadge.className = 'bg-green-100 text-green-600 text-xs px-2 py-1 rounded-full';
        }
    },

    // トレンドチャートを更新
    updateTrendChart(months) {
        const trend = SearchData.generateTrendData(this.currentKeyword, months);
        ChartManager.updateTrendChart(trend.labels, trend.data);
    },

    // 関連キーワードを表示
    displayRelatedKeywords() {
        const keywords = SearchData.generateRelatedKeywords(this.currentKeyword);
        const container = document.getElementById('relatedKeywords');

        container.innerHTML = keywords.map(kw => {
            const trendIcon = kw.trend === 'up' ? '↑' : kw.trend === 'down' ? '↓' : '→';
            const trendColor = kw.trend === 'up' ? 'text-green-500' : kw.trend === 'down' ? 'text-red-500' : 'text-gray-400';

            return `
                <button class="keyword-tag bg-purple-50 text-purple-700 px-3 py-2 rounded-lg text-sm hover:bg-purple-100 transition-all flex items-center gap-2"
                        onclick="App.searchKeyword('${kw.keyword}')">
                    <span>${kw.keyword}</span>
                    <span class="text-xs text-gray-400">${(kw.volume / 1000).toFixed(1)}K</span>
                    <span class="${trendColor} text-xs">${trendIcon}</span>
                </button>
            `;
        }).join('');
    },

    // 検索者ペルソナを表示
    displayPersona() {
        const persona = SearchData.generatePersona(this.currentKeyword);
        const container = document.getElementById('personaSection');

        container.innerHTML = `
            <div class="space-y-4">
                <!-- 年齢分布 -->
                <div>
                    <h4 class="text-sm font-medium text-gray-600 mb-2">年齢層</h4>
                    <div class="space-y-1">
                        ${persona.age.map(age => {
                            const [label, percent] = age.split(': ');
                            const width = parseInt(percent);
                            return `
                                <div class="flex items-center text-sm">
                                    <span class="w-16 text-gray-500">${label}</span>
                                    <div class="flex-1 bg-gray-100 rounded-full h-2 mx-2">
                                        <div class="bg-purple-500 h-2 rounded-full" style="width: ${width}%"></div>
                                    </div>
                                    <span class="text-gray-600 w-10 text-right">${percent}</span>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>

                <!-- 性別 -->
                <div>
                    <h4 class="text-sm font-medium text-gray-600 mb-2">性別</h4>
                    <div class="flex gap-4">
                        <div class="flex-1 bg-blue-50 rounded-lg p-3 text-center">
                            <span class="text-2xl">👨</span>
                            <p class="text-lg font-bold text-blue-600">${persona.gender.male}%</p>
                        </div>
                        <div class="flex-1 bg-pink-50 rounded-lg p-3 text-center">
                            <span class="text-2xl">👩</span>
                            <p class="text-lg font-bold text-pink-600">${persona.gender.female}%</p>
                        </div>
                    </div>
                </div>

                <!-- 職業 -->
                <div>
                    <h4 class="text-sm font-medium text-gray-600 mb-2">主な職業</h4>
                    <div class="flex flex-wrap gap-2">
                        ${persona.occupation.map(occ => `
                            <span class="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">${occ}</span>
                        `).join('')}
                    </div>
                </div>

                <!-- デバイス -->
                <div>
                    <h4 class="text-sm font-medium text-gray-600 mb-2">使用デバイス</h4>
                    <div class="flex gap-2">
                        <div class="flex-1 text-center p-2 bg-gray-50 rounded-lg">
                            <span class="text-xl">📱</span>
                            <p class="text-sm font-medium">${persona.devices.mobile}%</p>
                        </div>
                        <div class="flex-1 text-center p-2 bg-gray-50 rounded-lg">
                            <span class="text-xl">💻</span>
                            <p class="text-sm font-medium">${persona.devices.desktop}%</p>
                        </div>
                        <div class="flex-1 text-center p-2 bg-gray-50 rounded-lg">
                            <span class="text-xl">📟</span>
                            <p class="text-sm font-medium">${persona.devices.tablet}%</p>
                        </div>
                    </div>
                </div>

                <!-- モチベーション -->
                <div class="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
                    <h4 class="text-sm font-medium text-gray-600 mb-1">検索の動機</h4>
                    <p class="text-sm text-gray-700">${persona.motivation}</p>
                </div>
            </div>
        `;
    },

    // 検索意図を表示
    displaySearchIntent() {
        const intents = SearchData.analyzeSearchIntent(this.currentKeyword);
        const container = document.getElementById('searchIntent');

        const colorMap = {
            blue: 'bg-blue-500',
            green: 'bg-green-500',
            orange: 'bg-orange-500',
            purple: 'bg-purple-500'
        };

        container.innerHTML = `
            <div class="space-y-3">
                ${intents.map(intent => `
                    <div>
                        <div class="flex justify-between text-sm mb-1">
                            <span class="text-gray-600">${intent.label}</span>
                            <span class="font-medium">${intent.percentage}%</span>
                        </div>
                        <div class="w-full bg-gray-100 rounded-full h-3">
                            <div class="${colorMap[intent.color]} h-3 rounded-full transition-all" style="width: ${intent.percentage}%"></div>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="mt-4 p-3 bg-gray-50 rounded-lg">
                <p class="text-xs text-gray-500">
                    💡 <strong>アドバイス:</strong> ${this.getIntentAdvice(intents[0].type)}
                </p>
            </div>
        `;
    },

    // 検索意図に基づくアドバイス
    getIntentAdvice(mainIntent) {
        const advice = {
            informational: 'このキーワードは情報収集目的が多いため、詳細で教育的なコンテンツが効果的です。',
            commercial: '比較検討段階のユーザーが多いため、比較表や口コミ情報を充実させましょう。',
            transactional: '購買意欲の高いユーザーが多いため、CTAや購入導線を最適化しましょう。',
            educational: '学習目的のユーザーが多いため、ステップバイステップのガイドが効果的です。'
        };
        return advice[mainIntent] || 'ユーザーのニーズに合わせたコンテンツを提供しましょう。';
    },

    // サイトを表示
    renderSites() {
        const container = document.getElementById('topSites');

        container.innerHTML = this.currentSites.map(site => `
            <div class="site-card bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div class="flex items-start justify-between">
                    <div class="flex-1">
                        <div class="flex items-center gap-3">
                            <span class="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-sm">${site.rank}</span>
                            <div>
                                <h4 class="font-medium text-gray-800">${site.name}</h4>
                                <p class="text-xs text-gray-400">${site.domain}</p>
                            </div>
                        </div>
                        <p class="text-sm text-gray-600 mt-2 line-clamp-1">${site.title}</p>
                        <div class="flex flex-wrap gap-3 mt-3 text-xs text-gray-500">
                            <span class="flex items-center gap-1">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                </svg>
                                ${site.traffic.toLocaleString()}/月
                            </span>
                            <span class="flex items-center gap-1">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
                                </svg>
                                DA: ${site.authority}
                            </span>
                            <span class="flex items-center gap-1">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                </svg>
                                ${site.wordCount.toLocaleString()}文字
                            </span>
                        </div>
                    </div>
                    <button onclick="App.openSEOAnalysis(${site.rank - 1})"
                            class="ml-4 gradient-bg text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-1">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                        </svg>
                        AI分析
                    </button>
                </div>
            </div>
        `).join('');
    },

    // サイトをソートして再表示
    sortAndRenderSites(sortType) {
        if (sortType === 'traffic') {
            this.currentSites.sort((a, b) => b.traffic - a.traffic);
        } else {
            this.currentSites.sort((a, b) => a.rank - b.rank);
        }
        this.renderSites();
    },

    // SEO分析モーダルを開く
    openSEOAnalysis(siteIndex) {
        const site = this.currentSites[siteIndex];
        const analysis = AIAnalysis.generateSEOAnalysis(site, this.currentKeyword);
        const html = AIAnalysis.generateReportHTML(analysis, site, this.currentKeyword);

        document.getElementById('seoAnalysisContent').innerHTML = html;
        document.getElementById('seoModal').classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    },

    // モーダルを閉じる
    closeModal() {
        document.getElementById('seoModal').classList.add('hidden');
        document.body.style.overflow = '';
    },

    // キーワードで検索（関連キーワードクリック用）
    searchKeyword(keyword) {
        document.getElementById('keywordInput').value = keyword;
        this.analyze();
    },

    // サジェストを表示
    showSuggestions(value) {
        const container = document.getElementById('suggestions');
        if (!value || value.length < 2) {
            container.classList.add('hidden');
            return;
        }

        const suggestions = this.getSuggestions(value);
        if (suggestions.length === 0) {
            container.classList.add('hidden');
            return;
        }

        container.innerHTML = suggestions.map(s => `
            <button class="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700 text-sm"
                    onclick="App.selectSuggestion('${s}')">
                ${s}
            </button>
        `).join('');
        container.classList.remove('hidden');
    },

    // サジェストを取得
    getSuggestions(value) {
        const allSuggestions = [
            'プログラミング 学習',
            'プログラミング 初心者',
            'python 入門',
            'javascript 基礎',
            'web開発 独学',
            'seo対策 方法',
            'マーケティング 戦略',
            'ai 活用',
            'chatgpt 使い方',
            '副業 おすすめ',
            'ダイエット 効果的',
            '英語 勉強法',
            '転職 成功',
            '投資 始め方'
        ];

        return allSuggestions.filter(s =>
            s.toLowerCase().includes(value.toLowerCase())
        ).slice(0, 5);
    },

    // サジェストを選択
    selectSuggestion(value) {
        document.getElementById('keywordInput').value = value;
        document.getElementById('suggestions').classList.add('hidden');
    },

    // 最近の検索を保存
    saveRecentSearch(keyword) {
        this.recentSearches = this.recentSearches.filter(k => k !== keyword);
        this.recentSearches.unshift(keyword);
        this.recentSearches = this.recentSearches.slice(0, 5);
        localStorage.setItem('recentSearches', JSON.stringify(this.recentSearches));
        this.renderRecentSearches();
    },

    // 最近の検索を読み込み
    loadRecentSearches() {
        try {
            this.recentSearches = JSON.parse(localStorage.getItem('recentSearches')) || [];
        } catch {
            this.recentSearches = [];
        }
    },

    // 最近の検索を表示
    renderRecentSearches() {
        const container = document.getElementById('recentSearches');
        if (this.recentSearches.length === 0) {
            container.innerHTML = '<span class="text-sm text-gray-400">最近の検索履歴はありません</span>';
            return;
        }

        container.innerHTML = `
            <span class="text-sm text-gray-500">最近の検索:</span>
            ${this.recentSearches.map(k => `
                <button onclick="App.searchKeyword('${k}')"
                        class="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm hover:bg-gray-200 transition-colors">
                    ${k}
                </button>
            `).join('')}
        `;
    },

    // トースト通知を表示
    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'fixed bottom-4 right-4 bg-gray-800 text-white px-6 py-3 rounded-lg shadow-lg z-50 fade-in';
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
};

// アプリケーション初期化
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

// グローバルに公開
window.App = App;
