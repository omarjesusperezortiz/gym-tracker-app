"""Mobile review page for the gym audit (docs/gym-audit.html).

One card per (slot, tab, exercise): current frames vs. proposed frames, an
"Approve fix" checkbox and a "Skip / unsure" toggle, kept in localStorage.
An export block at the bottom lists the approved rows to paste back to chat.
Frames are written as separate lazy-loaded JPEGs in docs/gym-audit-frames/.
"""
import html
import json
import os
import re
from collections import OrderedDict

from PIL import Image

FRAMES_DIR = "gym-audit-frames"
FRAME_POS = (0, 0.25, 0.5, 0.75)  # start, ¼, ½, ¾ of the animation
ID_RE = re.compile(r"([A-Za-z0-9]{7})$")
esc = html.escape


def write_frames(ids, media, out_dir):
    """<id>-<k>.jpg for k in 0..3, at the source size (480px). Skips existing files."""
    os.makedirs(out_dir, exist_ok=True)
    for i in ids:
        if all(os.path.exists(os.path.join(out_dir, f"{i}-{k}.jpg")) for k in range(len(FRAME_POS))):
            continue
        im = Image.open(os.path.join(media, f"{i}.webp"))
        n = getattr(im, "n_frames", 1)
        for k, pos in enumerate(FRAME_POS):
            im.seek(int(n * pos))
            im.convert("RGB").save(os.path.join(out_dir, f"{i}-{k}.jpg"), "JPEG", quality=70, optimize=True, progressive=True)


def proposed_id(code):
    """The EDB id an export code swaps in (plain id or MOVE-TO-BW:<id>), else None."""
    tail = code.split(":")[-1]
    return tail if ID_RE.fullmatch(tail) else None


def frames_html(srcs, label):
    btns = []
    for k, src in enumerate(srcs):
        btns.append(
            f'<button type="button" class="fr" data-cap="{esc(label)}" data-pos="frame {k + 1} of {len(srcs)}" aria-label="{esc(label)}, frame {k + 1} of {len(srcs)} — open full screen">'
            f'<img src="{esc(src)}" alt="" width="480" height="480" loading="lazy" decoding="async"></button>'
        )
    return f'<div class="frames">{"".join(btns)}</div>'


def build_review_page(rows, edb, action, fed, kind_label, root, media):
    docs = os.path.join(root, "docs")
    ids = {r["id"] for r in rows} | {i for i in (proposed_id(c) for c in action.values()) if i}
    write_frames(sorted(ids), media, os.path.join(docs, FRAMES_DIR))
    frame_srcs = lambda i: [f"{FRAMES_DIR}/{i}-{k}.jpg" for k in range(len(FRAME_POS))]

    groups = OrderedDict([("gym", OrderedDict()), ("other", OrderedDict())])
    for r in rows:
        groups["gym" if r["inGymTabs"] else "other"].setdefault(r["slot"], []).append(r)

    def card(r):
        code = "KEEP" if r["verdict"] == "MATCH" else action[r["n"]]
        tab = kind_label[r["kind"]]
        key = f"{r['slot']}|{r['kind']}|{r['id']}"
        cur_label = f"Current: {r['shown']}"
        cur = (
            f'<figure class="side cur"><figcaption><span class="lbl">Current</span>'
            f'<code>{r["id"]}</code> {esc(edb.get(r["id"], ""))} · {esc(r["equipment"])} · {esc(r["target"])}</figcaption>'
            f'{frames_html(frame_srcs(r["id"]), cur_label)}</figure>'
        )
        new = ""
        if r["verdict"] != "MATCH":
            pid = proposed_id(code)
            fed_name = code.split("FED:")[1] if "FED:" in code else None
            if pid:
                body = frames_html(frame_srcs(pid), f"Proposed: {edb.get(pid, pid)}")
                head = f'<code>{pid}</code> {esc(edb.get(pid, ""))}'
            elif fed_name:
                body = frames_html(fed[fed_name], f"Proposed: free-exercise-db {fed_name} photo")
                head = f"free-exercise-db “{esc(fed_name)}” photo <b class='warn'>⚠ last resort</b>"
            else:
                body = f'<div class="noimg">{esc(code.replace("-", " ").title())}</div>'
                head = ""
            new = (
                f'<figure class="side new"><figcaption><span class="lbl">Proposed</span>{head}</figcaption>{body}'
                f'<p class="cand">{esc(r["cand"])}</p></figure>'
            )
        export = f"{r['slot']}|{tab}|{r['id']}|{code}"
        approve_txt = "Approve (keep as is)" if r["verdict"] == "MATCH" else "Approve fix"
        checks = f'<span class="chk">checks {esc(r["checks"])}</span> ' if r["checks"] else ""
        prob = f'<p class="prob">{checks}{esc(r["problem"])}</p>' if r["problem"] else ""
        return f"""
<article class="row v-{r['verdict'].lower()}" data-key="{esc(key)}" data-v="{r['verdict']}" data-scope="{'gym' if r['inGymTabs'] else 'other'}" data-export="{esc(export)}">
  <div class="rhead"><span class="tab">{tab}</span><span class="meta">{r['role']} · {esc(r['where'])}</span><span class="badge">{r['verdict']}</span></div>
  <h3>{esc(r['shown'])}</h3>
  {prob}
  <div class="compare">{cur}{new}</div>
  <div class="actions">
    <label class="approve"><input type="checkbox" class="ck"><span class="box" aria-hidden="true"></span><span class="at">{approve_txt}<small>{esc(code)}</small></span></label>
    <button type="button" class="skip" aria-pressed="false">Skip / unsure</button>
  </div>
</article>"""

    titles = {"gym": "Gym tabs", "other": "Shared calisthenics / travel tabs"}
    notes = {
        "gym": "What the gym Train card and detail sheet show.",
        "other": "Other plans' tabs on the same shared slots — a gym fix can change these too.",
    }
    body = []
    for g, slots in groups.items():
        secs = "".join(
            f'<section class="slot"><h2>{esc(s)}</h2>{"".join(card(r) for r in rs)}</section>' for s, rs in slots.items()
        )
        body.append(f'<div class="group" data-group="{g}"><h2 class="gh">{titles[g]}</h2><p class="gn">{notes[g]}</p>{secs}</div>')

    page = PAGE.replace("{{BODY}}", "".join(body)).replace("{{TOTAL}}", str(len(rows)))
    with open(os.path.join(docs, "gym-audit.html"), "w") as f:
        f.write(page)


PAGE = """<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="color-scheme" content="dark"><meta name="theme-color" content="#141414">
<title>Gym Audit Review</title>
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 16 16%22%3E%3Crect width=%2216%22 height=%2216%22 rx=%223%22 fill=%22%235fd39a%22/%3E%3C/svg%3E">
<style>
:root{--bg:#141414;--card:#1e1e1e;--card2:#262626;--ink:#ededed;--mute:#9b9b9b;--line:#333;--ok:#5fd39a;--bad:#ff8a80;--unc:#f5b85c;
--okb:#16271e;--badb:#331816;--uncb:#30250f;--acc:#7cc4ff;--accb:#132433}
*{box-sizing:border-box}html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.45 -apple-system,system-ui,"Segoe UI",Roboto,sans-serif}
button{font:inherit;color:inherit}
.bar{position:sticky;top:0;z-index:5;background:rgba(20,20,20,.94);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);
border-bottom:1px solid var(--line);padding:calc(8px + env(safe-area-inset-top)) 16px 8px}
.bar-in{max-width:960px;margin:0 auto;display:grid;gap:6px}
.prog{display:flex;align-items:baseline;gap:8px}.prog b{font-size:17px;white-space:nowrap}.prog span{color:var(--mute);font-size:12px}
.meter{height:4px;background:var(--line);border-radius:4px;overflow:hidden}.meter i{display:block;height:100%;width:0;background:var(--ok);transition:width .2s}
.fl{display:flex;gap:6px;flex-wrap:wrap}
.pill{border:1px solid var(--line);background:var(--card);border-radius:999px;padding:6px 12px;font-size:13px;min-height:36px;cursor:pointer}
.pill[aria-pressed=true]{background:var(--ink);color:var(--bg);border-color:var(--ink)}
.seg{display:inline-flex;border:1px solid var(--line);border-radius:999px;overflow:hidden;background:var(--card)}
.seg button{border:0;background:transparent;padding:6px 10px;font-size:13px;min-height:36px;cursor:pointer}
.seg button+button{border-left:1px solid var(--line)}
.seg button[aria-pressed=true]{background:var(--ink);color:var(--bg)}
.exlink{margin-left:auto;color:var(--acc);font-size:14px;text-decoration:none;padding:4px 0}
.pill.cta{background:var(--accb);border-color:#2a4a66;color:var(--acc)}
main{max-width:960px;margin:0 auto;padding:12px 16px calc(40px + env(safe-area-inset-bottom))}
h1{font-size:22px;margin:6px 0 4px}.lead{color:var(--mute);margin:0 0 8px;font-size:14px}
.gh{font-size:13px;letter-spacing:.06em;text-transform:uppercase;color:var(--mute);margin:22px 0 2px}.gn{color:var(--mute);font-size:13px;margin:0 0 8px}
.slot>h2{font-size:18px;margin:16px 0 8px}
.row{background:var(--card);border:1px solid var(--line);border-left:4px solid var(--ok);border-radius:12px;padding:12px;margin:0 0 12px}
.row.v-mismatch{border-left-color:var(--bad)}.row.v-unclear{border-left-color:var(--unc)}
.row.done-a{box-shadow:inset 0 0 0 1px var(--ok)}.row.done-s{opacity:.7}
.rhead{display:flex;gap:8px;align-items:center;font-size:13px;color:var(--mute)}.tab{font-weight:700;color:var(--ink)}
.badge{margin-left:auto;font-weight:700;font-size:12px;padding:2px 9px;border-radius:999px;background:var(--okb);color:var(--ok)}
.v-mismatch .badge{background:var(--badb);color:var(--bad)}.v-unclear .badge{background:var(--uncb);color:var(--unc)}
h3{font-size:17px;margin:6px 0 4px}
.prob{margin:4px 0 10px;font-size:15px}.chk{font-size:11px;border:1px solid var(--line);border-radius:4px;padding:1px 5px;color:var(--mute);margin-right:4px;white-space:nowrap}
.compare{display:grid;gap:12px}
.side{margin:0;background:var(--card2);border-radius:10px;padding:8px}
.side figcaption{font-size:13px;color:var(--mute);margin:0 0 8px;word-break:break-word}
.side code{font:12px ui-monospace,Menlo,monospace;color:var(--ink)}
.lbl{display:inline-block;font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;margin-right:6px;color:var(--ink)}
.new .lbl{color:var(--acc)}.warn{color:var(--unc);font-weight:600}
.frames{display:grid;grid-template-columns:1fr 1fr;gap:6px}
.fr{padding:0;border:0;background:#fff;border-radius:8px;overflow:hidden;cursor:zoom-in;aspect-ratio:1/1}
.fr img{display:block;width:100%;height:100%;object-fit:cover}
.noimg{display:grid;place-items:center;min-height:120px;border:1px dashed var(--line);border-radius:8px;font-weight:700;color:var(--bad);text-align:center;padding:12px}
.cand{margin:8px 0 0;font-size:14px}
.actions{display:flex;gap:8px;margin-top:12px;align-items:stretch}
.approve{flex:1;display:flex;align-items:center;gap:12px;min-height:58px;padding:10px 12px;border-radius:10px;background:var(--card2);border:1px solid var(--line);cursor:pointer;position:relative}
.approve input{position:absolute;opacity:0;width:1px;height:1px}
.box{flex:none;width:30px;height:30px;border-radius:8px;border:2px solid var(--mute);display:grid;place-items:center}
.approve input:checked+.box{background:var(--ok);border-color:var(--ok)}
.approve input:checked+.box::after{content:"";width:9px;height:16px;border:solid #0b2116;border-width:0 3px 3px 0;transform:translateY(-2px) rotate(45deg)}
.approve input:focus-visible+.box{outline:2px solid var(--acc);outline-offset:2px}
.at{font-weight:700;display:grid}.at small{font:12px ui-monospace,Menlo,monospace;color:var(--mute);font-weight:400;word-break:break-all}
.skip{flex:none;border:1px solid var(--line);background:transparent;border-radius:10px;padding:0 12px;font-size:13px;color:var(--mute);min-width:84px;cursor:pointer}
.skip[aria-pressed=true]{background:var(--uncb);color:var(--unc);border-color:#5a4415}
#export{margin-top:28px;background:var(--card);border:1px solid var(--line);border-radius:12px;padding:14px}
#export h2{margin:0 0 6px;font-size:18px}
#exp{width:100%;min-height:220px;background:#0e0e0e;color:var(--ink);border:1px solid var(--line);border-radius:8px;padding:10px;font:12px/1.5 ui-monospace,Menlo,monospace;resize:vertical}
.exrow{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:10px}
.btn{border:0;background:var(--ok);color:#0b2116;font-weight:700;border-radius:10px;padding:12px 18px;min-height:48px;cursor:pointer}
.btn.ghost{background:transparent;color:var(--mute);border:1px solid var(--line);font-weight:500}
#copied{color:var(--ok);font-size:14px}
.empty{color:var(--mute);text-align:center;padding:24px}
.lb{position:fixed;inset:0;z-index:20;background:#000;display:grid;grid-template-rows:auto 1fr auto;touch-action:pan-y}
.lb[hidden]{display:none}
.lb-top{display:flex;align-items:center;gap:8px;padding:calc(10px + env(safe-area-inset-top)) 12px 8px;color:var(--ink);font-size:14px}
.lb-cap{flex:1;min-width:0}.lb-cap b{display:block;font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.lb-x{width:44px;height:44px;border-radius:999px;border:1px solid #444;background:#222;font-size:20px;cursor:pointer}
.lb-img{display:grid;place-items:center;overflow:hidden;padding:0 8px}
.lb-img img{max-width:100%;max-height:100%;background:#fff;border-radius:10px;object-fit:contain}
.lb-nav{display:flex;gap:10px;padding:10px 12px calc(14px + env(safe-area-inset-bottom))}
.lb-nav button{flex:1;min-height:52px;border-radius:12px;border:1px solid #444;background:#222;font-size:16px;cursor:pointer}
@media (min-width:720px){.compare{grid-template-columns:1fr 1fr}.frames{grid-template-columns:1fr 1fr}}
@media (prefers-reduced-motion:reduce){.meter i{transition:none}}
</style></head><body>
<header class="bar"><div class="bar-in">
  <div class="prog"><b id="pn">0 approved of 0</b><span id="ps"></span><a class="exlink" href="#export">Export ↓</a></div>
  <div class="meter" aria-hidden="true"><i id="pm"></i></div>
  <div class="fl">
    <span class="seg" role="group" aria-label="Scope"><button type="button" data-scope="gym" aria-pressed="true">Gym only</button><button type="button" data-scope="all" aria-pressed="false">All</button></span>
    <span class="seg" role="group" aria-label="Verdicts shown"><button type="button" data-verdict="MISMATCH" aria-pressed="true">Mismatch</button><button type="button" data-verdict="UNCLEAR" aria-pressed="true">Unclear</button><button type="button" data-verdict="MATCH" aria-pressed="true">Match</button></span>
  </div>
  <div class="fl">
    <button type="button" class="pill cta" id="selmm">Approve all MISMATCH</button>
    <button type="button" class="pill" id="hiderev" aria-pressed="false">Hide reviewed</button>
  </div>
</div></header>
<main>
<h1>Gym audit review</h1>
<p class="lead">{{TOTAL}} rows, gym tabs first. Tap a frame to view it full screen. Check <b>Approve fix</b> where you agree with the verdict and the proposed replacement. Your choices are saved on this phone, so you can stop and come back.</p>
{{BODY}}
<p class="empty" id="empty" hidden>No rows match these filters.</p>
<section id="export" aria-labelledby="exh">
  <h2 id="exh">Export</h2>
  <p class="lead">Approved rows as <code>slot|tab|current id|replacement</code>. Copy and paste this back into the chat.</p>
  <textarea id="exp" readonly spellcheck="false" aria-label="Export text"></textarea>
  <div class="exrow"><button type="button" class="btn" id="copy">Copy to clipboard</button><span id="copied" role="status"></span>
  <span style="flex:1"></span><button type="button" class="btn ghost" id="reset">Clear all choices</button></div>
</section>
</main>
<div class="lb" id="lb" hidden role="dialog" aria-modal="true" aria-label="Frame viewer">
  <div class="lb-top"><div class="lb-cap" id="lbcap"></div><button type="button" class="lb-x" id="lbx" aria-label="Close">✕</button></div>
  <div class="lb-img"><img id="lbimg" alt=""></div>
  <div class="lb-nav"><button type="button" id="lbp">‹ Prev</button><button type="button" id="lbn">Next ›</button></div>
</div>
<script>
(function(){
var KEY='gymAudit.review.v1', FKEY='gymAudit.filters.v1';
function load(k,d){try{var v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}}
function save(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
var state=load(KEY,{}), f=load(FKEY,{scope:'gym',v:{MISMATCH:1,UNCLEAR:1,MATCH:1},hide:0});
var rows=[].slice.call(document.querySelectorAll('.row'));
function $(s){return document.querySelector(s)}

function paint(row){
  var s=state[row.dataset.key];
  row.querySelector('.ck').checked=s==='a';
  row.querySelector('.skip').setAttribute('aria-pressed',s==='s');
  row.classList.toggle('done-a',s==='a');row.classList.toggle('done-s',s==='s');
}
function inScope(r){return f.scope==='all'||r.dataset.scope==='gym'}
function apply(){
  var any=false;
  rows.forEach(function(r){var vis=inScope(r)&&f.v[r.dataset.v]&&!(f.hide&&state[r.dataset.key]);r.hidden=!vis;any=any||vis});
  [].forEach.call(document.querySelectorAll('.slot'),function(s){s.hidden=!s.querySelector('.row:not([hidden])')});
  [].forEach.call(document.querySelectorAll('.group'),function(g){g.hidden=!g.querySelector('.row:not([hidden])')});
  $('#empty').hidden=any;
  [].forEach.call(document.querySelectorAll('[data-scope]'),function(b){if(b.tagName==='BUTTON')b.setAttribute('aria-pressed',b.dataset.scope===f.scope)});
  [].forEach.call(document.querySelectorAll('[data-verdict]'),function(b){b.setAttribute('aria-pressed',!!f.v[b.dataset.verdict])});
  $('#hiderev').setAttribute('aria-pressed',!!f.hide);
  progress();save(FKEY,f);
}
function progress(){
  var sc=rows.filter(inScope), a=sc.filter(function(r){return state[r.dataset.key]==='a'}).length,
      s=sc.filter(function(r){return state[r.dataset.key]==='s'}).length,
      mm=sc.filter(function(r){return r.dataset.v==='MISMATCH'}),
      mma=mm.filter(function(r){return state[r.dataset.key]==='a'}).length;
  $('#pn').textContent=a+' approved of '+sc.length;
  $('#ps').textContent=s+' skipped · '+(sc.length-a-s)+' left';
  $('#pm').style.width=(sc.length?(a+s)/sc.length*100:0)+'%';
  $('#selmm').textContent=(mm.length&&mma===mm.length?'Unapprove all MISMATCH':'Approve all MISMATCH')+' ('+mm.length+')';
  exportText();
}
function set(row,val){var k=row.dataset.key;if(val)state[k]=val;else delete state[k];save(KEY,state);paint(row)}
rows.forEach(function(r){
  paint(r);
  r.querySelector('.ck').addEventListener('change',function(e){set(r,e.target.checked?'a':null);progress()});
  r.querySelector('.skip').addEventListener('click',function(){set(r,state[r.dataset.key]==='s'?null:'s');progress()});
});
[].forEach.call(document.querySelectorAll('button[data-scope]'),function(b){b.onclick=function(){f.scope=b.dataset.scope;apply()}});
[].forEach.call(document.querySelectorAll('[data-verdict]'),function(b){b.onclick=function(){var v=b.dataset.verdict;if(f.v[v])delete f.v[v];else f.v[v]=1;apply()}});
$('#hiderev').onclick=function(){f.hide=f.hide?0:1;apply()};
$('#selmm').onclick=function(){
  var mm=rows.filter(function(r){return inScope(r)&&r.dataset.v==='MISMATCH'});
  var all=mm.every(function(r){return state[r.dataset.key]==='a'});
  mm.forEach(function(r){set(r,all?null:'a')});apply();
};
var resetArmed=false;
$('#reset').onclick=function(){
  var b=this;
  if(!resetArmed){resetArmed=true;b.textContent='Tap again to clear everything';setTimeout(function(){resetArmed=false;b.textContent='Clear all choices'},4000);return}
  state={};save(KEY,state);rows.forEach(paint);resetArmed=false;b.textContent='Clear all choices';apply();
};

function exportText(){
  var ap=[],keep=0,sk=[];
  rows.forEach(function(r){var s=state[r.dataset.key];
    if(s==='a'){if(r.dataset.v==='MATCH')keep++;else ap.push(r.dataset.export)}
    else if(s==='s')sk.push(r.dataset.export.split('|').slice(0,3).join('|'))});
  var out=['GYM AUDIT REVIEW','APPROVED FIXES ('+ap.length+') — slot|tab|current|replacement'].concat(ap);
  out.push('','CONFIRMED MATCH (keep as is): '+keep+' rows');
  out.push('','SKIPPED / UNSURE ('+sk.length+') — slot|tab|current');out=out.concat(sk);
  $('#exp').value=out.join('\\n');
}
$('#copy').onclick=function(){
  var t=$('#exp'),msg=$('#copied');
  function done(ok){msg.textContent=ok?'Copied ✓':'Copy failed — the text is selected, copy it manually';setTimeout(function(){msg.textContent=''},3500)}
  function fallback(){t.removeAttribute('readonly');t.focus();t.setSelectionRange(0,t.value.length);var ok=false;try{ok=document.execCommand('copy')}catch(e){}t.setAttribute('readonly','');done(ok)}
  if(navigator.clipboard&&window.isSecureContext){navigator.clipboard.writeText(t.value).then(function(){done(true)},fallback)}else fallback();
};

// Lightbox: every frame of the tapped row (current, then proposed); swipe, arrows or keys.
var lb=$('#lb'),lbimg=$('#lbimg'),cap=$('#lbcap'),list=[],idx=0,opener=null,title='';
function show(){var b=list[idx];lbimg.src=b.querySelector('img').src;lbimg.alt=b.dataset.cap+', '+b.dataset.pos;
  cap.innerHTML='';var t=document.createElement('b');t.textContent=b.dataset.cap;cap.appendChild(t);
  cap.appendChild(document.createTextNode(title+' · '+b.dataset.pos+' · swipe for more'))}
function open(btn){var row=btn.closest('.row');list=[].slice.call(row.querySelectorAll('.fr'));idx=list.indexOf(btn);
  title=row.querySelector('h3').textContent;opener=btn;lb.hidden=false;document.body.style.overflow='hidden';show();$('#lbx').focus()}
function close(){lb.hidden=true;document.body.style.overflow='';lbimg.removeAttribute('src');if(opener)opener.focus()}
function step(d){idx=(idx+d+list.length)%list.length;show()}
document.addEventListener('click',function(e){var b=e.target.closest('.fr');if(b)open(b)});
$('#lbx').onclick=close;$('#lbp').onclick=function(){step(-1)};$('#lbn').onclick=function(){step(1)};
lb.addEventListener('click',function(e){if(e.target===lb||e.target.classList.contains('lb-img'))close()});
document.addEventListener('keydown',function(e){if(lb.hidden)return;if(e.key==='Escape')close();if(e.key==='ArrowRight')step(1);if(e.key==='ArrowLeft')step(-1)});
var x0=null;lb.addEventListener('touchstart',function(e){x0=e.touches[0].clientX},{passive:true});
lb.addEventListener('touchend',function(e){if(x0===null)return;var dx=e.changedTouches[0].clientX-x0;if(Math.abs(dx)>40)step(dx<0?1:-1);x0=null});

apply();
})();
</script></body></html>"""
