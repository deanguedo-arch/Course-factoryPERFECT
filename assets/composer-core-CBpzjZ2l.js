function e(e){return String(e??``).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#39;`)}function t(e){let t=String(e||``).trim();return t?/^https?:\/\//i.test(t)||t.startsWith(`/`)?t:/^materials\//i.test(t)?`/${t}`:``:``}function n(t){return e(t||``).replace(/\n/g,`<br>`)}function r({bodyHtml:t=``,title:n=``,subtitle:r=``,footerHtml:i=``,tone:a=``,elevated:o=!0,flat:s=!1,attrs:c=``}={}){let l=[`cf-card`];return s?l.push(`cf-card--flat`):o&&l.push(`cf-card--elevated`),a&&l.push(a),`
    <article class="${l.join(` `)}" ${c}>
      ${n?`<h3 class="text-lg font-bold">${e(n)}</h3>`:``}
      ${r?`<p class="text-sm cf-muted mt-2">${e(r)}</p>`:``}
      ${t||``}
      ${i||``}
    </article>
  `}function i(e){let t=String(e||``);return t.trim()?t.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi,``).replace(/\son[a-z]+\s*=\s*(['"]).*?\1/gi,``).replace(/\shref\s*=\s*(['"])\s*javascript:.*?\1/gi,` href="#"`):``}function a(e){let t=String(e||``).trim();return t&&/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(t)?t:``}var o=`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=Roboto:wght@400;700;900&family=Open+Sans:wght@400;700;800&family=Lato:wght@400;700;900&family=Montserrat:wght@400;700;900&family=Poppins:wght@400;700;900&family=Raleway:wght@400;700;900&family=Nunito:wght@400;700;900&family=Playfair+Display:wght@400;700;900&family=Merriweather:wght@400;700;900&family=Oswald:wght@400;700&family=Bebas+Neue&display=swap');`;function s(e){return String(e||``).replace(/<\/script/gi,`<\\/script`)}function c(e){try{return encodeURIComponent(JSON.stringify(e))}catch{return``}}var l=2,u=5;function d(e,t=3){let n=Number.parseInt(e,10),r=Number.isFinite(n)?n:Number.parseInt(t,10),i=Number.isFinite(r)?r:3;return Math.max(l,Math.min(u,i))}function f(e,t=0){let n=Number.parseFloat(e);return Number.isFinite(n)?Math.round(n*100)/100:t}function p(e){return Number.isInteger(e)?String(e):String(Math.round(e*100)/100)}function m(e=3){let t=d(e,3),n={2:[{label:`Strong`,score:2},{label:`Needs Work`,score:1}],3:[{label:`Exceeds`,score:3},{label:`Meets`,score:2},{label:`Developing`,score:1}],4:[{label:`Exemplary`,score:4},{label:`Proficient`,score:3},{label:`Developing`,score:2},{label:`Beginning`,score:1}],5:[{label:`Mastery`,score:5},{label:`Advanced`,score:4},{label:`Proficient`,score:3},{label:`Developing`,score:2},{label:`Beginning`,score:1}]};return(n[t]||n[3]).map(e=>({...e}))}function h(e=3){let t=d(e,3);return Array.from({length:t},(e,t)=>({label:`Criterion ${t+1}`}))}function g(e,t){return e.map(e=>t.map(t=>`Describe "${t.label}" for ${e.label.toLowerCase()}.`))}function _(e){let t=String(e||``).trim().toLowerCase();return t===`textarea`||t===`number`?t:`text`}function v(e,t=null){let n=String(e||``).trim().toLowerCase();return n===`rich`?`rich`:n===`plain`?`plain`:t&&String(t?.helperHtml||t?.promptHtml||``).trim()?`rich`:`plain`}function y(e,t){return!!(e&&typeof e==`object`&&Object.prototype.hasOwnProperty.call(e,t))}function b(e){return String(e||``).trim().toLowerCase()===`title`?`title`:`field`}function x(e=`field`){return b(e)===`title`?{kind:`title`,title:`Section Title`,showContent:!1,content:``}:{kind:`field`,label:`Field Label`,fieldType:`text`,placeholder:``,helperMode:`plain`,helperText:``,helperHtml:``}}function S(e){let t=y(e,`title`)?e.title:e?.text,n=y(e,`content`)?e.content:e?.instructions,r=t==null?``:String(t),i=n==null?``:String(n);return{kind:`title`,title:r,showContent:!!(e?.showContent===!0||i&&e?.showContent!==!1),content:i}}function C(e){let t=e?.label==null?``:String(e.label),n=e?.placeholder==null?``:String(e.placeholder),r=e?.fieldType||e?.inputType||(e?.type===`field`?``:e?.type),a=Object.prototype.hasOwnProperty.call(e||{},`helperText`)?e?.helperText:e?.prompt,o=Object.prototype.hasOwnProperty.call(e||{},`helperHtml`)?e?.helperHtml:e?.promptHtml,s=a==null?``:String(a),c=i(o==null?``:String(o)),l=v(e?.helperMode,e);return{kind:`field`,label:t,fieldType:_(r),placeholder:n,helperMode:l,helperText:s,helperHtml:c}}var w=1,ee=8;function te(e,t=2){let n=Number.parseInt(e,10),r=Number.isFinite(n)?n:Number.parseInt(t,10),i=Number.isFinite(r)?r:2;return Math.max(w,Math.min(ee,i))}function ne(e){if(e&&typeof e==`object`&&!Array.isArray(e))return{label:e.label==null?``:String(e.label),editable:e.editable!==!1,placeholder:e.placeholder==null?``:String(e.placeholder)};let t=e==null?``:String(e);return t.trim()?{label:t,editable:!1,placeholder:``}:{label:``,editable:!0,placeholder:`Type your response...`}}function re(e={}){let t=te(e.rowCount,Array.isArray(e.rows)?e.rows.length:2),n=te(e.colCount,Array.isArray(e.columns)?e.columns.length:2),r=e?.showRowLabels!==!1,i=Object.prototype.hasOwnProperty.call(e||{},`rowLabelHeader`)?String(e?.rowLabelHeader??``):`Rows`,a=Array.from({length:t},(t,n)=>{let r=Array.isArray(e.rows)?e.rows[n]:null,i=`Row ${n+1}`,a=!!(r&&typeof r==`object`&&Object.prototype.hasOwnProperty.call(r,`label`));return{id:String(r?.id||`row-${n+1}`),label:a?String(r?.label??``):i}}),o=Array.from({length:n},(t,n)=>{let r=Array.isArray(e.columns)?e.columns[n]:null,i=`Column ${n+1}`,a=!!(r&&typeof r==`object`&&Object.prototype.hasOwnProperty.call(r,`label`));return{id:String(r?.id||`col-${n+1}`),label:a?String(r?.label??``):i}});return{rowCount:t,colCount:n,showRowLabels:r,rowLabelHeader:i,rows:a,columns:o,cells:a.map((t,n)=>o.map((t,r)=>ne(Array.isArray(e.cells)&&Array.isArray(e.cells[n])?e.cells[n][r]:null)))}}function ie(e={}){let t=y(e,`blocks`),n=Array.isArray(e.blocks)?e.blocks:[];if(t)return n.map((e,t)=>b(e?.kind||e?.blockType||e?.type||`field`)===`title`?S(e,t):C(e,t));let r=[],i=String(e.title||``).trim();return i&&r.push(S({title:i,showContent:!1,content:``},0)),(Array.isArray(e.fields)?e.fields:[]).forEach((e,t)=>{r.push(C(e,t))}),r}function ae(e){let t=String(e||``).trim().toLowerCase();return t===`short_answer`||t===`short-answer`||t===`short`?`short_answer`:`multiple_choice`}function oe(e,{ensureMinimum:t=!1}={}){let n=(Array.isArray(e)?e:[]).map(e=>e==null?``:String(e));if(!t)return n;let r=n.map(e=>e.trim()).filter(Boolean);return r.length>=2?r:r.length===1?[r[0],`Option B`]:[`Option A`,`Option B`]}function se(e=`multiple_choice`){return ae(e)===`short_answer`?{type:`short_answer`,prompt:`Add a short-answer prompt.`,placeholder:`Write your response...`}:{type:`multiple_choice`,prompt:`Add your question prompt here.`,options:[`Option A`,`Option B`,`Option C`],correctIndex:0}}function ce(e={}){if(ae(e?.type||e?.kind)===`short_answer`)return{type:`short_answer`,prompt:e?.prompt==null?``:String(e.prompt),placeholder:e?.placeholder==null?``:String(e.placeholder)};let t=oe(e?.options),n=Number.parseInt(e?.correctIndex,10),r=Math.max(t.length-1,0),i=Number.isFinite(n)?Math.max(0,Math.min(n,r)):0;return{type:`multiple_choice`,prompt:e?.prompt==null?``:String(e.prompt),options:t,correctIndex:i}}function le(e={}){let t=y(e,`questions`),n=Array.isArray(e.questions)?e.questions:[];if(t)return n.map((e,t)=>ce(e,t));let r=[],i=String(e.prompt||``).trim(),a=Array.isArray(e.options)?e.options:[];(i||a.some(e=>String(e||``).trim())||!String(e.shortAnswerPrompt||``).trim())&&r.push(ce({type:`multiple_choice`,prompt:e.prompt,options:e.options,correctIndex:e.correctIndex},0));let o=String(e.shortAnswerPrompt||``).trim();return o&&r.push(ce({type:`short_answer`,prompt:o,placeholder:e.shortAnswerPlaceholder},r.length)),r.length||r.push(se(`multiple_choice`)),r}const ue={content_block:{type:`content_block`,label:`Content Block`,createDefaultData(){return{title:`New Section`,body:`Write your lesson content here.`,bodyMode:`rich`,bodyHtml:`<p>Write your lesson content here.</p>`,blockContainerBg:``,bodyContainerBg:``}},compileToHtml({data:t={}}={}){let s=i(t.bodyHtml||``),c=t.bodyMode===`plain`||!s?n(t.body):s,l=a(t.bodyContainerBg||t.blockContainerBg||t.containerBg),u=l?` style="background:${e(l)};"`:``,d=`
        <style>
          ${o}
          .cf-rich-content p { margin: 0.6rem 0; }
          .cf-rich-content ul { list-style: disc; padding-left: 1.5rem; margin: 0.75rem 0; }
          .cf-rich-content ol { list-style: decimal; padding-left: 1.5rem; margin: 0.75rem 0; }
          .cf-rich-content li { margin: 0.35rem 0; }
          .cf-rich-content h1 { font-size: 1.875rem; line-height: 2.25rem; font-weight: 700; margin: 1rem 0 0.5rem; }
          .cf-rich-content h2 { font-size: 1.5rem; line-height: 2rem; font-weight: 700; margin: 0.9rem 0 0.45rem; }
          .cf-rich-content h3 { font-size: 1.25rem; line-height: 1.75rem; font-weight: 700; margin: 0.8rem 0 0.4rem; }
          .cf-rich-content a { text-decoration: underline; }
          .cf-rich-content blockquote { border-left: 3px solid color-mix(in srgb, var(--cf-border) 70%, var(--cf-accent) 30%); margin: 0.9rem 0; padding-left: 0.8rem; opacity: 0.95; }
          .cf-rich-content div { margin: 0.45rem 0; }
          .cf-rich-content font[size='1'] { font-size: 0.75rem; }
          .cf-rich-content font[size='2'] { font-size: 0.875rem; }
          .cf-rich-content font[size='3'] { font-size: 1rem; }
          .cf-rich-content font[size='4'] { font-size: 1.125rem; }
          .cf-rich-content font[size='5'] { font-size: 1.25rem; }
          .cf-rich-content font[size='6'] { font-size: 1.5rem; }
          .cf-rich-content font[size='7'] { font-size: 1.875rem; }
        </style>
      `;return r({title:t.title||``,attrs:u,bodyHtml:`${d}<div class="leading-relaxed cf-rich-content">${c}</div>`})}},title_block:{type:`title_block`,label:`Title Block`,createDefaultData(){return{text:`Module Title`,textMode:`rich`,textHtml:`<h2>Module Title</h2>`,align:`left`,blockContainerBg:``,bodyContainerBg:``}},compileToHtml({data:t={}}={}){let s=i(t.textHtml||``),c=t.textMode===`plain`||!s?n(t.text||``):s,l=String(t.align||`left`).toLowerCase(),u=l===`center`?`text-center`:l===`right`?`text-right`:`text-left`,d=a(t.bodyContainerBg||t.blockContainerBg||t.containerBg),f=d?` style="background:${e(d)};"`:``,p=`
        <style>
          ${o}
          .cf-title-content p { margin: 0.45rem 0; }
          .cf-title-content h1 { font-size: 2.5rem; line-height: 1.1; font-weight: 900; margin: 0.4rem 0; }
          .cf-title-content h2 { font-size: 2rem; line-height: 1.15; font-weight: 850; margin: 0.35rem 0; }
          .cf-title-content h3 { font-size: 1.5rem; line-height: 1.2; font-weight: 800; margin: 0.3rem 0; }
          .cf-title-content h4 { font-size: 1.25rem; line-height: 1.25; font-weight: 750; margin: 0.3rem 0; }
          .cf-title-content ul { list-style: disc; padding-left: 1.5rem; margin: 0.65rem 0; }
          .cf-title-content ol { list-style: decimal; padding-left: 1.5rem; margin: 0.65rem 0; }
          .cf-title-content li { margin: 0.2rem 0; }
          .cf-title-content a { text-decoration: underline; }
          .cf-title-content blockquote { border-left: 3px solid color-mix(in srgb, var(--cf-accent2) 65%, var(--cf-border) 35%); margin: 0.75rem 0; padding-left: 0.8rem; opacity: 0.95; }
          .cf-title-content font[size='1'] { font-size: 0.75rem; }
          .cf-title-content font[size='2'] { font-size: 0.875rem; }
          .cf-title-content font[size='3'] { font-size: 1rem; }
          .cf-title-content font[size='4'] { font-size: 1.125rem; }
          .cf-title-content font[size='5'] { font-size: 1.25rem; }
          .cf-title-content font[size='6'] { font-size: 1.5rem; }
          .cf-title-content font[size='7'] { font-size: 1.875rem; }
        </style>
      `;return r({attrs:`data-title-block ${f}`.trim(),bodyHtml:`${p}<div class="cf-title-content leading-tight ${u}">${c}</div>`})}},spacer_block:{type:`spacer_block`,label:`Spacer (Empty)`,createDefaultData(){return{height:48}},compileToHtml({data:e={}}={}){let t=Number.parseInt(e.height,10);return`
        <div
          aria-hidden="true"
          data-spacer-block
          class="rounded-xl border border-dashed  bg-transparent"
          style="min-height: ${Number.isFinite(t)?Math.max(0,Math.min(600,t)):48}px;"
        ></div>
      `}},embed_block:{type:`embed_block`,label:`Embed Block`,createDefaultData(){return{url:``,caption:``}},compileToHtml({data:n={}}={}){let r=t(n.url),i=e(n.caption||``);return r?`
        <article class="cf-card cf-card--elevated">
          <div class="aspect-video rounded-lg overflow-hidden border  bg-black">
            <iframe src="${e(r)}" title="${i||`Embedded content`}" class="w-full h-full" frameborder="0" allowfullscreen loading="lazy"></iframe>
          </div>
          ${i?`<p class="text-xs cf-muted mt-3">${i}</p>`:``}
          <p class="text-xs mt-2"><a href="${e(r)}" target="_blank" rel="noopener noreferrer" class="underline">Open in new tab</a></p>
        </article>
      `:`
          <article class="cf-card cf-card--elevated tone-warning">
            <p class="text-sm font-semibold uppercase tracking-wider">Embed missing URL</p>
          </article>
        `}},image_block:{type:`image_block`,label:`Image`,createDefaultData(){return{url:``,alt:``,caption:``,width:`full`}},compileToHtml({data:n={}}={}){let r=t(n.url),i=e(n.alt||`Image`),a=e(n.caption||``),o=String(n.width||`full`),s={full:`w-full`,wide:`w-full md:w-5/6 mx-auto`,medium:`w-full md:w-2/3 mx-auto`,small:`w-full md:w-1/2 mx-auto`},c=s[o]||s.full;return r?`
        <figure class="cf-card cf-card--elevated ${c}">
          <img src="${e(r)}" alt="${i}" class="w-full h-auto rounded-lg border " loading="lazy" />
          ${a?`<figcaption class="text-xs cf-muted mt-3">${a}</figcaption>`:``}
        </figure>
      `:`
          <article class="cf-card cf-card--elevated tone-warning">
            <p class="text-sm font-semibold uppercase tracking-wider">Image URL missing</p>
          </article>
        `}},resource_list:{type:`resource_list`,label:`Resource List`,createDefaultData(){return{title:`Resources`,items:[{label:`Resource link`,viewUrl:``,downloadUrl:``}]}},compileToHtml({data:n={}}={}){let r=(Array.isArray(n.items)?n.items:[]).filter(e=>e&&(e.label||e.url||e.viewUrl||e.downloadUrl||e.digitalContent)).map(n=>{let r=t(n.viewUrl||n.url),i=t(n.downloadUrl||n.url),a=e(n.label||n.viewUrl||n.downloadUrl||n.url||`Resource`),o=e(n.description||``),s=n&&n.digitalContent?c(n.digitalContent):``,l=r?`<button type="button" class="px-3 py-2 rounded cf-btn cf-btn--primary  text-[11px] font-bold uppercase tracking-wide" data-resource-view data-resource-url="${e(r)}" data-resource-title="${a}">View</button>`:``,u=i?`<button type="button" class="px-3 py-2 rounded cf-btn cf-btn--ghost  text-[11px] font-bold uppercase tracking-wide text-center" data-resource-download data-resource-download-url="${e(i)}" data-resource-download-name="${a}">Download</button>`:``,d=s?`<button type="button" class="px-3 py-2 rounded cf-btn cf-btn--primary  text-[11px] font-bold uppercase tracking-wide text-center" data-resource-read data-resource-read-title="${a}" data-resource-read-content="${e(s)}">Read</button>`:``;return!l&&!u&&!d?`<li class="cf-card cf-card--flat p-4"><p class=" text-sm font-semibold">${a}</p>${o?`<p class="text-xs cf-muted mt-1">${o}</p>`:``}</li>`:`
            <li class="cf-card cf-card--flat p-4">
              <p class=" text-sm font-semibold">${a}</p>
              ${o?`<p class="text-xs cf-muted mt-1">${o}</p>`:``}
              <div class="mt-3 flex flex-wrap gap-2">
                ${l}
                ${u}
                ${d}
              </div>
            </li>
          `});return`
        <article class="cf-card cf-card--elevated">
          <h3 class="text-lg font-bold  mb-3">${e(n.title||`Resources`)}</h3>
          <div class="is-hidden mb-4 rounded-lg border overflow-hidden bg-black" data-resource-viewer>
            <div class="flex items-center justify-between cf-card cf-card--flat px-3 py-2">
              <p class="text-xs font-bold uppercase tracking-widest " data-resource-viewer-title>Resource Viewer</p>
              <button type="button" class="cf-btn cf-btn--ghost text-xs font-bold uppercase tracking-widest" data-resource-viewer-close>Close</button>
            </div>
            <iframe src="" title="Resource viewer" class="w-full border-0" style="height: 70vh;" data-resource-viewer-frame></iframe>
          </div>
          <div class="is-hidden mb-4 rounded-lg border border-emerald-500/30 overflow-hidden bg-transparent" data-resource-reader>
            <div class="flex items-center justify-between cf-card cf-card--flat px-3 py-2">
              <p class="text-xs font-bold uppercase tracking-widest tone-success" data-resource-reader-title>Digital Resource</p>
              <button type="button" class="cf-btn cf-btn--ghost text-xs font-bold uppercase tracking-widest" data-resource-reader-close>Close</button>
            </div>
            <div class="flex" style="height: 70vh;">
              <aside class="hidden md:block w-64 border-r bg-transparent p-3 overflow-y-auto custom-scroll">
                <p class="text-[10px] font-bold uppercase tracking-widest cf-muted mb-2">Contents</p>
                <div class="space-y-1" data-resource-reader-toc></div>
              </aside>
              <div class="flex-1 p-4 md:p-6 overflow-y-auto custom-scroll">
                <div data-resource-reader-body></div>
                <div class="mt-6 pt-4 border-t  flex items-center justify-between gap-3">
                  <button type="button" class="px-3 py-2 rounded cf-btn cf-btn--ghost  text-[11px] font-bold uppercase tracking-wide disabled:opacity-40" data-resource-reader-prev>Previous</button>
                  <p class="text-[11px] font-bold uppercase tracking-widest cf-muted" data-resource-reader-progress></p>
                  <button type="button" class="px-3 py-2 rounded cf-btn cf-btn--ghost  text-[11px] font-bold uppercase tracking-wide disabled:opacity-40" data-resource-reader-next>Next</button>
                </div>
              </div>
            </div>
          </div>
          ${r.length?`<ul class="space-y-3 text-sm">${r.join(`
`)}</ul>`:`<p class="cf-muted text-sm">No resources added yet.</p>`}
        </article>
      `}},assessment_embed:{type:`assessment_embed`,label:`Assessment Block`,createDefaultData(){return{title:`Assessments`,items:[]}},compileToHtml({data:t={}}={}){let n=(Array.isArray(t.items)?t.items:[]).map((t,n)=>{let r=e(t?.title||`Assessment ${n+1}`),i=String(t?.html||``),a=s(t?.script||``);return`
          <div class="cf-card cf-card--elevated bg-transparent p-4">
            <h4 class="text-base font-bold ">${r}</h4>
            <div class="mt-4 space-y-3">
              ${i||`<p class="cf-muted text-sm">No assessment HTML found for this item.</p>`}
            </div>
            ${a?`<script>(function(){\n${a}\n})();<\\/script>`:``}
          </div>
        `});return`
        <article class="cf-card cf-card--elevated tone-info">
          <h3 class="text-lg font-bold mb-3">${e(t.title||`Assessments`)}</h3>
          ${n.length?`<div class="space-y-4">${n.join(`
`)}</div>`:`<p class="cf-muted text-sm">No assessments linked yet.</p>`}
        </article>
      `}},rubric_creator:{type:`rubric_creator`,label:`Rubric Creator`,createDefaultData(){let e=h(3),t=m(3);return{title:`Performance Rubric`,instructions:`Review each criterion and choose one level per row.`,rowCount:3,colCount:3,selfScoringEnabled:!0,totalLabel:`Self Score Total`,rows:e,columns:t,cells:g(e,t)}},compileToHtml({data:t={},activityId:r=``}={}){let i=d(t.rowCount,Array.isArray(t.rows)?t.rows.length:3),a=d(t.colCount,Array.isArray(t.columns)?t.columns.length:3),o=Array.from({length:i},(e,n)=>{let r=Array.isArray(t.rows)?t.rows[n]:null,i=`Criterion ${n+1}`;return{label:String(r?.label||i).trim()||i}}),s=Array.from({length:a},(e,n)=>{let r=Array.isArray(t.columns)?t.columns[n]:null,i=`Level ${n+1}`,o=a-n;return{label:String(r?.label||i).trim()||i,score:f(r?.score,o)}}),c=o.map((e,n)=>s.map((r,i)=>{let a=Array.isArray(t.cells)&&Array.isArray(t.cells[n])?t.cells[n][i]:``,o=`Describe "${r.label}" for ${e.label.toLowerCase()}.`;return String(a||o).trim()||o})),l=t.selfScoringEnabled!==!1,u=String(r||`rubric`).replace(/[^a-z0-9_-]/gi,`-`).toLowerCase(),m=f(s.reduce((e,t)=>Math.max(e,Number(t.score)||0),0)*o.length,0);return`
        <article class="cf-card cf-card--elevated tone-success" data-rubric-block data-rubric-id="${e(u)}">
          <h3 class="text-lg font-bold">${e(t.title||`Rubric`)}</h3>
          ${t.instructions?`<p class="text-sm cf-muted mt-2">${n(t.instructions||``)}</p>`:``}
          <div class="mt-4 overflow-x-auto rounded-lg border ">
            <table class="min-w-full border-collapse text-xs">
              <thead class="bg-transparent">
                <tr>
                  <th class="p-3 border-b  text-left font-bold uppercase tracking-wider cf-muted">Criteria</th>
                  ${s.map(t=>`
                        <th class="p-3 border-b  text-left font-bold uppercase tracking-wider cf-muted">
                          <div>${e(t.label)}</div>
                          <div class="text-[10px] font-semibold tone-info mt-1">Score: ${e(p(t.score))}</div>
                        </th>
                      `).join(`
`)}
                </tr>
              </thead>
              <tbody>
                ${o.map((t,n)=>`
                    <tr data-rubric-row="${n}">
                      <th class="align-top p-3 border-b  bg-transparent text-left  font-bold" data-rubric-row-label>${e(t.label)}</th>
                      ${s.map((t,r)=>`
                          <td class="align-top p-3 border-b  bg-transparent transition-colors" data-rubric-cell data-rubric-row="${n}" data-rubric-col="${r}" data-rubric-score="${e(p(t.score))}">
                            <p class="text-xs cf-muted leading-relaxed">${e(c[n][r])}</p>
                            ${l?`
                                  <label class="mt-3 inline-flex items-center gap-2 rounded border  bg-transparent px-2 py-1 cursor-pointer">
                                    <input
                                      type="radio"
                                      name="rubric-${e(u)}-row-${n}"
                                      value="${e(p(t.score))}"
                                      data-rubric-choice
                                      data-rubric-row="${n}"
                                      data-rubric-col="${r}"
                                      data-rubric-score="${e(p(t.score))}"
                                      class="w-3.5 h-3.5"
                                    />
                                    <span class="text-[10px] font-semibold uppercase tracking-wide ">Select</span>
                                  </label>
                                `:``}
                          </td>
                        `).join(`
`)}
                    </tr>
                  `).join(`
`)}
              </tbody>
            </table>
          </div>
          ${l?`
                <div class="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3 tone-success">
                  <p class="text-xs font-bold uppercase tracking-wider">${e(t.totalLabel||`Self Score Total`)}</p>
                  <div class="flex items-center gap-2">
                    <p class="text-lg font-black ">
                      <span data-rubric-total>0</span>
                      <span class="text-xs font-semibold cf-muted"> / <span data-rubric-max>${e(p(m))}</span></span>
                    </p>
                    <button type="button" class="px-2 py-1 rounded cf-btn cf-btn--ghost text-[10px] font-bold uppercase tracking-wide " data-rubric-clear>
                      Clear
                    </button>
                  </div>
                </div>
              `:`<p class="mt-4 text-[11px] cf-muted">Self-scoring is disabled for this rubric.</p>`}
        </article>
      `}},knowledge_check:{type:`knowledge_check`,label:`Knowledge Check`,createDefaultData(){return{title:`Knowledge Check`,questions:[se(`multiple_choice`)]}},compileToHtml({data:t={},index:n=0,activityId:r=``}={}){let i=le(t),a=y(t,`title`)?String(t.title??``).trim():`Knowledge Check`;return`
        <article class="cf-card cf-card--elevated" data-kc-block data-kc-id="${e(r)}">
          ${a?`<h3 class="text-lg font-bold  mb-4">${e(a)}</h3>`:``}
          <div class="space-y-4">
            ${i.map((t,i)=>{let a=e(t.prompt==null?``:String(t.prompt));if(t.type===`short_answer`){let n=e(t.placeholder==null?`Write your response...`:String(t.placeholder));return`
                    <section class="rounded-lg border p-4 tone-info" data-kc-question data-kc-kind="short_answer" data-kc-question-index="${i}">
                      <p class="text-[10px] font-bold uppercase tracking-widest mb-2">Question ${i+1}</p>
                      <label class="text-xs font-semibold uppercase tracking-wide cf-muted block mb-2" data-kc-prompt>${a}</label>
                      <textarea
                        class="w-full min-h-28 cf-card cf-card--flat p-3 "
                        data-kc-short-answer
                        placeholder="${n}"
                      ></textarea>
                    </section>
                  `}let o=`kc-${n}-${r}-${i}`,s=oe(t.options),c=Math.max(s.length-1,0);return`
                  <section class="cf-card cf-card--flat p-4" data-kc-question data-kc-kind="multiple_choice" data-kc-question-index="${i}" data-kc-correct="${Number.isInteger(t.correctIndex)?Math.max(0,Math.min(t.correctIndex,c)):0}">
                    <p class="text-[10px] font-bold uppercase tracking-widest cf-muted mb-2">Question ${i+1}</p>
                    <h4 class="text-sm font-bold  mb-3" data-kc-prompt>${a}</h4>
                    <div class="space-y-2">
                      ${s.length?s.map((t,n)=>`
                                  <label class="flex items-center gap-3 cf-card cf-card--flat p-3 ">
                                    <input type="radio" name="${e(o)}" value="${n}" class="w-4 h-4" />
                                    <span>${e(t)}</span>
                                  </label>
                                `).join(`
`):`<p class="text-xs cf-muted">No options added yet.</p>`}
                    </div>
                    <div class="mt-4 flex items-center gap-3">
                      <button type="button" class="px-3 py-2 rounded cf-btn cf-btn--primary  text-xs font-bold uppercase tracking-wide" data-kc-check>
                        Check Answer
                      </button>
                      <p class="text-xs cf-muted" data-kc-result></p>
                    </div>
                  </section>
                `}).join(`
`)}
          </div>
        </article>
      `}},submission_builder:{type:`submission_builder`,label:`Generate Report`,createDefaultData(){return{title:`Report Generator`,buttonLabel:`Generate Report`}},compileToHtml({data:t={}}={}){return`
        <article class="cf-card cf-card--elevated tone-success" data-submission-block>
          <h3 class="text-lg font-bold mb-3">${e(t.title||`Report Generator`)}</h3>
          <div class="flex flex-wrap gap-3">
            <button type="button" class="px-4 py-2 rounded cf-btn cf-btn--primary  text-xs font-bold uppercase tracking-wide" data-submission-generate>
              ${e(t.buttonLabel||`Generate Report`)}
            </button>
            <button type="button" class="px-4 py-2 rounded cf-btn cf-btn--ghost  text-xs font-bold uppercase tracking-wide" data-submission-copy>
              Copy to Clipboard
            </button>
            <button type="button" class="px-4 py-2 rounded cf-btn cf-btn--ghost  text-xs font-bold uppercase tracking-wide" data-submission-download>
              Download TXT
            </button>
            <button type="button" class="px-4 py-2 rounded cf-btn cf-btn--ghost  text-xs font-bold uppercase tracking-wide" data-submission-print>
              Print
            </button>
          </div>
          <pre class="mt-4 p-4 rounded bg-transparent border  text-xs  whitespace-pre-wrap" data-submission-output>Generate your report to view a summary here.</pre>
        </article>
      `}},save_load_block:{type:`save_load_block`,label:`Save / Load Progress`,createDefaultData(){return{title:`Save or Restore Progress`,description:`Download a JSON backup of current responses, then upload it later to restore the module state.`,fileName:`module-progress`}},compileToHtml({data:t={}}={}){return`
        <article class="cf-card cf-card--elevated tone-info" data-save-load-block data-save-load-file-name="${e(String(t.fileName||`module-progress`).replace(/[^a-z0-9._-]/gi,`-`).trim()||`module-progress`)}">
          <h3 class="text-lg font-bold mb-2">${e(t.title||`Save or Restore Progress`)}</h3>
          <p class="text-xs leading-relaxed">${n(t.description||``)}</p>
          <input type="file" accept=".json,application/json" class="is-hidden" data-save-load-upload-input />
          <div class="mt-3 flex flex-wrap gap-2">
            <button type="button" class="px-3 py-2 rounded cf-btn cf-btn--primary  text-xs font-bold uppercase tracking-wide" data-save-load-download>
              Download JSON
            </button>
            <button type="button" class="px-3 py-2 rounded cf-btn cf-btn--ghost  text-xs font-bold uppercase tracking-wide" data-save-load-upload-trigger>
              Upload JSON
            </button>
          </div>
          <p class="mt-3 text-xs" data-save-load-status>No backup loaded yet.</p>
        </article>
      `}},callout_block:{type:`callout_block`,label:`Callout / Admonition`,createDefaultData(){return{tone:`tip`,title:`Helpful tip`,body:`Add a concise note, warning, example, or myth-buster here.`}},compileToHtml({data:t={}}={}){let r=String(t.tone||`tip`).toLowerCase(),i={tip:{tone:`tone-success`,label:`TIP`},warning:{tone:`tone-warning`,label:`WARNING`},example:{tone:`tone-info`,label:`EXAMPLE`},myth:{tone:`tone-danger`,label:`MYTH`},note:{tone:`tone-info`,label:`NOTE`}},a=i[r]||i.tip;return`
        <article class="cf-card cf-card--elevated ${a.tone}">
          <p class="text-[10px] font-bold uppercase tracking-widest">${a.label}</p>
          <h3 class="mt-2 text-lg font-bold">${e(t.title||`Callout`)}</h3>
          <p class="mt-2 text-sm leading-relaxed">${n(t.body||``)}</p>
        </article>
      `}},accordion_block:{type:`accordion_block`,label:`Accordion / FAQ`,createDefaultData(){return{title:`Frequently Asked Questions`,items:[{question:`Question one?`,answer:`Answer one.`},{question:`Question two?`,answer:`Answer two.`}]}},compileToHtml({data:t={}}={}){let r=(Array.isArray(t.items)?t.items:[]).filter(e=>e&&(e.question||e.answer));return`
        <article class="cf-card cf-card--elevated">
          <h3 class="text-lg font-bold  mb-3">${e(t.title||`Accordion`)}</h3>
          <div class="space-y-2">
            ${r.length?r.map((t,r)=>`
                      <details class="cf-card cf-card--flat p-3" ${r===0?`open`:``}>
                        <summary class="cursor-pointer text-sm font-bold ">${e(t.question||`Item ${r+1}`)}</summary>
                        <div class="mt-2 text-sm cf-muted leading-relaxed">${n(t.answer||``)}</div>
                      </details>
                    `).join(`
`):`<p class="text-sm cf-muted">No accordion items yet.</p>`}
          </div>
        </article>
      `}},tabs_block:{type:`tabs_block`,label:`Tabs`,createDefaultData(){return{title:`Compare`,tabs:[{label:`Option A`,content:`Details for option A.`},{label:`Option B`,content:`Details for option B.`},{label:`Option C`,content:`Details for option C.`}]}},compileToHtml({data:t={}}={}){let r=(Array.isArray(t.tabs)?t.tabs:[]).filter(e=>e&&(e.label||e.content));return`
        <article class="cf-card cf-card--elevated" data-tabs-block>
          <h3 class="text-lg font-bold  mb-3">${e(t.title||`Tabs`)}</h3>
          <div class="flex flex-wrap gap-2" role="tablist" aria-label="${e(t.title||`Tabs`)}">
            ${r.length?r.map((t,n)=>`
                      <button
                        type="button"
                        role="tab"
                        data-tabs-trigger
                        data-tab-index="${n}"
                        class="cf-chip ${n===0?`is-active`:``}"
                      >
                        ${e(t.label||`Tab ${n+1}`)}
                      </button>
                    `).join(`
`):`<p class="text-sm cf-muted">No tabs configured yet.</p>`}
          </div>
          ${r.length?`
              <div class="mt-3 space-y-2">
                ${r.map((t,r)=>`
                    <div
                      role="tabpanel"
                      data-tabs-panel
                      data-tab-index="${r}"
                      class="cf-card cf-card--flat p-3 ${r===0?``:`is-hidden`}"
                    >
                      <h4 class="text-sm font-bold ">${e(t.label||`Tab ${r+1}`)}</h4>
                      <p class="text-sm cf-muted mt-2 leading-relaxed">${n(t.content||``)}</p>
                    </div>
                  `).join(`
`)}
              </div>
            `:``}
        </article>
      `}},tab_group:{type:`tab_group`,label:`Tab Group (Container)`,createDefaultData(){return{title:`Tab Group`,tabs:[{id:`activities`,label:`Activities`,activityIds:[],activities:[]},{id:`additional`,label:`Additional Learning`,activityIds:[],activities:[]}],defaultTabId:`activities`}},compileToHtml({data:t={}}={}){let n=Array.isArray(t.tabs)?t.tabs:[],r=String(t.title||``).trim(),i=n.map((t,n)=>{let r=e(String(t?.label||t?.id||`Tab ${n+1}`)),i=Array.isArray(t?.activityIds)?t.activityIds.filter(Boolean):[],a=Array.isArray(t?.activities)?t.activities.filter(Boolean):[];return`<li class="cf-card cf-card--flat px-3 py-2 text-xs cf-muted">${r} <span class="cf-muted">(${i.length} refs, ${a.length} inline)</span></li>`}).join(`
`);return`
        <article class="cf-card cf-card--elevated" data-tab-group>
          ${r?`<h3 class="text-lg font-bold  mb-3">${e(r)}</h3>`:``}
          ${i?`<ul class="space-y-2">${i}</ul>`:`<p class="text-sm cf-muted">No tabs configured.</p>`}
        </article>
      `}},card_list:{type:`card_list`,label:`Card List (Container)`,createDefaultData(){return{title:`Card List`,cards:[{title:`New Card`,subtitle:``,icon:``,targetActivityId:``,activity:null,activities:[],openMode:`expand`}]}},compileToHtml({data:t={}}={}){let n=String(t.title||``).trim(),r=(Array.isArray(t.cards)?t.cards:[]).map((t,n)=>{let r=String(t?.openMode||`expand`).trim().toLowerCase(),i=r===`modal`||r===`navigate_section`||r===`navigate_page`?r:`expand`;return`<li class="cf-card cf-card--flat px-3 py-2 text-xs cf-muted">${e(String(t?.title||`Card ${n+1}`))} <span class="cf-muted">(${i})</span></li>`}).join(`
`);return`
        <article class="cf-card cf-card--elevated" data-card-list>
          ${n?`<h3 class="text-lg font-bold  mb-3">${e(n)}</h3>`:``}
          ${r?`<ul class="space-y-2">${r}</ul>`:`<p class="text-sm cf-muted">No cards configured.</p>`}
        </article>
      `}},step_sequence:{type:`step_sequence`,label:`Step Sequence`,createDefaultData(){return{title:`Step-by-Step Flow`,steps:[{title:`Step 1`,detail:`Describe the first step.`},{title:`Step 2`,detail:`Describe the second step.`},{title:`Step 3`,detail:`Describe the third step.`}]}},compileToHtml({data:t={}}={}){let r=(Array.isArray(t.steps)?t.steps:[]).filter(e=>e&&(e.title||e.detail));return`
        <article class="cf-card cf-card--elevated">
          <h3 class="text-lg font-bold  mb-4">${e(t.title||`Steps`)}</h3>
          ${r.length?`
              <ol class="space-y-3">
                ${r.map((t,r)=>`
                    <li class="cf-card cf-card--flat p-4">
                      <div class="flex items-start gap-3">
                        <div class="cf-chip tone-info w-7 h-7 p-0 text-xs font-bold flex items-center justify-center">${r+1}</div>
                        <div>
                          <h4 class="text-sm font-bold ">${e(t.title||`Step ${r+1}`)}</h4>
                          <p class="text-sm cf-muted mt-1 leading-relaxed">${n(t.detail||``)}</p>
                        </div>
                      </div>
                    </li>
                  `).join(`
`)}
              </ol>
            `:`<p class="text-sm cf-muted">No steps added yet.</p>`}
        </article>
      `}},checklist_block:{type:`checklist_block`,label:`Checklist`,createDefaultData(){return{title:`Action Checklist`,items:[`Complete task one`,`Complete task two`,`Complete task three`]}},compileToHtml({data:t={},activityId:n=``}={}){let r=(Array.isArray(t.items)?t.items:[]).map(e=>String(e||``).trim()).filter(Boolean);return`
        <article class="cf-card cf-card--elevated" data-checklist-block data-checklist-id="${e(n||t.title||`checklist`)}" data-checklist-total="${r.length}">
          <div class="flex items-center justify-between gap-3 mb-3">
            <h3 class="text-lg font-bold ">${e(t.title||`Checklist`)}</h3>
            <p class="text-xs font-semibold uppercase tracking-widest cf-muted" data-checklist-progress>${r.length?`0 / ${r.length}`:`0 / 0`} done</p>
          </div>
          ${r.length?`
              <div class="space-y-2">
                ${r.map((t,n)=>`
                    <label class="flex items-center gap-3 cf-card cf-card--flat p-3">
                      <input type="checkbox" class="w-4 h-4" data-checklist-input data-checklist-index="${n}" />
                      <span class="text-sm ">${e(t)}</span>
                    </label>
                  `).join(`
`)}
              </div>
            `:`<p class="text-sm cf-muted">No checklist items yet.</p>`}
        </article>
      `}},scenario_branch:{type:`scenario_branch`,label:`Scenario Branch`,createDefaultData(){return{title:`Scenario Lab`,prompt:`A key decision appears. What do you do next?`,choices:[{label:`Choice A`,outcome:`Outcome for choice A.`,tone:`good`},{label:`Choice B`,outcome:`Outcome for choice B.`,tone:`caution`},{label:`Choice C`,outcome:`Outcome for choice C.`,tone:`neutral`}]}},compileToHtml({data:t={}}={}){let r=(Array.isArray(t.choices)?t.choices:[]).filter(e=>e&&(e.label||e.outcome)),i={good:`border-emerald-500/30 bg-emerald-950/20`,caution:`border-amber-500/30 bg-amber-950/20`,risk:`border-rose-500/30 bg-rose-950/20`,neutral:` bg-transparent`};return`
        <article class="cf-card cf-card--elevated">
          <h3 class="text-lg font-bold ">${e(t.title||`Scenario Branch`)}</h3>
          <p class="mt-2 text-sm cf-muted">${n(t.prompt||``)}</p>
          <div class="mt-4 space-y-2">
            ${r.length?r.map((t,r)=>`
                      <details class="rounded-lg border p-3 ${i[String(t.tone||`neutral`).toLowerCase()]||i.neutral}">
                        <summary class="cursor-pointer text-sm font-bold ">${e(t.label||`Choice ${r+1}`)}</summary>
                        <p class="text-sm cf-muted mt-2 leading-relaxed">${n(t.outcome||``)}</p>
                      </details>
                    `).join(`
`):`<p class="text-sm cf-muted">No branches added yet.</p>`}
          </div>
        </article>
      `}},drag_sort_block:{type:`drag_sort_block`,label:`Drag / Sort`,createDefaultData(){return{title:`Sort Challenge`,instructions:`Order these items from first to last.`,items:[`Item A`,`Item B`,`Item C`]}},compileToHtml({data:t={}}={}){let r=(Array.isArray(t.items)?t.items:[]).map(e=>String(e||``).trim()).filter(Boolean);return`
        <article class="cf-card cf-card--elevated" data-sort-block>
          <h3 class="text-lg font-bold ">${e(t.title||`Sort`)}</h3>
          <p class="text-sm cf-muted mt-2">${n(t.instructions||``)}</p>
          ${r.length?`
              <ol class="mt-4 space-y-2" data-sort-list>
                ${r.map((t,n)=>`
                    <li class="cf-card cf-card--flat px-3 py-2 text-sm  flex items-center justify-between gap-3" data-sort-item draggable="true">
                      <div class="flex items-center gap-2 min-w-0">
                        <span class="cf-muted font-mono" data-sort-rank>${n+1}.</span>
                        <span class="truncate">${e(t)}</span>
                      </div>
                      <div class="flex items-center gap-1">
                        <button type="button" class="px-2 py-1 rounded cf-btn cf-btn--ghost text-[10px] font-bold " data-sort-move="-1" title="Move up">Up</button>
                        <button type="button" class="px-2 py-1 rounded cf-btn cf-btn--ghost text-[10px] font-bold " data-sort-move="1" title="Move down">Down</button>
                      </div>
                    </li>
                  `).join(`
`)}
              </ol>
            `:`<p class="text-sm cf-muted mt-3">No sort items yet.</p>`}
          <p class="text-[11px] cf-muted mt-3">Tip: drag rows or use Up/Down to reorder.</p>
        </article>
      `}},flashcard_deck:{type:`flashcard_deck`,label:`Flashcards`,createDefaultData(){return{title:`Flashcards`,cards:[{front:`Front 1`,back:`Back 1`},{front:`Front 2`,back:`Back 2`}]}},compileToHtml({data:t={}}={}){let r=(Array.isArray(t.cards)?t.cards:[]).filter(e=>e&&(e.front||e.back));return`
        <article class="cf-card cf-card--elevated" data-flashcards-block>
          <h3 class="text-lg font-bold  mb-3">${e(t.title||`Flashcards`)}</h3>
          <div class="grid gap-3 md:grid-cols-2">
            ${r.length?r.map((e,t)=>`
                      <div class="cf-card cf-card--flat p-4" data-flashcard data-flashcard-index="${t}">
                        <div data-flashcard-front>
                          <p class="text-[10px] font-bold uppercase tracking-widest cf-muted">Front</p>
                          <p class="text-sm  mt-1">${n(e.front||``)}</p>
                        </div>
                        <div data-flashcard-back class="is-hidden">
                          <p class="text-[10px] font-bold uppercase tracking-widest cf-muted">Back</p>
                          <p class="text-sm cf-muted mt-1">${n(e.back||``)}</p>
                        </div>
                        <button type="button" class="mt-3 px-3 py-1.5 rounded cf-btn cf-btn--primary text-[11px] font-bold  uppercase tracking-wide" data-flashcard-toggle>
                          Flip
                        </button>
                      </div>
                    `).join(`
`):`<p class="text-sm cf-muted">No cards yet.</p>`}
          </div>
        </article>
      `}},reflection_journal:{type:`reflection_journal`,label:`Reflection Journal`,createDefaultData(){return{title:`Reflection`,prompt:`What stood out from this lesson?`,placeholder:`Write your reflection...`}},compileToHtml({data:t={}}={}){return`
        <article class="cf-card cf-card--elevated">
          <h3 class="text-lg font-bold ">${e(t.title||`Reflection`)}</h3>
          <p class="text-sm cf-muted mt-2">${n(t.prompt||``)}</p>
          <textarea class="mt-4 w-full min-h-32 cf-card cf-card--flat p-3 text-sm " placeholder="${e(t.placeholder||`Write here...`)}"></textarea>
        </article>
      `}},worksheet_form:{type:`worksheet_form`,label:`Template / Worksheet`,createDefaultData(){return{title:`Worksheet`,blocks:[{kind:`title`,title:`Section 1`,showContent:!0,content:`Add instructions for this section.`},{kind:`field`,label:`Goal`,fieldType:`text`,placeholder:`Enter goal...`},{kind:`field`,label:`Plan`,fieldType:`textarea`,placeholder:`Describe your plan...`}]}},compileToHtml({data:t={}}={}){let r=ie(t),a=String(t.title||``).trim();return`
        <article class="cf-card cf-card--elevated" data-worksheet-block>
          ${a?`<h3 class="text-lg font-bold  mb-3">${e(a)}</h3>`:``}
          <div class="space-y-3">
            ${r.length?r.map((t,r)=>{if(t.kind===`title`){let r=t.title==null?``:String(t.title);return`
                          <section class="cf-card cf-card--flat tone-info p-4" data-worksheet-segment data-worksheet-kind="title">
                            ${r?`<h4 class="text-sm font-bold uppercase tracking-wide">${e(r)}</h4>`:``}
                            ${t.showContent&&t.content?`<p class="mt-2 text-sm leading-relaxed">${n(t.content)}</p>`:``}
                          </section>
                        `}let a=e(t?.label==null?`Field ${r+1}`:String(t.label)),o=_(t?.fieldType||t?.inputType||t?.type),s=e(t?.placeholder||``),c=v(t?.helperMode,t),l=t?.helperText==null?``:String(t.helperText),u=i(t?.helperHtml||``),d=c===`rich`&&u?`<div class="cf-rich-editor text-sm cf-muted leading-relaxed mb-2">${u}</div>`:l?`<p class="text-xs cf-muted leading-relaxed mb-2">${n(l)}</p>`:``;return o===`textarea`?`
                          <div data-worksheet-segment data-worksheet-kind="field">
                            <label class="block text-xs font-bold uppercase tracking-wide cf-muted mb-1">${a}</label>
                            ${d}
                            <textarea class="w-full min-h-24 cf-card cf-card--flat p-3 text-sm " placeholder="${s}"></textarea>
                          </div>
                        `:o===`number`?`
                          <div data-worksheet-segment data-worksheet-kind="field">
                            <label class="block text-xs font-bold uppercase tracking-wide cf-muted mb-1">${a}</label>
                            ${d}
                            <input type="number" class="w-full cf-card cf-card--flat p-2 text-sm " placeholder="${s}" />
                          </div>
                        `:`
                        <div data-worksheet-segment data-worksheet-kind="field">
                          <label class="block text-xs font-bold uppercase tracking-wide cf-muted mb-1">${a}</label>
                          ${d}
                          <input type="text" class="w-full cf-card cf-card--flat p-2 text-sm " placeholder="${s}" />
                        </div>
                      `}).join(`
`):`<p class="text-sm cf-muted">No worksheet blocks yet.</p>`}
          </div>
        </article>
      `}},fillable_chart:{type:`fillable_chart`,label:`Fillable Chart`,createDefaultData(){return{title:`Fillable Chart`,description:`Label each cell and choose whether students can edit it.`,rowCount:2,colCount:2,showRowLabels:!0,rowLabelHeader:`Rows`,rows:[{id:`row-1`,label:`Row 1`},{id:`row-2`,label:`Row 2`}],columns:[{id:`col-1`,label:`Column 1`},{id:`col-2`,label:`Column 2`}],cells:[[{label:``,editable:!0,placeholder:`Type your response...`},{label:``,editable:!0,placeholder:`Type your response...`}],[{label:``,editable:!0,placeholder:`Type your response...`},{label:``,editable:!0,placeholder:`Type your response...`}]]}},compileToHtml({data:t={}}={}){let r=re(t),i=String(t.title||``).trim(),a=String(t.description||``).trim(),o=r.showRowLabels?`
            <th class="p-3 border-b  text-left font-bold uppercase tracking-wide cf-muted w-40">
              ${e(r.rowLabelHeader||``)||`&nbsp;`}
            </th>
          `:``,s=r.columns.map(t=>`
            <th class="p-3 border-b border-l  text-left font-bold uppercase tracking-wide cf-muted">
              ${e(t.label||``)||`&nbsp;`}
            </th>
          `).join(`
`),c=r.rows.map((t,i)=>{let a=r.columns.map((t,a)=>{let o=r.cells[i][a];return o.editable?`
                  <td class="p-3 border-b border-l  align-top">
                    ${o.label?`<p class="text-xs cf-muted mb-2">${n(o.label)}</p>`:``}
                    <textarea
                      class="w-full min-h-24 cf-card cf-card--flat p-2 text-sm "
                      placeholder="${e(o.placeholder||`Type your response...`)}"
                    ></textarea>
                  </td>
                `:`
                <td class="p-3 border-b border-l  align-top">
                  <div class="text-sm  leading-relaxed">${n(o.label||``)}</div>
                </td>
              `}).join(`
`);return`
            <tr>
              ${r.showRowLabels?`
                <th class="p-3 border-b  bg-transparent text-left  font-bold uppercase tracking-wide">
                  ${e(t.label||``)||`&nbsp;`}
                </th>
              `:``}
              ${a}
            </tr>
          `}).join(`
`);return`
        <article class="cf-card cf-card--elevated" data-fillable-chart-block>
          ${i?`<h3 class="text-lg font-bold ">${e(i)}</h3>`:``}
          ${a?`<p class="text-sm cf-muted mt-2">${n(a)}</p>`:``}
          <div class="mt-4 overflow-x-auto rounded-lg border ">
            <table class="min-w-full border-collapse text-xs">
              <thead class="bg-transparent">
                <tr>
                  ${o}
                  ${s}
                </tr>
              </thead>
              <tbody>
                ${c}
              </tbody>
            </table>
          </div>
        </article>
      `}},portfolio_evidence:{type:`portfolio_evidence`,label:`Portfolio / Evidence`,createDefaultData(){return{title:`Evidence Submission`,instructions:`Capture proof of your work and a short reflection.`,criteria:[`Quality`,`Completeness`,`Clarity`]}},compileToHtml({data:t={}}={}){let r=(Array.isArray(t.criteria)?t.criteria:[]).map(e=>String(e||``).trim()).filter(Boolean);return`
        <article class="cf-card cf-card--elevated">
          <h3 class="text-lg font-bold ">${e(t.title||`Portfolio`)}</h3>
          <p class="text-sm cf-muted mt-2">${n(t.instructions||``)}</p>
          <div class="mt-4 space-y-3">
            <div>
              <label class="block text-xs font-bold uppercase tracking-wide cf-muted mb-1">Artifact URL</label>
              <input type="text" class="w-full cf-card cf-card--flat p-2 text-sm " placeholder="https://..." />
            </div>
            <div>
              <label class="block text-xs font-bold uppercase tracking-wide cf-muted mb-1">Evidence Summary</label>
              <textarea class="w-full min-h-28 cf-card cf-card--flat p-3 text-sm " placeholder="Explain what this artifact proves..."></textarea>
            </div>
            ${r.length?`
                <div class="cf-card cf-card--flat p-3">
                  <p class="text-xs font-bold uppercase tracking-wide cf-muted mb-2">Self-Check</p>
                  <div class="space-y-2">
                    ${r.map(t=>`
                        <label class="flex items-center gap-2 text-sm ">
                          <input type="checkbox" class="w-4 h-4" />
                          <span>${e(t)}</span>
                        </label>
                      `).join(`
`)}
                  </div>
                </div>
              `:``}
          </div>
        </article>
      `}},path_map:{type:`path_map`,label:`Choose-Your-Path Map`,createDefaultData(){return{title:`Learning Paths`,nodes:[{title:`Path A`,description:`Description for path A.`},{title:`Path B`,description:`Description for path B.`},{title:`Path C`,description:`Description for path C.`}]}},compileToHtml({data:t={}}={}){let r=(Array.isArray(t.nodes)?t.nodes:[]).filter(e=>e&&(e.title||e.description));return`
        <article class="cf-card cf-card--elevated" data-path-map-block>
          <h3 class="text-lg font-bold  mb-3">${e(t.title||`Path Map`)}</h3>
          ${r.length?`
              <div class="grid gap-3 md:grid-cols-12">
                <div class="md:col-span-4 space-y-2">
                  ${r.map((t,n)=>`
                      <button
                        type="button"
                        data-path-node
                        data-path-index="${n}"
                        class="w-full text-left cf-card cf-card--flat p-3 transition-colors ${n===0?`is-active`:``}"
                      >
                        <p class="text-xs font-bold uppercase tracking-widest cf-muted">Path ${n+1}</p>
                        <p class="text-sm font-bold  mt-1">${e(t.title||`Path ${n+1}`)}</p>
                      </button>
                    `).join(`
`)}
                </div>
                <div class="md:col-span-8 space-y-2">
                  ${r.map((t,r)=>`
                      <div class="cf-card cf-card--flat p-4">
                        <div data-path-panel data-path-index="${r}" class="${r===0?``:`is-hidden`}">
                        <h4 class="text-sm font-bold text-indigo-300">${e(t.title||`Path`)}</h4>
                        <p class="text-sm cf-muted mt-1 leading-relaxed">${n(t.description||``)}</p>
                        </div>
                      </div>
                    `).join(`
`)}
                </div>
              </div>
            `:`<p class="text-sm cf-muted">No paths added yet.</p>`}
        </article>
      `}},hotspot_image:{type:`hotspot_image`,label:`Interactive Image / Hotspots`,createDefaultData(){return{title:`Interactive Image`,url:``,alt:`Interactive visual`,hotspots:[{label:`Point A`,x:25,y:35,content:`Explain this area.`},{label:`Point B`,x:60,y:55,content:`Explain this area.`}]}},compileToHtml({data:r={}}={}){let i=t(r.url),a=Array.isArray(r.hotspots)?r.hotspots:[];return`
        <article class="cf-card cf-card--elevated" data-hotspot-block>
          <h3 class="text-lg font-bold  mb-3">${e(r.title||`Interactive Image`)}</h3>
          ${i?`
              <figure class="relative rounded-lg border bg-black overflow-hidden" data-hotspot-figure>
                <img src="${e(i)}" alt="${e(r.alt||`Interactive image`)}" class="w-full h-auto" loading="lazy" />
                ${a.length?a.map((t,n)=>`
                        <button
                          type="button"
                          data-hotspot-btn
                          data-hotspot-index="${n}"
                          style="left:${Math.max(0,Math.min(100,Number.parseFloat(t?.x)||0))}%;top:${Math.max(0,Math.min(100,Number.parseFloat(t?.y)||0))}%;"
                          class="absolute -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full border text-[11px] font-black transition-colors ${n===0?`is-active`:`cf-card cf-card--flat`}"
                          title="${e(t?.label||`Hotspot ${n+1}`)}"
                          aria-label="${e(t?.label||`Hotspot ${n+1}`)}"
                        >
                          ${n+1}
                        </button>
                      `).join(`
`):``}
              </figure>
              ${a.length?`
                  <div class="mt-3 grid md:grid-cols-2 gap-2">
                    ${a.map((t,r)=>`
                        <div data-hotspot-panel data-hotspot-index="${r}" class="cf-card cf-card--flat p-2 text-xs cf-muted ${r===0?``:`is-hidden`}">
                          <p class="font-bold ">${e(t.label||`Hotspot ${r+1}`)}</p>
                          <p class="mt-1">${n(t?.content||``)}</p>
                        </div>
                      `).join(`
`)}
                  </div>
                `:``}
            `:`<p class="text-sm cf-muted">Add an image URL to render hotspot content.</p>`}
        </article>
      `}},timeline_story:{type:`timeline_story`,label:`Timeline Story`,createDefaultData(){return{title:`Timeline`,events:[{date:`Phase 1`,title:`Start`,description:`Describe what begins here.`},{date:`Phase 2`,title:`Middle`,description:`Describe what happens next.`},{date:`Phase 3`,title:`Finish`,description:`Describe the final outcome.`}]}},compileToHtml({data:t={}}={}){let r=(Array.isArray(t.events)?t.events:[]).filter(e=>e&&(e.date||e.title||e.description));return`
        <article class="cf-card cf-card--elevated">
          <h3 class="text-lg font-bold  mb-4">${e(t.title||`Timeline`)}</h3>
          ${r.length?`
              <ol class="space-y-4 border-l  ml-2 pl-4">
                ${r.map(t=>`
                    <li class="relative">
                      <span class="absolute -left-[23px] top-1.5 w-2 h-2 rounded-full bg-indigo-400"></span>
                      <p class="text-xs uppercase tracking-widest cf-muted">${e(t.date||``)}</p>
                      <h4 class="text-sm font-bold  mt-1">${e(t.title||``)}</h4>
                      <p class="text-sm cf-muted mt-1 leading-relaxed">${n(t.description||``)}</p>
                    </li>
                  `).join(`
`)}
              </ol>
            `:`<p class="text-sm cf-muted">No timeline events yet.</p>`}
        </article>
      `}},before_after:{type:`before_after`,label:`Before / After`,createDefaultData(){return{title:`Before vs After`,beforeLabel:`Before`,beforeText:`Describe the initial state.`,afterLabel:`After`,afterText:`Describe the transformed state.`}},compileToHtml({data:t={}}={}){return`
        <article class="cf-card cf-card--elevated" data-before-after-block>
          <h3 class="text-lg font-bold  mb-3">${e(t.title||`Before / After`)}</h3>
          <p class="text-xs cf-muted">Move the slider to compare emphasis between both states.</p>
          <div class="grid md:grid-cols-2 gap-3">
            <div class="rounded-lg border border-rose-500/30 bg-rose-950/20 p-4 transition-opacity" data-before-panel>
              <p class="text-xs font-bold uppercase tracking-widest text-rose-300">${e(t.beforeLabel||`Before`)}</p>
              <p class="text-sm text-rose-100/90 mt-2 leading-relaxed">${n(t.beforeText||``)}</p>
            </div>
            <div class="rounded-lg border p-4 transition-opacity tone-success" data-after-panel>
              <p class="text-xs font-bold uppercase tracking-widest">${e(t.afterLabel||`After`)}</p>
              <p class="text-sm mt-2 leading-relaxed">${n(t.afterText||``)}</p>
            </div>
          </div>
          <div class="mt-4">
            <input type="range" min="0" max="100" value="50" class="w-full" data-before-after-slider />
            <div class="mt-1 flex items-center justify-between text-[11px] cf-muted">
              <span>${e(t.beforeLabel||`Before`)}</span>
              <span data-before-after-value>50 / 50</span>
              <span>${e(t.afterLabel||`After`)}</span>
            </div>
          </div>
        </article>
      `}},roleplay_simulator:{type:`roleplay_simulator`,label:`Roleplay Simulator`,createDefaultData(){return{title:`Roleplay`,scenario:`Set up a realistic interaction scenario.`,messages:[{speaker:`Person A`,line:`Opening line from person A.`},{speaker:`Person B`,line:`Response from person B.`}],responsePrompt:`What would you say next?`}},compileToHtml({data:t={}}={}){let r=Array.isArray(t.messages)?t.messages:[];return`
        <article class="cf-card cf-card--elevated">
          <h3 class="text-lg font-bold ">${e(t.title||`Roleplay Simulator`)}</h3>
          <p class="text-sm cf-muted mt-2">${n(t.scenario||``)}</p>
          <div class="mt-4 space-y-2">
            ${r.length?r.map((t,r)=>`
                      <div class="cf-card cf-card--flat p-3">
                        <p class="text-[10px] uppercase tracking-widest cf-muted">${e(t.speaker||`Speaker ${r+1}`)}</p>
                        <p class="text-sm  mt-1">${n(t.line||``)}</p>
                      </div>
                    `).join(`
`):`<p class="text-sm cf-muted">No dialogue turns yet.</p>`}
          </div>
          <div class="mt-4">
            <label class="block text-xs font-bold uppercase tracking-wide cf-muted mb-1">${e(t.responsePrompt||`Your response`)}</label>
            <textarea class="w-full min-h-28 cf-card cf-card--flat p-3 text-sm " placeholder="Draft your response..."></textarea>
          </div>
        </article>
      `}},decision_lab:{type:`decision_lab`,label:`Decision Lab`,createDefaultData(){return{title:`Decision Lab`,description:`Adjust the levers below to test outcomes.`,resultLabel:`Projected outcome score`,variables:[{name:`Cost`,min:0,max:10,value:5,weight:1},{name:`Impact`,min:0,max:10,value:7,weight:2},{name:`Risk`,min:0,max:10,value:3,weight:2}]}},compileToHtml({data:t={}}={}){let r=(Array.isArray(t.variables)?t.variables:[]).map((e,t)=>{let n=Number(e?.min),r=Number(e?.max),i=Number(e?.value),a=Number(e?.weight),o=Number.isFinite(n)?n:0,s=Number.isFinite(r)&&r>=o?r:o+10,c=Number.isFinite(i)?Math.max(o,Math.min(s,i)):o,l=Number.isFinite(a)&&a>0?a:1,u=s===o?0:(c-o)/(s-o);return{key:`decision-${t}`,name:String(e?.name||`Variable`),min:o,max:s,value:c,weight:l,normalized:u}}),i=r.reduce((e,t)=>e+t.weight,0),a=r.reduce((e,t)=>e+t.normalized*t.weight,0),o=i>0?Math.round(a/i*100):0;return`
        <article class="cf-card cf-card--elevated" data-decision-block>
          <h3 class="text-lg font-bold ">${e(t.title||`Decision Lab`)}</h3>
          <p class="text-sm cf-muted mt-2">${n(t.description||``)}</p>
          <div class="mt-4 grid gap-2 md:grid-cols-2">
            ${r.length?r.map(t=>`
                      <div class="cf-card cf-card--flat p-3">
                        <p class="text-xs uppercase tracking-widest cf-muted">${e(t.name)}</p>
                        <p class="text-xs cf-muted mt-1">Weight: ${t.weight}</p>
                        <input
                          type="range"
                          min="${t.min}"
                          max="${t.max}"
                          step="1"
                          value="${t.value}"
                          class="mt-2 w-full"
                          data-decision-input
                          data-decision-key="${e(t.key)}"
                          data-decision-min="${t.min}"
                          data-decision-max="${t.max}"
                          data-decision-weight="${t.weight}"
                        />
                        <div class="mt-1 flex items-center justify-between text-[11px] cf-muted">
                          <span>${t.min}</span>
                          <span class="font-bold " data-decision-current data-decision-key="${e(t.key)}">${t.value}</span>
                          <span>${t.max}</span>
                        </div>
                      </div>
                    `).join(`
`):`<p class="text-sm cf-muted">No decision variables yet.</p>`}
          </div>
          <div class="mt-4 cf-card cf-card--flat tone-info p-3">
            <p class="text-xs uppercase tracking-widest">${e(t.resultLabel||`Outcome score`)}</p>
            <p class="text-2xl font-black  mt-1" data-decision-score>${o}</p>
          </div>
        </article>
      `}}};function T(e){return ue[e]||null}var de={content:`Content & Media`,assessment:`Assessment & Knowledge`,interactive:`Interactive Activities`,productivity:`Reports & Save/Load`,layout:`Layout & Utility`,general:`Other`},fe={content_block:`content`,title_block:`content`,spacer_block:`layout`,embed_block:`content`,image_block:`content`,resource_list:`content`,assessment_embed:`assessment`,rubric_creator:`assessment`,knowledge_check:`assessment`,submission_builder:`productivity`,save_load_block:`productivity`,callout_block:`content`,accordion_block:`content`,tabs_block:`content`,tab_group:`layout`,card_list:`layout`,step_sequence:`content`,checklist_block:`interactive`,scenario_branch:`interactive`,drag_sort_block:`interactive`,flashcard_deck:`interactive`,reflection_journal:`interactive`,worksheet_form:`assessment`,fillable_chart:`interactive`,portfolio_evidence:`assessment`,path_map:`interactive`,hotspot_image:`interactive`,timeline_story:`content`,before_after:`interactive`,roleplay_simulator:`interactive`,decision_lab:`interactive`};function pe(e){return fe[e]||`general`}function me(e){return de[e]||de.general}function he(){return Object.keys(ue)}function ge(){let e={};return Object.keys(ue).forEach(t=>{let n=pe(t);e[n]||(e[n]=[]),e[n].push(t)}),[`content`,`assessment`,`interactive`,`productivity`,`layout`,`general`].filter(t=>Array.isArray(e[t])&&e[t].length>0).map(t=>({category:t,label:me(t),types:e[t]}))}function _e(e=``){return String(e||``).replace(/<style[\s\S]*?<\/style>/gi,` `).replace(/<script[\s\S]*?<\/script>/gi,` `).replace(/<[^>]*>/g,` `).replace(/&nbsp;/gi,` `).replace(/&#39;/gi,`'`).replace(/&quot;/gi,`"`).replace(/&amp;/gi,`&`).replace(/&lt;/gi,`<`).replace(/&gt;/gi,`>`).replace(/\s+/g,` `).trim()}function ve(e,t=`item`){return String(e||``).trim().toLowerCase().replace(/<[^>]*>/g,``).replace(/[^a-z0-9]+/g,`-`).replace(/^-+|-+$/g,``)||t}function E(e,t=[]){return typeof e==`string`?((/[<][a-z!/]/i.test(e)||/\bhref\s*=\s*["']#/i.test(e)||/\bid\s*=\s*["']/i.test(e))&&t.push(e),t):Array.isArray(e)?(e.forEach(e=>E(e,t)),t):(e&&typeof e==`object`&&Object.values(e).forEach(e=>E(e,t)),t)}function ye(e=``){let t=new Set,n=/\sid\s*=\s*(['"])(.*?)\1/gi,r=n.exec(String(e||``));for(;r;){let i=String(r[2]||``).trim();i&&t.add(i),r=n.exec(String(e||``))}return t}function be(e=``){let t=new Set,n=/\shref\s*=\s*(['"])#(.*?)\1/gi,r=n.exec(String(e||``));for(;r;){let i=String(r[2]||``).trim();i&&t.add(i),r=n.exec(String(e||``))}return t}function xe(e=``){let t=0,n=/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi,r=n.exec(String(e||``));for(;r;)_e(r[2]||``)||(t+=1),r=n.exec(String(e||``));return t}function Se(e){let t=String(e||``).trim();if(!t)return null;let n=t.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);if(n){let e=n[1].length===3?n[1].split(``).map(e=>`${e}${e}`).join(``):n[1];return{r:Number.parseInt(e.slice(0,2),16),g:Number.parseInt(e.slice(2,4),16),b:Number.parseInt(e.slice(4,6),16)}}let r=t.match(/^rgba?\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})(?:\s*,\s*(0|0?\.\d+|1(?:\.0+)?))?\s*\)$/i);return r?{r:Math.max(0,Math.min(255,Number.parseInt(r[1],10)||0)),g:Math.max(0,Math.min(255,Number.parseInt(r[2],10)||0)),b:Math.max(0,Math.min(255,Number.parseInt(r[3],10)||0))}:null}function D(e){let t=e/255;return t<=.03928?t/12.92:((t+.055)/1.055)**2.4}function Ce(e,t){if(!e||!t)return 0;let n=.2126*D(e.r)+.7152*D(e.g)+.0722*D(e.b),r=.2126*D(t.r)+.7152*D(t.g)+.0722*D(t.b),i=Math.max(n,r),a=Math.min(n,r);return(i+.05)/(a+.05)}function we(e,t){let n=String(e?.id||``).trim(),r=new Set,i=`activity-${t+1}`;return n&&(r.add(n),r.add(`cf-activity-${ve(n,i)}`),r.add(`cb-${ve(n,`section-${t+1}`)}`)),E(e?.data||{}).forEach(e=>{ye(e).forEach(e=>r.add(e))}),e?.type===`card_list`&&(Array.isArray(e?.data?.cards)?e.data.cards:[]).forEach((e,t)=>{r.add(`${ve(n,`card-list`)}-panel-${t+1}`)}),r}function Te(e){let t=[],n=e?.type||``,r=e?.data&&typeof e.data==`object`?e.data:{},i=e=>{let t=String(e||``).trim();return!t||/^javascript:/i.test(t)?!1:/^(https?:)?\/\//i.test(t)||/^(\/|\.\/|\.\.\/)/.test(t)||/^(blob:|data:)/i.test(t)||/^(assets|materials)\//i.test(t)?!0:/\s/.test(t)?!1:t.includes(`/`)||/\.[a-z0-9]{2,8}($|[?#])/i.test(t)},a=(e,n)=>{t.push({level:e===`error`?`error`:`warn`,message:String(n||``).trim()})};if(!n||!T(n))return a(`error`,`Unknown activity type: ${n||`(missing)`}`),t;if(n===`embed_block`&&(String(r.url||``).trim()||a(`error`,`Embed URL is missing.`),String(r.url||``).trim()&&!i(r.url)&&a(`warn`,`Embed URL format looks invalid.`)),n===`image_block`&&(String(r.url||``).trim()||a(`error`,`Image URL is missing.`),String(r.url||``).trim()&&!i(r.url)&&a(`warn`,`Image URL format looks invalid.`),String(r.alt||``).trim()||a(`warn`,`Alt text is empty (accessibility).`)),n===`title_block`&&(_e(r.textHtml||r.text||``)||a(`warn`,`Title block content is empty.`)),n===`content_block`&&(_e(r.bodyHtml||r.body||``)||a(`warn`,`Content block body is empty.`)),n===`resource_list`){let e=Array.isArray(r.items)?r.items:[];String(r.title||``).trim()||a(`warn`,`Resource list title is empty.`),e.length===0&&a(`warn`,`No resources added yet.`),e.forEach((e,t)=>{let n=String(e?.label||``).trim(),r=String(e?.viewUrl||e?.url||``).trim(),o=String(e?.downloadUrl||e?.url||``).trim(),s=!!e?.digitalContent;n||a(`warn`,`Resource #${t+1}: label is empty.`),!r&&!o&&!s&&a(`warn`,`Resource #${t+1}: missing view/download/read source.`),r&&!i(r)&&a(`warn`,`Resource #${t+1}: view URL format looks invalid.`),o&&!i(o)&&a(`warn`,`Resource #${t+1}: download URL format looks invalid.`)})}if(n===`rubric_creator`){let e=d(r.rowCount,3),t=d(r.colCount,3);String(r.title||``).trim()||a(`warn`,`Rubric title is empty.`),r.rowCount!=null&&d(r.rowCount,3)!==Number.parseInt(r.rowCount,10)&&a(`warn`,`Rubric row count is clamped to ${e} (allowed ${l}-${u}).`),r.colCount!=null&&d(r.colCount,3)!==Number.parseInt(r.colCount,10)&&a(`warn`,`Rubric column count is clamped to ${t} (allowed ${l}-${u}).`);let n=Array.isArray(r.rows)?r.rows:[],i=Array.isArray(r.columns)?r.columns:[];n.length&&n.length!==e&&a(`warn`,`Rubric rows list does not match row count.`),i.length&&i.length!==t&&a(`warn`,`Rubric columns list does not match column count.`)}if(n===`knowledge_check`){let e=Array.isArray(r.questions)?r.questions:[];e.length?e.forEach((e,t)=>{let n=ae(e?.type||e?.kind);String(e?.prompt||``).trim()||a(`warn`,`Knowledge check question #${t+1} prompt is empty.`),n===`multiple_choice`&&(Array.isArray(e?.options)?e.options:[]).filter(e=>String(e||``).trim()).length<2&&a(`warn`,`Knowledge check question #${t+1} should have at least 2 options.`)}):(String(r.prompt||``).trim()||a(`warn`,`Knowledge check prompt is empty.`),(Array.isArray(r.options)?r.options:[]).length<2&&a(`warn`,`Knowledge check should have at least 2 options.`))}if(n===`worksheet_form`){let e=ie(r);e.length||a(`warn`,`Worksheet has no blocks yet.`),e.filter(e=>e.kind===`field`).length||a(`warn`,`Worksheet should include at least one input field.`)}if(n===`fillable_chart`){let e=re(r);e.rows.length||a(`warn`,`Fillable chart needs at least one row.`),e.columns.length||a(`warn`,`Fillable chart needs at least one column.`);let t=Array.isArray(r.rows)?r.rows:[],n=Array.isArray(r.columns)?r.columns:[];t.length&&t.length!==e.rowCount&&a(`warn`,`Fillable chart rows list does not match row count.`),n.length&&n.length!==e.colCount&&a(`warn`,`Fillable chart columns list does not match column count.`);let i=Array.isArray(r.cells)?r.cells:[],o=i.length>0&&i.length!==e.rowCount,s=i.some(t=>Array.isArray(t)&&t.length!==e.colCount);(o||s)&&a(`warn`,`Fillable chart cells grid does not match row/column counts.`),e.cells.flat().filter(e=>e.editable).length||a(`warn`,`Fillable chart has no editable cells for student responses.`)}if(n===`tab_group`){let e=Array.isArray(r.tabs)?r.tabs:[];e.length||a(`warn`,`Tab group has no tabs configured.`),e.forEach((e,t)=>{let n=Array.isArray(e?.activityIds)?e.activityIds.filter(Boolean):[],r=Array.isArray(e?.activities)?e.activities.filter(Boolean):[];!n.length&&!r.length&&a(`warn`,`Tab #${t+1} has no referenced or inline activities.`)})}if(n===`card_list`){let e=Array.isArray(r.cards)?r.cards:[];e.length||a(`warn`,`Card list has no cards configured.`),e.forEach((e,t)=>{let n=!!String(e?.targetActivityId||``).trim(),r=!!(e?.activity&&typeof e.activity==`object`),i=Array.isArray(e?.activities)&&e.activities.some(e=>e&&typeof e==`object`);!n&&!r&&!i&&a(`warn`,`Card #${t+1} has no target activity.`)})}n===`hotspot_image`&&(String(r.imageUrl||r.url||``).trim()||a(`warn`,`Hotspot image URL is empty.`),String(r.imageUrl||r.url||``).trim()&&!i(r.imageUrl||r.url)&&a(`warn`,`Hotspot image URL format looks invalid.`),(Array.isArray(r.hotspots)?r.hotspots:[]).length===0&&a(`warn`,`No hotspots defined yet.`));let o=E(r).reduce((e,t)=>e+xe(t),0);o>0&&a(`warn`,`${o} heading tag${o===1?``:`s`} appear empty.`);let s=Se(r.blockTextColor),c=Se(r.bodyContainerBg||r.blockContainerBg||r.containerBg);if(s&&c){let e=Ce(s,c);e>0&&e<3?a(`error`,`Text contrast is very low (${e.toFixed(2)}:1).`):e>0&&e<4.5&&a(`warn`,`Text contrast may be hard to read (${e.toFixed(2)}:1).`)}return t.filter(e=>e&&e.message)}function Ee(e){let t=Array.isArray(e)?e:[],n=t.map(e=>String(e?.id||``).trim()),r=new Set(n.filter(Boolean)),i=new Set(n.filter((e,t)=>e&&n.indexOf(e)!==t)),a=new Set;return t.forEach((e,t)=>{we(e,t).forEach(e=>a.add(e))}),t.map((e,t)=>{let n=String(e?.id||``).trim(),o=e?.type||``,s=Te(e),c=e?.data&&typeof e.data==`object`?e.data:{},l=e?.layout?.breakpoints?.mobile,u=l&&typeof l==`object`&&Object.keys(l).some(e=>l[e]!==``&&l[e]!=null);if(n?i.has(n)&&s.push({level:`error`,message:`Activity ID is duplicated. Duplicate IDs break references and preview selection.`}):s.push({level:`warn`,message:`Activity ID is missing.`}),!u){let t=Math.max(1,Number.parseInt(e?.layout?.colSpan,10)||1),n=Math.max(1,Number.parseInt(e?.layout?.col,10)||1),r=Math.max(0,Number.parseInt(e?.layout?.x,10)||0),i=Math.max(1,Number.parseInt(e?.layout?.w,10)||t);(t>1||n>1||r>0||i>1)&&s.push({level:`warn`,message:`No mobile override for this multi-column placement. It may overflow or feel cramped on small screens.`})}let d=new Set;return E(c).forEach(e=>{be(e).forEach(e=>{a.has(e)||d.add(e)})}),d.size>0&&s.push({level:`warn`,message:`Internal anchor target${d.size===1?``:`s`} missing: ${Array.from(d).join(`, `)}.`}),o===`tab_group`&&(Array.isArray(c.tabs)?c.tabs:[]).forEach((e,t)=>{let n=(Array.isArray(e?.activityIds)?e.activityIds:[]).map(e=>String(e||``).trim()).filter(e=>e&&!r.has(e));n.length>0&&s.push({level:`warn`,message:`Tab #${t+1} references missing activities: ${n.join(`, `)}.`})}),o===`card_list`&&(Array.isArray(c.cards)?c.cards:[]).forEach((e,t)=>{let n=String(e?.targetActivityId||``).trim();n&&!r.has(n)&&s.push({level:`warn`,message:`Card #${t+1} references missing activity: ${n}.`})}),{index:t,id:n,type:o,issues:s.filter(e=>e&&e.message)}})}function De(e){return(Array.isArray(e)?e:[]).reduce((e,t)=>((Array.isArray(t?.issues)?t.issues:[]).forEach(t=>{t?.level===`error`?e.error+=1:e.warn+=1}),e),{error:0,warn:0})}const Oe=`simple`,ke=[12,12],Ae=[12,12],je=[`tablet`,`mobile`];var Me=[`sm`,`md`,`lg`],Ne=[`card`,`flat`],Pe=[`xs`,`sm`,`md`,`lg`,`xl`];function Fe(e,t){let n=Number.parseInt(e,10);return Number.isFinite(n)?n:t}function O(e,t=1){let n=Number.parseInt(e,10);return Number.isFinite(n)?Math.max(1,n):t}function Ie(e,t=0){let n=Number.parseInt(e,10);return Number.isFinite(n)?Math.max(0,n):t}function Le(e,t,n,r){let i=Fe(e,r);return Math.max(t,Math.min(n,i))}function Re(e){let t=Number.parseInt(e,10);return Number.isFinite(t)}function ze(e,t){return`${e}:${t}`}function Be(e,t=[12,12]){let n=Array.isArray(e)?e:t;return[Le(n[0],0,200,t[0]),Le(n[1],0,200,t[1])]}function Ve(e){return String(e||``).trim().toLowerCase()===`canvas`?`canvas`:`simple`}function He(e){let t=String(e||``).trim().toLowerCase();return Ne.includes(t)?t:`card`}function Ue(e){let t=String(e||``).trim().toLowerCase();return Me.includes(t)?t:`md`}function We(e){let t=String(e||``).trim().toLowerCase();return Pe.includes(t)?t:`md`}function Ge(e,t){return!e||typeof e!=`object`?!1:t.some(t=>Object.prototype.hasOwnProperty.call(e,t)&&e[t]!==``&&e[t]!==null)}function Ke(e){let t=e&&typeof e==`object`?{...e}:{};return t.border=t.border!==!1,t.variant=He(t.variant),t.padding=Ue(t.padding),t.titleVariant=We(t.titleVariant),t}function qe(e){let t=e&&typeof e==`object`?{...e}:{};return t.collapsible=t.collapsible===!0,t.collapsedByDefault=t.collapsible?t.collapsedByDefault===!0:!1,t}function k(e){let t=Fe(e,1);return Math.max(1,Math.min(4,t))}function A(e,t=1){let n=k(t),r=Fe(e,1);return Math.max(1,Math.min(n,r))}function j(e){return O(e,1)}function M(e,t=1,n=1){let r=k(t),i=A(n,r),a=Math.max(1,r-i+1),o=O(e,1);return Math.min(o,a)}function N(e,t=1){return A(e,t)}function P(e,t=1,n=1){let r=k(t),i=N(n,r),a=Math.max(0,r-i),o=Ie(e,0);return Math.min(o,a)}function F(e){return Ie(e,0)}function I(e){return O(e,4)}function L(e){let t=e&&typeof e==`object`?{...e}:{};return t.mode=Ve(t.mode),t.maxColumns=k(t.maxColumns),t.rowHeight=Le(t.rowHeight,8,200,24),t.margin=Be(t.margin,ke),t.containerPadding=Be(t.containerPadding,Ae),t.simpleMatchTallestRow=t.simpleMatchTallestRow===!0,t}function Je(e,t,n,r,i){if(t<1||n<1||n+r-1>i)return!1;for(let i=n;i<n+r;i+=1)if(e.has(ze(t,i)))return!1;return!0}function Ye(e,t,n,r){for(let i=n;i<n+r;i+=1)e.add(ze(t,i))}function Xe(e,t,n,r,i){let a=Math.max(1,i-r+1),o=Math.max(1,t),s=Math.max(1,n);for(s>a&&(o+=1,s=1);;){if(s>a){o+=1,s=1;continue}if(Je(e,o,s,r,i))return{row:o,col:s};s+=1,s>i&&(o+=1,s=1)}}function Ze(e,t){let n=e&&typeof e==`object`?{...e}:{};return delete n.breakpoints,delete n.hidden,n.colSpan=A(n.colSpan,t),Re(n.row)?n.row=O(n.row,1):delete n.row,Re(n.col)?n.col=O(n.col,1):delete n.col,n.w=N(n.w??n.colSpan,t),n.x=P(n.x??(n.col||1)-1,t,n.w),n.y=F(n.y??(n.row||1)-1),n.h=I(n.h),n}function Qe(e,t){let n=e&&typeof e==`object`?{...e}:{};return delete n.breakpoints,delete n.hidden,n.w=N(n.w??n.colSpan,t),n.h=I(n.h),n.x=P(n.x??(n.col||1)-1,t,n.w),n.y=F(n.y??(n.row||1)-1),n.colSpan=A(n.colSpan??n.w,t),n.col=M(n.col||n.x+1,t,n.colSpan),n.row=j(n.row||n.y+1),n}function $e(e,t,n,r){let i=e&&typeof e==`object`?{...e}:null;if(!i)return null;let a=i.hidden===!0;if(n===`canvas`){if(!Ge(i,[`x`,`y`,`w`,`h`,`colSpan`,`col`,`row`])&&!a)return null;let e=Qe({...r&&typeof r==`object`?r:{},...i},t);return a&&(e.hidden=!0),e}if(!Ge(i,[`colSpan`,`row`,`col`])&&!a)return null;let o=Ze({...r&&typeof r==`object`?r:{},...i},t);return a&&(o.hidden=!0),o}function et(e,t,n,r){let i=e&&typeof e==`object`?e:null;if(!i)return null;let a={};return je.forEach(e=>{let o=$e(i[e],t,n,r);o&&(a[e]=o)}),Object.keys(a).length>0?a:null}function tt(e,t,{maxColumns:n=1,mode:r=Oe}={}){let i=String(t||``).trim().toLowerCase();if(!je.includes(i))return null;let a=R(e,0,n,r)?.layout?.breakpoints?.[i];return a&&typeof a==`object`?{...a}:null}function nt(e,t,{maxColumns:n=1,mode:r=Oe}={}){let i=R(e,0,n,r),a=String(t||`desktop`).trim().toLowerCase(),o=i?.layout&&typeof i.layout==`object`?{...i.layout}:{},s=o.breakpoints&&typeof o.breakpoints==`object`?o.breakpoints:{};if(delete o.breakpoints,!je.includes(a))return{...o,hidden:!1,hasOverride:!1};let c=s[a];return!c||typeof c!=`object`?{...o,hidden:!1,hasOverride:!1}:{...o,...c,hidden:c.hidden===!0,hasOverride:!0}}function R(e,t,n=1,r=Oe){let i=e&&typeof e==`object`?{...e}:{};i.type=i.type||`content_block`,i.id=i.id||`activity-${t+1}`,i.data=i.data&&typeof i.data==`object`?i.data:{},i.style=Ke(i.style),i.behavior=qe(i.behavior);let a=i.layout&&typeof i.layout==`object`?{...i.layout}:{},o=a.breakpoints;r===`canvas`?i.layout=Qe(a,n):i.layout=Ze(a,n);let s=et(o,n,r,i.layout);return s&&(i.layout.breakpoints=s),i}function rt(e,t=1,{fixedPlacement:n}={}){let r=k(t),i=Array.isArray(e)?e.map((e,t)=>R(e,t,r,`simple`)):[];if(i.length===0)return[];let a=i.map((e,t)=>{let n=A(e?.layout?.colSpan,r);return{index:t,colSpan:n,anchorRow:j(e?.layout?.row||1),anchorCol:M(e?.layout?.col||1,r,n)}}),o=Number.isInteger(n?.index)?n.index:null,s=new Set,c=new Map;if(o!==null&&o>=0&&o<a.length){let e=a[o],t=Xe(s,j(n?.row||e.anchorRow),M(n?.col||e.anchorCol,r,e.colSpan),e.colSpan,r);c.set(e.index,{row:t.row,col:t.col,colSpan:e.colSpan}),Ye(s,t.row,t.col,e.colSpan)}return a.filter(e=>e.index!==o).sort((e,t)=>e.anchorRow===t.anchorRow?e.anchorCol===t.anchorCol?e.index-t.index:e.anchorCol-t.anchorCol:e.anchorRow-t.anchorRow).forEach(e=>{let t=Xe(s,e.anchorRow,e.anchorCol,e.colSpan,r);c.set(e.index,{row:t.row,col:t.col,colSpan:e.colSpan}),Ye(s,t.row,t.col,e.colSpan)}),i.map((e,t)=>{let n=c.get(t)||{row:j(e?.layout?.row||1),col:M(e?.layout?.col||1,r,e?.layout?.colSpan||1),colSpan:A(e?.layout?.colSpan,r)};return{...e,layout:{...e.layout||{},colSpan:n.colSpan,row:n.row,col:n.col,w:N(e?.layout?.w??n.colSpan,r),h:I(e?.layout?.h),x:P(e?.layout?.x??n.col-1,r,e?.layout?.w??n.colSpan),y:F(e?.layout?.y??n.row-1)}}})}function it(e,t){return!(e.x+e.w<=t.x||t.x+t.w<=e.x||e.y+e.h<=t.y||t.y+t.h<=e.y)}function at(e,t){return!t.some(t=>it(e,t))}function ot(e,t=1){let n=k(t),r=Array.isArray(e)?e.map((e,t)=>R(e,t,n,`canvas`)):[];if(!r.length)return[];let i=r.map((e,t)=>({index:t,x:P(e.layout?.x,n,e.layout?.w),y:F(e.layout?.y),w:N(e.layout?.w,n),h:I(e.layout?.h)})).sort((e,t)=>e.y===t.y?e.x===t.x?e.index-t.index:e.x-t.x:e.y-t.y),a=[];i.forEach(e=>{let t=e.y,r=e.x,i={...e};for(;;){if(i.x=P(r,n,i.w),i.y=F(t),at(i,a)){a.push({...i});break}t+=1}});let o=new Map(a.map(e=>[e.index,e]));return r.map((e,t)=>{let r=o.get(t)||{x:0,y:0,w:1,h:4},i=A(e?.layout?.colSpan??r.w,n);return{...e,layout:{...e.layout||{},x:r.x,y:r.y,w:r.w,h:r.h,colSpan:i,col:M(e?.layout?.col||r.x+1,n,i),row:j(e?.layout?.row||r.y+1)}}})}function z(e,{maxColumns:t=1,mode:n=Oe}={}){let r=k(t),i=Ve(n);return Array.isArray(e)?i===`canvas`?ot(e,r):rt(e,r):[]}function st(e){let t=L(e?.composerLayout);return{composerLayout:t,activities:z(e?.activities,{maxColumns:t.maxColumns,mode:t.mode})}}function ct(e,t=1,{includeTrailingRow:n=!0,trailingRows:r=0}={}){let i=k(t),a=z(e,{maxColumns:i,mode:`simple`}).map((e,t)=>({index:t,row:j(e?.layout?.row||1),col:M(e?.layout?.col||1,i,e?.layout?.colSpan||1),colSpan:A(e?.layout?.colSpan,i)})),o=new Set;a.forEach(e=>{Ye(o,e.row,e.col,e.colSpan)});let s=a.reduce((e,t)=>Math.max(e,t.row),1),c=n&&Number.isInteger(r)?Math.max(0,r):0,l=a.length>0?s:1,u=Math.max(1,l+c),d=[];for(let e=1;e<=u;e+=1)for(let t=1;t<=i;t+=1)o.has(ze(e,t))||d.push({key:`slot-${e}-${t}`,row:e,col:t});return{maxColumns:i,rowCount:u,placements:a,emptySlots:d}}function lt(e,t,n,r,{maxColumns:i=1}={}){let a=k(i),o=z(e,{maxColumns:a,mode:`simple`});if(!Number.isInteger(t)||t<0||t>=o.length)return{activities:o,toIndex:t,changed:!1};let s=o[t],c=A(s?.layout?.colSpan,a),l=rt(o,a,{fixedPlacement:{index:t,row:j(n||s?.layout?.row||1),col:M(r||s?.layout?.col||1,a,c)}});return{activities:l,toIndex:t,changed:l.some((e,t)=>{let n=o[t]?.layout||{},r=e?.layout||{};return n.row!==r.row||n.col!==r.col||n.colSpan!==r.colSpan})}}const ut=[`auto`,`image`,`video`,`embed`],dt=[`activities`];function ft(e,t=`tab`){return String(e||``).trim().toLowerCase().replace(/[^a-z0-9_-]+/g,`-`).replace(/^-+|-+$/g,``)||t}function B(e){return e==null?``:String(e)}function pt(e){let t=String(e||``).trim().toLowerCase();return ut.includes(t)?t:`auto`}function V(e){let t=e&&typeof e==`object`?e:{},n=t.mediaUrl??t.image??``;return{title:B(t.title),subtitle:B(t.subtitle),progressLabel:B(t.progressLabel),mediaUrl:B(n),mediaType:pt(t.mediaType)}}function mt(e){let t=V(e),n=t.title.trim(),r=t.subtitle.trim(),i=t.progressLabel.trim(),a=t.mediaUrl.trim(),o=pt(t.mediaType),s={};return n&&(s.title=n),r&&(s.subtitle=r),i&&(s.progressLabel=i),a&&(s.mediaUrl=a),o!==`auto`&&(s.mediaType=o),Object.keys(s).length?s:null}var ht=/\.(mp4|webm|ogg|ogv|m4v|mov|m3u8)([?#].*)?$/i,gt=/(youtube\.com|youtu\.be|vimeo\.com|loom\.com|wistia\.)/i,_t=/\/embed\/|\/player\//i;function vt(e){let t=V(e),n=t.mediaUrl.trim();if(!n)return`none`;let r=pt(t.mediaType);if(r===`image`||r===`video`||r===`embed`)return r;let i=n.toLowerCase();return i.startsWith(`data:video/`)||ht.test(i)?`video`:_t.test(i)||gt.test(i)?`embed`:`image`}function H(e){let t=e&&typeof e==`object`?e:{};return{title:B(t.title||t.label),url:B(t.url||t.href),description:B(t.description||t.subtitle)}}function yt(e){return Array.isArray(e)?e.filter(e=>e&&typeof e==`object`).map(e=>{try{return JSON.parse(JSON.stringify(e))}catch{return{...e}}}):[]}function bt(e,t=0){let n=e&&typeof e==`object`?e:{},r=B(n.id||n.key||n.slug||`tab-${t+1}`),i=ft(r,`tab-${t+1}`),a=B(n.label||n.title||r||`Tab ${t+1}`),o=(Array.isArray(n.activityIds)?n.activityIds:[]).map(e=>B(e).trim()).filter(Boolean),s=(Array.isArray(n.links)?n.links:Array.isArray(n.additionalLinks)?n.additionalLinks:[]).map(e=>H(e));return{id:i,label:a,activityIds:o,...Object.prototype.hasOwnProperty.call(n,`activities`)?{activities:yt(n.activities)}:{},links:s}}function xt(e){let t=new Set;return e.map((e,n)=>{let r=bt(e,n),i=r.id,a=2;for(;t.has(i);)i=`${r.id}-${a}`,a+=1;return t.add(i),{...r,id:i}})}function St(e){let t=B(e.activitiesTabLabel||e.activitiesLabel||`Activities`),n=B(e.additionalTabLabel||e.additionalLabel||`Additional Learning`),r=Array.isArray(e.additionalLinks)?e.additionalLinks.map(e=>H(e)):[];return[{id:`activities`,label:t,activityIds:[],links:[]},{id:`additional`,label:n,activityIds:[],links:r}]}function Ct(e,t){let n=xt(e),r=new Map(n.map(e=>[e.id,e])),i=St(t),a=new Map(i.map(e=>[e.id,e]));dt.forEach(e=>{r.has(e)||r.set(e,bt(a.get(e)))});let o=n.map(e=>r.get(e.id)).filter(Boolean);return dt.forEach(e=>{o.some(t=>t.id===e)||o.push(r.get(e))}),o.map(e=>{let t=a.get(e.id);return{...e,label:B(e.label||t?.label||(e.id===`additional`?`Additional Learning`:`Activities`)),activityIds:Array.from(new Set((Array.isArray(e.activityIds)?e.activityIds:[]).map(e=>B(e).trim()).filter(Boolean))),...Object.prototype.hasOwnProperty.call(e,`activities`)?{activities:yt(e.activities)}:{},links:(Array.isArray(e.links)?e.links:[]).map(e=>H(e))}})}function wt(e){let t=e&&typeof e==`object`?e:{};return Ct(Array.isArray(t.tabs)&&t.tabs.length>0?t.tabs:St(t),t)}function U(e){let t=wt(e&&typeof e==`object`?e:{}),n=t.find(e=>e.id===`activities`),r=t.find(e=>e.id===`additional`),i=Array.isArray(r?.links)?r.links.map(e=>H(e)):[];return{activitiesTabLabel:B(n?.label||`Activities`),additionalTabLabel:B(r?.label||`Additional Learning`),additionalLinks:i,tabs:t}}function Tt(e){let t=U(e),n=Ct(Array.isArray(t.tabs)?t.tabs:[],t).map((e,t)=>{let n=B(e?.label||e?.id||`Tab ${t+1}`).trim()||`Tab ${t+1}`,r=ft(e?.id||`tab-${t+1}`,`tab-${t+1}`),i=Array.from(new Set((Array.isArray(e?.activityIds)?e.activityIds:[]).map(e=>B(e).trim()).filter(Boolean))),a=(Array.isArray(e?.links)?e.links:[]).map(e=>H(e)).map(e=>({title:e.title.trim(),url:e.url.trim(),description:e.description.trim()})).filter(e=>e.title||e.url||e.description).map(e=>({title:e.title||e.url||`Resource`,url:e.url,description:e.description}));return{id:r,label:n,activityIds:i,...Object.prototype.hasOwnProperty.call(e||{},`activities`)?{activities:yt(e?.activities)}:{},links:a}}).filter(e=>e.label||e.activityIds.length>0||e.links.length>0||Array.isArray(e.activities)&&e.activities.length>0),r=n.find(e=>e.id===`activities`)||{id:`activities`,label:`Activities`,activityIds:[],links:[]},i=n.find(e=>e.id===`additional`)||{id:`additional`,label:`Additional Learning`,activityIds:[],links:[]},a=B(r.label).trim()||`Activities`,o=B(i.label).trim()||`Additional Learning`,s=(Array.isArray(i.links)?i.links:[]).map(e=>H(e)).map(e=>({title:e.title.trim(),url:e.url.trim(),description:e.description.trim()})).filter(e=>e.title||e.url||e.description).map(e=>({title:e.title||e.url||`Resource`,url:e.url,description:e.description})),c={},l=U(null).tabs;return JSON.stringify(n)!==JSON.stringify(l)&&(c.tabs=n),a!==`Activities`&&(c.activitiesTabLabel=a),o!==`Additional Learning`&&(c.additionalTabLabel=o),s.length>0&&(c.additionalLinks=s),c.tabs&&(c.activitiesTabLabel=a,c.additionalTabLabel=o,c.additionalLinks=s),Object.keys(c).length?c:null}function Et(e){return typeof e==`object`&&!!e&&!Array.isArray(e)}function Dt(e){return String(e||``).replace(/([a-z0-9])([A-Z])/g,`$1 $2`).replace(/[_-]+/g,` `).replace(/\s+/g,` `).trim().replace(/^\w/,e=>e.toUpperCase())}function Ot(e){let t=[];return String(e||``).replace(/([^[.\]]+)|\[(\d+)\]/g,(e,n,r)=>(n?t.push(n):t.push(Number.parseInt(r,10)),``)),t}function kt(e,t){return Ot(t).reduce((e,t)=>{if(e!=null)return e[t]},e)}function At(e,t,n){let r=Ot(t);if(!r.length)return e;let i=Array.isArray(e)?[...e]:{...e&&typeof e==`object`?e:{}},a=i;return r.forEach((e,t)=>{if(t===r.length-1){a[e]=n;return}let i=r[t+1],o=a[e],s;s=Array.isArray(o)?[...o]:o&&typeof o==`object`?{...o}:typeof i==`number`?[]:{},a[e]=s,a=s}),i}function jt(e){return e==null?``:typeof e==`string`?e:typeof e==`number`||typeof e==`boolean`?String(e):``}function Mt(e){let t=String(e||``).trim();return t?/(title|label|text|body|subtitle|description|caption|heading|summary|prompt|author|placeholder|progress|kicker|eyebrow|quote|name|url|href|alt|button|cta)/i.test(t):!1}function Nt(e,t=[],n=[]){if(Array.isArray(e))return e.forEach((e,r)=>Nt(e,[...t,r],n)),n;if(Et(e))return Object.entries(e).forEach(([e,r])=>Nt(r,[...t,e],n)),n;let r=t[t.length-1];if(!Mt(r)||!(typeof e==`string`||e==null))return n;let i=t.map(e=>typeof e==`number`?`${e+1}`:Dt(e)).join(` / `),a=t.map((e,t)=>typeof e==`number`?`[${e}]`:t===0?e:`.${e}`).join(``);return n.push({path:a,label:i,value:typeof e==`string`?e:``}),n}const Pt=[{value:`course.name`,label:`Course Name`},{value:`course.theme`,label:`Course Theme`},{value:`module.title`,label:`Module Title`},{value:`module.id`,label:`Module ID`},{value:`module.template`,label:`Module Template`},{value:`module.theme`,label:`Module Theme`},{value:`module.blockCount`,label:`Module Block Count`},{value:`date.today`,label:`Today (YYYY-MM-DD)`},{value:`date.year`,label:`Current Year`}];function Ft(e){return`{{${String(e||``).trim()}}}`}function It(e,{courseSettings:t={},activities:n=[],activity:r=null}={}){let i=new Date;return{course:{name:String(t?.courseName||t?.__courseName||``).trim()||`Course`,theme:String(t?.themeDefault||t?.theme||``).trim()||``},module:{id:String(e?.id||``).trim()||``,title:String(e?.title||``).trim()||``,template:String(e?.template||``).trim()||``,theme:String(e?.theme||``).trim()||``,blockCount:Array.isArray(n)?n.length:0},activity:{id:String(r?.id||``).trim()||``,type:String(r?.type||``).trim()||``},date:{today:i.toISOString().slice(0,10),year:String(i.getFullYear())}}}function Lt(e,t){return jt(kt(t,e))}function Rt(e,t){let n=String(e??``);return n.includes(`{{`)?n.replace(/\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g,(e,n)=>Lt(n,t)):n}function W(e,t){return typeof e==`string`?Rt(e,t):Array.isArray(e)?e.map(e=>W(e,t)):Et(e)?Object.fromEntries(Object.entries(e).map(([e,n])=>[e,W(n,t)])):e}function zt(e,t){return!e||typeof e!=`object`?e:{...e,data:W(e.data||{},t),style:W(e.style||{},t),behavior:W(e.behavior||{},t)}}function Bt(e){return Nt(e?.data&&typeof e.data==`object`?e.data:{})}function Vt(e,t,n){let r=String(t||``).trim(),i=String(n||``).trim();return!r||!i||!e||typeof e!=`object`?e:{...e,data:At(e.data&&typeof e.data==`object`?e.data:{},r,Ft(i))}}const Ht=[{value:`dark_cards`,label:`Dark Cards`},{value:`finlit_clean`,label:`FinLit Clean`},{value:`coursebook_light`,label:`Coursebook Light`},{value:`toolkit_clean`,label:`Toolkit Clean`},{value:`saas_clean`,label:`SaaS Clean`},{value:`lms_pastel`,label:`LMS Pastel`},{value:`crypto_neon`,label:`Crypto Neon`}],Ut=Ht.map(e=>e.value),Wt=[{value:`foundation`,label:`Foundation`},{value:`premium_dribbble`,label:`Premium (Dribbble-grade)`}].map(e=>e.value);function Gt(e,t=`dark_cards`){let n=String(e||``).trim().toLowerCase();return n&&Ut.includes(n)?n:t}function Kt(e,t=`premium_dribbble`){let n=String(e||``).trim().toLowerCase();return n&&Wt.includes(n)?n:t}function G(e){return String(e??``).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#39;`)}function qt(e){let t=String(e||``).trim();return t?/^(https?:|mailto:|tel:)/i.test(t)||/^(\/|\.\/|\.\.\/|#)/.test(t)?t:/^materials\//i.test(t)?`/${t}`:``:``}var Jt={Arial:`Arial, Helvetica, sans-serif`,Helvetica:`Helvetica, Arial, sans-serif`,Verdana:`Verdana, Geneva, sans-serif`,Tahoma:`Tahoma, Geneva, sans-serif`,"Trebuchet MS":`Trebuchet MS, Helvetica, sans-serif`,"Segoe UI":`Segoe UI, Tahoma, sans-serif`,Georgia:`Georgia, serif`,Garamond:`Garamond, serif`,"Palatino Linotype":`Palatino Linotype, Book Antiqua, Palatino, serif`,"Times New Roman":`Times New Roman, Times, serif`,"Courier New":`Courier New, Courier, monospace`,"Lucida Console":`Lucida Console, Monaco, monospace`,Impact:`Impact, Haettenschweiler, Arial Narrow Bold, sans-serif`,"Comic Sans MS":`Comic Sans MS, Comic Sans, cursive`,Inter:`Inter, sans-serif`,Roboto:`Roboto, sans-serif`,"Open Sans":`Open Sans, sans-serif`,Lato:`Lato, sans-serif`,Montserrat:`Montserrat, sans-serif`,Poppins:`Poppins, sans-serif`,Raleway:`Raleway, sans-serif`,Nunito:`Nunito, sans-serif`,"Playfair Display":`Playfair Display, serif`,Merriweather:`Merriweather, serif`,Oswald:`Oswald, sans-serif`,"Bebas Neue":`Bebas Neue, sans-serif`},Yt={default:null,slate:{textColor:`#dbe3ee`,containerBg:`rgba(15, 23, 42, 0.82)`,borderColor:`rgba(71, 85, 105, 0.7)`,accentColor:`#7dd3fc`},ocean:{textColor:`#dbeafe`,containerBg:`rgba(30, 58, 138, 0.45)`,borderColor:`rgba(96, 165, 250, 0.7)`,accentColor:`#38bdf8`},forest:{textColor:`#dcfce7`,containerBg:`rgba(20, 83, 45, 0.5)`,borderColor:`rgba(74, 222, 128, 0.6)`,accentColor:`#4ade80`},sunset:{textColor:`#ffedd5`,containerBg:`rgba(154, 52, 18, 0.45)`,borderColor:`rgba(251, 146, 60, 0.65)`,accentColor:`#fb923c`},mono:{textColor:`#f8fafc`,containerBg:`rgba(17, 24, 39, 0.82)`,borderColor:`rgba(148, 163, 184, 0.6)`,accentColor:`#cbd5e1`}},Xt={tablet:`(max-width: 1024px)`,mobile:`(max-width: 640px)`};function Zt(e){let t=String(e||``).trim();return/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(t)?t:``}function Qt(e){let t=String(e||``).trim().toLowerCase();return Object.prototype.hasOwnProperty.call(Yt,t)?t:`default`}function $t(e){return Jt[String(e||``).trim()]||``}function en(e={}){let t=Qt(e.blockTheme),n=Yt[t];return{themeKey:t,fontFamily:$t(e.blockFontFamily),textColor:Zt(e.blockTextColor)||n?.textColor||``,containerBg:Zt(e.blockContainerBg||e.containerBg)||n?.containerBg||``,borderColor:n?.borderColor||``,accentColor:n?.accentColor||``}}function tn(){return`
    (function() {
      if (window.__CF_COMPOSER_RUNTIME_BOUND__) return;
      window.__CF_COMPOSER_RUNTIME_BOUND__ = true;

      function normalizeSpace(value) {
        return String(value || '').replace(/\\s+/g, ' ').trim();
      }

      function closest(el, selector) {
        while (el) {
          if (el.matches && el.matches(selector)) return el;
          el = el.parentElement;
        }
        return null;
      }

      function resolveViewerUrl(rawUrl) {
        var url = resolveAssetUrl(rawUrl);
        if (!url) return '';
        if (url.indexOf('docs.google.com/viewer') !== -1) return url;

        function isGoogleSitesHost() {
          var ref = '';
          try { ref = document.referrer || ''; } catch (e) { ref = ''; }
          if (/sites\\.google\\.com/i.test(ref)) return true;
          try { return /sites\\.google\\.com/i.test(window.top.location.host || ''); } catch (e) { return /sites\\.google\\.com/i.test(ref); }
        }

        var clean = String(url).trim();
        if (!clean) return clean;

        // Prefer direct Drive preview URLs.
        var isDrive = /docs\\.google\\.com|drive\\.google\\.com/i.test(clean);
        if (isDrive) {
          var driveIdMatch = clean.match(/\\/file\\/d\\/([a-zA-Z0-9_-]+)/i) || clean.match(/[?&]id=([a-zA-Z0-9_-]+)/i);
          if (driveIdMatch && driveIdMatch[1]) {
            return 'https://drive.google.com/file/d/' + driveIdMatch[1] + '/preview';
          }
          if (clean.indexOf('/view') !== -1) {
            return clean.replace('/view', '/preview');
          }
          return clean;
        }

        // Never route local/same-origin URLs through Google Docs Viewer.
        if (/^(\\/|\\.\\/|\\.\\.\\/|blob:|data:)/i.test(clean)) {
          return clean;
        }
        var isSameOrigin = false;
        try {
          var parsed = new URL(clean, window.location.href);
          isSameOrigin = parsed.origin === window.location.origin;
        } catch (e) {
          isSameOrigin = false;
        }
        if (isSameOrigin) {
          return clean;
        }

        // Google Sites embeds often need the Docs viewer, but only for public absolute URLs.
        var forceViewer = isGoogleSitesHost() || window.CF_FORCE_PDF_VIEWER === true;
        if (forceViewer && /^https?:\\/\\//i.test(clean)) {
          return 'https://docs.google.com/viewer?embedded=true&url=' + encodeURIComponent(clean);
        }

        return clean;
      }

      function resolveAssetUrl(rawUrl) {
        var url = String(rawUrl || '').trim();
        if (!url) return '';

        // Keep absolute/remote URLs untouched.
        if (/^(https?:|data:|blob:|mailto:)/i.test(url)) return url;
        if (/^\\/\\//.test(url)) return url;

        function smartJoin(base, path) {
          if (!base) return path;
          var baseClean = String(base).replace(/\\/$/, '');
          if (!path || !/^\\//.test(path)) return baseClean + '/' + path;
          var baseParts = baseClean.split('/');
          var lastBaseSegment = baseParts[baseParts.length - 1];
          if (lastBaseSegment && path.indexOf('/' + lastBaseSegment + '/') === 0) {
            return baseClean + path.substring(lastBaseSegment.length + 1);
          }
          return baseClean + path;
        }

        function normalizeLocalMaterialPath(value) {
          var clean = String(value || '').trim();
          var idx = clean.indexOf('/materials/');
          if (idx !== -1) return clean.substring(idx);
          if (/^materials\\//.test(clean)) return '/' + clean;
          return clean;
        }

        function getOriginalLocalMaterialPath(value) {
          var clean = String(value || '').trim();
          var idx = clean.indexOf('/materials/');
          if (idx !== -1) {
            var withPrefix = clean;
            return withPrefix.startsWith('/') ? withPrefix : ('/' + withPrefix);
          }
          if (/^materials\\//.test(clean)) return '/' + clean;
          if (/^\\/materials\\//.test(clean)) return clean;
          return '';
        }

        // Use configured asset base URL when available (Google Sites / CDN).
        var baseUrl = String(window.CF_ASSET_BASE_URL || '').trim().replace(/\\/$/, '');
        var materialPath = normalizeLocalMaterialPath(url);
        var originalMaterialPath = getOriginalLocalMaterialPath(url);
        if (baseUrl && /^\\/materials\\//.test(materialPath)) {
          return smartJoin(baseUrl, materialPath);
        }

        // For embedded/hosted contexts without base URL, prefer preserving the original absolute path.
        if (originalMaterialPath) {
          var pathname = window.location && window.location.pathname ? window.location.pathname : '';
          var host = window.location && window.location.hostname ? window.location.hostname : '';
          var inGoogleEmbed = /googleusercontent\\.com|sites\\.google\\.com/i.test(host) || /\\/embeds\\//.test(pathname);
          if (inGoogleEmbed) {
            return originalMaterialPath;
          }
        }

        // Normalize known local materials paths so they work in local exported modules and ZIPs.
        if (/^\\/materials\\//.test(materialPath)) {
          var rel = materialPath.substring(1); // materials/...
          var path = window.location && window.location.pathname ? window.location.pathname : '';
          var inModulesDir = /\\/modules\\//.test(path) || window.location.protocol === 'file:';
          return inModulesDir ? ('../' + rel) : rel;
        }

        if (/^\\//.test(url)) return url;
        return url;
      }

      function getSubmissionContext(target) {
        var block = closest(target, '[data-submission-block]');
        if (!block) return null;
        return {
          block: block,
          output: block.querySelector('[data-submission-output]'),
        };
      }

      function getSaveLoadContext(target) {
        var block = closest(target, '[data-save-load-block]');
        if (!block) return null;
        return {
          block: block,
          root: closest(block, '[data-composer-root]') || document,
          input: block.querySelector('[data-save-load-upload-input]'),
          status: block.querySelector('[data-save-load-status]'),
          fileName: block.getAttribute('data-save-load-file-name') || 'module-progress',
        };
      }

      function setSaveLoadStatus(ctx, message, tone) {
        if (!ctx || !ctx.status) return;
        var normalizedTone = tone === 'error' ? 'error' : tone === 'success' ? 'success' : 'info';
        var toneClass = normalizedTone === 'error' ? 'tone-danger' : normalizedTone === 'success' ? 'tone-success' : 'tone-info';
        ctx.status.className = 'mt-3 text-xs cf-status-message ' + toneClass;
        ctx.status.textContent = message;
      }

      function getPersistableFields(root) {
        return Array.prototype.slice.call(root.querySelectorAll('input, textarea, select')).filter(function(field) {
          if (closest(field, '[data-submission-block]')) return false;
          if (closest(field, '[data-save-load-block]')) return false;
          var tag = String(field.tagName || '').toLowerCase();
          var type = String(field.type || '').toLowerCase();
          if (tag === 'input' && (type === 'hidden' || type === 'file' || type === 'button' || type === 'submit' || type === 'reset' || type === 'image')) {
            return false;
          }
          return true;
        });
      }

      function ensureSortItemIds(list, listIndex) {
        if (!list) return;
        Array.prototype.slice.call(list.querySelectorAll('[data-sort-item]')).forEach(function(item, itemIndex) {
          if (!item.getAttribute('data-sort-item-id')) {
            item.setAttribute('data-sort-item-id', 'sort-' + listIndex + '-item-' + itemIndex);
          }
        });
      }

      function collectInteractiveUiState(root) {
        var tabs = Array.prototype.slice.call(root.querySelectorAll('[data-tabs-block]')).map(function(block) {
          var activeTrigger = block.querySelector('[data-tabs-trigger][aria-selected="true"]');
          if (!activeTrigger) activeTrigger = block.querySelector('[data-tabs-trigger]');
          var idx = parseInt((activeTrigger && activeTrigger.getAttribute('data-tab-index')) || '0', 10);
          return Number.isInteger(idx) ? idx : 0;
        });

        var pathMaps = Array.prototype.slice.call(root.querySelectorAll('[data-path-map-block]')).map(function(block) {
          var activeNode = block.querySelector('[data-path-node].is-active') || block.querySelector('[data-path-node]');
          var idx = parseInt((activeNode && activeNode.getAttribute('data-path-index')) || '0', 10);
          return Number.isInteger(idx) ? idx : 0;
        });

        var hotspots = Array.prototype.slice.call(root.querySelectorAll('[data-hotspot-block]')).map(function(block) {
          var activeButton = block.querySelector('[data-hotspot-btn].is-active') || block.querySelector('[data-hotspot-btn]');
          var idx = parseInt((activeButton && activeButton.getAttribute('data-hotspot-index')) || '0', 10);
          return Number.isInteger(idx) ? idx : 0;
        });

        var flashcards = Array.prototype.slice.call(root.querySelectorAll('[data-flashcards-block]')).map(function(block) {
          return Array.prototype.slice
            .call(block.querySelectorAll('[data-flashcard]'))
            .map(function(card, cardIndex) {
              return card.getAttribute('data-flashcard-side') === 'back' ? cardIndex : null;
            })
            .filter(function(index) { return index !== null; });
        });

        var sortLists = Array.prototype.slice.call(root.querySelectorAll('[data-sort-list]')).map(function(list, listIndex) {
          ensureSortItemIds(list, listIndex);
          return Array.prototype.slice
            .call(list.querySelectorAll('[data-sort-item]'))
            .map(function(item) { return item.getAttribute('data-sort-item-id') || ''; })
            .filter(Boolean);
        });

        return {
          tabs: tabs,
          pathMaps: pathMaps,
          hotspots: hotspots,
          flashcards: flashcards,
          sortLists: sortLists,
        };
      }

      function applyInteractiveUiState(root, uiState) {
        var state = uiState && typeof uiState === 'object' ? uiState : {};

        Array.prototype.slice.call(root.querySelectorAll('[data-tabs-block]')).forEach(function(block, idx) {
          if (!Array.isArray(state.tabs)) return;
          var next = parseInt(state.tabs[idx], 10);
          if (!Number.isInteger(next)) return;
          setActiveTab(block, next);
        });

        Array.prototype.slice.call(root.querySelectorAll('[data-path-map-block]')).forEach(function(block, idx) {
          if (!Array.isArray(state.pathMaps)) return;
          var next = parseInt(state.pathMaps[idx], 10);
          if (!Number.isInteger(next)) return;
          setPathMapIndex(block, next);
        });

        Array.prototype.slice.call(root.querySelectorAll('[data-hotspot-block]')).forEach(function(block, idx) {
          if (!Array.isArray(state.hotspots)) return;
          var next = parseInt(state.hotspots[idx], 10);
          if (!Number.isInteger(next)) return;
          setHotspotIndex(block, next);
        });

        Array.prototype.slice.call(root.querySelectorAll('[data-flashcards-block]')).forEach(function(block, idx) {
          var openIndexes = Array.isArray(state.flashcards) && Array.isArray(state.flashcards[idx]) ? state.flashcards[idx] : [];
          var openSet = new Set(openIndexes.map(function(value) { return parseInt(value, 10); }));
          Array.prototype.slice.call(block.querySelectorAll('[data-flashcard]')).forEach(function(card, cardIndex) {
            setFlashcardFace(card, openSet.has(cardIndex));
          });
        });

        Array.prototype.slice.call(root.querySelectorAll('[data-sort-list]')).forEach(function(list, listIndex) {
          ensureSortItemIds(list, listIndex);
          if (!(Array.isArray(state.sortLists) && Array.isArray(state.sortLists[listIndex]))) return;
          var desiredOrder = state.sortLists[listIndex];
          var byId = {};
          Array.prototype.slice.call(list.querySelectorAll('[data-sort-item]')).forEach(function(item) {
            byId[item.getAttribute('data-sort-item-id') || ''] = item;
          });
          desiredOrder.forEach(function(itemId) {
            var item = byId[itemId];
            if (item) list.appendChild(item);
          });
          refreshSortRanks(list);
        });
      }

      function collectModuleProgressSnapshot(root) {
        var fields = getPersistableFields(root).map(function(field) {
          var tag = String(field.tagName || '').toLowerCase();
          var type = String(field.type || '').toLowerCase();
          if (type === 'checkbox' || type === 'radio') {
            return {
              tag: tag,
              type: type,
              checked: Boolean(field.checked),
            };
          }
          return {
            tag: tag,
            type: type,
            value: String(field.value || ''),
          };
        });

        return {
          kind: 'course-factory-module-progress',
          version: 1,
          savedAt: new Date().toISOString(),
          fields: fields,
          ui: collectInteractiveUiState(root),
        };
      }

      function applyModuleProgressSnapshot(root, snapshot) {
        if (!snapshot || typeof snapshot !== 'object') {
          return { ok: false, message: 'Invalid progress payload.' };
        }
        var records = Array.isArray(snapshot.fields) ? snapshot.fields : [];
        if (!records.length) {
          return { ok: false, message: 'No saved fields found in this file.' };
        }

        var fields = getPersistableFields(root);
        var appliedCount = 0;
        records.forEach(function(record, idx) {
          var field = fields[idx];
          if (!field) return;
          var tag = String(field.tagName || '').toLowerCase();
          var type = String(field.type || '').toLowerCase();
          if (type === 'checkbox' || type === 'radio') {
            field.checked = Boolean(record && record.checked);
            appliedCount += 1;
            return;
          }
          var nextValue = record && Object.prototype.hasOwnProperty.call(record, 'value') ? String(record.value || '') : '';
          field.value = nextValue;
          appliedCount += 1;
          if (tag === 'select' || type === 'range') return;
        });

        applyInteractiveUiState(root, snapshot.ui || {});

        Array.prototype.slice.call(root.querySelectorAll('[data-checklist-block]')).forEach(function(block) {
          refreshChecklistBlock(block, true);
        });
        Array.prototype.slice.call(root.querySelectorAll('[data-before-after-block]')).forEach(function(block) {
          refreshBeforeAfterBlock(block);
        });
        Array.prototype.slice.call(root.querySelectorAll('[data-decision-block]')).forEach(function(block) {
          refreshDecisionBlock(block);
        });
        Array.prototype.slice.call(root.querySelectorAll('[data-rubric-block]')).forEach(function(block) {
          refreshRubricBlock(block);
        });

        return { ok: true, message: 'Restored ' + appliedCount + ' fields from backup.' };
      }

      function downloadModuleProgressSnapshot(ctx, snapshot) {
        var baseName = String((ctx && ctx.fileName) || 'module-progress').replace(/[^a-z0-9._-]/gi, '-').trim() || 'module-progress';
        var fileName = /\\.json$/i.test(baseName) ? baseName : (baseName + '.json');
        var blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json;charset=utf-8' });
        var link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(function() {
          URL.revokeObjectURL(link.href);
        }, 500);
      }

      function getReadableText(el, fallback) {
        if (!el) return fallback || '';
        var text = normalizeSpace(el.innerText || el.textContent || '');
        return text || fallback || '';
      }

      function getSectionTitle(section, fallback) {
        if (!section) return fallback || 'Section';
        var titleEl = section.querySelector('h3, h2, h4');
        return getReadableText(titleEl, fallback || 'Section');
      }

      function readFieldLabel(field, scope, fallback) {
        if (!field) return fallback || 'Response';
        var labelEl = null;
        var id = field.id;
        if (id) {
          try {
            labelEl = scope.querySelector('label[for="' + id.replace(/"/g, '\\"') + '"]');
          } catch (err) {
            labelEl = null;
          }
        }
        if (!labelEl) labelEl = closest(field, 'label');
        var raw = labelEl ? getReadableText(labelEl, '') : '';
        if (!raw && field.getAttribute) raw = normalizeSpace(field.getAttribute('aria-label') || '');
        if (!raw) raw = normalizeSpace(field.name || field.id || field.placeholder || '');
        return raw || fallback || 'Response';
      }

      function readFieldValue(field) {
        if (!field) return '';
        var tag = String(field.tagName || '').toLowerCase();
        var type = String(field.type || '').toLowerCase();
        if (type === 'checkbox') return field.checked ? 'Yes' : '';
        if (tag === 'select') {
          var selected = field.options && field.selectedIndex >= 0 ? field.options[field.selectedIndex] : null;
          var selectedText = selected ? normalizeSpace(selected.innerText || selected.text || '') : '';
          return selectedText || normalizeSpace(field.value || '');
        }
        return normalizeSpace(field.value || '');
      }

      function formatNumericValue(value) {
        var parsed = Number(value);
        if (!Number.isFinite(parsed)) return '0';
        var rounded = Math.round(parsed * 100) / 100;
        return String(rounded);
      }

      function collectFilledFieldLines(scope, options) {
        var config = options || {};
        var lines = [];
        var textFields = Array.prototype.slice.call(
          scope.querySelectorAll('input:not([type="hidden"]):not([type="radio"]):not([type="checkbox"]), textarea, select'),
        );
        textFields.forEach(function(field, idx) {
          if (closest(field, '[data-submission-block]')) return;
          if (Array.isArray(config.excludeSelectors) && config.excludeSelectors.some(function(selector) { return closest(field, selector); })) return;
          var value = readFieldValue(field);
          if (!value) return;
          var fallbackLabel = 'Response ' + (idx + 1);
          var label = readFieldLabel(field, scope, fallbackLabel);
          lines.push(label + ': ' + value);
        });

        if (config.includeCheckedCheckboxes !== false) {
          var checkboxes = Array.prototype.slice.call(scope.querySelectorAll('input[type="checkbox"]'));
          checkboxes.forEach(function(field) {
            if (closest(field, '[data-submission-block]')) return;
            if (Array.isArray(config.excludeSelectors) && config.excludeSelectors.some(function(selector) { return closest(field, selector); })) return;
            if (!field.checked) return;
            var label = readFieldLabel(field, scope, 'Checkbox');
            lines.push(label + ': Yes');
          });
        }

        if (config.includeRadioSelections !== false) {
          var radios = Array.prototype.slice.call(scope.querySelectorAll('input[type="radio"]'));
          var radioGroups = {};
          radios.forEach(function(field, idx) {
            if (closest(field, '[data-submission-block]')) return;
            if (Array.isArray(config.excludeSelectors) && config.excludeSelectors.some(function(selector) { return closest(field, selector); })) return;
            var key = field.name || ('__radio_' + idx);
            if (!radioGroups[key]) radioGroups[key] = [];
            radioGroups[key].push(field);
          });
          Object.keys(radioGroups).forEach(function(key) {
            var group = radioGroups[key];
            if (!group || !group.length) return;
            var selected = null;
            group.forEach(function(field) {
              if (field.checked) selected = field;
            });
            if (!selected) return;
            var optionWrap = closest(selected, 'label');
            var optionText = optionWrap ? getReadableText(optionWrap, '') : '';
            if (!optionText) optionText = normalizeSpace(selected.value || 'Selected');
            var label = key && key.indexOf('__radio_') !== 0 ? key : 'Selected Option';
            lines.push(label + ': ' + optionText);
          });
        }

        return lines;
      }

      function pushReportSection(targetLines, title, lines) {
        if (!lines || !lines.length) return;
        targetLines.push('[' + title + ']');
        lines.forEach(function(line) {
          targetLines.push('- ' + line);
        });
        targetLines.push('');
      }

      function buildSubmissionReport(root) {
        var reportLines = [];
        var sections = Array.prototype.slice.call(root.querySelectorAll('[data-activity-type]'));

        sections.forEach(function(section, sectionIdx) {
          var type = normalizeSpace(section.getAttribute('data-activity-type') || '').toLowerCase();
          if (!type || type === 'submission_builder' || type === 'save_load_block') return;
          var title = getSectionTitle(section, 'Activity ' + (sectionIdx + 1));
          var lines = [];

          if (type === 'knowledge_check') {
            var block = section.querySelector('[data-kc-block]');
            if (!block) return;
            var title = getReadableText(block.querySelector('h3'), 'Knowledge Check');
            lines.push('Set: ' + title);
            var questionNodes = Array.prototype.slice.call(block.querySelectorAll('[data-kc-question]'));
            if (questionNodes.length) {
              questionNodes.forEach(function(questionNode, qIdx) {
                var kind = normalizeSpace(questionNode.getAttribute('data-kc-kind') || '').toLowerCase();
                var prompt = getReadableText(questionNode.querySelector('[data-kc-prompt]'), 'Question ' + (qIdx + 1));
                if (kind === 'short_answer') {
                  var responseField = questionNode.querySelector('[data-kc-short-answer]');
                  var responseText = normalizeSpace((responseField && responseField.value) || '');
                  lines.push('Q' + (qIdx + 1) + ': ' + prompt);
                  lines.push('Response: ' + (responseText || '[No response]'));
                  return;
                }
                var selected = questionNode.querySelector('input[type="radio"]:checked');
                var selectedLabel = '[No selection]';
                var outcome = 'Not answered';
                if (selected) {
                  var labelWrap = closest(selected, 'label');
                  selectedLabel = labelWrap ? getReadableText(labelWrap, 'Option ' + (selected.value || '?')) : ('Option ' + (selected.value || '?'));
                  var correct = parseInt(questionNode.getAttribute('data-kc-correct') || '0', 10);
                  var picked = parseInt(selected.value || '-1', 10);
                  if (!isNaN(correct) && !isNaN(picked)) {
                    outcome = picked === correct ? 'Correct' : 'Incorrect';
                  }
                }
                lines.push('Q' + (qIdx + 1) + ': ' + prompt);
                lines.push('Selected Answer: ' + selectedLabel);
                lines.push('Result: ' + outcome);
              });
            } else {
              // Legacy knowledge-check markup fallback.
              var prompt = getReadableText(block.querySelector('h3'), 'Knowledge Check');
              var selected = block.querySelector('input[type="radio"]:checked');
              var selectedLabel = '[No selection]';
              var outcome = 'Not answered';
              if (selected) {
                var labelWrap = closest(selected, 'label');
                selectedLabel = labelWrap ? getReadableText(labelWrap, 'Option ' + (selected.value || '?')) : ('Option ' + (selected.value || '?'));
                var correct = parseInt(block.getAttribute('data-kc-correct') || '0', 10);
                var picked = parseInt(selected.value || '-1', 10);
                if (!isNaN(correct) && !isNaN(picked)) {
                  outcome = picked === correct ? 'Correct' : 'Incorrect';
                }
              }
              lines.push('Prompt: ' + prompt);
              lines.push('Selected Answer: ' + selectedLabel);
              lines.push('Result: ' + outcome);
              var shortAnswer = block.querySelector('[data-kc-short-answer]');
              if (shortAnswer) {
                var shortAnswerText = normalizeSpace(shortAnswer.value || '');
                lines.push('Reflection: ' + (shortAnswerText || '[No response]'));
              }
            }
          } else if (type === 'checklist_block') {
            var checklist = section.querySelector('[data-checklist-block]');
            if (!checklist) return;
            var checklistInputs = Array.prototype.slice.call(checklist.querySelectorAll('[data-checklist-input]'));
            var checkedCount = checklistInputs.filter(function(input) { return input.checked; }).length;
            var total = checklistInputs.length;
            lines.push('Progress: ' + checkedCount + ' / ' + total + ' complete');
            checklistInputs.forEach(function(input) {
              var row = closest(input, 'label');
              var textEl = row ? row.querySelector('span') : null;
              var itemText = getReadableText(textEl, 'Checklist item');
              lines.push((input.checked ? '[x] ' : '[ ] ') + itemText);
            });
          } else if (type === 'drag_sort_block') {
            var sortList = section.querySelector('[data-sort-list]');
            if (!sortList) return;
            var sortItems = Array.prototype.slice.call(sortList.querySelectorAll('[data-sort-item]'));
            if (!sortItems.length) return;
            lines.push('Current Order:');
            sortItems.forEach(function(item, idx) {
              var labelEl = item.querySelector('div span:last-child');
              var itemText = getReadableText(labelEl, getReadableText(item, 'Item ' + (idx + 1)));
              itemText = normalizeSpace(itemText.replace(/\\bUp\\b/g, '').replace(/\\bDown\\b/g, ''));
              lines.push(String(idx + 1) + '. ' + itemText);
            });
          } else if (type === 'reflection_journal') {
            var reflectionPrompt = getReadableText(section.querySelector('p'), 'Reflection Prompt');
            var reflectionInput = section.querySelector('textarea');
            var reflectionValue = normalizeSpace((reflectionInput && reflectionInput.value) || '');
            lines.push('Prompt: ' + reflectionPrompt);
            lines.push('Response: ' + (reflectionValue || '[No response]'));
          } else if (type === 'worksheet_form') {
            lines = collectFilledFieldLines(section, { includeCheckedCheckboxes: false, includeRadioSelections: false });
            if (!lines.length) lines.push('No worksheet fields filled yet.');
          } else if (type === 'portfolio_evidence') {
            var artifactInput = section.querySelector('input[type="text"]');
            var summaryInput = section.querySelector('textarea');
            var artifactValue = normalizeSpace((artifactInput && artifactInput.value) || '');
            var summaryValue = normalizeSpace((summaryInput && summaryInput.value) || '');
            lines.push('Artifact URL: ' + (artifactValue || '[Not provided]'));
            lines.push('Evidence Summary: ' + (summaryValue || '[Not provided]'));
            var checkedCriteria = Array.prototype.slice
              .call(section.querySelectorAll('input[type="checkbox"]'))
              .filter(function(field) { return field.checked; })
              .map(function(field) { return readFieldLabel(field, section, 'Criteria'); });
            lines.push('Self-Check Criteria Met: ' + (checkedCriteria.length ? checkedCriteria.join('; ') : '[None selected]'));
          } else if (type === 'roleplay_simulator') {
            var rolePrompt = getReadableText(section.querySelector('label'), 'Your response');
            var roleInput = section.querySelector('textarea');
            var roleValue = normalizeSpace((roleInput && roleInput.value) || '');
            lines.push('Prompt: ' + rolePrompt);
            lines.push('Response: ' + (roleValue || '[No response]'));
          } else if (type === 'decision_lab') {
            var decisionInputs = Array.prototype.slice.call(section.querySelectorAll('[data-decision-input]'));
            if (!decisionInputs.length) return;
            decisionInputs.forEach(function(input) {
              var card = closest(input, '.rounded-lg');
              var name = getReadableText(card ? card.querySelector('p') : null, 'Variable');
              var weight = normalizeSpace(input.getAttribute('data-decision-weight') || '1');
              var min = normalizeSpace(input.getAttribute('data-decision-min') || '');
              var max = normalizeSpace(input.getAttribute('data-decision-max') || '');
              var value = normalizeSpace(input.value || '');
              lines.push(name + ': ' + value + ' (range ' + min + '-' + max + ', weight ' + weight + ')');
            });
            var score = getReadableText(section.querySelector('[data-decision-score]'), '');
            if (score) lines.push('Projected Outcome Score: ' + score);
          } else if (type === 'rubric_creator') {
            var rubricBlock = section.querySelector('[data-rubric-block]');
            if (!rubricBlock) return;
            var rubricRows = Array.prototype.slice.call(rubricBlock.querySelectorAll('tr[data-rubric-row]'));
            var totalScore = 0;
            rubricRows.forEach(function(row, rowIdx) {
              var rowLabel = getReadableText(row.querySelector('[data-rubric-row-label]'), 'Criterion ' + (rowIdx + 1));
              var selectedChoice = row.querySelector('[data-rubric-choice]:checked');
              if (!selectedChoice) {
                lines.push(rowLabel + ': [No selection]');
                return;
              }
              var scoreValue = Number(selectedChoice.getAttribute('data-rubric-score') || selectedChoice.value);
              if (Number.isFinite(scoreValue)) totalScore += scoreValue;
              var colIdx = parseInt(selectedChoice.getAttribute('data-rubric-col') || '-1', 10);
              var descriptor = '';
              if (Number.isInteger(colIdx) && colIdx >= 0) {
                var cell = row.querySelector('[data-rubric-cell][data-rubric-col="' + colIdx + '"]');
                descriptor = getReadableText(cell ? cell.querySelector('p') : null, '');
              }
              lines.push(rowLabel + ': Score ' + formatNumericValue(scoreValue) + (descriptor ? ' - ' + descriptor : ''));
            });
            var maxText = getReadableText(rubricBlock.querySelector('[data-rubric-max]'), '');
            lines.push('Total: ' + formatNumericValue(totalScore) + (maxText ? ' / ' + maxText : ''));
          } else if (type === 'before_after') {
            var slider = section.querySelector('[data-before-after-slider]');
            var beforeLabel = getReadableText(section.querySelector('[data-before-panel] p'), 'Before');
            var afterLabel = getReadableText(section.querySelector('[data-after-panel] p'), 'After');
            var afterPercent = parseInt((slider && slider.value) || '50', 10);
            if (isNaN(afterPercent)) afterPercent = 50;
            afterPercent = Math.max(0, Math.min(100, afterPercent));
            var beforePercent = 100 - afterPercent;
            lines.push('Comparison Split: ' + beforeLabel + ' ' + beforePercent + ' / ' + afterLabel + ' ' + afterPercent);
          } else if (type === 'tabs_block') {
            var activeTabPanel = section.querySelector('[data-tabs-panel]:not(.is-hidden)');
            if (activeTabPanel) {
              var activeTabLabel = getReadableText(activeTabPanel.querySelector('h4'), 'Tab');
              lines.push('Active Tab: ' + activeTabLabel);
            }
          } else if (type === 'path_map') {
            var activePath = section.querySelector('[data-path-panel]:not(.is-hidden)');
            if (activePath) {
              lines.push('Selected Path: ' + getReadableText(activePath.querySelector('h4'), 'Path'));
            }
          } else if (type === 'hotspot_image') {
            var activeHotspot = section.querySelector('[data-hotspot-panel]:not(.is-hidden)');
            if (activeHotspot) {
              lines.push('Selected Hotspot: ' + getReadableText(activeHotspot.querySelector('p'), 'Hotspot'));
            }
          } else if (type === 'flashcard_deck') {
            var cards = Array.prototype.slice.call(section.querySelectorAll('[data-flashcard]'));
            if (cards.length) {
              var flipped = cards.filter(function(card) { return card.getAttribute('data-flashcard-side') === 'back'; }).length;
              lines.push('Cards Flipped: ' + flipped + ' / ' + cards.length);
            }
          } else if (type === 'scenario_branch' || type === 'accordion_block') {
            var openItems = Array.prototype.slice
              .call(section.querySelectorAll('details[open] summary'))
              .map(function(summary) { return getReadableText(summary, 'Open item'); })
              .filter(Boolean);
            if (openItems.length) {
              lines.push('Expanded Items: ' + openItems.join('; '));
            }
          } else {
            lines = collectFilledFieldLines(section, {});
          }

          pushReportSection(reportLines, title, lines);
        });

        if (!reportLines.length) {
          return 'No responses found to include in this report yet. Fill in one or more activity inputs and generate again.';
        }

        var header = [
          'Course Factory Submission Report',
          'Generated: ' + new Date().toLocaleString(),
          '',
        ];
        return header.concat(reportLines).join('\\n').trim();
      }

      function escapeForHtml(value) {
        return String(value || '')
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;');
      }

      function decodeDataAttrJson(raw) {
        if (!raw) return null;
        try {
          return JSON.parse(decodeURIComponent(raw));
        } catch (e) {
          return null;
        }
      }

      var resourceReaderState = null;

      function getReaderRefs(card) {
        if (!card) return null;
        return {
          card: card,
          panel: card.querySelector('[data-resource-reader]'),
          title: card.querySelector('[data-resource-reader-title]'),
          toc: card.querySelector('[data-resource-reader-toc]'),
          body: card.querySelector('[data-resource-reader-body]'),
          progress: card.querySelector('[data-resource-reader-progress]'),
          prevBtn: card.querySelector('[data-resource-reader-prev]'),
          nextBtn: card.querySelector('[data-resource-reader-next]'),
        };
      }

      function renderReaderToc(state) {
        if (!state || !state.refs || !state.refs.toc) return;
        var tocHtml = state.chapters
          .map(function(chapter, idx) {
            var chapterTitle = escapeForHtml(chapter && chapter.title ? chapter.title : ('Chapter ' + (idx + 1)));
            var chapterNumber = escapeForHtml(chapter && chapter.number ? String(chapter.number) : String(idx + 1));
            var isActive = idx === state.index;
            var btnClass = isActive
              ? 'cf-chip is-active w-full justify-start text-left'
              : 'cf-chip w-full justify-start text-left';
            return '<button type="button" class="' + btnClass + '" data-resource-reader-chapter="' + idx + '">' + chapterNumber + '. ' + chapterTitle + '</button>';
          })
          .join('');
        state.refs.toc.innerHTML = tocHtml;
      }

      function renderReaderChapter(state) {
        if (!state || !state.refs || !state.refs.body) return;
        if (!state.chapters.length) {
          state.refs.body.innerHTML = '<p class="text-sm cf-muted">No chapters found.</p>';
          if (state.refs.progress) state.refs.progress.textContent = '';
          if (state.refs.prevBtn) state.refs.prevBtn.disabled = true;
          if (state.refs.nextBtn) state.refs.nextBtn.disabled = true;
          renderReaderToc(state);
          return;
        }

        if (state.index < 0) state.index = 0;
        if (state.index > state.chapters.length - 1) state.index = state.chapters.length - 1;

        var chapter = state.chapters[state.index] || {};
        var chapterTitle = escapeForHtml(chapter.title || ('Chapter ' + (state.index + 1)));
        var chapterNumber = escapeForHtml(chapter.number ? String(chapter.number) : String(state.index + 1));
        var sections = Array.isArray(chapter.sections) ? chapter.sections : [];
        var sectionsHtml = sections
          .map(function(section) {
            var heading = escapeForHtml(section && section.heading ? section.heading : '');
            var body = escapeForHtml(section && section.content ? section.content : '').replace(/\\n/g, '<br>');
            return '<section class="mt-5">' +
              (heading ? '<h5 class="text-sm font-bold tone-info mb-2">' + heading + '</h5>' : '') +
              '<div class="text-sm  leading-relaxed">' + body + '</div>' +
            '</section>';
          })
          .join('');

        var resourceTitle = escapeForHtml(state.content && state.content.title ? state.content.title : 'Digital Resource');
        state.refs.body.innerHTML =
          '<h3 class="text-xl font-bold  mb-1">' + resourceTitle + '</h3>' +
          '<p class="text-xs uppercase tracking-widest cf-muted mb-4">Chapter ' + (state.index + 1) + ' of ' + state.chapters.length + '</p>' +
          '<h4 class="text-lg font-bold  border-b  pb-2">' + chapterNumber + '. ' + chapterTitle + '</h4>' +
          sectionsHtml;

        if (state.refs.progress) {
          state.refs.progress.textContent = 'Chapter ' + (state.index + 1) + ' / ' + state.chapters.length;
        }
        if (state.refs.prevBtn) state.refs.prevBtn.disabled = state.index === 0;
        if (state.refs.nextBtn) state.refs.nextBtn.disabled = state.index === state.chapters.length - 1;
        renderReaderToc(state);
      }

      function openResourceReader(card, titleText, payload) {
        var refs = getReaderRefs(card);
        if (!refs || !refs.panel || !refs.body) return;
        var content = payload && typeof payload === 'object' ? payload : {};
        var chapters = Array.isArray(content.chapters) ? content.chapters : [];
        resourceReaderState = {
          refs: refs,
          content: content,
          chapters: chapters,
          index: 0,
        };
        refs.panel.classList.remove('is-hidden');
        if (refs.title) {
          refs.title.textContent = 'Digital Resource: ' + (titleText || content.title || 'Read');
        }
        renderReaderChapter(resourceReaderState);
      }

      function closeResourceReader(card) {
        var refs = getReaderRefs(card);
        if (!refs || !refs.panel) return;
        refs.panel.classList.add('is-hidden');
        if (refs.body) refs.body.innerHTML = '';
        if (refs.toc) refs.toc.innerHTML = '';
        resourceReaderState = null;
      }

      function safeStorageGet(key) {
        if (!key) return '';
        try {
          return window.localStorage ? window.localStorage.getItem(key) : '';
        } catch (err) {
          return '';
        }
      }

      function safeStorageSet(key, value) {
        if (!key) return;
        try {
          if (window.localStorage) window.localStorage.setItem(key, value);
        } catch (err) {
          // Ignore storage permission/availability errors.
        }
      }

      function getChecklistStorageKey(block) {
        if (!block) return '';
        var rawId = (block.getAttribute('data-checklist-id') || '').trim();
        if (!rawId) return '';
        return 'cf_checklist_v1_' + rawId.replace(/[^a-z0-9_-]/gi, '_');
      }

      function refreshChecklistBlock(block, shouldPersist) {
        if (!block) return;
        var inputs = Array.prototype.slice.call(block.querySelectorAll('[data-checklist-input]'));
        var checkedIndices = [];
        inputs.forEach(function(input, idx) {
          if (input.checked) checkedIndices.push(idx);
          var row = closest(input, 'label');
          if (!row) return;
          var text = row.querySelector('span');
          if (!text) return;
          text.classList.toggle('line-through', input.checked);
          text.classList.toggle('tone-info', input.checked);
          row.classList.toggle('is-active', input.checked);
        });
        var total = parseInt(block.getAttribute('data-checklist-total') || String(inputs.length), 10);
        if (!Number.isFinite(total) || total < 0) total = inputs.length;
        var progress = block.querySelector('[data-checklist-progress]');
        if (progress) progress.textContent = checkedIndices.length + ' / ' + total + ' done';
        if (shouldPersist) {
          safeStorageSet(
            getChecklistStorageKey(block),
            JSON.stringify({
              checked: checkedIndices,
              updatedAt: Date.now(),
            }),
          );
        }
      }

      function restoreChecklistBlock(block) {
        if (!block) return;
        var raw = safeStorageGet(getChecklistStorageKey(block));
        if (raw) {
          try {
            var parsed = JSON.parse(raw);
            var checked = parsed && Array.isArray(parsed.checked) ? parsed.checked : [];
            var checkSet = new Set(checked.map(function(idx) { return parseInt(idx, 10); }).filter(function(idx) { return Number.isInteger(idx) && idx >= 0; }));
            Array.prototype.slice.call(block.querySelectorAll('[data-checklist-input]')).forEach(function(input, idx) {
              input.checked = checkSet.has(idx);
            });
          } catch (err) {
            // Ignore malformed saved checklist JSON.
          }
        }
        refreshChecklistBlock(block, false);
      }

      function setActiveTab(block, nextIndex) {
        if (!block) return;
        var triggers = Array.prototype.slice.call(block.querySelectorAll('[data-tabs-trigger]'));
        var panels = Array.prototype.slice.call(block.querySelectorAll('[data-tabs-panel]'));
        if (!triggers.length || !panels.length) return;
        var hasMatch = triggers.some(function(trigger) {
          return parseInt(trigger.getAttribute('data-tab-index') || '-1', 10) === nextIndex;
        });
        var active = hasMatch ? nextIndex : parseInt(triggers[0].getAttribute('data-tab-index') || '0', 10);
        triggers.forEach(function(trigger) {
          var idx = parseInt(trigger.getAttribute('data-tab-index') || '-1', 10);
          var isActive = idx === active;
          trigger.setAttribute('aria-selected', isActive ? 'true' : 'false');
          trigger.classList.toggle('is-active', isActive);
        });
        panels.forEach(function(panel) {
          var idx = parseInt(panel.getAttribute('data-tab-index') || '-1', 10);
          panel.classList.toggle('is-hidden', idx !== active);
        });
      }

      function setFlashcardFace(card, showBack) {
        if (!card) return;
        var front = card.querySelector('[data-flashcard-front]');
        var back = card.querySelector('[data-flashcard-back]');
        var toggleBtn = card.querySelector('[data-flashcard-toggle]');
        if (front) front.classList.toggle('is-hidden', showBack);
        if (back) back.classList.toggle('is-hidden', !showBack);
        card.setAttribute('data-flashcard-side', showBack ? 'back' : 'front');
        if (toggleBtn) toggleBtn.textContent = showBack ? 'Show Front' : 'Show Back';
      }

      function setPathMapIndex(block, nextIndex) {
        if (!block) return;
        var nodes = Array.prototype.slice.call(block.querySelectorAll('[data-path-node]'));
        var panels = Array.prototype.slice.call(block.querySelectorAll('[data-path-panel]'));
        if (!nodes.length || !panels.length) return;
        var hasMatch = nodes.some(function(node) {
          return parseInt(node.getAttribute('data-path-index') || '-1', 10) === nextIndex;
        });
        var active = hasMatch ? nextIndex : parseInt(nodes[0].getAttribute('data-path-index') || '0', 10);
        nodes.forEach(function(node) {
          var idx = parseInt(node.getAttribute('data-path-index') || '-1', 10);
          var isActive = idx === active;
          node.classList.toggle('is-active', isActive);
        });
        panels.forEach(function(panel) {
          var idx = parseInt(panel.getAttribute('data-path-index') || '-1', 10);
          panel.classList.toggle('is-hidden', idx !== active);
        });
      }

      function setHotspotIndex(block, nextIndex) {
        if (!block) return;
        var buttons = Array.prototype.slice.call(block.querySelectorAll('[data-hotspot-btn]'));
        var panels = Array.prototype.slice.call(block.querySelectorAll('[data-hotspot-panel]'));
        if (!buttons.length || !panels.length) return;
        var hasMatch = buttons.some(function(btn) {
          return parseInt(btn.getAttribute('data-hotspot-index') || '-1', 10) === nextIndex;
        });
        var active = hasMatch ? nextIndex : parseInt(buttons[0].getAttribute('data-hotspot-index') || '0', 10);
        buttons.forEach(function(btn) {
          var idx = parseInt(btn.getAttribute('data-hotspot-index') || '-1', 10);
          var isActive = idx === active;
          btn.classList.toggle('is-active', isActive);
        });
        panels.forEach(function(panel) {
          var idx = parseInt(panel.getAttribute('data-hotspot-index') || '-1', 10);
          panel.classList.toggle('is-hidden', idx !== active);
        });
      }

      function refreshBeforeAfterBlock(block) {
        if (!block) return;
        var slider = block.querySelector('[data-before-after-slider]');
        if (!slider) return;
        var raw = parseInt(slider.value || '50', 10);
        var afterPct = Number.isFinite(raw) ? Math.max(0, Math.min(100, raw)) : 50;
        var beforePct = 100 - afterPct;
        var beforePanel = block.querySelector('[data-before-panel]');
        var afterPanel = block.querySelector('[data-after-panel]');
        if (beforePanel) beforePanel.style.opacity = String((Math.max(20, beforePct) / 100).toFixed(2));
        if (afterPanel) afterPanel.style.opacity = String((Math.max(20, afterPct) / 100).toFixed(2));
        var valueEl = block.querySelector('[data-before-after-value]');
        if (valueEl) valueEl.textContent = beforePct + ' / ' + afterPct;
      }

      function refreshDecisionBlock(block) {
        if (!block) return;
        var inputs = Array.prototype.slice.call(block.querySelectorAll('[data-decision-input]'));
        if (!inputs.length) return;
        var totalWeight = 0;
        var weightedSum = 0;
        inputs.forEach(function(input) {
          var min = Number(input.getAttribute('data-decision-min'));
          var max = Number(input.getAttribute('data-decision-max'));
          var weight = Number(input.getAttribute('data-decision-weight'));
          var safeMin = Number.isFinite(min) ? min : 0;
          var safeMax = Number.isFinite(max) && max >= safeMin ? max : safeMin + 10;
          var safeWeight = Number.isFinite(weight) && weight > 0 ? weight : 1;
          var value = Number(input.value);
          var clamped = Number.isFinite(value) ? Math.max(safeMin, Math.min(safeMax, value)) : safeMin;
          if (String(clamped) !== String(input.value)) input.value = String(clamped);
          var normalized = safeMax === safeMin ? 0 : (clamped - safeMin) / (safeMax - safeMin);
          weightedSum += normalized * safeWeight;
          totalWeight += safeWeight;
          var key = input.getAttribute('data-decision-key') || '';
          if (key) {
            var current = block.querySelector('[data-decision-current][data-decision-key="' + key + '"]');
            if (current) current.textContent = String(clamped);
          }
        });
        var score = totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 100) : 0;
        var scoreEl = block.querySelector('[data-decision-score]');
        if (scoreEl) scoreEl.textContent = String(score);
      }

      function refreshRubricBlock(block) {
        if (!block) return;
        var choices = Array.prototype.slice.call(block.querySelectorAll('[data-rubric-choice]'));
        var total = 0;
        choices.forEach(function(choice) {
          var row = parseInt(choice.getAttribute('data-rubric-row') || '-1', 10);
          var col = parseInt(choice.getAttribute('data-rubric-col') || '-1', 10);
          var cell = null;
          if (Number.isInteger(row) && Number.isInteger(col) && row >= 0 && col >= 0) {
            cell = block.querySelector('[data-rubric-cell][data-rubric-row="' + row + '"][data-rubric-col="' + col + '"]');
          }
          if (cell) {
            cell.classList.toggle('is-active', choice.checked);
          }
          if (choice.checked) {
            var score = Number(choice.getAttribute('data-rubric-score') || choice.value);
            if (Number.isFinite(score)) total += score;
          }
        });
        var totalEl = block.querySelector('[data-rubric-total]');
        if (totalEl) totalEl.textContent = formatNumericValue(total);
      }

      function getSortContext(target) {
        var item = closest(target, '[data-sort-item]');
        if (!item) return null;
        var list = closest(item, '[data-sort-list]');
        if (!list) return null;
        return { item: item, list: list };
      }

      function refreshSortRanks(list) {
        if (!list) return;
        Array.prototype.slice.call(list.querySelectorAll('[data-sort-item]')).forEach(function(item, idx) {
          var rank = item.querySelector('[data-sort-rank]');
          if (rank) rank.textContent = String(idx + 1) + '.';
        });
      }

      function moveSortItem(item, offset) {
        if (!item || !offset) return;
        var list = closest(item, '[data-sort-list]');
        if (!list) return;
        var allLists = Array.prototype.slice.call(document.querySelectorAll('[data-sort-list]'));
        var listIndex = allLists.indexOf(list);
        ensureSortItemIds(list, listIndex >= 0 ? listIndex : 0);
        var items = Array.prototype.slice.call(list.querySelectorAll('[data-sort-item]'));
        var fromIndex = items.indexOf(item);
        if (fromIndex < 0) return;
        var toIndex = Math.max(0, Math.min(items.length - 1, fromIndex + offset));
        if (toIndex === fromIndex) return;
        if (toIndex > fromIndex) {
          list.insertBefore(item, items[toIndex].nextSibling);
        } else {
          list.insertBefore(item, items[toIndex]);
        }
        refreshSortRanks(list);
      }

      function initializeComposerRuntime() {
        Array.prototype.slice.call(document.querySelectorAll('[data-checklist-block]')).forEach(function(block) {
          restoreChecklistBlock(block);
        });
        Array.prototype.slice.call(document.querySelectorAll('[data-tabs-block]')).forEach(function(block) {
          var first = block.querySelector('[data-tabs-trigger]');
          var start = first ? parseInt(first.getAttribute('data-tab-index') || '0', 10) : 0;
          setActiveTab(block, start);
        });
        Array.prototype.slice.call(document.querySelectorAll('[data-flashcard]')).forEach(function(card) {
          setFlashcardFace(card, false);
        });
        Array.prototype.slice.call(document.querySelectorAll('[data-path-map-block]')).forEach(function(block) {
          var first = block.querySelector('[data-path-node]');
          var start = first ? parseInt(first.getAttribute('data-path-index') || '0', 10) : 0;
          setPathMapIndex(block, start);
        });
        Array.prototype.slice.call(document.querySelectorAll('[data-hotspot-block]')).forEach(function(block) {
          var first = block.querySelector('[data-hotspot-btn]');
          var start = first ? parseInt(first.getAttribute('data-hotspot-index') || '0', 10) : 0;
          setHotspotIndex(block, start);
        });
        Array.prototype.slice.call(document.querySelectorAll('[data-before-after-block]')).forEach(function(block) {
          refreshBeforeAfterBlock(block);
        });
        Array.prototype.slice.call(document.querySelectorAll('[data-decision-block]')).forEach(function(block) {
          refreshDecisionBlock(block);
        });
        Array.prototype.slice.call(document.querySelectorAll('[data-rubric-block]')).forEach(function(block) {
          refreshRubricBlock(block);
        });
        Array.prototype.slice.call(document.querySelectorAll('[data-sort-list]')).forEach(function(list, listIndex) {
          ensureSortItemIds(list, listIndex);
          refreshSortRanks(list);
        });
      }

      var activeSortDragItem = null;
      var activeSortDropTarget = null;

      document.addEventListener('click', function(event) {
        var checkBtn = closest(event.target, '[data-kc-check]');
        if (checkBtn) {
          var questionScope = closest(checkBtn, '[data-kc-question]');
          var block = closest(checkBtn, '[data-kc-block]');
          var scope = questionScope || block;
          if (!scope) return;
          var correct = parseInt(scope.getAttribute('data-kc-correct') || '0', 10);
          var chosen = scope.querySelector('input[type="radio"]:checked');
          var resultEl = scope.querySelector('[data-kc-result]');
          if (!chosen) {
            if (resultEl) resultEl.textContent = 'Select an option first.';
            return;
          }
          var selected = parseInt(chosen.value, 10);
          var isCorrect = selected === correct;
          if (resultEl) {
            resultEl.textContent = isCorrect ? 'Correct.' : 'Try again.';
            resultEl.className = isCorrect ? 'text-xs tone-success' : 'text-xs tone-danger';
          }
          return;
        }

        var tabTrigger = closest(event.target, '[data-tabs-trigger]');
        if (tabTrigger) {
          var tabBlock = closest(tabTrigger, '[data-tabs-block]');
          if (!tabBlock) return;
          var tabIndex = parseInt(tabTrigger.getAttribute('data-tab-index') || '0', 10);
          setActiveTab(tabBlock, Number.isFinite(tabIndex) ? tabIndex : 0);
          return;
        }

        var flashcardToggle = closest(event.target, '[data-flashcard-toggle]');
        if (flashcardToggle) {
          var flashcard = closest(flashcardToggle, '[data-flashcard]');
          if (!flashcard) return;
          var showBack = flashcard.getAttribute('data-flashcard-side') !== 'back';
          setFlashcardFace(flashcard, showBack);
          return;
        }

        var pathNode = closest(event.target, '[data-path-node]');
        if (pathNode) {
          var pathBlock = closest(pathNode, '[data-path-map-block]');
          if (!pathBlock) return;
          var pathIndex = parseInt(pathNode.getAttribute('data-path-index') || '0', 10);
          setPathMapIndex(pathBlock, Number.isFinite(pathIndex) ? pathIndex : 0);
          return;
        }

        var hotspotBtn = closest(event.target, '[data-hotspot-btn]');
        if (hotspotBtn) {
          var hotspotBlock = closest(hotspotBtn, '[data-hotspot-block]');
          if (!hotspotBlock) return;
          var hotspotIndex = parseInt(hotspotBtn.getAttribute('data-hotspot-index') || '0', 10);
          setHotspotIndex(hotspotBlock, Number.isFinite(hotspotIndex) ? hotspotIndex : 0);
          return;
        }

        var sortMoveBtn = closest(event.target, '[data-sort-move]');
        if (sortMoveBtn) {
          var sortContext = getSortContext(sortMoveBtn);
          if (!sortContext) return;
          var delta = parseInt(sortMoveBtn.getAttribute('data-sort-move') || '0', 10);
          if (!Number.isFinite(delta)) return;
          moveSortItem(sortContext.item, delta);
          return;
        }

        var rubricClearBtn = closest(event.target, '[data-rubric-clear]');
        if (rubricClearBtn) {
          var rubricBlock = closest(rubricClearBtn, '[data-rubric-block]');
          if (!rubricBlock) return;
          Array.prototype.slice.call(rubricBlock.querySelectorAll('[data-rubric-choice]')).forEach(function(choice) {
            choice.checked = false;
          });
          refreshRubricBlock(rubricBlock);
          return;
        }

        var viewResourceBtn = closest(event.target, '[data-resource-view]');
        if (viewResourceBtn) {
          var resourceCard = closest(viewResourceBtn, 'article');
          if (!resourceCard) return;
          var viewer = resourceCard.querySelector('[data-resource-viewer]');
          var frame = resourceCard.querySelector('[data-resource-viewer-frame]');
          var title = resourceCard.querySelector('[data-resource-viewer-title]');
          var rawUrl = viewResourceBtn.getAttribute('data-resource-url') || '';
          if (!viewer || !frame || !rawUrl) return;
          frame.src = resolveViewerUrl(rawUrl);
          if (title) title.textContent = 'Viewing: ' + (viewResourceBtn.getAttribute('data-resource-title') || 'Resource');
          viewer.classList.remove('is-hidden');
          return;
        }

        var closeResourceBtn = closest(event.target, '[data-resource-viewer-close]');
        if (closeResourceBtn) {
          var closeCard = closest(closeResourceBtn, 'article');
          if (!closeCard) return;
          var closeViewer = closeCard.querySelector('[data-resource-viewer]');
          var closeFrame = closeCard.querySelector('[data-resource-viewer-frame]');
          if (closeFrame) closeFrame.src = '';
          if (closeViewer) closeViewer.classList.add('is-hidden');
          return;
        }

        var readResourceBtn = closest(event.target, '[data-resource-read]');
        if (readResourceBtn) {
          var readCard = closest(readResourceBtn, 'article');
          if (!readCard) return;
          var payload = decodeDataAttrJson(readResourceBtn.getAttribute('data-resource-read-content') || '');
          openResourceReader(readCard, readResourceBtn.getAttribute('data-resource-read-title') || 'Read', payload);
          return;
        }

        var closeReaderBtn = closest(event.target, '[data-resource-reader-close]');
        if (closeReaderBtn) {
          var closeReadCard = closest(closeReaderBtn, 'article');
          if (!closeReadCard) return;
          closeResourceReader(closeReadCard);
          return;
        }

        var tocChapterBtn = closest(event.target, '[data-resource-reader-chapter]');
        if (tocChapterBtn && resourceReaderState) {
          var idx = parseInt(tocChapterBtn.getAttribute('data-resource-reader-chapter') || '0', 10);
          if (!isNaN(idx)) {
            resourceReaderState.index = idx;
            renderReaderChapter(resourceReaderState);
          }
          return;
        }

        var prevReaderBtn = closest(event.target, '[data-resource-reader-prev]');
        if (prevReaderBtn && resourceReaderState) {
          resourceReaderState.index = Math.max(0, resourceReaderState.index - 1);
          renderReaderChapter(resourceReaderState);
          return;
        }

        var nextReaderBtn = closest(event.target, '[data-resource-reader-next]');
        if (nextReaderBtn && resourceReaderState) {
          resourceReaderState.index = Math.min(resourceReaderState.chapters.length - 1, resourceReaderState.index + 1);
          renderReaderChapter(resourceReaderState);
          return;
        }

        var downloadResourceBtn = closest(event.target, '[data-resource-download]');
        if (downloadResourceBtn) {
          var rawDownloadUrl = downloadResourceBtn.getAttribute('data-resource-download-url') || '';
          var downloadUrl = resolveAssetUrl(rawDownloadUrl);
          if (!downloadUrl) return;
          var downloadName = (downloadResourceBtn.getAttribute('data-resource-download-name') || 'resource').replace(/[^a-z0-9._ -]/gi, '');
          var link = document.createElement('a');
          link.href = downloadUrl;
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          link.setAttribute('download', downloadName || 'resource');
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          return;
        }

        var saveLoadDownloadBtn = closest(event.target, '[data-save-load-download]');
        if (saveLoadDownloadBtn) {
          var saveCtx = getSaveLoadContext(saveLoadDownloadBtn);
          if (!saveCtx || !saveCtx.root) return;
          try {
            var snapshot = collectModuleProgressSnapshot(saveCtx.root);
            downloadModuleProgressSnapshot(saveCtx, snapshot);
            setSaveLoadStatus(saveCtx, 'Backup downloaded (' + new Date().toLocaleTimeString() + ').', 'success');
          } catch (err) {
            setSaveLoadStatus(saveCtx, 'Could not create backup JSON.', 'error');
          }
          return;
        }

        var saveLoadUploadTriggerBtn = closest(event.target, '[data-save-load-upload-trigger]');
        if (saveLoadUploadTriggerBtn) {
          var uploadCtx = getSaveLoadContext(saveLoadUploadTriggerBtn);
          if (!uploadCtx || !uploadCtx.input) return;
          uploadCtx.input.value = '';
          uploadCtx.input.click();
          setSaveLoadStatus(uploadCtx, 'Select a JSON backup file to restore.', 'info');
          return;
        }

        var generateBtn = closest(event.target, '[data-submission-generate]');
        if (generateBtn) {
          var submissionContext = getSubmissionContext(generateBtn);
          if (!submissionContext || !submissionContext.output) return;
          var root = closest(generateBtn, '[data-composer-root]') || document;
          var reportText = buildSubmissionReport(root);
          submissionContext.output.textContent = reportText;
          return;
        }

        var copyBtn = closest(event.target, '[data-submission-copy]');
        if (copyBtn) {
          var copyContext = getSubmissionContext(copyBtn);
          var out = copyContext ? copyContext.output : null;
          if (!out) return;
          var text = out.textContent || '';
          if (!text.trim()) return;
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).catch(function() {});
          } else {
            var ta = document.createElement('textarea');
            ta.value = text;
            document.body.appendChild(ta);
            ta.select();
            try { document.execCommand('copy'); } catch (e) {}
            document.body.removeChild(ta);
          }
          return;
        }

        var downloadBtn = closest(event.target, '[data-submission-download]');
        if (downloadBtn) {
          var downloadContext = getSubmissionContext(downloadBtn);
          var downloadOut = downloadContext ? downloadContext.output : null;
          if (!downloadOut) return;
          var downloadText = downloadOut.textContent || '';
          if (!downloadText.trim()) return;
          var blob = new Blob([downloadText], { type: 'text/plain;charset=utf-8' });
          var link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = 'module-report.txt';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          setTimeout(function() {
            URL.revokeObjectURL(link.href);
          }, 500);
          return;
        }

        var printBtn = closest(event.target, '[data-submission-print]');
        if (printBtn) {
          var printContext = getSubmissionContext(printBtn);
          var printOut = printContext ? printContext.output : null;
          if (!printOut) return;
          var printText = printOut.textContent || '';
          if (!printText.trim()) return;
          var win = window.open('', '_blank');
          if (!win) return;
          win.document.write('<!DOCTYPE html><html><head><title>Module Report</title><style>body{font-family:Arial,sans-serif;padding:24px;line-height:1.4;}pre{white-space:pre-wrap;}</style></head><body><h1>Module Report</h1><pre>' + escapeForHtml(printText) + '</pre></body></html>');
          win.document.close();
          win.focus();
          win.print();
        }
      });

      document.addEventListener('change', function(event) {
        var checklistInput = closest(event.target, '[data-checklist-input]');
        if (checklistInput) {
          var checklistBlock = closest(checklistInput, '[data-checklist-block]');
          if (!checklistBlock) return;
          refreshChecklistBlock(checklistBlock, true);
          return;
        }

        var rubricChoiceInput = closest(event.target, '[data-rubric-choice]');
        if (rubricChoiceInput) {
          var rubricChoiceBlock = closest(rubricChoiceInput, '[data-rubric-block]');
          if (!rubricChoiceBlock) return;
          refreshRubricBlock(rubricChoiceBlock);
          return;
        }

        var uploadInput = closest(event.target, '[data-save-load-upload-input]');
        if (uploadInput) {
          var uploadCtx = getSaveLoadContext(uploadInput);
          if (!uploadCtx || !uploadCtx.root) return;
          var file = uploadInput.files && uploadInput.files[0];
          if (!file) {
            setSaveLoadStatus(uploadCtx, 'Upload canceled.', 'info');
            return;
          }
          file
            .text()
            .then(function(text) {
              var parsed = null;
              try {
                parsed = JSON.parse(text);
              } catch {
                setSaveLoadStatus(uploadCtx, 'Invalid JSON file. Could not parse backup.', 'error');
                return;
              }
              var payload = parsed;
              if (parsed && typeof parsed === 'object' && parsed.kind && parsed.kind !== 'course-factory-module-progress') {
                setSaveLoadStatus(uploadCtx, 'Unsupported backup type for this module.', 'error');
                return;
              }
              if (parsed && typeof parsed === 'object' && parsed.payload && typeof parsed.payload === 'object') {
                payload = parsed.payload;
              }
              var result = applyModuleProgressSnapshot(uploadCtx.root, payload);
              setSaveLoadStatus(uploadCtx, result.message, result.ok ? 'success' : 'error');
            })
            .catch(function() {
              setSaveLoadStatus(uploadCtx, 'Failed to read selected backup file.', 'error');
            });
        }
      });

      document.addEventListener('input', function(event) {
        var beforeAfterSlider = closest(event.target, '[data-before-after-slider]');
        if (beforeAfterSlider) {
          var beforeAfterBlock = closest(beforeAfterSlider, '[data-before-after-block]');
          if (!beforeAfterBlock) return;
          refreshBeforeAfterBlock(beforeAfterBlock);
          return;
        }

        var decisionInput = closest(event.target, '[data-decision-input]');
        if (decisionInput) {
          var decisionBlock = closest(decisionInput, '[data-decision-block]');
          if (!decisionBlock) return;
          refreshDecisionBlock(decisionBlock);
        }
      });

      document.addEventListener('dragstart', function(event) {
        var sortItem = closest(event.target, '[data-sort-item]');
        if (!sortItem) return;
        activeSortDragItem = sortItem;
        sortItem.classList.add('is-dragging');
        if (event.dataTransfer) {
          event.dataTransfer.effectAllowed = 'move';
          event.dataTransfer.setData('text/plain', 'sort-item');
        }
      });

      document.addEventListener('dragover', function(event) {
        if (!activeSortDragItem) return;
        var overItem = closest(event.target, '[data-sort-item]');
        var overList = overItem ? closest(overItem, '[data-sort-list]') : closest(event.target, '[data-sort-list]');
        if (!overList) return;
        event.preventDefault();
        if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
        if (activeSortDropTarget && activeSortDropTarget !== overItem) {
          activeSortDropTarget.classList.remove('is-dragover');
        }
        if (overItem && overItem !== activeSortDragItem) {
          overItem.classList.add('is-dragover');
          activeSortDropTarget = overItem;
        } else {
          activeSortDropTarget = null;
        }
      });

      document.addEventListener('drop', function(event) {
        if (!activeSortDragItem) return;
        var targetItem = closest(event.target, '[data-sort-item]');
        var targetList = targetItem ? closest(targetItem, '[data-sort-list]') : closest(event.target, '[data-sort-list]');
        if (!targetList) return;
        event.preventDefault();
        if (activeSortDropTarget) {
          activeSortDropTarget.classList.remove('is-dragover');
          activeSortDropTarget = null;
        }
        if (!targetItem || targetItem === activeSortDragItem) {
          targetList.appendChild(activeSortDragItem);
          refreshSortRanks(targetList);
          return;
        }
        var rect = targetItem.getBoundingClientRect();
        var insertAfter = event.clientY > rect.top + rect.height / 2;
        if (insertAfter) {
          targetList.insertBefore(activeSortDragItem, targetItem.nextSibling);
        } else {
          targetList.insertBefore(activeSortDragItem, targetItem);
        }
        refreshSortRanks(targetList);
      });

      document.addEventListener('dragend', function() {
        if (activeSortDropTarget) {
          activeSortDropTarget.classList.remove('is-dragover');
          activeSortDropTarget = null;
        }
        if (activeSortDragItem) {
          activeSortDragItem.classList.remove('is-dragging');
          var owningList = closest(activeSortDragItem, '[data-sort-list]');
          if (owningList) refreshSortRanks(owningList);
          activeSortDragItem = null;
        }
      });

      initializeComposerRuntime();
    })();
  `}var nn=[`deck`,`finlit`,`coursebook`,`toolkit_dashboard`],rn=Ut;function an(e,t=`deck`){let n=String(e||``).trim().toLowerCase();return n&&nn.includes(n)?n:t}function on(e,t=`dark_cards`){return Gt(e,t)}function sn(e,t=`premium_dribbble`){return Kt(e,t)}function cn(e={}){let t=e&&typeof e==`object`?e:{},n=String(t.variant||``).trim().toLowerCase(),r=String(t.padding||``).trim().toLowerCase(),i=String(t.titleVariant||``).trim().toLowerCase();return{border:t.border!==!1,variant:n===`flat`?`flat`:`card`,padding:r===`sm`||r===`lg`?r:`md`,titleVariant:[`xs`,`sm`,`md`,`lg`,`xl`].includes(i)?i:`md`}}function ln(e={}){let t=e&&typeof e==`object`?e:{},n=t.collapsible===!0;return{collapsible:n,collapsedByDefault:n?t.collapsedByDefault===!0:!1}}function K(e){return String(e||``).replace(/<[^>]+>/g,` `).replace(/&nbsp;/gi,` `).replace(/&amp;/gi,`&`).replace(/&lt;/gi,`<`).replace(/&gt;/gi,`>`).replace(/&#39;/gi,`'`).replace(/&quot;/gi,`"`).replace(/\s+/g,` `).trim()}function q(e,t=`item`){return String(e||``).trim().toLowerCase().replace(/<[^>]*>/g,``).replace(/[^a-z0-9]+/g,`-`).replace(/^-+|-+$/g,``)||t}function un(e=``,t=``){let n=[],r=/<h([1-4])[^>]*>([\s\S]*?)<\/h\1>/gi,i=r.exec(e);for(;i;){let a=K(i[2]);a&&n.push({level:Number.parseInt(i[1],10)||3,text:a,anchor:t}),i=r.exec(e)}return n}function dn(){return`
    (function() {
      if (window.__CF_TEMPLATE_RUNTIME_BOUND__) return;
      window.__CF_TEMPLATE_RUNTIME_BOUND__ = true;

      function closest(el, selector) {
        while (el) {
          if (el.matches && el.matches(selector)) return el;
          el = el.parentElement;
        }
        return null;
      }

      document.addEventListener('click', function(event) {
        var finlitTab = closest(event.target, '[data-finlit-tab-trigger]');
        if (finlitTab) {
          event.preventDefault();
          var root = closest(finlitTab, '[data-finlit-root]') || document;
          var nextId = finlitTab.getAttribute('data-finlit-tab-trigger');
          Array.prototype.slice.call(root.querySelectorAll('[data-finlit-tab-trigger]')).forEach(function(trigger) {
            var active = trigger.getAttribute('data-finlit-tab-trigger') === nextId;
            trigger.setAttribute('aria-selected', active ? 'true' : 'false');
            trigger.classList.toggle('is-active', active);
          });
          Array.prototype.slice.call(root.querySelectorAll('[data-finlit-tab-panel]')).forEach(function(panel) {
            panel.classList.toggle('is-hidden', panel.getAttribute('data-finlit-tab-panel') !== nextId);
          });
          return;
        }

        var expandToggle = closest(event.target, '[data-expand-toggle]');
        if (expandToggle) {
          event.preventDefault();
          var panelId = expandToggle.getAttribute('data-expand-toggle');
          var root = closest(expandToggle, '[data-composer-root]') || document;
          var panel = root.querySelector('[data-expand-panel="' + panelId + '"]');
          if (panel) panel.classList.toggle('is-hidden');
          return;
        }

        var openModal = closest(event.target, '[data-toolkit-open-modal]');
        if (openModal) {
          event.preventDefault();
          var modalRoot = closest(openModal, '[data-toolkit-dashboard]') || document;
          var modalId = openModal.getAttribute('data-toolkit-open-modal');
          var modal = modalRoot.querySelector('[data-toolkit-modal-id="' + modalId + '"]');
          if (modal) modal.classList.remove('is-hidden');
          return;
        }

        var closeModal = closest(event.target, '[data-toolkit-close-modal]') || closest(event.target, '[data-toolkit-modal-backdrop]');
        if (closeModal) {
          event.preventDefault();
          var modal = closest(closeModal, '[data-toolkit-modal-id]');
          if (modal) modal.classList.add('is-hidden');
        }
      });

      function applyToolkitFilters(root) {
        var queryInput = root.querySelector('[data-toolkit-query]');
        var query = String(queryInput && queryInput.value || '').toLowerCase().trim();
        var activeBtn = root.querySelector('[data-toolkit-category-filter].is-active');
        var category = activeBtn ? String(activeBtn.getAttribute('data-toolkit-category-filter') || 'all').toLowerCase() : 'all';
        Array.prototype.slice.call(root.querySelectorAll('[data-toolkit-card]')).forEach(function(card) {
          var cardCategory = String(card.getAttribute('data-toolkit-category') || '').toLowerCase();
          var search = String(card.getAttribute('data-toolkit-search') || '').toLowerCase();
          var passCategory = category === 'all' || cardCategory === category;
          var passQuery = !query || search.indexOf(query) !== -1;
          card.classList.toggle('is-hidden', !(passCategory && passQuery));
        });
      }

      document.addEventListener('click', function(event) {
        var filterBtn = closest(event.target, '[data-toolkit-category-filter]');
        if (!filterBtn) return;
        event.preventDefault();
        var root = closest(filterBtn, '[data-toolkit-dashboard]') || document;
        Array.prototype.slice.call(root.querySelectorAll('[data-toolkit-category-filter]')).forEach(function(btn) {
          btn.classList.remove('is-active');
        });
        filterBtn.classList.add('is-active');
        applyToolkitFilters(root);
      });

      document.addEventListener('input', function(event) {
        var queryInput = closest(event.target, '[data-toolkit-query]');
        if (!queryInput) return;
        var root = closest(queryInput, '[data-toolkit-dashboard]') || document;
        applyToolkitFilters(root);
      });

      Array.prototype.slice.call(document.querySelectorAll('[data-finlit-root]')).forEach(function(root) {
        var trigger = root.querySelector('[data-finlit-tab-trigger][aria-selected="true"]');
        if (!trigger) {
          trigger = root.querySelector('[data-finlit-tab-trigger].is-active');
        }
        if (!trigger) {
          var visiblePanel = root.querySelector('[data-finlit-tab-panel]:not(.is-hidden)');
          if (visiblePanel) {
            var panelId = visiblePanel.getAttribute('data-finlit-tab-panel');
            if (panelId) {
              trigger = root.querySelector('[data-finlit-tab-trigger="' + panelId + '"]');
            }
          }
        }
        if (!trigger) {
          trigger = root.querySelector('[data-finlit-tab-trigger]');
        }
        if (trigger) trigger.click();
      });
    })();
  `}function fn(e,{courseSettings:t={}}={}){let{composerLayout:n,activities:r}=st(e),i=It(e,{courseSettings:t,activities:r}),a=r.map(e=>zt(e,{...i,activity:{id:String(e?.id||``).trim(),type:String(e?.type||``).trim()}})),o=new Map;a.forEach(e=>{let t=String(e?.id||``).trim();t&&o.set(t,e)});let s=an(e?.template,an(t?.templateDefault,`deck`)),c=on(e?.theme,on(t?.themeDefault,`dark_cards`)),l=sn(e?.composerVisualQuality,sn(t?.composerVisualQuality,`premium_dribbble`)),u=`cf-theme-${c}`,d=`cf-visual-${l}`,f=(e,t=`inline`)=>z((Array.isArray(e)?e:[]).map((e,n)=>({id:e?.id||`${t}-${n+1}-${Math.random().toString(36).slice(2,8)}`,type:e?.type||`content_block`,data:e?.data||{},layout:e?.layout||{colSpan:1},style:e?.style||{},behavior:e?.behavior||{}})),{maxColumns:n.maxColumns,mode:n.mode}).map(e=>zt(e,{...i,activity:{id:String(e?.id||``).trim(),type:String(e?.type||``).trim()}})),p=(e,t,{withLayout:r=!0,trail:i=[]}={})=>{let a=String(e?.id||`activity-${t+1}`);if(i.includes(a))return`<section class="cf-card tone-danger"><p class="text-sm">Cycle detected for activity "${G(a)}".</p></section>`;let s=e?.data||{},c=``;if(e?.type===`tab_group`){let e=Array.isArray(s.tabs)?s.tabs:[];c=`
        <article class="cf-card cf-card--elevated cf-template-surface">
          ${String(s.title||``).trim()?`<h3 class="text-lg font-bold  mb-3">${G(String(s.title||``))}</h3>`:``}
          <div class="space-y-2">
            ${e.length?e.map((e,t)=>{let n=(Array.isArray(e?.activityIds)?e.activityIds:[]).map(e=>o.get(String(e||``).trim())).filter(Boolean),r=f(e?.activities,`${a}-tab-${t+1}`),s=[...n,...r];return`
                        <details class="cf-card cf-card--flat p-3" ${t===0?`open`:``}>
                          <summary class="cursor-pointer cf-pill">${G(String(e?.label||e?.id||`Tab ${t+1}`))}</summary>
                          <div class="mt-3 space-y-3">
                            ${s.length?s.map((e,t)=>p(e,t,{withLayout:!1,trail:[...i,a]})).join(`
`):`<p class="text-sm cf-muted">No linked activities.</p>`}
                          </div>
                        </details>
                      `}).join(`
`):`<p class="text-sm cf-muted">No tabs configured.</p>`}
          </div>
        </article>
      `}else if(e?.type===`card_list`){let e=(Array.isArray(s.cards)?s.cards:[]).map((e,t)=>{let n=String(e?.openMode||`expand`).trim().toLowerCase(),r=n===`modal`||n===`navigate_section`||n===`navigate_page`?n:`expand`,s=o.get(String(e?.targetActivityId||``).trim()),c=f([...e?.activity&&typeof e.activity==`object`?[e.activity]:[],...Array.isArray(e?.activities)?e.activities:[]],`${a}-card-${t+1}`),l=s?[s,...c]:c,u=`${q(a,`card-list`)}-panel-${t+1}`,d=l.length?l.map((e,t)=>p(e,t,{withLayout:!1,trail:[...i,a]})).join(`
`):`<p class="text-sm cf-muted">No linked activity.</p>`;return`
            <article class="cf-card cf-card--flat">
              <h4 class="text-sm font-bold ">${G(String(e?.title||`Card ${t+1}`))}</h4>
              ${String(e?.subtitle||``).trim()?`<p class="mt-1 text-xs cf-muted">${G(String(e.subtitle||``))}</p>`:``}
              <div class="mt-2">
                ${r===`expand`?`<button type="button" data-expand-toggle="${u}" class="cf-btn cf-btn--primary">Open</button>
                       <div data-expand-panel="${u}" class="is-hidden mt-3">${d}</div>`:r===`modal`?`<button type="button" data-toolkit-open-modal="${u}" class="cf-btn cf-btn--primary">Open Modal</button>
                         <div class="is-hidden fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" data-toolkit-modal-id="${u}" data-toolkit-modal-backdrop>
                           <div class="w-full max-w-3xl cf-card cf-card--elevated max-h-[85vh] custom-scroll">
                             <div class="flex items-center justify-between mb-3">
                               <h4 class="text-sm font-bold ">${G(String(e?.title||`Card ${t+1}`))}</h4>
                               <button type="button" data-toolkit-close-modal class="cf-btn cf-btn--ghost">Close</button>
                             </div>
                             ${d}
                           </div>
                         </div>`:`<a href="#${u}" class="inline-flex items-center cf-btn cf-btn--ghost">${r===`navigate_page`?`Open Page`:`Go to Section`}</a>
                         <section id="${u}" class="mt-3">${d}</section>`}
              </div>
            </article>
          `}).join(`
`);c=`
        <article class="cf-card cf-card--elevated cf-template-surface" data-toolkit-dashboard>
          ${String(s.title||``).trim()?`<h3 class="text-lg font-bold  mb-3">${G(String(s.title||``))}</h3>`:``}
          <div class="grid gap-3 md:grid-cols-2">${e||`<p class="text-sm cf-muted">No cards configured.</p>`}</div>
        </article>
      `}else{let n=T(e.type);c=n?n.compileToHtml({data:e.data,index:t,activityId:e.id}):`<article class="cf-card tone-danger"><p class="text-sm font-semibold">Unknown activity type: ${G(e.type)}</p></article>`}let l=e?.layout?.colSpan||1,u=Number.isInteger(e?.layout?.row)?e.layout.row:null,d=Number.isInteger(e?.layout?.col)?e.layout.col:null,m=Number.isInteger(e?.layout?.x)?e.layout.x:Math.max(0,(d||1)-1),h=Number.isInteger(e?.layout?.y)?e.layout.y:Math.max(0,(u||1)-1),g=Number.isInteger(e?.layout?.w)?e.layout.w:l,_=Number.isInteger(e?.layout?.h)?e.layout.h:4,v=r===!1?``:n.mode===`canvas`?`grid-column: ${m+1} / span ${g}; grid-row: ${h+1} / span ${_};`:d?`grid-column: ${d} / span ${l};${u?` grid-row: ${u};`:``}`:`grid-column: span ${l} / span ${l};${u?` grid-row: ${u};`:``}`,y=en(e?.data||{}),b=cn(e?.style||{}),x=ln(e?.behavior||{}),S=[v],C=[`cf-composer-activity`,`cf-pad-${b.padding}`,`cf-title-${b.titleVariant}`];r!==!1&&n.mode===`canvas`&&C.push(`cf-canvas-item`),b.border||C.push(`cf-no-border`),b.variant===`flat`&&C.push(`cf-variant-flat`),y.fontFamily&&(C.push(`cf-block-font-override`),S.push(`--cf-block-font:${y.fontFamily};`)),y.textColor&&(C.push(`cf-block-text-override`),S.push(`--cf-block-text:${y.textColor};`)),y.containerBg&&(C.push(`cf-block-bg-override`),S.push(`--cf-block-bg:${y.containerBg};`)),y.borderColor&&(C.push(`cf-block-border-override`),S.push(`--cf-block-border:${y.borderColor};`)),y.accentColor&&(C.push(`cf-block-accent-override`),S.push(`--cf-block-accent:${y.accentColor};`));let w=[];je.forEach(t=>{let r=nt(e,t,{maxColumns:n.maxColumns,mode:n.mode});r?.hasOverride&&(w.push(`data-composer-responsive-${t}="true"`),S.push(`--cf-${t}-col-start:${r.col||1};`),S.push(`--cf-${t}-row-start:${r.row||1};`),S.push(`--cf-${t}-col-span:${r.colSpan||r.w||1};`),S.push(`--cf-${t}-w:${r.w||r.colSpan||1};`),S.push(`--cf-${t}-h:${r.h||4};`),r.hidden===!0&&S.push(`--cf-${t}-display:none;`))});let ee=S.filter(Boolean).join(` `),te=K(e?.data?.title||e?.data?.text||T(e?.type)?.label||`Activity ${t+1}`),ne=x.collapsible?`<details class="cf-card cf-card--flat" ${x.collapsedByDefault?``:`open`}><summary class="cursor-pointer select-none cf-pill">${G(te)}</summary><div class="p-1">${c}</div></details>`:c;return`
      <section
        id="cf-activity-${q(a,`activity-${t+1}`)}"
        data-activity-type="${G(e.type)}"
        data-activity-id="${G(e.id)}"
        data-block-theme="${G(y.themeKey)}"
        data-composer-col-span="${l}"
        data-composer-row="${u||``}"
        data-composer-col="${d||``}"
        data-composer-x="${m}"
        data-composer-y="${h}"
        data-composer-w="${g}"
        data-composer-h="${_}"
        ${w.join(` `)}
        style="${ee}"
        class="${C.join(` `)}"
      >
        ${ne}
      </section>
    `},m=e=>{let t=e.length?e.map((e,t)=>p(e,t)).join(`
`):`<p class="cf-muted" style="grid-column: 1 / -1;">No composer activities added yet.</p>`;if(n.mode===`canvas`){let e=Number.parseInt(n.rowHeight,10)||24,r=Array.isArray(n.margin)?n.margin:[12,12],i=Array.isArray(n.containerPadding)?n.containerPadding:[12,12];return`
        <div class="grid" data-composer-root data-composer-columns="${n.maxColumns}" data-composer-layout-mode="canvas" style="grid-template-columns: repeat(${n.maxColumns}, minmax(0, 1fr)); grid-auto-rows: ${e}px; gap: ${r[1]}px ${r[0]}px; padding: ${i[1]}px ${i[0]}px;">
          ${t}
        </div>
      `}let r=n.simpleMatchTallestRow===!0;return`
      <div class="grid gap-6" data-composer-root data-composer-columns="${n.maxColumns}" data-composer-layout-mode="simple" data-composer-simple-match-tallest-row="${r?`true`:`false`}" style="grid-template-columns: repeat(${n.maxColumns}, minmax(0, 1fr)); grid-auto-flow: row;">
        ${t}
      </div>
    `},h=()=>{if(s===`finlit`){let t=U(e?.finlit),r=Array.isArray(t?.tabs)?t.tabs:[],i=String(e?.finlitActiveTabId||e?.__finlitActiveTabId||``).trim(),s=a.filter(e=>e?.type!==`tab_group`),c=a.filter(e=>e?.type===`tab_group`)[0]||null,l=[];if(c){let e=Array.isArray(c?.data?.tabs)?c.data.tabs:[],t=e=>{if(!e)return``;let t=(Array.isArray(e?.activityIds)?e.activityIds:[]).map(e=>o.get(String(e||``).trim())).filter(Boolean),n=f(e?.activities,`${c.id||`tab-group`}-${e?.id||`tab`}`),r=[...t,...n];return r.length?r.map((e,t)=>p(e,t,{withLayout:!1,trail:[c.id]})).join(`
`):``};e.forEach(e=>{l.push({id:String(e?.id||``).trim().toLowerCase(),html:t(e)})})}let u=e=>{let t=String(e||``).trim().toLowerCase();if(!t)return``;let n=l.find(e=>e.id===t);return!n&&t===`activities`&&(n=l.find(e=>e.id.includes(`activit`))),!n&&t===`additional`&&(n=l.find(e=>e.id.includes(`additional`))),n||=l.find(e=>e.id&&t.includes(e.id)),n?.html||``},d=e=>(Array.isArray(e)?e:[]).map((e,t)=>{let n=String(e?.title||``).trim()||`Resource ${t+1}`,r=String(e?.description||``).trim(),i=qt(e?.url),a=i&&!i.startsWith(`#`)?` target="_blank" rel="noopener noreferrer"`:``;return`
              <article class="cf-card cf-card--flat">
                ${i?`<a href="${G(i)}"${a} class="text-sm font-bold">${G(n)}</a>`:`<p class="text-sm font-bold">${G(n)}</p>`}
                ${r?`<p class="mt-1 text-xs cf-muted leading-relaxed">${G(r)}</p>`:``}
              </article>
            `}).join(`
`),h=new Set(r.flatMap(e=>Array.isArray(e?.activityIds)?e.activityIds:[]).map(e=>String(e||``).trim()).filter(Boolean)),g=s.filter(e=>{let t=String(e?.id||``).trim();return t&&!h.has(t)}),_=g.length?m(g):``,v=r.map((e,t)=>{let r=String(e?.id||`tab-${t+1}`).trim()||`tab-${t+1}`,i=String(e?.label||r||`Tab ${t+1}`).trim()||`Tab ${t+1}`,a=Object.prototype.hasOwnProperty.call(e||{},`activities`),s=a?z(Array.isArray(e?.activities)?e.activities:[],{maxColumns:n.maxColumns,mode:n.mode}):[],c=s.length?m(s):``,l=a?[]:(Array.isArray(e?.activityIds)?e.activityIds:[]).map(e=>o.get(String(e||``).trim())).filter(Boolean),f=l.length?m(l):``,p=u(r),h=d(e?.links),g=[];return c&&g.push(c),f&&g.push(f),r===`activities`&&!a&&!c&&_&&g.push(_),p&&g.push(p),h&&g.push(`<div class="space-y-2">${h}</div>`),{tabId:r,tabLabel:i,panelHtml:g.length>0?g.join(`
`):`<p class="cf-muted text-sm">No ${G(i.toLowerCase()||`tab`)} content.</p>`,isActive:!1}});v.length===0&&v.push({tabId:`activities`,tabLabel:String(t?.activitiesTabLabel||`Activities`),panelHtml:_||`<p class="cf-muted text-sm">No activities yet.</p>`,isActive:!0});let y=v.some(e=>e.tabId===i)?i:v[0]?.tabId||`activities`;v.forEach(e=>{e.isActive=e.tabId===y});let b=V(e?.hero),x=String(b.mediaUrl||``).trim(),S=/^((https?:)?\/\/|\/|\.\/|\.\.\/|data:image\/|data:video\/|blob:|materials\/)/i.test(x)?/^materials\//i.test(x)?`/${x}`:x:``,C=vt(b),w=String(b.title||e?.title||`Module`),ee=S&&C===`video`?`<div class="mt-4 rounded-lg overflow-hidden cf-card cf-card--flat bg-black"><video src="${G(S)}" class="w-full h-auto" controls preload="metadata"></video></div>`:S&&C===`embed`?`<div class="mt-4 rounded-lg overflow-hidden cf-card cf-card--flat bg-black aspect-video"><iframe src="${G(S)}" title="${G(w)}" class="w-full h-full" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen loading="lazy"></iframe></div>`:S?`<div class="mt-4 rounded-lg overflow-hidden cf-card cf-card--flat bg-black"><img src="${G(S)}" alt="${G(w)}" class="w-full h-auto" loading="lazy" /></div>`:``;return`
        <section class="space-y-6 cf-card cf-card--elevated cf-template-surface" data-finlit-root>
          <header class="cf-card cf-card--flat">
            <h2 class="text-2xl font-black ">${G(w)}</h2>
            ${String(b.subtitle||``).trim()?`<p class="mt-2 text-sm cf-muted">${G(String(b.subtitle||``))}</p>`:``}
            ${String(b.progressLabel||``).trim()?`<p class="mt-3 text-[11px] font-bold uppercase tracking-wide cf-muted">${G(String(b.progressLabel||``))}</p>`:``}
            ${ee}
          </header>
          <div class="flex flex-wrap gap-3 cf-divider pb-2">
            ${v.map(e=>`
                  <button
                    type="button"
                    data-finlit-tab-trigger="${G(e.tabId)}"
                    class="cf-chip ${e.isActive?`is-active`:``}"
                  >
                    ${G(e.tabLabel)}
                  </button>
                `).join(`
`)}
          </div>
          ${v.map(e=>`
                <div data-finlit-tab-panel="${G(e.tabId)}" class="${e.isActive?``:`is-hidden`}">
                  ${e.panelHtml}
                </div>
              `).join(`
`)}
        </section>
      `}if(s===`coursebook`){let e=a.map((e,t)=>{let n=`cb-${q(e?.id||`section-${t+1}`,`section-${t+1}`)}`,r=p(e,t,{withLayout:!1}),i=e?.type===`title_block`?K(e?.data?.textHtml||e?.data?.text||``):K(e?.data?.title||``);return{anchor:n,html:`<section id="${n}">${r}</section>`,entries:[...i?[{level:2,text:i,anchor:n}]:[],...un(r,n)]}}),t=new Set,n=e.flatMap(e=>e.entries).filter(e=>{let n=`${e.anchor}:${e.text.toLowerCase()}`;return t.has(n)?!1:(t.add(n),!0)});return`
        <section class="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside class="cf-card cf-card--elevated h-max sticky top-4 cf-template-surface">
            <h3 class="text-xs font-bold uppercase tracking-wide cf-muted mb-3">Contents</h3>
            <nav class="space-y-2">
              ${n.length?n.map(e=>`<a href="#${e.anchor}" class="block text-sm" style="padding-left:${Math.max(0,e.level-2)*.75}rem;">${G(e.text)}</a>`).join(`
`):`<p class="text-sm cf-muted">No headings found.</p>`}
            </nav>
          </aside>
          <article class="cf-card cf-card--elevated cf-template-surface cf-prose">
            <div class="space-y-6">${e.map(e=>e.html).join(`
`)}</div>
          </article>
        </section>
      `}if(s===`toolkit_dashboard`){let e=[],t=a.filter(e=>e?.type===`card_list`);return t.length?t.forEach((t,n)=>{(Array.isArray(t?.data?.cards)?t.data.cards:[]).forEach((t,r)=>{e.push({id:`tool-card-${n+1}-${r+1}`,title:String(t?.title||`Tool ${r+1}`),subtitle:String(t?.subtitle||``),category:String(t?.category||`General`),openMode:String(t?.openMode||`expand`).trim().toLowerCase(),linked:(()=>{let e=o.get(String(t?.targetActivityId||``).trim()),i=f([...t?.activity&&typeof t.activity==`object`?[t.activity]:[],...Array.isArray(t?.activities)?t.activities:[]],`tool-inline-${n+1}-${r+1}`);return e?[e,...i]:i})()})})}):a.forEach((t,n)=>{e.push({id:`tool-card-auto-${n+1}`,title:K(t?.data?.title||t?.data?.text||T(t?.type)?.label||`Tool ${n+1}`),subtitle:``,category:T(t?.type)?.label||`General`,openMode:`expand`,linked:[t]})}),`
        <section class="space-y-4" data-toolkit-dashboard>
          <div class="flex flex-wrap gap-2">
            <input type="search" data-toolkit-query class="cf-input flex-1 min-w-56" placeholder="Search tools..." />
            <button type="button" data-toolkit-category-filter="all" class="cf-chip is-active">All</button>
          </div>
          <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">${e.map(e=>({...e,openMode:e.openMode===`modal`||e.openMode===`navigate_section`||e.openMode===`navigate_page`?e.openMode:`expand`})).map(e=>{let t=`${e.id}-panel`,n=Array.isArray(e.linked)?e.linked:[],r=n.length?n.map((t,n)=>p(t,n,{withLayout:!1,trail:[e.id]})).join(`
`):`<p class="text-sm cf-muted">No linked activity.</p>`,i=`${e.title} ${e.subtitle} ${e.category}`.trim().toLowerCase();return`
            <article class="cf-card cf-card--elevated cf-toolkit-card cf-template-surface" data-toolkit-card data-toolkit-category="${q(e.category,`general`)}" data-toolkit-search="${G(i)}">
              <h4 class="text-sm font-bold ">${G(e.title)}</h4>
              ${e.subtitle?`<p class="mt-1 text-xs cf-muted">${G(e.subtitle)}</p>`:``}
              <div class="mt-3">
                ${e.openMode===`expand`?`<button type="button" data-expand-toggle="${t}" class="cf-btn cf-btn--primary">Open</button><div class="is-hidden mt-3" data-expand-panel="${t}">${r}</div>`:e.openMode===`modal`?`<button type="button" data-toolkit-open-modal="${t}" class="cf-btn cf-btn--primary">Open Modal</button><div class="is-hidden fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" data-toolkit-modal-id="${t}" data-toolkit-modal-backdrop><div class="w-full max-w-3xl cf-card cf-card--elevated max-h-[85vh] custom-scroll"><div class="flex items-center justify-between mb-3"><h4 class="text-sm font-bold ">${G(e.title)}</h4><button type="button" data-toolkit-close-modal class="cf-btn cf-btn--ghost">Close</button></div>${r}</div></div>`:`<a href="#${t}" class="inline-flex items-center cf-btn cf-btn--ghost">${e.openMode===`navigate_page`?`Open Page`:`Go to Section`}</a><section id="${t}" class="mt-3">${r}</section>`}
              </div>
            </article>
          `}).join(`
`)||`<p class="cf-muted text-sm">No tools configured.</p>`}</div>
        </section>
      `}return m(a)},g={dark_cards:`
      --cf-bg:#020617;
      --cf-bg-gradient:radial-gradient(1200px 640px at 18% -10%, rgba(56,189,248,0.22), transparent 60%), radial-gradient(1000px 580px at 110% 0%, rgba(34,197,94,0.14), transparent 64%);
      --cf-surface:rgba(7, 15, 28, 0.62);
      --cf-card:rgba(15, 23, 42, 0.74);
      --cf-border:rgba(71, 85, 105, 0.6);
      --cf-text:#e2e8f0;
      --cf-muted:#94a3b8;
      --cf-accent:#38bdf8;
      --cf-accent2:#22c55e;
    `,finlit_clean:`
      --cf-bg:#eef2f7;
      --cf-bg-gradient:radial-gradient(900px 500px at 8% -10%, rgba(14,165,233,0.12), transparent 60%);
      --cf-surface:#ffffff;
      --cf-card:#ffffff;
      --cf-border:#d7dde7;
      --cf-text:#0f172a;
      --cf-muted:#64748b;
      --cf-accent:#0284c7;
      --cf-accent2:#16a34a;
    `,coursebook_light:`
      --cf-bg:#f8fafc;
      --cf-bg-gradient:linear-gradient(180deg, rgba(148,163,184,0.1) 0%, rgba(248,250,252,0) 46%);
      --cf-surface:#ffffff;
      --cf-card:#ffffff;
      --cf-border:#dbe2eb;
      --cf-text:#111827;
      --cf-muted:#6b7280;
      --cf-accent:#1d4ed8;
      --cf-accent2:#0ea5e9;
    `,toolkit_clean:`
      --cf-bg:#f3f6fb;
      --cf-bg-gradient:radial-gradient(900px 480px at 0% -20%, rgba(56,189,248,0.15), transparent 58%);
      --cf-surface:#ffffff;
      --cf-card:#ffffff;
      --cf-border:#d4dbe5;
      --cf-text:#111827;
      --cf-muted:#64748b;
      --cf-accent:#0891b2;
      --cf-accent2:#6366f1;
    `,saas_clean:`
      --cf-bg:#f4f7f6;
      --cf-bg-gradient:radial-gradient(860px 460px at 4% -12%, rgba(34,197,94,0.16), transparent 56%);
      --cf-surface:#ffffff;
      --cf-card:#ffffff;
      --cf-border:#dbe4df;
      --cf-text:#10221a;
      --cf-muted:#5f746b;
      --cf-accent:#16a34a;
      --cf-accent2:#22c55e;
    `,lms_pastel:`
      --cf-bg:#eef0ff;
      --cf-bg-gradient:linear-gradient(150deg, rgba(196,181,253,0.42) 0%, rgba(224,231,255,0.45) 55%, rgba(255,237,213,0.32) 100%);
      --cf-surface:rgba(255,255,255,0.86);
      --cf-card:rgba(255,255,255,0.94);
      --cf-border:#cfd4f2;
      --cf-text:#1f1f3a;
      --cf-muted:#606084;
      --cf-accent:#6366f1;
      --cf-accent2:#f59e0b;
    `,crypto_neon:`
      --cf-bg:#060815;
      --cf-bg-gradient:radial-gradient(860px 420px at 8% -12%, rgba(34,211,238,0.22), transparent 58%), radial-gradient(900px 440px at 110% -6%, rgba(147,51,234,0.26), transparent 62%);
      --cf-surface:rgba(11, 16, 34, 0.66);
      --cf-card:rgba(17, 24, 48, 0.56);
      --cf-border:rgba(255,255,255,0.18);
      --cf-text:#e8ecff;
      --cf-muted:#9fa8c8;
      --cf-accent:#22d3ee;
      --cf-accent2:#a855f7;
    `};return{html:`
    <style>
      ${rn.map(e=>`.cf-theme-${e}{${g[e]||g.dark_cards}}`).join(`
`)}
      ${`
      .cf-page {
        --cf-r-sm: 10px;
        --cf-r-md: 16px;
        --cf-r-lg: 24px;
        --cf-sh-0: none;
        --cf-sh-1: 0 10px 30px rgba(2,6,23,0.12);
        --cf-sh-2: 0 18px 40px rgba(2,6,23,0.18);
        --cf-focus: 0 0 0 3px color-mix(in srgb, var(--cf-accent) 36%, transparent);
        --cf-space-1: 0.35rem;
        --cf-space-2: 0.6rem;
        --cf-space-3: 0.9rem;
        --cf-space-4: 1.2rem;
        --cf-space-5: 1.6rem;
        --cf-space-6: 2.2rem;
        min-height: 100vh;
        padding: clamp(16px, 3vw, 40px);
        background: var(--cf-bg);
        background-image: var(--cf-bg-gradient, none);
        color: var(--cf-text);
        font-family: Inter, system-ui, -apple-system, "Segoe UI", sans-serif;
        line-height: 1.5;
      }
      .cf-shell {
        max-width: 1400px;
        margin: 0 auto;
        border-radius: var(--cf-r-lg);
        background: var(--cf-surface);
        border: 1px solid var(--cf-border);
        box-shadow: var(--cf-sh-2);
        padding: clamp(16px, 3vw, 32px);
        display: grid;
        gap: 1.5rem;
      }
      .cf-shell h1, .cf-shell h2, .cf-shell h3, .cf-shell h4, .cf-shell h5, .cf-shell h6 { color: var(--cf-text); line-height: 1.2; letter-spacing: -0.01em; }
      .cf-shell p, .cf-shell li, .cf-shell small, .cf-shell label { color: color-mix(in srgb, var(--cf-text) 92%, transparent); }
      .cf-shell h1 { font-size: clamp(1.8rem, 2.8vw, 2.7rem); font-weight: 900; }
      .cf-shell h2 { font-size: clamp(1.5rem, 2.2vw, 2.1rem); font-weight: 800; }
      .cf-shell h3 { font-size: clamp(1.2rem, 1.7vw, 1.5rem); font-weight: 700; }
      .cf-shell a { color: var(--cf-accent); text-decoration: underline; text-underline-offset: 0.12em; }
      .cf-shell a:hover { color: color-mix(in srgb, var(--cf-accent) 80%, var(--cf-accent2) 20%); }
      .cf-shell table { width: 100%; border-collapse: collapse; }
      .cf-shell th, .cf-shell td { border: 1px solid var(--cf-border); padding: 0.6rem 0.7rem; vertical-align: top; }
      .cf-shell th { background: color-mix(in srgb, var(--cf-card) 70%, transparent); font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.04em; }
      .cf-muted { color: var(--cf-muted) !important; }
      .cf-status-message { padding: 0.45rem 0.6rem; border: 1px solid transparent; border-radius: var(--cf-r-sm); display: inline-flex; align-items: center; gap: 0.4rem; }
      .cf-divider { border-bottom: 1px solid var(--cf-border); }

      .cf-card {
        background: var(--cf-card);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-r-md);
        box-shadow: var(--cf-sh-1);
        padding: clamp(20px, 2vw, 24px);
      }
      .cf-card--elevated { box-shadow: var(--cf-sh-2); }
      .cf-card--flat { background: transparent; border-color: color-mix(in srgb, var(--cf-border) 70%, transparent); box-shadow: var(--cf-sh-0); }
      .cf-template-surface { background: var(--cf-card); border: 1px solid var(--cf-border); border-radius: var(--cf-r-md); box-shadow: var(--cf-sh-1); }

      .cf-btn, .cf-chip, .cf-pill {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.45rem;
        height: 36px;
        border-radius: var(--cf-r-sm);
        border: 1px solid var(--cf-border);
        padding: 0 0.85rem;
        font-size: 0.76rem;
        font-weight: 700;
        letter-spacing: 0.03em;
        text-transform: uppercase;
        color: var(--cf-text);
        background: color-mix(in srgb, var(--cf-card) 84%, transparent);
        cursor: pointer;
        transition: transform 140ms ease, box-shadow 180ms ease, border-color 180ms ease, background 180ms ease, color 180ms ease;
      }
      .cf-pill { height: 32px; }
      .cf-btn:hover, .cf-chip:hover, .cf-pill:hover { transform: translateY(-1px); border-color: color-mix(in srgb, var(--cf-accent) 45%, var(--cf-border) 55%); }
      .cf-btn:active, .cf-chip:active, .cf-pill:active { transform: translateY(0); }
      .cf-btn:focus-visible, .cf-chip:focus-visible, .cf-pill:focus-visible, .cf-input:focus-visible, .cf-textarea:focus-visible, .cf-select:focus-visible {
        outline: none;
        box-shadow: var(--cf-focus);
      }
      .cf-btn--primary {
        border-color: color-mix(in srgb, var(--cf-accent) 75%, #fff 25%);
        background: linear-gradient(135deg, color-mix(in srgb, var(--cf-accent) 88%, #fff 12%), color-mix(in srgb, var(--cf-accent2) 72%, var(--cf-accent) 28%));
        color: white;
      }
      .cf-btn--ghost { background: transparent; }
      .cf-btn--danger {
        border-color: color-mix(in srgb, #ef4444 65%, var(--cf-border) 35%);
        color: #fca5a5;
        background: color-mix(in srgb, #ef4444 14%, transparent);
      }

      .cf-input, .cf-textarea, .cf-select {
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-r-sm);
        background: var(--cf-card);
        color: var(--cf-text);
        padding: 0.58rem 0.78rem;
        font-size: 0.9rem;
      }
      .cf-textarea { min-height: 7rem; resize: vertical; }
      .cf-input::placeholder, .cf-textarea::placeholder { color: color-mix(in srgb, var(--cf-muted) 82%, transparent); }

      .tone-success { color: #34d399 !important; border-color: color-mix(in srgb, #34d399 45%, var(--cf-border) 55%) !important; background: color-mix(in srgb, #34d399 14%, transparent) !important; }
      .tone-warning { color: #fbbf24 !important; border-color: color-mix(in srgb, #fbbf24 45%, var(--cf-border) 55%) !important; background: color-mix(in srgb, #fbbf24 14%, transparent) !important; }
      .tone-danger { color: #f87171 !important; border-color: color-mix(in srgb, #f87171 45%, var(--cf-border) 55%) !important; background: color-mix(in srgb, #f87171 14%, transparent) !important; }
      .tone-info { color: #60a5fa !important; border-color: color-mix(in srgb, #60a5fa 45%, var(--cf-border) 55%) !important; background: color-mix(in srgb, #60a5fa 14%, transparent) !important; }
      .is-active {
        border-color: var(--cf-accent) !important;
        background: color-mix(in srgb, var(--cf-accent) 16%, var(--cf-card) 84%) !important;
        color: var(--cf-text) !important;
        box-shadow: 0 0 0 1px color-mix(in srgb, var(--cf-accent) 58%, transparent);
      }
      .is-dragover { border-color: var(--cf-accent) !important; box-shadow: 0 0 0 2px color-mix(in srgb, var(--cf-accent) 45%, transparent); }
      .is-dragging { opacity: 0.7; }
      .is-hidden { display: none !important; }

      .cf-prose { font-family: Georgia, "Times New Roman", serif; line-height: 1.72; }
      .cf-theme-crypto_neon .cf-card, .cf-theme-crypto_neon .cf-shell { backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); }
      .cf-theme-crypto_neon .cf-btn--primary, .cf-theme-crypto_neon .is-active {
        box-shadow: 0 0 0 1px color-mix(in srgb, var(--cf-accent) 42%, transparent), 0 0 20px color-mix(in srgb, var(--cf-accent2) 28%, transparent);
      }
      .cf-visual-premium_dribbble .cf-shell { box-shadow: 0 30px 60px rgba(2,6,23,0.2), 0 2px 0 rgba(255,255,255,0.04) inset; }
      .cf-visual-premium_dribbble .cf-card { box-shadow: 0 20px 40px rgba(2,6,23,0.16); border-color: color-mix(in srgb, var(--cf-border) 72%, white 28%); }
      .cf-visual-premium_dribbble .cf-card:hover { transform: translateY(-2px); }
      .cf-visual-premium_dribbble .cf-btn--primary { filter: saturate(1.08) contrast(1.02); }

      .cf-composer-activity { position: relative; }
      .cf-composer-activity.cf-block-font-override,
      .cf-composer-activity.cf-block-font-override * { font-family: var(--cf-block-font); }
      .cf-composer-activity.cf-block-text-override :is(h1, h2, h3, h4, h5, h6, p, span, div, li, ul, ol, label, summary, small, strong, em, blockquote, pre, a, button, input, textarea, select) { color: var(--cf-block-text); }
      .cf-composer-activity.cf-block-bg-override > :first-child { background: var(--cf-block-bg); }
      .cf-composer-activity.cf-block-border-override > :first-child { border-color: var(--cf-block-border); }
      .cf-composer-activity.cf-block-accent-override :is(a, .cf-btn--primary, .cf-chip.is-active, .cf-pill.is-active, .is-active) { color: var(--cf-block-accent); border-color: var(--cf-block-accent); }
      .cf-composer-activity.cf-no-border > :first-child { border: 0 !important; box-shadow: none !important; }
      .cf-composer-activity.cf-variant-flat > :first-child { background: transparent !important; }
      .cf-composer-activity.cf-pad-sm > :first-child { padding: 0.5rem !important; }
      .cf-composer-activity.cf-pad-md > :first-child { padding: 1rem !important; }
      .cf-composer-activity.cf-pad-lg > :first-child { padding: 1.5rem !important; }
      .cf-composer-activity.cf-title-xs :is(h1,h2,h3,h4) { font-size: 0.875rem !important; }
      .cf-composer-activity.cf-title-sm :is(h1,h2,h3,h4) { font-size: 1rem !important; }
      .cf-composer-activity.cf-title-md :is(h1,h2,h3,h4) { font-size: 1.125rem !important; }
      .cf-composer-activity.cf-title-lg :is(h1,h2,h3,h4) { font-size: 1.375rem !important; }
      .cf-composer-activity.cf-title-xl :is(h1,h2,h3,h4) { font-size: 1.75rem !important; }
      .cf-composer-activity.cf-canvas-item { min-height: 0; overflow: hidden; }
      .cf-composer-activity.cf-canvas-item > :first-child { height: 100%; overflow: auto; box-sizing: border-box; }
      [data-composer-root][data-composer-layout-mode="simple"][data-composer-simple-match-tallest-row="true"] { align-items: stretch; }
      [data-composer-root][data-composer-layout-mode="simple"][data-composer-simple-match-tallest-row="true"] > .cf-composer-activity { height: 100%; }
      [data-composer-root][data-composer-layout-mode="simple"][data-composer-simple-match-tallest-row="true"] > .cf-composer-activity > :first-child { height: 100%; box-sizing: border-box; }
      [data-composer-root][data-composer-layout-mode="simple"] textarea { resize: none !important; overflow-y: auto; }

      @media ${Xt.tablet} {
        [data-composer-root][data-composer-layout-mode="simple"] > .cf-composer-activity[data-composer-responsive-tablet="true"] {
          display: var(--cf-tablet-display, block) !important;
          grid-column: var(--cf-tablet-col-start, auto) / span var(--cf-tablet-col-span, 1) !important;
          grid-row: var(--cf-tablet-row-start, auto) !important;
        }
        [data-composer-root][data-composer-layout-mode="canvas"] > .cf-composer-activity[data-composer-responsive-tablet="true"] {
          display: var(--cf-tablet-display, block) !important;
          grid-column: var(--cf-tablet-col-start, 1) / span var(--cf-tablet-w, 1) !important;
          grid-row: var(--cf-tablet-row-start, 1) / span var(--cf-tablet-h, 4) !important;
        }
      }

      @media ${Xt.mobile} {
        [data-composer-root][data-composer-layout-mode="simple"] > .cf-composer-activity[data-composer-responsive-mobile="true"] {
          display: var(--cf-mobile-display, block) !important;
          grid-column: var(--cf-mobile-col-start, auto) / span var(--cf-mobile-col-span, 1) !important;
          grid-row: var(--cf-mobile-row-start, auto) !important;
        }
        [data-composer-root][data-composer-layout-mode="canvas"] > .cf-composer-activity[data-composer-responsive-mobile="true"] {
          display: var(--cf-mobile-display, block) !important;
          grid-column: var(--cf-mobile-col-start, 1) / span var(--cf-mobile-w, 1) !important;
          grid-row: var(--cf-mobile-row-start, 1) / span var(--cf-mobile-h, 4) !important;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .cf-page *, .cf-page *::before, .cf-page *::after {
          animation: none !important;
          transition: none !important;
          scroll-behavior: auto !important;
        }
      }
  `}
    </style>
    <div class="cf-page ${u} ${d}" data-template="${G(s)}" data-theme="${G(c)}" data-visual-quality="${G(l)}">
      <div class="cf-shell">
        ${h()}
      </div>
    </div>
  `,css:``,script:`${tn()}\n${dn()}`}}const pn=[`deck`,`finlit`,`coursebook`,`toolkit_dashboard`];function mn(e){return String(e||``).trim().toLowerCase()}function hn(e){return pn.includes(mn(e))}function J(e){let t=Number.parseInt(e,10);return Number.isFinite(t)?t:null}function gn(e){let t=e&&typeof e==`object`?e:{},n={},r=J(t.colSpan),i=J(t.row),a=J(t.col),o=J(t.x),s=J(t.y),c=J(t.w),l=J(t.h);return r!=null&&(n.colSpan=r),i!=null&&(n.row=i),a!=null&&(n.col=a),o!=null&&(n.x=o),s!=null&&(n.y=s),c!=null&&(n.w=c),l!=null&&(n.h=l),n}function _n(e){let t=e&&typeof e==`object`?e:{};return{composerLayout:L(t.composerLayout),activityLayouts:Object.entries(t.activityLayouts&&typeof t.activityLayouts==`object`?t.activityLayouts:{}).reduce((e,[t,n])=>{let r=String(t||``).trim();return r&&(e[r]=gn(n)),e},{})}}function vn(e,t=`deck`){let n=mn(e);if(hn(n))return n;let r=mn(t);return hn(r)?r:`deck`}function yn(e,t){let n=L(e);return{composerLayout:n,activityLayouts:z(t,{maxColumns:n.maxColumns,mode:n.mode}).reduce((e,t)=>{let n=String(t?.id||``).trim();return n&&(e[n]=gn(t?.layout)),e},{})}}function bn(e,{activities:t=[]}={}){let n=e&&typeof e==`object`?e:{},r=new Set((Array.isArray(t)?t:[]).map(e=>String(e?.id||``).trim()).filter(Boolean));return Object.entries(n).reduce((e,[t,n])=>{let i=mn(t);if(!hn(i))return e;let a=_n(n),o=Object.entries(a.activityLayouts||{}).reduce((e,[t,n])=>(r.size>0&&!r.has(t)||(e[t]=gn(n)),e),{});return e[i]={composerLayout:L(a.composerLayout),activityLayouts:o},e},{})}function xn(e){return _n(e)}function Sn(e,t,n,r){let i=L({mode:n,maxColumns:r}),a=_n(t),o=a&&a.composerLayout&&typeof a.composerLayout==`object`?L(a.composerLayout):i,s=a&&a.activityLayouts&&typeof a.activityLayouts==`object`?a.activityLayouts:{},c=z(e,{maxColumns:o.maxColumns,mode:o.mode}).map(e=>{let t=String(e?.id||``).trim(),n=t?s[t]:null;return!n||typeof n!=`object`?e:{...e,layout:{...e.layout||{},...gn(n)}}}),l=e=>{let t=String(e?.id||``).trim();return!!(t&&s[t])},u=z(c,{maxColumns:o.maxColumns,mode:o.mode}),d=u.map((e,t)=>l(e)?null:t).filter(e=>Number.isInteger(e));if(!d.length)return{composerLayout:o,activities:u};let f=new Set(d),p=new Set(u.map((e,t)=>t).filter(e=>!f.has(e))),m=p.size>0;if(o.mode===`canvas`){let e=m&&Array.from(p).reduce((e,t)=>{let n=u[t]?.layout||{},r=Number.parseInt(n.y,10),i=Number.parseInt(n.h,10),a=Number.isFinite(r)?Math.max(0,r):0,o=Number.isFinite(i)?Math.max(1,i):4;return Math.max(e,a+o)},0)||0;return{composerLayout:o,activities:z(u.map((t,n)=>{if(!f.has(n))return t;let r=t?.layout||{},i=Number.parseInt(r.w,10),a=Number.parseInt(r.h,10),o=Number.isFinite(i)?Math.max(1,i):Math.max(1,Number.parseInt(r.colSpan,10)||1),s=Number.isFinite(a)?Math.max(1,a):4,c={...t,layout:{...r||{},x:0,y:e,w:o,h:s,col:1,row:e+1,colSpan:o}};return e+=s,c}),{maxColumns:o.maxColumns,mode:o.mode})}}let h=m?Array.from(p).reduce((e,t)=>{let n=Number.parseInt(u[t]?.layout?.row,10),r=Number.isFinite(n)?Math.max(1,n):1;return Math.max(e,r)},1)+1:1;return{composerLayout:o,activities:z(u.map((e,t)=>{if(!f.has(t))return e;let n=e?.layout||{},r={...e,layout:{...n||{},row:h,col:1,x:0,y:h-1}};return h+=1,r}),{maxColumns:o.maxColumns,mode:o.mode})}}function Y(e){if(e==null)return e;try{if(typeof structuredClone==`function`)return structuredClone(e)}catch{}try{return JSON.parse(JSON.stringify(e))}catch{return e}}function Cn(e){let t=e&&typeof e==`object`?e:{},n={};return t.colSpan!=null&&(n.colSpan=t.colSpan),t.breakpoints&&typeof t.breakpoints==`object`&&(n.breakpoints=Y(t.breakpoints)),n}function wn(e){let t=e&&typeof e==`object`?e:{};return{type:String(t.type||``).trim()||`content_block`,data:Y(t.data||{}),style:Y(t.style||{}),behavior:Y(t.behavior||{}),layout:Cn(t.layout)}}function Tn(e,t,{prefix:n=`cmp`}={}){let r=String(e||``).trim()||`Untitled Component`,i=new Date().toISOString();return{id:`${n}-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,name:r,createdAt:i,updatedAt:i,activity:wn(t)}}function X(e,{fallbackPrefix:t=`cmp`}={}){if(!e||typeof e!=`object`)return null;let n=wn(e.activity);return String(n.type||``).trim()?{id:String(e.id||`${t}-${Date.now()}-${Math.random().toString(36).slice(2,8)}`).trim(),name:String(e.name||``).trim()||`Untitled Component`,createdAt:String(e.createdAt||e.updatedAt||``).trim()||new Date().toISOString(),updatedAt:String(e.updatedAt||e.createdAt||``).trim()||new Date().toISOString(),activity:n}:null}function En(e,t={}){return(Array.isArray(e)?e:[]).map(e=>X(e,t)).filter(Boolean)}function Dn(e){if(!e||typeof e!=`object`||!e.component||typeof e.component!=`object`)return null;let t=String(e.component.sourceId||``).trim();return t?{sourceId:t,sourceName:String(e.component.sourceName||``).trim()||`Course Component`,linked:e.component.linked!==!1,linkedAt:String(e.component.linkedAt||``).trim()||``,sourceUpdatedAt:String(e.component.sourceUpdatedAt||``).trim()||``}:null}function On(e){let t=X(e);return t?{sourceId:t.id,sourceName:t.name,linked:!0,linkedAt:new Date().toISOString(),sourceUpdatedAt:t.updatedAt||t.createdAt||``}:null}function kn(e,t){let n=e&&typeof e==`object`?{...e}:{},r=On(t);return r&&(n.component=r),n}function An(e,t,{name:n}={}){let r=X(e);if(!r)return null;let i=String(n||r.name||``).trim()||`Untitled Component`;return{...r,name:i,updatedAt:new Date().toISOString(),activity:wn(t)}}function jn(e,t){let n=Dn(e);if(!n)return{linked:!1,stale:!1,missingSource:!1,sourceEntry:null,link:null};let r=En(t).find(e=>e.id===n.sourceId)||null,i=String(r?.updatedAt||r?.createdAt||``).trim();return{linked:!!n.linked,stale:!!(r&&i!==String(n.sourceUpdatedAt||``).trim()),missingSource:!r,sourceEntry:r,link:n}}function Mn(e){if(!e||typeof e!=`object`||!e.component)return e;let t={...e};return delete t.component,t}function Nn(e,t){let n=Dn(e);return!!(n?.sourceId&&String(n.sourceId)===String(t||``).trim())}function Pn(e,t,{preserveLayout:n=!0}={}){let r=X(t);if(!r||!Nn(e,r.id))return{changed:!1,activity:e};let i=e&&typeof e==`object`?e:{},a=Dn(i),o=wn(r.activity),s=On(r),c={...i,...o,id:i.id||o.id,layout:n&&i.layout&&typeof i.layout==`object`?Y(i.layout):Cn(o.layout),component:a?.linkedAt?{...s,linkedAt:a.linkedAt}:s},l=JSON.stringify(i)!==JSON.stringify(c);return{changed:l,activity:l?c:e}}function Fn(e,t,n={}){let r=!1,i=0,a=(Array.isArray(e)?e:[]).map(e=>{let a=Pn(e,t,n);return a.changed?(r=!0,i+=1,a.activity):e});return{changed:r,count:i,activities:r?a:Array.isArray(e)?e:[]}}function In(e,t,n={}){let r=!1,i=0,a=(Array.isArray(e)?e:[]).map(e=>{if(!Array.isArray(e?.activities)||e.activities.length===0)return e;let a=Fn(e.activities,t,n);return a.changed?(r=!0,i+=a.count,{...e,activities:a.activities}):e});return{changed:r,count:i,modules:r?a:Array.isArray(e)?e:[]}}function Ln(e){return{...e?.layout&&typeof e.layout==`object`?e.layout:{}}}function Z(e,t){return{...e,layout:{...Ln(e),...t}}}function Q(e){let t=Ln(e),n=Math.max(1,Number.isInteger(t.w)?t.w:Number.isInteger(t.colSpan)?t.colSpan:1),r=Math.max(1,Number.isInteger(t.h)?t.h:4);return{x:Math.max(0,Number.isInteger(t.x)?t.x:0),y:Math.max(0,Number.isInteger(t.y)?t.y:0),w:n,h:r}}function Rn(e){let t=Ln(e);return{row:Math.max(1,Number.isInteger(t.row)?t.row:1),col:Math.max(1,Number.isInteger(t.col)?t.col:1),colSpan:Math.max(1,Number.isInteger(t.colSpan)?t.colSpan:1)}}function $(e,t,n){let r=new Set((Array.isArray(t)?t:[]).filter(e=>Number.isInteger(e)));return r.size<=1?e:(Array.isArray(e)?e:[]).map((e,t)=>r.has(t)?n(e,t):e)}function zn(e,t,n){let r=(Array.isArray(e)?e:[]).filter(e=>Number.isInteger(e));if(!r.length)return[];let i=r.includes(t)?t:r[0];return[i,...r.filter(e=>e!==i).sort(n)]}function Bn(e,t,n,r=`left`){let i=e?.[n];if(!i)return e;let a=Q(i);return $(e,t,e=>{let t=Q(e);return r===`left`?Z(e,{x:a.x}):r===`right`?Z(e,{x:Math.max(0,a.x+a.w-t.w)}):r===`top`?Z(e,{y:a.y}):r===`bottom`?Z(e,{y:Math.max(0,a.y+a.h-t.h)}):e})}function Vn(e,t,n=`horizontal`){let r=(Array.isArray(t)?t:[]).filter(e=>Number.isInteger(e));if(r.length<=2)return e;let i=[...r].sort((t,r)=>{let i=Q(e[t]),a=Q(e[r]);return n===`vertical`?i.y-a.y||i.x-a.x:i.x-a.x||i.y-a.y}),a=Q(e[i[0]]),o=Q(e[i[i.length-1]]),s=i.reduce((t,r)=>{let i=Q(e[r]);return t+(n===`vertical`?i.h:i.w)},0),c=n===`vertical`?Math.max(0,o.y+o.h-a.y):Math.max(0,o.x+o.w-a.x),l=Math.max(0,(c-s)/(i.length-1)),u=n===`vertical`?a.y:a.x,d=new Map;return i.forEach(t=>{let r=Q(e[t]);n===`vertical`?(d.set(t,{y:Math.round(u)}),u+=r.h+l):(d.set(t,{x:Math.round(u)}),u+=r.w+l)}),$(e,i,(e,t)=>Z(e,d.get(t)||{}))}function Hn(e,t,n,r=`width`){let i=e?.[n];if(!i)return e;let a=Q(i);return $(e,t,e=>r===`height`?Z(e,{h:a.h}):Z(e,{w:a.w,colSpan:a.w}))}function Un(e,t,n){let r=e?.[n];if(!r)return e;let i=Q(r),a=zn(t,n,(t,n)=>{let r=Q(e[t]),i=Q(e[n]);return r.y-i.y||r.x-i.x||t-n}),o=new Map,s=i.y;return a.forEach(t=>{let n=Q(e[t]);o.set(t,{x:i.x,y:s}),s+=n.h}),$(e,a,(e,t)=>Z(e,o.get(t)||{}))}function Wn(e,t,n){let r=e?.[n];if(!r)return e;let i=Rn(r);return $(e,t,e=>Z(e,{colSpan:i.colSpan,w:i.colSpan}))}function Gn(e,t,n){let r=e?.[n];if(!r)return e;let i=Rn(r),a=zn(t,n,(t,n)=>{let r=Rn(e[t]),i=Rn(e[n]);return r.row-i.row||r.col-i.col||t-n}),o=new Map;return a.forEach((e,t)=>{o.set(e,{row:i.row+t,col:i.col})}),$(e,a,(e,t)=>Z(e,o.get(t)||{}))}function Kn(e,t=`activity`){return String(e||``).trim().toLowerCase().replace(/[^a-z0-9]+/g,`-`).replace(/^-+|-+$/g,``)||t}function qn(e){return e&&typeof e==`object`?{...e}:e}function Jn(e,t){return`${Kn(e,`activity`)}-${Date.now()}-${t+1}-${Math.random().toString(36).slice(2,6)}`}function Yn(e={},t=0){return String(e.title||e.caption||e.label||``).trim()||(String(e.url||``).trim().split(`/`).pop()?.split(`?`)[0]?.split(`#`)[0]||``).replace(/\.[a-z0-9]{2,8}$/i,``).replace(/[-_]+/g,` `).replace(/\s+/g,` `).trim()||`Image ${t+1}`}function Xn(e){let t=Array.isArray(e)?e:[],n=new Set,r=!1,i=0;return{activities:t.map((e,t)=>{let a=qn(e),o=String(e?.id||``).trim();return!o||n.has(o)?(a.id=Jn(e?.type,t),r=!0,i+=1,n.add(a.id),a):(n.add(o),a)}),changed:r,fixedCount:i}}function Zn(e){let t=Array.isArray(e)?e:[],n=!1,r=0;return{activities:t.map((e,t)=>{if(e?.type!==`image_block`)return e;let i=e?.data&&typeof e.data==`object`?e.data:{};return String(i.alt||``).trim()?e:(n=!0,r+=1,{...e,data:{...i,alt:Yn(i,t)}})}),changed:n,fixedCount:r}}function Qn(e,{breakpoint:t=`mobile`}={}){let n=Array.isArray(e)?e:[],r=!1,i=0;return{activities:n.map(e=>{let n=e?.layout&&typeof e.layout==`object`?e.layout:null;if(!n)return e;let a=n.breakpoints&&typeof n.breakpoints==`object`?n.breakpoints:{},o=a[t]&&typeof a[t]==`object`?a[t]:null;if(o&&Object.keys(o).length>0)return e;let s=Number.isInteger(n?.x)||Number.isInteger(n?.w)||Number.isInteger(n?.h);return(Number.isInteger(n?.colSpan)?n.colSpan:Number.isInteger(n?.w)?n.w:1)<=1?e:(r=!0,i+=1,{...e,layout:{...n,breakpoints:{...a,[t]:s?{...o||{},x:0,w:1}:{...o||{},col:1,colSpan:1}}}})}),changed:r,fixedCount:i}}const $n=[{value:`simple`,label:`Simple`},{value:`advanced`,label:`Advanced`}].map(e=>e.value),er=[{value:`focus`,label:`Focus`,settings:{previewWidth:62,previewHeight:900,builderHeight:720,builderCellWidth:220,lockBuilderScale:!0}},{value:`balanced`,label:`Balanced`,settings:{previewWidth:55,previewHeight:900,builderHeight:760,builderCellWidth:220,lockBuilderScale:!0}},{value:`canvas`,label:`Canvas`,settings:{previewWidth:45,previewHeight:1e3,builderHeight:860,builderCellWidth:240,lockBuilderScale:!1}}];function tr(e,t=`simple`){let n=String(e||``).trim().toLowerCase();return n&&$n.includes(n)?n:t}export{ge as $,Pt as A,Tt as B,bn as C,Ut as D,Ht as E,Lt as F,z as G,A as H,dt as I,nt as J,L as K,V as L,It as M,Bt as N,Gt as O,Ft as P,T as Q,U as R,xn as S,fn as T,tt as U,ct as V,lt as W,se as X,De as Y,x as Z,Fn as _,Qn as a,Sn as b,Hn as c,Gn as d,he as et,kn as f,En as g,jn as h,Zn as i,Ee as it,Vt as j,Kt as k,Wn as l,Mn as m,tr as n,le as nt,Bn as o,Tn as p,st as q,Xn as r,ie as rt,Vn as s,er as t,re as tt,Un as u,In as v,vn as w,yn as x,An as y,mt as z};