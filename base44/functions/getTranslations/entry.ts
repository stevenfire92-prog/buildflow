import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';

const RUN_KEY = 'bf-translations-7c4f';
const MAX_STRINGS = 300;
const MAX_VALUE_LEN = 1000;

export default async function(req) {
  try {
    let body = {};
    try {
      body = await req.json();
    } catch (e) {
      body = {};
    }
    if (!body || body.run_key !== RUN_KEY) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const languageCode = String(body.language_code || '').trim();
    const languageName = String(body.language_name || languageCode).trim();
    const strings = body.strings || {};
    if (!languageCode || languageCode === 'en') {
      return Response.json({ translations: {} });
    }

    const base44 = createClientFromRequest(req);

    // Load cached translations for this language
    const existing = await base44.asServiceRole.entities.Translation.filter(
      { language_code: languageCode },
      undefined,
      500
    );
    const translations = {};
    (existing || []).forEach((row) => {
      translations[row.key] = row.value;
    });

    // Collect the keys that still need translating
    const missing = {};
    let count = 0;
    for (const [key, value] of Object.entries(strings)) {
      if (count >= MAX_STRINGS) break;
      if (typeof value !== 'string' || translations[key]) continue;
      missing[key] = value.slice(0, MAX_VALUE_LEN);
      count += 1;
    }

    if (Object.keys(missing).length > 0) {
      const prompt =
        'You are a professional localization expert for software products.\n\n' +
        `Translate each UI string below into ${languageName} (language code "${languageCode}").\n\n` +
        'Rules:\n' +
        '- Keep brand names exactly unchanged: Base44, Se Fire Tech, BuildFlow.\n' +
        '- Keep pricing amounts ($0, $16, $28), "..." placeholders, and separators ("·", "—", "©") unchanged.\n' +
        '- Keep the tone concise, confident and marketing-appropriate.\n' +
        '- If a technical term has no established equivalent in the target language (e.g. SEO), keep the English term.\n\n' +
        'Input is a JSON object of key -> English text:\n' +
        JSON.stringify(missing) +
        '\n\n' +
        `Respond with ONLY a valid JSON object mapping EVERY input key to its ${languageName} translation. ` +
        'Only include the input keys. No markdown fences, no commentary — the entire response must be the JSON object.';

      const result = await base44.asServiceRole.integrations.Core.InvokeLLM({ prompt });

      // InvokeLLM may return { response: "..." }, a plain string, or an already-parsed object
      let raw = result;
      if (raw && typeof raw === 'object' && raw.response !== undefined) raw = raw.response;
      let out = null;
      if (typeof raw === 'string') {
        const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').trim();
        try {
          out = JSON.parse(cleaned);
        } catch (e) {
          out = null;
        }
      } else if (raw && typeof raw === 'object') {
        out = raw;
      }

      const toSave = [];
      if (out && typeof out === 'object') {
        for (const key of Object.keys(missing)) {
          const translated = typeof out[key] === 'string' ? out[key].trim() : '';
          if (translated) {
            translations[key] = translated;
            toSave.push({
              language_code: languageCode,
              key,
              value: translated.slice(0, MAX_VALUE_LEN),
            });
          }
        }
      }
      if (toSave.length > 0) {
        await base44.asServiceRole.entities.Translation.bulkCreate(toSave);
      } else {
        console.log(
          'getTranslations: could not extract translations, raw result:',
          typeof raw === 'string' ? raw.slice(0, 300) : JSON.stringify(raw).slice(0, 300)
        );
      }
    }

    return Response.json({ translations });
  } catch (error) {
    console.log('getTranslations error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}