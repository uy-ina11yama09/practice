// 検索ボリュームデータ生成モジュール
// 実際のAPIを使用する場合は、このファイルを差し替えてください

const SearchData = {
    // キーワードカテゴリと基本ボリュームのマッピング
    categoryPatterns: {
        programming: ['プログラミング', 'python', 'javascript', 'コード', '開発', 'エンジニア', 'web開発'],
        marketing: ['マーケティング', 'seo', '広告', 'sns', 'コンテンツ', 'ブランディング'],
        business: ['ビジネス', '起業', '副業', '投資', '転職', 'キャリア'],
        health: ['健康', 'ダイエット', '筋トレ', '美容', 'スキンケア', '食事'],
        education: ['学習', '勉強', '資格', '英語', 'スキル', 'オンライン'],
        technology: ['ai', '人工知能', 'chatgpt', 'tech', 'デジタル', 'iot'],
        lifestyle: ['旅行', 'グルメ', 'ファッション', '趣味', 'インテリア']
    },

    // 基本ボリュームレンジ（カテゴリ別）
    volumeRanges: {
        programming: { min: 50000, max: 500000 },
        marketing: { min: 30000, max: 300000 },
        business: { min: 80000, max: 600000 },
        health: { min: 100000, max: 800000 },
        education: { min: 60000, max: 400000 },
        technology: { min: 150000, max: 1000000 },
        lifestyle: { min: 70000, max: 500000 },
        default: { min: 20000, max: 200000 }
    },

    // キーワードのカテゴリを判定
    detectCategory(keyword) {
        const lowerKeyword = keyword.toLowerCase();
        for (const [category, patterns] of Object.entries(this.categoryPatterns)) {
            if (patterns.some(pattern => lowerKeyword.includes(pattern))) {
                return category;
            }
        }
        return 'default';
    },

    // ハッシュ関数（キーワードから一貫した数値を生成）
    hashCode(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash);
    },

    // シード付き乱数生成
    seededRandom(seed) {
        const x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
    },

    // 月間検索ボリュームを生成
    generateMonthlyVolume(keyword) {
        const category = this.detectCategory(keyword);
        const range = this.volumeRanges[category];
        const hash = this.hashCode(keyword);
        const randomFactor = this.seededRandom(hash);
        const volume = Math.floor(range.min + (range.max - range.min) * randomFactor);
        return Math.round(volume / 1000) * 1000;
    },

    // 競合度を生成（0-100）
    generateCompetition(keyword) {
        const hash = this.hashCode(keyword + 'competition');
        return Math.floor(this.seededRandom(hash) * 100);
    },

    // CPCを生成
    generateCPC(keyword) {
        const hash = this.hashCode(keyword + 'cpc');
        const baseCPC = 50 + this.seededRandom(hash) * 450;
        return Math.round(baseCPC);
    },

    // SEO難易度を生成
    generateSEODifficulty(keyword) {
        const hash = this.hashCode(keyword + 'seo');
        return Math.floor(this.seededRandom(hash) * 100);
    },

    // トレンドデータを生成（過去12ヶ月）
    generateTrendData(keyword, months = 12) {
        const baseVolume = this.generateMonthlyVolume(keyword);
        const hash = this.hashCode(keyword);
        const data = [];
        const labels = [];

        const now = new Date();
        for (let i = months - 1; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            labels.push(`${date.getFullYear()}/${date.getMonth() + 1}`);

            // 季節性を加味
            const seasonalFactor = 1 + 0.2 * Math.sin((date.getMonth() / 12) * Math.PI * 2);
            // ランダムな変動
            const randomFactor = 0.8 + this.seededRandom(hash + i) * 0.4;
            // トレンド（緩やかな上昇傾向）
            const trendFactor = 1 + (months - 1 - i) * 0.01;

            const volume = Math.floor(baseVolume * seasonalFactor * randomFactor * trendFactor);
            data.push(volume);
        }

        return { labels, data };
    },

    // 季節性データを生成
    generateSeasonalData(keyword) {
        const hash = this.hashCode(keyword);
        const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
        const data = months.map((_, i) => {
            const base = 50 + this.seededRandom(hash + i) * 50;
            const seasonal = 20 * Math.sin((i / 12) * Math.PI * 2 + this.seededRandom(hash) * Math.PI);
            return Math.floor(base + seasonal);
        });

        return { labels: months, data };
    },

    // 関連キーワードを生成
    generateRelatedKeywords(keyword) {
        const category = this.detectCategory(keyword);
        const relatedTerms = {
            programming: ['入門', '独学', 'スクール', 'おすすめ', '初心者', '学習方法', '無料', '資格', 'AI', 'アプリ開発', '副業', '転職'],
            marketing: ['戦略', '成功事例', 'ツール', '基礎', '最新トレンド', 'BtoB', 'コンテンツ', 'SNS活用', '分析', 'ROI'],
            business: ['始め方', '成功', 'アイデア', 'ノウハウ', '事例', '戦略', '資金', 'オンライン', 'スキル'],
            health: ['方法', '効果', '口コミ', 'おすすめ', '食事', '運動', 'サプリ', '自宅', '簡単'],
            education: ['方法', 'コツ', 'アプリ', '無料', 'オンライン', '効率', 'モチベーション', '社会人'],
            technology: ['使い方', '入門', '活用', '最新', 'ビジネス', '事例', '将来', '学習'],
            lifestyle: ['おすすめ', '人気', 'ランキング', '口コミ', '比較', '初心者', '2024', 'トレンド'],
            default: ['とは', '方法', 'やり方', 'コツ', 'おすすめ', '比較', '口コミ', '評判']
        };

        const terms = relatedTerms[category] || relatedTerms.default;
        const hash = this.hashCode(keyword);

        return terms.map((term, i) => {
            const volume = Math.floor(this.generateMonthlyVolume(keyword) * (0.1 + this.seededRandom(hash + i) * 0.5));
            const trend = ['up', 'down', 'stable'][Math.floor(this.seededRandom(hash + i + 100) * 3)];
            return {
                keyword: `${keyword} ${term}`,
                volume: Math.round(volume / 100) * 100,
                trend: trend
            };
        }).sort((a, b) => b.volume - a.volume).slice(0, 8);
    },

    // 検索者ペルソナを生成
    generatePersona(keyword) {
        const category = this.detectCategory(keyword);
        const hash = this.hashCode(keyword);

        const personas = {
            programming: {
                age: ['20代: 45%', '30代: 35%', '40代: 15%', 'その他: 5%'],
                gender: { male: 70, female: 30 },
                occupation: ['会社員（IT）', '学生', 'フリーランス', '異業種からの転職希望者'],
                interests: ['テクノロジー', 'スキルアップ', '副業', 'キャリアアップ'],
                motivation: '新しいスキルを身につけてキャリアの可能性を広げたい',
                devices: { mobile: 35, desktop: 60, tablet: 5 }
            },
            marketing: {
                age: ['20代: 30%', '30代: 40%', '40代: 20%', '50代以上: 10%'],
                gender: { male: 55, female: 45 },
                occupation: ['マーケター', '経営者', 'フリーランス', '広告代理店'],
                interests: ['ビジネス成長', 'デジタル戦略', 'データ分析', 'トレンド'],
                motivation: '効果的な集客・販促方法を見つけてビジネスを成長させたい',
                devices: { mobile: 40, desktop: 55, tablet: 5 }
            },
            health: {
                age: ['20代: 25%', '30代: 30%', '40代: 25%', '50代以上: 20%'],
                gender: { male: 40, female: 60 },
                occupation: ['会社員', '主婦/主夫', '学生', 'シニア'],
                interests: ['美容', 'ライフスタイル', '食生活', 'フィットネス'],
                motivation: '健康的な生活を送りたい、見た目を改善したい',
                devices: { mobile: 65, desktop: 25, tablet: 10 }
            },
            default: {
                age: ['20代: 30%', '30代: 30%', '40代: 25%', '50代以上: 15%'],
                gender: { male: 50, female: 50 },
                occupation: ['会社員', '学生', '主婦/主夫', 'フリーランス'],
                interests: ['情報収集', '問題解決', 'トレンド把握', '比較検討'],
                motivation: '必要な情報を効率的に得たい',
                devices: { mobile: 55, desktop: 35, tablet: 10 }
            }
        };

        return personas[category] || personas.default;
    },

    // 検索意図を分析
    analyzeSearchIntent(keyword) {
        const intents = [];
        const lowerKeyword = keyword.toLowerCase();

        // 情報収集系
        if (lowerKeyword.includes('とは') || lowerKeyword.includes('意味') || lowerKeyword.includes('仕組み')) {
            intents.push({ type: 'informational', label: '情報収集', percentage: 70, color: 'blue' });
            intents.push({ type: 'educational', label: '学習目的', percentage: 20, color: 'green' });
            intents.push({ type: 'transactional', label: '購買目的', percentage: 10, color: 'orange' });
        }
        // 比較・検討系
        else if (lowerKeyword.includes('比較') || lowerKeyword.includes('おすすめ') || lowerKeyword.includes('ランキング')) {
            intents.push({ type: 'commercial', label: '比較検討', percentage: 50, color: 'purple' });
            intents.push({ type: 'transactional', label: '購買目的', percentage: 35, color: 'orange' });
            intents.push({ type: 'informational', label: '情報収集', percentage: 15, color: 'blue' });
        }
        // 方法・ハウツー系
        else if (lowerKeyword.includes('方法') || lowerKeyword.includes('やり方') || lowerKeyword.includes('コツ')) {
            intents.push({ type: 'informational', label: '情報収集', percentage: 55, color: 'blue' });
            intents.push({ type: 'educational', label: '学習目的', percentage: 35, color: 'green' });
            intents.push({ type: 'transactional', label: '購買目的', percentage: 10, color: 'orange' });
        }
        // デフォルト
        else {
            const hash = this.hashCode(keyword);
            const r1 = Math.floor(this.seededRandom(hash) * 30) + 30;
            const r2 = Math.floor(this.seededRandom(hash + 1) * 30) + 20;
            const r3 = 100 - r1 - r2;
            intents.push({ type: 'informational', label: '情報収集', percentage: r1, color: 'blue' });
            intents.push({ type: 'commercial', label: '比較検討', percentage: r2, color: 'purple' });
            intents.push({ type: 'transactional', label: '購買目的', percentage: r3, color: 'orange' });
        }

        return intents.sort((a, b) => b.percentage - a.percentage);
    },

    // 検索上位サイトを生成
    generateTopSites(keyword) {
        const hash = this.hashCode(keyword);
        const category = this.detectCategory(keyword);

        const siteTemplates = {
            programming: [
                { domain: 'qiita.com', name: 'Qiita', type: '技術記事プラットフォーム' },
                { domain: 'zenn.dev', name: 'Zenn', type: '技術記事プラットフォーム' },
                { domain: 'techacademy.jp', name: 'TechAcademy', type: 'オンラインスクール' },
                { domain: 'udemy.com', name: 'Udemy', type: 'オンライン学習' },
                { domain: 'progate.com', name: 'Progate', type: '学習サービス' },
                { domain: 'paiza.jp', name: 'paiza', type: 'プログラミング学習' },
                { domain: 'codecamp.jp', name: 'CodeCamp', type: 'オンラインスクール' },
                { domain: 'teratail.com', name: 'teratail', type: 'Q&Aサイト' },
                { domain: 'tech-camp.in', name: 'テックキャンプ', type: 'スクール' },
                { domain: 'note.com', name: 'note', type: 'ブログプラットフォーム' }
            ],
            marketing: [
                { domain: 'ferret-plus.com', name: 'ferret', type: 'マーケティングメディア' },
                { domain: 'webtan.impress.co.jp', name: 'Web担当者Forum', type: '専門メディア' },
                { domain: 'markezine.jp', name: 'MarkeZine', type: 'マーケティング専門' },
                { domain: 'seohacks.net', name: 'SEO HACKS', type: 'SEO専門' },
                { domain: 'hubspot.jp', name: 'HubSpot', type: 'マーケティングツール' },
                { domain: 'contentmarketinglab.jp', name: 'コンテンツマーケラボ', type: '専門メディア' },
                { domain: 'satori.marketing', name: 'SATORI', type: 'MAツール' },
                { domain: 'liskul.com', name: 'LISKUL', type: 'マーケティングメディア' },
                { domain: 'baigie.me', name: 'ベイジのブログ', type: 'Web制作会社' },
                { domain: 'wacul-ai.com', name: 'WACUL', type: 'デジタルマーケ' }
            ],
            default: [
                { domain: 'wikipedia.org', name: 'Wikipedia', type: '百科事典' },
                { domain: 'note.com', name: 'note', type: 'ブログプラットフォーム' },
                { domain: 'allabout.co.jp', name: 'All About', type: '総合情報サイト' },
                { domain: 'mynavi.jp', name: 'マイナビ', type: '総合情報サイト' },
                { domain: 'diamond.jp', name: 'ダイヤモンド', type: 'ビジネスメディア' },
                { domain: 'president.jp', name: 'プレジデント', type: 'ビジネスメディア' },
                { domain: 'toyokeizai.net', name: '東洋経済', type: '経済メディア' },
                { domain: 'nikkei.com', name: '日本経済新聞', type: '経済メディア' },
                { domain: 'yahoo.co.jp', name: 'Yahoo! JAPAN', type: 'ポータルサイト' },
                { domain: 'hatena.ne.jp', name: 'はてなブログ', type: 'ブログプラットフォーム' }
            ]
        };

        const templates = siteTemplates[category] || siteTemplates.default;

        return templates.map((site, i) => {
            const rankSeed = hash + i;
            const traffic = Math.floor(this.seededRandom(rankSeed) * 50000) + 5000;
            const authority = Math.floor(60 + this.seededRandom(rankSeed + 100) * 40);
            const backlinks = Math.floor(1000 + this.seededRandom(rankSeed + 200) * 50000);
            const wordCount = Math.floor(1500 + this.seededRandom(rankSeed + 300) * 8000);

            return {
                rank: i + 1,
                domain: site.domain,
                name: site.name,
                type: site.type,
                title: `${keyword}${['の完全ガイド', 'とは？初心者向け解説', '徹底解説', 'まとめ', 'の基礎知識'][i % 5]}`,
                url: `https://${site.domain}/${keyword.replace(/\s/g, '-')}-guide`,
                traffic: traffic,
                authority: authority,
                backlinks: backlinks,
                wordCount: wordCount,
                lastUpdated: new Date(Date.now() - Math.floor(this.seededRandom(rankSeed + 400) * 90) * 24 * 60 * 60 * 1000).toLocaleDateString('ja-JP'),
                seoFactors: {
                    titleOptimization: Math.floor(70 + this.seededRandom(rankSeed + 500) * 30),
                    contentQuality: Math.floor(70 + this.seededRandom(rankSeed + 600) * 30),
                    backlinks: Math.floor(60 + this.seededRandom(rankSeed + 700) * 40),
                    userExperience: Math.floor(65 + this.seededRandom(rankSeed + 800) * 35),
                    technicalSEO: Math.floor(70 + this.seededRandom(rankSeed + 900) * 30)
                }
            };
        });
    }
};

// グローバルに公開
window.SearchData = SearchData;
