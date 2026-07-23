import { useAuth } from '@/src/auth/AuthProvider';
import { Card, PixelLabel, Progress, Screen, StatePanel } from '@/src/components/BbUi';
import api from '@/src/services/api';
import { bb } from '@/src/theme/tokens';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
type Mission={id:number;title:string;description:string;difficulty:string;xpReward:number;currentProgress:number;targetValue:number;isAiGenerated:boolean;expiresAt:string};
export default function MissionsScreen(){
 const{user}=useAuth();const[items,setItems]=useState<Mission[]>([]);const[error,setError]=useState('');
 useEffect(()=>{if(user)api.get<Mission[]>(`/missions/user/${user.id}`).then(r=>setItems(r.data)).catch(()=>setError('Mission board could not be loaded.'))},[user]);
 return <Screen><PixelLabel tone={bb.colors.gold}>QUEST BOARD</PixelLabel><Text style={s.title}>Missions</Text><Text style={s.muted}>Rewards reinforce logging, saving, planning and learning—not spending.</Text>
 {error?<StatePanel title="MISSION LINK ERROR" message={error}/>:null}{!error&&items.length===0?<StatePanel title="BOARD CLEAR" message="No active missions. Personalized quests will appear after more financial activity."/>:null}
 {items.map(m=><Card key={m.id} accent={m.isAiGenerated?bb.colors.violet:bb.colors.gold}><View style={s.row}><PixelLabel tone={m.isAiGenerated?bb.colors.violet:bb.colors.gold}>{m.isAiGenerated?'NOVA PERSONALIZED':m.difficulty}</PixelLabel><Text style={s.xp}>+{m.xpReward} XP</Text></View><Text style={s.cardTitle}>{m.title}</Text><Text style={s.muted}>{m.description}</Text><Progress value={m.targetValue?m.currentProgress/m.targetValue:0} tone={m.isAiGenerated?bb.colors.violet:bb.colors.gold}/><Text style={s.meta}>{m.currentProgress} / {m.targetValue} · expires {new Date(m.expiresAt).toLocaleDateString('he-IL')}</Text></Card>)}</Screen>
}
const s=StyleSheet.create({title:{color:bb.colors.text,fontSize:28,fontWeight:'800'},muted:{color:bb.colors.muted,fontSize:13,lineHeight:20},row:{flexDirection:'row',justifyContent:'space-between',gap:10},xp:{color:bb.colors.gold,fontWeight:'800'},cardTitle:{color:bb.colors.text,fontSize:18,fontWeight:'800'},meta:{color:bb.colors.muted,fontFamily:'monospace',fontSize:10}})
