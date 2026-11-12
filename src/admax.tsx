import {tr} from './workspace-tools';
import { useState } from 'react';
import './admax.css';

// A separate HTML document lets the supplied synchronous tag use document.write
// without replacing the React app or rerunning on state changes.
export function AdMax() {
  // Select one slot when mounted; resizing must not request another advert.
  const [source] = useState(() => window.matchMedia('(max-width: 767px)').matches
    ? '/ads/admax-mobile.html' : '/ads/admax.html');
  return <aside className="admax-placement" aria-label={tr("広告")}>
    <span className="admax-label">{tr("広告")}</span>
    <iframe title={tr("忍者AdMax 広告")} src={source} width="300" height="250"
      loading="lazy" referrerPolicy="strict-origin-when-cross-origin" />
  </aside>;
}
