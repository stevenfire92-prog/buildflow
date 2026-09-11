import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';

export default async function(req) {
  try {
    let body = {};
    try {
      body = await req.json();
    } catch (e) {
      body = {};
    }

    const message = String(body.message || '').trim();
    if (!message) {
      return Response.json({ error: 'Message is required' }, { status: 400 });
    }

    const history = Array.isArray(body.history) ? body.history.slice(-6) : [];
    const topic = String(body.topic || 'general').trim();

    const base44 = createClientFromRequest(req);

    // Fetch brief context of existing projects and books to give personalized guidance
    let projectCount = 0;
    let bookCount = 0;
    try {
      const projects = await base44.asServiceRole.entities.Project.list('-created_date', 10);
      projectCount = (projects || []).length;
      const books = await base44.asServiceRole.entities.KindleBook.list(undefined, 10);
      bookCount = (books || []).length;
    } catch {
      // graceful fallback if entities not accessible
    }

    const conversationContext = history
      .map((h) => `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.content}`)
      .join('\n');

    const prompt = `You are the Builder Flow AI Setup Assistant — the premier AI software architect and platform guide for Builder Flow (Se Fire Tech), founded by Steven Thomas Turcott.
Your mission is to be the best-in-class setup assistant, providing direct, highly knowledgeable, and practical answers.

Platform Context:
- Platform: Builder Flow by Se Fire Tech
- Founder: Steven Thomas Turcott
- Current Workspace: ${projectCount} active projects registered, ${bookCount} Kindle books connected
- Integrations: Stripe Payments (live mode, subscription & one-time), Google Sheets (metric sync), Google Calendar (deadline sync), Gmail (automated Monday 9:00 AM weekly report), 190+ World Languages & Regional Accents, Steven's Voice Narrator Guide.
- Shadow Path: Steven Thomas Turcott's 9-book dark fantasy series with Stripe Buy & Rent digital checkouts.

Instructions:
1. Provide concrete, step-by-step guidance.
2. If asked about setup (Stripe, Google Sheets, Calendar, Domains, Languages, Kindle Books, Projects), provide concise, bulleted instructions.
3. Keep answers clear, confident, professional, and friendly.
4. If code or configuration is relevant, present clean markdown snippets.

${conversationContext ? `Recent conversation:\n${conversationContext}\n` : ''}
User Request: ${message}

Assistant Response:`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
    });

    let reply = '';
    if (typeof result === 'string') {
      reply = result;
    } else if (result && typeof result === 'object') {
      reply = result.response || result.output || JSON.stringify(result);
    }

    return Response.json({
      reply: reply.trim(),
      topic,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('aiAssistantChat error:', error);
    return Response.json(
      { error: error.message || 'Failed to generate assistant response' },
      { status: 500 }
    );
  }
}