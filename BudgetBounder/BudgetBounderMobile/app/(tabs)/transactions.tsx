import { useAuth } from '@/src/auth/AuthProvider';
import { Card, PixelLabel, PrimaryButton, Screen, StatePanel } from '@/src/components/BbUi';
import api from '@/src/services/api';
import { bb, formatIls } from '@/src/theme/tokens';
import type { Transaction } from '@/src/types/api';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function TransactionsScreen() {
  const { user } = useAuth();
  const [items, setItems] = useState<Transaction[]>([]);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!user) return;
    api.get<Transaction[]>(`/transactions/user/${user.id}`)
      .then(response => setItems(response.data.sort((a,b) => b.date.localeCompare(a.date))))
      .catch(() => setError('Activity could not be loaded.'));
  }, [user]);
  return <Screen>
    <View style={styles.header}><View style={styles.flex}><PixelLabel tone={bb.colors.cyan}>FINANCE LOG</PixelLabel><Text style={styles.title}>Activity</Text><Text style={styles.muted}>Every entry strengthens your financial map.</Text></View><PrimaryButton onPress={() => router.push('/modal')}>+ ADD</PrimaryButton></View>
    {error ? <StatePanel title="ACTIVITY ERROR" message={error} /> : null}
    {!error && items.length === 0 ? <StatePanel title="NO TRANSACTIONS" message="Log your first expense or income to begin." action={<PrimaryButton onPress={() => router.push('/modal')}>ADD FIRST ENTRY</PrimaryButton>} /> : null}
    {items.map(item => <Card key={item.id}><View style={styles.row}><View style={[styles.icon,{borderColor:item.type === 'Income' ? bb.colors.emerald : bb.colors.coral}]}><Text>{item.category.slice(0,1).toUpperCase()}</Text></View><View style={styles.flex}><Text style={styles.cardTitle}>{item.title}</Text><Text style={styles.muted}>{item.category} · {new Date(item.date).toLocaleDateString('he-IL')}</Text></View><Text style={[styles.amount,{color:item.type === 'Income' ? bb.colors.emerald : bb.colors.text}]}>{item.type === 'Income' ? '+' : '−'}{formatIls(item.amount)}</Text></View></Card>)}
  </Screen>;
}
const styles=StyleSheet.create({header:{flexDirection:'row',gap:12,alignItems:'center'},flex:{flex:1,gap:5},title:{color:bb.colors.text,fontSize:28,fontWeight:'800'},muted:{color:bb.colors.muted,fontSize:13,lineHeight:19},row:{flexDirection:'row',alignItems:'center',gap:12},icon:{width:40,height:40,borderRadius:12,borderWidth:1,backgroundColor:bb.colors.raised,alignItems:'center',justifyContent:'center'},cardTitle:{color:bb.colors.text,fontWeight:'700',fontSize:16},amount:{fontWeight:'800',fontSize:14}})
