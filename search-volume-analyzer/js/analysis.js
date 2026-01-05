// AI分析モジュール
// 実際のAI APIを使用する場合は、このファイルを拡張してください

const AIAnalysis = {
    // SEO分析レポートを生成
    generateSEOAnalysis(site, keyword) {
        const analysis = {
            overview: this.generateOverview(site, keyword),
            rankingFactors: this.analyzeRankingFactors(site),
            strengths: this.identifyStrengths(site),
            improvements: this.suggestImprovements(site),
            contentAnalysis: this.analyzeContent(site, keyword),
            technicalSEO: this.analyzeTechnical(site),
            competitorComparison: this.compareWithCompetitors(site)
        };
        return analysis;
    },

    // 概要を生成
    generateOverview(site, keyword) {
        const templates = [
            `「${site.name}」は「${keyword}」の検索結果で${site.rank}位にランクインしています。ドメインオーソリティは${site.authority}と${site.authority > 70 ? '非常に高く' : site.authority > 50 ? '比較的高く' : '中程度で'}、${site.backlinks.toLocaleString()}件のバックリンクを獲得しています。`,
            `このサイトは${site.type}として知られており、「${keyword}」関連のコンテンツで強い存在感を示しています。月間推定流入数は${site.traffic.toLocaleString()}で、コンテンツは${site.wordCount.toLocaleString()}文字と${site.wordCount > 5000 ? '非常に充実' : site.wordCount > 3000 ? '十分な量' : '適度な量'}しています。`
        ];
        return templates.join('\n\n');
    },

    // ランキング要因を分析
    analyzeRankingFactors(site) {
        const factors = site.seoFactors;
        return [
            {
                name: 'タイトル最適化',
                score: factors.titleOptimization,
                description: this.getTitleAnalysis(factors.titleOptimization),
                icon: '📝'
            },
            {
                name: 'コンテンツ品質',
                score: factors.contentQuality,
                description: this.getContentQualityAnalysis(factors.contentQuality, site.wordCount),
                icon: '📄'
            },
            {
                name: 'バックリンク',
                score: factors.backlinks,
                description: this.getBacklinkAnalysis(factors.backlinks, site.backlinks),
                icon: '🔗'
            },
            {
                name: 'ユーザー体験',
                score: factors.userExperience,
                description: this.getUXAnalysis(factors.userExperience),
                icon: '👥'
            },
            {
                name: '技術的SEO',
                score: factors.technicalSEO,
                description: this.getTechnicalAnalysis(factors.technicalSEO),
                icon: '⚙️'
            }
        ];
    },

    getTitleAnalysis(score) {
        if (score >= 90) return 'タイトルは非常に最適化されています。キーワードが適切に含まれ、クリック率を高める魅力的な表現になっています。';
        if (score >= 70) return 'タイトルは適切に最適化されています。主要キーワードが含まれており、検索意図に合致しています。';
        return 'タイトルの最適化の余地があります。より具体的なキーワードや数字の活用を検討してください。';
    },

    getContentQualityAnalysis(score, wordCount) {
        if (score >= 90) return `${wordCount.toLocaleString()}文字の充実したコンテンツで、トピックを網羅的にカバーしています。E-E-A-Tの観点でも高評価です。`;
        if (score >= 70) return `${wordCount.toLocaleString()}文字のコンテンツは、ユーザーの検索意図に対して適切な情報量を提供しています。`;
        return `コンテンツの拡充が推奨されます。現在${wordCount.toLocaleString()}文字ですが、より詳細な情報追加が効果的でしょう。`;
    },

    getBacklinkAnalysis(score, count) {
        if (score >= 90) return `${count.toLocaleString()}件の高品質なバックリンクを獲得しており、ドメインの信頼性が非常に高いです。`;
        if (score >= 70) return `${count.toLocaleString()}件のバックリンクがあり、業界内で一定の認知度を確立しています。`;
        return `バックリンク数は${count.toLocaleString()}件です。質の高い外部リンクの獲得戦略が重要です。`;
    },

    getUXAnalysis(score) {
        if (score >= 90) return 'ページ速度、モバイル対応、ナビゲーションともに優れており、Core Web Vitalsも良好です。';
        if (score >= 70) return 'ユーザー体験は平均以上です。ページの読み込み速度やモバイル表示は概ね良好です。';
        return 'ユーザー体験の改善余地があります。ページ速度やモバイル対応の最適化を検討してください。';
    },

    getTechnicalAnalysis(score) {
        if (score >= 90) return '技術的なSEO対策が万全です。構造化データ、サイトマップ、クロール効率すべて最適化されています。';
        if (score >= 70) return '基本的な技術SEOは実装されています。いくつかの改善点はありますが、大きな問題はありません。';
        return '技術的SEOに改善の余地があります。構造化データや内部リンク構造の見直しを推奨します。';
    },

    // 強みを特定
    identifyStrengths(site) {
        const strengths = [];
        const factors = site.seoFactors;

        if (factors.contentQuality >= 80) {
            strengths.push({
                title: '高品質なコンテンツ',
                description: '専門性の高い充実したコンテンツが評価されています。'
            });
        }
        if (factors.backlinks >= 80) {
            strengths.push({
                title: '強力なバックリンクプロファイル',
                description: '信頼性の高いサイトからの被リンクを多数獲得しています。'
            });
        }
        if (site.authority >= 70) {
            strengths.push({
                title: '高いドメインオーソリティ',
                description: `DA ${site.authority}は業界でもトップクラスの評価です。`
            });
        }
        if (factors.userExperience >= 80) {
            strengths.push({
                title: '優れたユーザー体験',
                description: '使いやすさとアクセシビリティが高く評価されています。'
            });
        }
        if (site.wordCount >= 5000) {
            strengths.push({
                title: '網羅的なコンテンツ量',
                description: `${site.wordCount.toLocaleString()}文字の詳細なコンテンツでトピックを網羅。`
            });
        }

        return strengths.length > 0 ? strengths : [{
            title: '安定したパフォーマンス',
            description: 'バランスの取れたSEO対策が実施されています。'
        }];
    },

    // 改善点を提案
    suggestImprovements(site) {
        const improvements = [];
        const factors = site.seoFactors;

        if (factors.titleOptimization < 80) {
            improvements.push({
                priority: '高',
                title: 'タイトルタグの最適化',
                description: 'より魅力的で検索意図に合ったタイトルに改善することで、CTRの向上が期待できます。',
                impact: 'CTR向上'
            });
        }
        if (factors.contentQuality < 80) {
            improvements.push({
                priority: '高',
                title: 'コンテンツの質と量の向上',
                description: 'より詳細で専門的な情報を追加し、ユーザーの疑問に網羅的に答えるコンテンツへ。',
                impact: 'ランキング向上'
            });
        }
        if (factors.backlinks < 70) {
            improvements.push({
                priority: '中',
                title: 'バックリンク獲得戦略',
                description: 'ゲスト投稿やリンク可能なアセット作成による被リンク増加を推奨します。',
                impact: 'ドメイン権威向上'
            });
        }
        if (factors.technicalSEO < 80) {
            improvements.push({
                priority: '中',
                title: '技術的SEOの改善',
                description: '構造化データの実装やサイト速度の最適化を検討してください。',
                impact: 'クロール効率改善'
            });
        }
        if (factors.userExperience < 75) {
            improvements.push({
                priority: '高',
                title: 'ユーザー体験の向上',
                description: 'Core Web Vitalsの改善やモバイル表示の最適化を推奨します。',
                impact: 'エンゲージメント向上'
            });
        }

        return improvements.length > 0 ? improvements : [{
            priority: '低',
            title: '継続的な最適化',
            description: '現状維持しつつ、定期的なコンテンツ更新と競合分析を続けてください。',
            impact: '長期的な安定'
        }];
    },

    // コンテンツ分析
    analyzeContent(site, keyword) {
        return {
            wordCount: site.wordCount,
            readingTime: Math.ceil(site.wordCount / 400), // 日本語の平均読書速度
            keywordDensity: (1.5 + Math.random() * 1.5).toFixed(1) + '%',
            headingsCount: Math.floor(site.wordCount / 500) + 2,
            imagesEstimate: Math.floor(site.wordCount / 800) + 1,
            lastUpdated: site.lastUpdated,
            recommendation: site.wordCount < 3000
                ? 'コンテンツをより充実させることで、検索順位の向上が期待できます。'
                : 'コンテンツ量は十分です。定期的な更新で鮮度を保ちましょう。'
        };
    },

    // 技術SEO分析
    analyzeTechnical(site) {
        const score = site.seoFactors.technicalSEO;
        return {
            mobileOptimization: score >= 70 ? '最適化済み' : '改善が必要',
            pageSpeed: score >= 80 ? '高速' : score >= 60 ? '普通' : '要改善',
            https: true,
            structuredData: score >= 75,
            canonicalTag: true,
            robotsTxt: true,
            sitemap: true,
            coreWebVitals: {
                lcp: score >= 80 ? '良好' : '改善が必要',
                fid: score >= 70 ? '良好' : '改善が必要',
                cls: score >= 75 ? '良好' : '改善が必要'
            }
        };
    },

    // 競合比較
    compareWithCompetitors(site) {
        const avgAuthority = 65;
        const avgBacklinks = 15000;
        const avgWordCount = 4000;

        return {
            authorityComparison: {
                site: site.authority,
                average: avgAuthority,
                difference: site.authority - avgAuthority,
                status: site.authority > avgAuthority ? 'above' : 'below'
            },
            backlinksComparison: {
                site: site.backlinks,
                average: avgBacklinks,
                difference: site.backlinks - avgBacklinks,
                status: site.backlinks > avgBacklinks ? 'above' : 'below'
            },
            contentComparison: {
                site: site.wordCount,
                average: avgWordCount,
                difference: site.wordCount - avgWordCount,
                status: site.wordCount > avgWordCount ? 'above' : 'below'
            }
        };
    },

    // レポートHTMLを生成
    generateReportHTML(analysis, site, keyword) {
        return `
            <div class="space-y-6">
                <!-- 概要 -->
                <div>
                    <h4 class="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                        <span class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">📊</span>
                        分析概要
                    </h4>
                    <p class="text-gray-600 leading-relaxed">${analysis.overview}</p>
                </div>

                <!-- ランキング要因 -->
                <div>
                    <h4 class="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                        <span class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">🎯</span>
                        なぜこのサイトが上位表示されているのか
                    </h4>
                    <div class="space-y-3">
                        ${analysis.rankingFactors.map(factor => `
                            <div class="bg-gray-50 rounded-lg p-4">
                                <div class="flex items-center justify-between mb-2">
                                    <span class="font-medium text-gray-700">${factor.icon} ${factor.name}</span>
                                    <span class="text-sm font-semibold ${factor.score >= 80 ? 'text-green-600' : factor.score >= 60 ? 'text-yellow-600' : 'text-red-600'}">${factor.score}/100</span>
                                </div>
                                <div class="w-full bg-gray-200 rounded-full h-2 mb-2">
                                    <div class="h-2 rounded-full ${factor.score >= 80 ? 'bg-green-500' : factor.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'}" style="width: ${factor.score}%"></div>
                                </div>
                                <p class="text-sm text-gray-600">${factor.description}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- 強み -->
                <div>
                    <h4 class="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                        <span class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">💪</span>
                        このサイトの強み
                    </h4>
                    <div class="grid grid-cols-1 gap-3">
                        ${analysis.strengths.map(s => `
                            <div class="bg-green-50 border border-green-100 rounded-lg p-4">
                                <h5 class="font-medium text-green-800">${s.title}</h5>
                                <p class="text-sm text-green-700 mt-1">${s.description}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- 改善提案 -->
                <div>
                    <h4 class="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                        <span class="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3">💡</span>
                        あなたのサイトで参考にすべき点・改善ポイント
                    </h4>
                    <div class="space-y-3">
                        ${analysis.improvements.map(imp => `
                            <div class="border ${imp.priority === '高' ? 'border-red-200 bg-red-50' : imp.priority === '中' ? 'border-yellow-200 bg-yellow-50' : 'border-gray-200 bg-gray-50'} rounded-lg p-4">
                                <div class="flex items-center justify-between mb-1">
                                    <h5 class="font-medium ${imp.priority === '高' ? 'text-red-800' : imp.priority === '中' ? 'text-yellow-800' : 'text-gray-800'}">${imp.title}</h5>
                                    <span class="text-xs px-2 py-1 rounded-full ${imp.priority === '高' ? 'bg-red-200 text-red-700' : imp.priority === '中' ? 'bg-yellow-200 text-yellow-700' : 'bg-gray-200 text-gray-700'}">優先度: ${imp.priority}</span>
                                </div>
                                <p class="text-sm ${imp.priority === '高' ? 'text-red-700' : imp.priority === '中' ? 'text-yellow-700' : 'text-gray-600'}">${imp.description}</p>
                                <p class="text-xs mt-2 font-medium ${imp.priority === '高' ? 'text-red-600' : imp.priority === '中' ? 'text-yellow-600' : 'text-gray-500'}">期待効果: ${imp.impact}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- コンテンツ分析 -->
                <div>
                    <h4 class="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                        <span class="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">📝</span>
                        コンテンツ詳細
                    </h4>
                    <div class="grid grid-cols-2 gap-4">
                        <div class="bg-gray-50 rounded-lg p-3 text-center">
                            <p class="text-2xl font-bold text-gray-800">${analysis.contentAnalysis.wordCount.toLocaleString()}</p>
                            <p class="text-xs text-gray-500">文字数</p>
                        </div>
                        <div class="bg-gray-50 rounded-lg p-3 text-center">
                            <p class="text-2xl font-bold text-gray-800">${analysis.contentAnalysis.readingTime}分</p>
                            <p class="text-xs text-gray-500">読了時間</p>
                        </div>
                        <div class="bg-gray-50 rounded-lg p-3 text-center">
                            <p class="text-2xl font-bold text-gray-800">${analysis.contentAnalysis.keywordDensity}</p>
                            <p class="text-xs text-gray-500">キーワード密度</p>
                        </div>
                        <div class="bg-gray-50 rounded-lg p-3 text-center">
                            <p class="text-2xl font-bold text-gray-800">${analysis.contentAnalysis.headingsCount}</p>
                            <p class="text-xs text-gray-500">見出し数</p>
                        </div>
                    </div>
                    <p class="text-sm text-gray-600 mt-3 bg-blue-50 p-3 rounded-lg">${analysis.contentAnalysis.recommendation}</p>
                </div>

                <!-- 競合比較 -->
                <div>
                    <h4 class="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                        <span class="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center mr-3">⚖️</span>
                        競合との比較
                    </h4>
                    <div class="space-y-3">
                        ${this.generateComparisonBar('ドメインオーソリティ', analysis.competitorComparison.authorityComparison)}
                        ${this.generateComparisonBar('バックリンク数', analysis.competitorComparison.backlinksComparison)}
                        ${this.generateComparisonBar('コンテンツ量', analysis.competitorComparison.contentComparison)}
                    </div>
                </div>
            </div>
        `;
    },

    generateComparisonBar(label, data) {
        const sitePercent = Math.min(100, (data.site / (data.average * 2)) * 100);
        const avgPercent = 50;

        return `
            <div class="bg-gray-50 rounded-lg p-3">
                <div class="flex justify-between text-sm mb-1">
                    <span class="text-gray-600">${label}</span>
                    <span class="${data.status === 'above' ? 'text-green-600' : 'text-red-600'} font-medium">
                        ${data.status === 'above' ? '+' : ''}${typeof data.difference === 'number' ? data.difference.toLocaleString() : data.difference}
                    </span>
                </div>
                <div class="relative h-4 bg-gray-200 rounded-full">
                    <div class="absolute h-4 bg-purple-500 rounded-full" style="width: ${sitePercent}%"></div>
                    <div class="absolute h-4 w-1 bg-gray-400" style="left: ${avgPercent}%"></div>
                </div>
                <div class="flex justify-between text-xs text-gray-400 mt-1">
                    <span>このサイト: ${typeof data.site === 'number' ? data.site.toLocaleString() : data.site}</span>
                    <span>競合平均: ${typeof data.average === 'number' ? data.average.toLocaleString() : data.average}</span>
                </div>
            </div>
        `;
    }
};

// グローバルに公開
window.AIAnalysis = AIAnalysis;
