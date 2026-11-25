import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { messages, character, memories } = await req.json();

    const apiKey = process.env.AI_API_KEY;
    const provider = process.env.AI_PROVIDER || 'openai'; // openai, anthropic, grok, etc.

    if (!apiKey) {
      return NextResponse.json({
        content: "*(AI not connected yet. Add your AI_API_KEY to the environment variables to enable real responses.)*"
      });
    }

    // Build system prompt with character + memories
    const memoryText = memories?.length
      ? `\n\nImportant memories:\n${memories.map((m: any) => `- ${m.content}`).join('\n')}`
      : '';

    const systemPrompt = `You are ${character?.name || 'a character'}. 
${character?.personality || ''}
${character?.private_instructions || ''}
${character?.backstory ? `Backstory: ${character.backstory}` : ''}
${memoryText}

Stay fully in character. Write immersive, natural responses. Use *asterisks* for actions and narration. Do not speak or act for the user.`;

    let reply = '';

    if (provider === 'openai' || provider === 'grok') {
      const baseUrl = provider === 'grok' 
        ? 'https://api.x.ai/v1' 
        : 'https://api.openai.com/v1';

      const res = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: provider === 'grok' ? 'grok-beta' : 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages.map((m: any) => ({ role: m.role, content: m.content })),
          ],
          temperature: 0.8,
          max_tokens: 500,
        }),
      });

      const data = await res.json();
      reply = data.choices?.[0]?.message?.content || 'No response';
    } else if (provider === 'anthropic') {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 500,
          system: systemPrompt,
          messages: messages.map((m: any) => ({
            role: m.role === 'assistant' ? 'assistant' : 'user',
            content: m.content,
          })),
        }),
      });

      const data = await res.json();
      reply = data.content?.[0]?.text || 'No response';
    }

    return NextResponse.json({ content: reply });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ content: 'Something went wrong with the AI response.' }, { status: 500 });
  }
}
