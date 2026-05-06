export function speak(text: string) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 0.9;
  u.pitch = 1;
  u.lang = 'en-US';
  window.speechSynthesis.speak(u);
}

export function exportBookmarksAsPDF(terms: { word: string; category: string; explanation: { beginner: string } }[]) {
  const content = terms.map(t =>
    `<div style="page-break-inside:avoid;margin-bottom:24px;padding:16px;border:1px solid #ddd;border-radius:8px;">
      <h3 style="color:#b8860b;margin:0 0 4px">${t.word}</h3>
      <p style="color:#888;font-size:12px;margin:0 0 8px">${t.category}</p>
      <p style="margin:0;font-size:14px;line-height:1.6">${t.explanation.beginner}</p>
    </div>`
  ).join('');

  const html = `<!DOCTYPE html><html><head><title>Gnosis Bookmarks</title>
    <style>body{font-family:Georgia,serif;max-width:700px;margin:40px auto;padding:20px}
    h1{text-align:center;color:#b8860b}p.sub{text-align:center;color:#888}</style></head>
    <body><h1>Gnosis — Bookmarked Terms</h1><p class="sub">${terms.length} terms · Exported ${new Date().toLocaleDateString()}</p>
    <hr style="border:none;border-top:1px solid #ddd;margin:24px 0">${content}</body></html>`;

  const w = window.open('', '_blank');
  if (w) { w.document.write(html); w.document.close(); w.print(); }
}
