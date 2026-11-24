// === js/terminal.js — terminal log rendering (appendLog) + escapeHtml.
// Load order: 4th. Depends on state.js. ===
    function appendLog(htmlContent, type = 'system') {
      const wrapper = document.createElement('div');
      wrapper.className = 'log-entry';

      if (type === 'user') {
        wrapper.innerHTML = `<div class="text-emerald-400 font-bold flex items-center gap-2"><span class="text-slate-500">&gt;</span> ${escapeHtml(htmlContent)}</div>`;
      } else if (type === 'error') {
        wrapper.innerHTML = `
          <div class="bg-rose-950/60 border-l-4 border-rose-500 rounded-r-xl p-3 text-rose-200 text-xs sm:text-sm">
            <div class="font-bold text-rose-400 uppercase tracking-wider text-[11px] mb-0.5">&#9888; Protocol Error</div>
            <div>${htmlContent}</div>
          </div>`;
      } else if (type === 'info') {
        wrapper.innerHTML = `
          <div class="bg-slate-900/90 border border-slate-700/80 rounded-xl p-3 text-cyan-200 text-xs sm:text-sm">
            ${htmlContent}
          </div>`;
      } else if (type === 'hint') {
        wrapper.innerHTML = `
          <div class="bg-amber-950/50 border-l-4 border-amber-400 rounded-r-xl p-3 text-amber-200 text-xs sm:text-sm">
            <span class="font-bold text-amber-400">HINT:</span> ${htmlContent}
          </div>`;
      } else if (type === 'summary') {
        wrapper.innerHTML = `
          <div class="bg-gradient-to-br from-emerald-950/80 to-slate-900 border-2 border-emerald-500/50 rounded-2xl p-4 text-xs sm:text-sm shadow-lg shadow-emerald-950/50">
            ${htmlContent}
          </div>`;
      } else {
        const stageData = STAGES[state.stage];
        wrapper.innerHTML = `
          <div class="space-y-2 border-b border-slate-800/80 pb-3.5">
            <div class="inline-block text-[11px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              ${stageData ? stageData.location : ''}
            </div>
            ${htmlContent}
          </div>`;
      }

      terminalLog.appendChild(wrapper);
      terminalLog.scrollTop = terminalLog.scrollHeight;
    }

    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }
