// AI API utilities

export const generateWithAI = async (prompt, content, settings) => {
  if (!settings.apiKey) {
    throw new Error('APIキーが設定されていません。設定画面でAPIキーを入力してください。');
  }

  if (settings.apiProvider === 'openai') {
    return generateWithOpenAI(prompt, content, settings.apiKey);
  } else if (settings.apiProvider === 'anthropic') {
    return generateWithAnthropic(prompt, content, settings.apiKey);
  }

  throw new Error('不明なAPIプロバイダーです。');
};

const generateWithOpenAI = async (systemPrompt, userContent, apiKey) => {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent },
      ],
      max_tokens: 1000,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'OpenAI API エラー');
  }

  const data = await response.json();
  return data.choices[0].message.content;
};

const generateWithAnthropic = async (systemPrompt, userContent, apiKey) => {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-3-5-haiku-latest',
      max_tokens: 1000,
      system: systemPrompt,
      messages: [
        { role: 'user', content: userContent },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Anthropic API エラー');
  }

  const data = await response.json();
  return data.content[0].text;
};

// Generate title for an idea
export const generateTitle = async (content, settings) => {
  const prompt = `以下のアイデアに対して、簡潔で分かりやすいタイトルを1つだけ生成してください。タイトルのみを出力し、他の説明は不要です。タイトルは20文字以内にしてください。`;
  return generateWithAI(prompt, content, settings);
};

// Generate tag suggestions
export const generateTagSuggestions = async (content, existingTags, settings) => {
  const prompt = `以下のアイデアに適切なタグを3つまで提案してください。
既存のタグ一覧: ${existingTags.length > 0 ? existingTags.join(', ') : 'なし'}

できるだけ既存のタグを活用し、必要な場合のみ新しいタグを提案してください。
タグはカンマ区切りで出力してください。タグのみを出力し、他の説明は不要です。`;

  const result = await generateWithAI(prompt, content, settings);
  return result.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
};

// Generate feedback for an idea
export const generateFeedback = async (content, settings) => {
  return generateWithAI(settings.feedbackPrompt, content, settings);
};
