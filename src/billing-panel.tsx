import {tr} from './workspace-tools';
import {useEffect,useState} from 'react';
type Config={available:boolean;environment:string;monthlyTotal:number;termsVersion:string};
type Status={authenticated:boolean;csrf:string;pro:boolean;outstanding:boolean;held:boolean;paidThrough:number;cancelAtPeriodEnd:boolean};
const messages:Record<string,string>={
 login_required:'ログインし直してください。',try_later:'少し時間をおいて、もう一度お試しください。',
 existing_contract_use_portal:'すでに契約があります。「契約・支払方法を管理」から確認してください。',
 checkout_pending_or_complete:'決済の処理中、または完了済みです。「契約状態を更新」で確認してください。',
 contract_review_required:'契約の確認が必要です。お問い合わせ先へご連絡ください。',
 terms_required:'利用条件を確認してチェックしてください。',
 service_unavailable:'契約情報を取得できませんでした。時間をおいて再度お試しください。'
};
async function request(path:string,csrf?:string,body?:unknown){
 const res=await fetch(path,{method:csrf?'POST':'GET',credentials:'same-origin',cache:'no-store',
  headers:csrf?{'Content-Type':'application/json','X-CSRF-Token':csrf}:undefined,
  body:csrf?JSON.stringify(body??{}):undefined,signal:AbortSignal.timeout(20000)});
 if(!res.headers.get('content-type')?.includes('application/json'))throw Error('billing_not_configured');
 const data=await res.json();
 if(!res.ok)throw Error(data.error||'service_unavailable');
 return data;
}
export function BillingPanel(){
 const [config,setConfig]=useState<Config>(),[status,setStatus]=useState<Status>(),[busy,setBusy]=useState(false),[error,setError]=useState(''),[accepted,setAccepted]=useState(false);
 async function refresh(){
  setBusy(true);setError('');
  try{const c:Config=await request('/api/billing/config');setConfig(c);
   if(c.available){try{setStatus(await request('/api/billing/status'))}catch(e){if(e instanceof Error&&e.message==='login_required')setStatus(undefined);else throw e;}}
  }catch(e){const code=e instanceof Error?e.message:'';if(code==='billing_not_configured')setConfig({available:false,environment:'disabled',monthlyTotal:500,termsVersion:''});else setError(messages[code]??'接続を確認して再度お試しください。');}
  finally{setBusy(false)}
 }
 useEffect(()=>{void refresh()},[]);
 async function action(kind:'checkout'|'portal'|'logout'){
  if(!status||busy)return;setBusy(true);setError('');
  try{const data=await request(kind==='logout'?'/api/auth/logout':'/api/billing/'+kind,status.csrf,kind==='checkout'?{accepted,termsVersion:config?.termsVersion}:undefined);
   if(kind==='logout'){setStatus(undefined);setAccepted(false);return;}
   const target=new URL(data.url);if(target.protocol!=='https:'||target.hostname!==(kind==='checkout'?'checkout.stripe.com':'billing.stripe.com'))throw Error('invalid_redirect');
   location.assign(target.href);
  }catch(e){setError(messages[e instanceof Error?e.message:'']??'処理を完了できませんでした。もう一度お試しください。')}
  finally{setBusy(false)}
 }
 return <section className="panel billing-panel" aria-labelledby="billing-heading"><h2 id="billing-heading">{tr("プラン・契約管理")}</h2>
 {!config&&<p>{busy?tr("契約サービスを確認しています…"):tr("契約サービスに接続できませんでした。")}</p>}
 {config&&!config.available&&<p>{tr("月額総額500円のCoach Proは準備中です。現在は料金が発生せず、端末内の機能を利用できます。")}</p>}
 {config?.available&&<><p className="billing-test-notice" role="status">{tr("決済テスト環境です。実際の請求は発生しません。テスト用の支払情報を使用してください。")}</p>
 <p><strong>{tr("Coach Pro　月額総額500円")}</strong>{tr("· 毎月自動更新 · 税の上乗せなし")}</p>
 <p>{tr("解約後は支払済み期間の終了まで利用可能です。途中解約の日割り返金は原則ありません。最低継続月数・解約違約金はありません。")}</p>
 {!status?<form action="/api/auth/start" method="post"><p>{tr("契約を管理するためにログインします。映像や分析データは端末内に保存され、ログインしても端末間で同期されません。")}</p><button className="button primary" disabled={busy}>{tr("ログインして契約を確認")}</button></form>:<>
 <p>{status.held?tr("契約の確認中です。お問い合わせください。"):status.pro?tr("Coach Proを利用できます。"):status.outstanding?tr("お支払い・契約状態を確認してください。"):tr("有料契約はありません。")}
 {status.paidThrough>0&&<>{tr("利用期間の終了：")}{new Date(status.paidThrough*1000).toLocaleString()}。{status.cancelAtPeriodEnd?tr("次回更新は停止されています。"):''}</>}</p>
 {!status.outstanding&&!status.held&&<><label className="billing-consent"><input type="checkbox" checked={accepted} onChange={e=>setAccepted(e.target.checked)} disabled={busy}/><span><a href="/legal/terms.html" target="_blank" rel="noopener noreferrer">{tr("利用規約")}</a>{tr("・")}<a href="/legal/privacy.html" target="_blank" rel="noopener noreferrer">{tr("プライバシーポリシー")}</a>{tr("・")}<a href="/legal/commercial-disclosure.html" target="_blank" rel="noopener noreferrer">{tr("特商法表記")}</a>{tr("と、月額500円の自動更新・解約条件を確認しました。")}</span></label><button className="button primary" disabled={busy||!accepted} onClick={()=>void action('checkout')}>{tr("月額500円のテスト決済へ")}</button></>}
 <div className="actions"><button className="button" disabled={busy||(!status.outstanding&&!status.paidThrough)} onClick={()=>void action('portal')}>{tr("契約・支払方法を管理")}</button><button className="button" disabled={busy} onClick={()=>void action('logout')}>{tr("ログアウト")}</button></div>
 <p>{tr("ログアウトや端末データの削除では契約は解約されません。解約は契約管理画面から行ってください。")}</p>
 </>}</>}
 {error&&<p role="alert">{error}</p>}
 {(!config||config.available)&&<button className="button" disabled={busy} onClick={()=>void refresh()}>{tr("契約状態を更新")}</button>}
 </section>
}
