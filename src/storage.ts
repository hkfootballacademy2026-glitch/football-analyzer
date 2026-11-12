import Dexie, { type Table } from 'dexie';
import { emptyState, validate, type State } from './domain';
class Store extends Dexie { snapshots!:Table<{id:string;data:State}>;constructor(){super('football-analyzer-v1');this.version(1).stores({snapshots:'id'});}}
const db=new Store();
const generation=localStorage.getItem('fa-data-generation');
export async function load(){const saved=await db.snapshots.get('main');return saved?validate(saved.data):emptyState();}
export async function save(data:State){await db.transaction('rw',db.snapshots,async()=>{if(localStorage.getItem('fa-data-generation')!==generation)throw Error('別の画面で初期化されました。再読み込みしてください。');await db.snapshots.put({id:'main',data:validate(data)});});}

export async function resetStoredState(){await db.transaction('rw',db.snapshots,async()=>{localStorage.setItem('fa-data-generation',crypto.randomUUID());await db.snapshots.clear();for(const key of Object.keys(localStorage))if(key.startsWith('fa-movement-'))localStorage.removeItem(key);});}
