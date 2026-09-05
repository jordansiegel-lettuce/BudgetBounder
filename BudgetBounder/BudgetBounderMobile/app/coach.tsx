import { useState } from 'react';
import { Text, TextInput, StyleSheet } from 'react-native';
import { Card, PixelLabel, PrimaryButton, Screen, StatePanel } from '@/src/components/BbUi';
import api from '@/src/services/api';
import { bb } from '@/src/theme/tokens';

type Message = { role: 'user' | 'assistant'; text: string };
export default function CoachScreen() {
  const [messages, setMessages] = useState<Message[]>([]), [question, setQuestion] = useState(''), [busy, setBusy] = useState(false), [error, setError] = useState('');
  async function send(prompt = question) {
    if (!prompt.trim() || busy) return;
    setBusy(true); setError('');
    try {
      const context = messages.slice(-6).map(m => m.role + ': ' + m.text).join('\n');
      const response = await api.post<string>('/ai/chat', { message: (context ? context.slice(-5000) + '\n\nNew question: ' : '') + prompt.trim() });
      setMessages(previous => [...previous, { role: 'user', text: prompt }, { role: 'assistant', text: response.data }]); setQuestion('');
    } catch (e) { const data = (e as { response?: { data?: unknown } }).response?.data; setError(typeof data === 'string' && data.length < 250 ? data : 'The coach is unavailable. Your question is still here; please retry.'); }
    finally { setBusy(false); }
  }
  return <Screen><PixelLabel tone={bb.colors.violet}>NOVA · FINANCIAL COACH</PixelLabel><Text style={styles.title}>Ask. Plan. Save.</Text>
    <Text style={styles.body}>Nova uses your recent transactions and savings goals to suggest practical next steps.</Text>
    <PrimaryButton loading={busy} onPress={() => send('Create a practical savings plan for my goals with weekly and monthly contributions. Use my recorded finances and explain any missing information.')}>BUILD MY SAVINGS PLAN</PrimaryButton>
    <PrimaryButton loading={busy} onPress={() => send('Analyze my recent spending and give me a three-step action plan to improve my habits this week.')}>IMPROVE MY HABITS</PrimaryButton>
    {messages.map((m, i) => <Card key={i} accent={m.role === 'user' ? bb.colors.cyan : bb.colors.violet}><PixelLabel>{m.role === 'user' ? 'YOU' : 'NOVA'}</PixelLabel><Text selectable style={styles.body}>{m.text}</Text></Card>)}
    {error ? <StatePanel title="COACH CONNECTION" message={error} /> : null}
    <TextInput accessibilityLabel="Question for financial coach" multiline maxLength={2000} value={question} onChangeText={setQuestion} placeholder="How can I save more this month?" placeholderTextColor={bb.colors.muted} style={styles.input} />
    <PrimaryButton loading={busy} disabled={!question.trim()} onPress={() => send()}>ASK NOVA</PrimaryButton>
    <Text style={styles.body}>AI suggestions are estimates. Check them against your actual budget before acting.</Text>
  </Screen>;
}
const styles = StyleSheet.create({ title: { color: bb.colors.title, fontSize: 28, fontWeight: '900' }, body: { color: bb.colors.text, fontSize: 14, lineHeight: 21 }, input: { color: bb.colors.text, minHeight: 100, backgroundColor: bb.colors.raised, borderRadius: 12, borderWidth: 1, borderColor: bb.colors.border, padding: 14, textAlignVertical: 'top' } });
