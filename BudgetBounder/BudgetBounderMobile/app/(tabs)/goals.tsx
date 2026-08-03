import { useAuth } from '@/src/auth/AuthProvider';
import { Card, PixelLabel, Progress, Screen, StatePanel } from '@/src/components/BbUi';
import api from '@/src/services/api';
import { bb, formatIls } from '@/src/theme/tokens';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
type Goal={id:number;title:string;targetAmount:number;currentAmount:number;deadline:string;isCompleted:boolean};
export default function GoalsScreen(){
 const{user}=useAuth();const[items,setItems]=useState<Goal[]>([]);const[error,setError]=useState('');
 useEffect(()=>{if(user)api.get<Goal[]>(`/savinggoals/user/${user.id}`).then(r=>setItems(r.data)).catch(()=>setError('Savings goals could not be loaded.'))},[user]);
 const total=items.reduce((sum,g)=>sum+g.currentAmount,0);
 return <Screen><PixelLabel tone={bb.colors.cyan}>SAVINGS VAULTS</PixelLabel><Text style={s.title}>Goals</Text><Card accent={bb.colors.gold}><Text style={s.muted}>Total protected</Text><Text style={s.total}>{formatIls(total)}</Text><Text style={s.muted}>Saving progress earns XP only when healthy milestones are completed.</Text></Card>
 {error?<StatePanel title="VAULT ERROR" message={error}/>:null}{!error&&items.length===0?<StatePanel title="NO ACTIVE VAULTS" message="Create a goal from the full goal quest flow in the next product slice."/>:null}
 {items.map(g=><Card key={g.id} accent={g.isCompleted?bb.colors.emerald:undefined}><View style={s.row}><Text style={s.cardTitle}>{g.title}</Text><Text style={s.reward}>{g.isCompleted?'COMPLETE':new Date(g.deadline).toLocaleDateString('he-IL')}</Text></View><Text style={s.muted}>{formatIls(g.currentAmount)} of {formatIls(g.targetAmount)}</Text><Progress value={g.targetAmount?g.currentAmount/g.targetAmount:0} tone={g.isCompleted?bb.colors.emerald:bb.colors.cyan}/></Card>)}</Screen>
}
const s=StyleSheet.create({title:{color:bb.colors.text,fontSize:28,fontWeight:'800'},total:{color:bb.colors.gold,fontSize:34,fontWeight:'900'},muted:{color:bb.colors.muted,fontSize:13,lineHeight:19},row:{flexDirection:'row',justifyContent:'space-between',gap:10},cardTitle:{color:bb.colors.text,fontSize:17,fontWeight:'800',flex:1},reward:{color:bb.colors.gold,fontFamily:'monospace',fontSize:10}})
