// === js/actions.js — game logic: quick actions, stage entry, dispatchAction(), typed-command
// parser, resetSimulation(). Load order: 6th. Depends on all previous chunks. ===
    function renderQuickActions() {
      const stageData = STAGES[state.stage];
      if (!stageData) return;
      quickActionsContainer.innerHTML = '';

      stageData.actions.forEach((act) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = act.label;

        let classes = 'px-2.5 py-1.5 rounded-lg font-mono text-xs font-semibold transition active:scale-95 border ';
        if (act.style === 'primary') {
          classes += 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border-emerald-500/40 shadow-sm';
        } else if (act.style === 'danger') {
          classes += 'bg-slate-900/90 hover:bg-rose-950/60 text-slate-300 hover:text-rose-300 border-slate-700 hover:border-rose-500/40';
        } else {
          classes += 'bg-slate-900/90 hover:bg-slate-800 text-cyan-300 border-slate-700';
        }

        btn.className = classes;
        btn.addEventListener('click', () => dispatchAction(act.id, act.label));
        quickActionsContainer.appendChild(btn);
      });
    }

    function enterStage(stageNum) {
      state.stage = stageNum;
      const stageData = STAGES[stageNum];
      state.activeNode = stageData.activeNode;

      const paragraphsHtml = stageData.narrative
        .map((p) => `<p class="text-slate-200">${p}</p>`)
        .join('');

      appendLog(paragraphsHtml, 'system');
      syncVisuals();
    }

    function buildSummaryCard() {
      const accuracy = state.errors === 0
        ? '100% — Flawless!'
        : `${Math.max(0, Math.round(100 - (state.errors / (state.errors + state.hops + 1)) * 100))}% (${state.errors} error${state.errors > 1 ? 's' : ''})`;
      const hopVerdict = state.hops <= OPTIMAL_STEPS
        ? `<span class="text-emerald-400">Optimal path (${state.hops}/${OPTIMAL_STEPS} steps)</span>`
        : `<span class="text-amber-400">${state.hops}/${OPTIMAL_STEPS} steps (penalty from Stage 6B outage)</span>`;
      const stage6BFlag = state.stage6BVisited
        ? '<li class="text-rose-300">&#9888; Authoritative server overloaded—caching the response would have prevented this.</li>'
        : '<li class="text-emerald-300">&#10003; Resolver cached the record—authoritative server protected from query floods.</li>';

      return `
        <div class="font-bold text-emerald-300 text-sm mb-2">&#9733; END-OF-RUN SUMMARY — DNS QUEST COMPLETE &#9733;</div>
        <div class="grid grid-cols-2 gap-2 mb-2">
          <div class="bg-slate-950/70 rounded-lg p-2 border border-slate-800">
            <div class="text-[10px] uppercase text-slate-500">Hop Accuracy</div>
            <div class="text-slate-100 font-semibold">${hopVerdict}</div>
          </div>
          <div class="bg-slate-950/70 rounded-lg p-2 border border-slate-800">
            <div class="text-[10px] uppercase text-slate-500">Command Accuracy</div>
            <div class="text-slate-100 font-semibold">${accuracy}</div>
          </div>
          <div class="bg-slate-950/70 rounded-lg p-2 border border-slate-800">
            <div class="text-[10px] uppercase text-slate-500">Resolved IP</div>
            <div class="text-emerald-400 font-semibold">${TARGET_IP}</div>
          </div>
          <div class="bg-slate-950/70 rounded-lg p-2 border border-slate-800">
            <div class="text-[10px] uppercase text-slate-500">Total Hops / Errors</div>
            <div class="text-slate-100 font-semibold">${state.hops} hops / ${state.errors} errors</div>
          </div>
        </div>
        <div class="text-[11px] font-bold uppercase text-cyan-300 mb-1">J277 Exam Takeaways:</div>
        <ul class="space-y-1 text-xs text-slate-300 list-disc list-inside">
          <li>DNS translates human-readable domain names into IP addresses so routers can forward packets.</li>
          <li>DNS is a <strong>hierarchical, distributed database</strong>: Local Cache &rarr; ISP Resolver &rarr; Root &rarr; TLD &rarr; Authoritative NS.</li>
          <li><strong>Why resolvers cache records:</strong> faster repeat lookups, less internet traffic, and protection for authoritative servers.</li>
          ${stage6BFlag}
          <li><strong>Why skipping the cache is dangerous:</strong> uncached records let traffic spikes overload and take down an authoritative server (SERVFAIL).</li>
          <li><strong>TTL (Time to Live)</strong> controls how long a cached record remains valid before it must be re-resolved.</li>
        </ul>`;
    }
    /**
     * Core Action Dispatcher
     */
    function dispatchAction(actionId, displayCommand = null) {
      if (displayCommand) {
        appendLog(displayCommand, 'user');
      }

      // Global Utility Commands
      if (actionId === 'INSPECT_PACKET' || actionId === 'INSPECT') {
        sfx.playTone(440, 'sine', 0.08, 0.05);
        appendLog(
          `<div class="font-bold text-cyan-300 mb-1">PACKET HEADER INSPECTION:</div>
           <ul class="space-y-0.5 text-xs">
             <li>&bull; <strong>Src IP:</strong> 192.168.1.42</li>
             <li>&bull; <strong>Dest Domain:</strong> ${TARGET_DOMAIN}</li>
             <li>&bull; <strong>Dest IP:</strong> <span class="${state.resolvedIp ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}">${state.resolvedIp || 'NULL'}</span></li>
             <li>&bull; <strong>Record Type:</strong> A (IPv4)</li>
           </ul>`,
          'info'
        );
        return;
      }

      if (actionId === 'HINT' || actionId === 'HELP') {
        sfx.playTone(587.33, 'sine', 0.1, 0.05);
        const sd = STAGES[state.stage];
        if (sd) appendLog(sd.hint, 'hint');
        return;
      }

      if (actionId === 'LOOK') {
        const meta = NODE_METADATA[state.activeNode];
        const sd = STAGES[state.stage];
        appendLog(
          `<strong>Current Node:</strong> ${meta ? meta.title : state.activeNode}<br/>
           <strong>Role:</strong> ${meta ? meta.desc : ''}<br/>
           <strong>Available paths:</strong> ${sd ? sd.actions.map(a => a.label).join(', ') : ''}`,
          'info'
        );
        return;
      }

      if (actionId === 'RESET_SIMULATION' || actionId === 'RESET_SIM') {
        resetSimulation();
        return;
      }

      switch (state.stage) {
        case 0:
          if (actionId === 'CHECK_LOCAL_CACHE' || actionId === 'CHECK_CACHE') {
            state.hops++;
            state.completedNodes.add('client');
            sfx.playSuccess();
            activateEdge('edge-client-cache', 'label-client-cache', '#f59e0b', 'url(#arrow-amber)', true);
            animatePacketTravel('client', 'localCache', 'CHECK CACHE', '#f59e0b');
            enterStage(1);
          } else if (actionId === 'CONNECT_WEBSERVER' || actionId === 'CONNECT' || actionId === 'HTTP') {
            state.errors++;
            sfx.playError();
            flashErrorEdge('client', 'webserver');
            flashNodeError('client');
            animatePacketTravel('client', 'webserver', 'ERR: IP=NULL', '#f43f5e', true);
            appendLog(
              '<strong>Connection Failed:</strong> Cannot route packet—Destination IP is NULL. Routers cannot forward packets using domain names alone. Check your <strong>Local Cache</strong> first.',
              'error'
            );
            syncVisuals();
          } else if (actionId === 'QUERY_ROOT') {
            state.errors++;
            sfx.playError();
            flashErrorEdge('client', 'root');
            animatePacketTravel('client', 'root', 'BLOCKED', '#f43f5e', true);
            appendLog(
              '<strong>Network Policy Block:</strong> Home clients do not query Root Servers directly; check your local cache or ask your configured ISP DNS Resolver.',
              'error'
            );
            syncVisuals();
          }
          break;

        case 1:
          if (actionId === 'QUERY_RESOLVER') {
            state.hops++;
            sfx.playSuccess();
            activateEdge('edge-client-cache', 'label-client-cache', '#64748b', 'url(#arrow-muted)', false);
            activateEdge('edge-client-resolver', 'label-client-resolver', '#22d3ee', 'url(#arrow-cyan)', true);
            animatePacketTravel('client', 'resolver', 'DNS QUERY', '#22d3ee');
            enterStage(2);
          } else if (actionId === 'USE_EXPIRED_CACHE') {
            state.errors++;
            sfx.playError();
            flashNodeError('localCache');
            appendLog(
              '<strong>Stale Record Rejected:</strong> TTL is 0s. Using expired records risks connecting to an outdated or hijacked server. Query your <strong>ISP Recursive Resolver</strong> instead.',
              'error'
            );
            syncVisuals();
          } else if (actionId === 'QUERY_ROOT') {
            state.errors++;
            sfx.playError();
            flashErrorEdge('client', 'root');
            appendLog(
              'Your device is configured to delegate recursive lookups to your <strong>ISP Recursive Resolver</strong> first.',
              'error'
            );
            syncVisuals();
          }
          break;

        case 2:
          if (actionId === 'CHECK_RESOLVER_CACHE' || actionId === 'CHECK_CACHE') {
            sfx.playTone(440, 'sine', 0.08, 0.05);
            appendLog(
              `<strong>ISP Resolver Cache Check:</strong> <span class="text-amber-300">CACHE MISS</span>. No entry for <code class="text-cyan-300">${TARGET_DOMAIN}</code> in the resolver's shared cache. The resolver must query the <strong>Root DNS Server (.)</strong> next.`,
              'info'
            );
          } else if (actionId === 'QUERY_ROOT') {
            state.hops++;
            state.discoveredNodes.add('root');
            sfx.playSuccess();
            activateEdge('edge-client-resolver', 'label-client-resolver', '#10b981', 'url(#arrow-emerald)', false);
            activateEdge('edge-resolver-root', 'label-resolver-root', '#10b981', 'url(#arrow-emerald)', true);
            animatePacketTravel('resolver', 'root', 'QUERY ROOT (.)', '#22d3ee');
            setTimeout(() => {
              animatePacketTravel('root', 'resolver', 'Referral: .uk TLD', '#10b981');
            }, 720);
            enterStage(3);
          } else if (actionId === 'QUERY_TLD') {
            state.errors++;
            sfx.playError();
            flashErrorEdge('resolver', 'tld');
            appendLog(
              '<strong>Unknown Target:</strong> The resolver hasn\'t asked the Root Server where the <code class="text-rose-300">.uk</code> registry is located yet.',
              'error'
            );
            syncVisuals();
          } else if (actionId === 'QUERY_AUTHORITATIVE') {
            state.errors++;
            sfx.playError();
            flashErrorEdge('resolver', 'auth');
            appendLog(
              '<strong>Unknown Target:</strong> In a distributed database of billions of domains, the resolver does not know which Authoritative Server owns <code class="text-rose-300">wwt.org.uk</code>.',
              'error'
            );
            syncVisuals();
          }
          break;

        case 3:
          if (actionId === 'QUERY_TLD' || actionId === 'RETURN_REFERRAL') {
            state.hops++;
            state.discoveredNodes.add('tld');
            state.completedNodes.add('root');
            sfx.playSuccess();
            activateEdge('edge-resolver-root', 'label-resolver-root', '#10b981', 'url(#arrow-emerald)', false);
            activateEdge('edge-resolver-tld', 'label-resolver-tld', '#10b981', 'url(#arrow-emerald)', true);
            animatePacketTravel('resolver', 'tld', 'QUERY .uk TLD', '#22d3ee');
            setTimeout(() => {
              animatePacketTravel('tld', 'resolver', 'Referral: ns1.wwt.org.uk', '#10b981');
            }, 720);
            enterStage(4);
          } else if (actionId === 'DEMAND_IP_FROM_ROOT' || actionId === 'DEMAND_IP_ROOT') {
            state.errors++;
            sfx.playError();
            flashNodeError('root');
            appendLog(
              '<strong>Root Server Response:</strong> <em>"I only manage top-level extensions (.com, .uk, .org). Ask the .uk TLD server I just referred you to!"</em>',
              'error'
            );
            syncVisuals();
          }
          break;

        case 4:
          if (actionId === 'QUERY_AUTHORITATIVE') {
            state.hops++;
            state.discoveredNodes.add('auth');
            state.completedNodes.add('tld');
            sfx.playSuccess();
            activateEdge('edge-resolver-tld', 'label-resolver-tld', '#10b981', 'url(#arrow-emerald)', false);
            activateEdge('edge-resolver-auth', 'label-resolver-auth', '#10b981', 'url(#arrow-emerald)', true);
            animatePacketTravel('resolver', 'auth', 'QUERY AUTH NS', '#22d3ee');
            setTimeout(() => {
              animatePacketTravel('auth', 'resolver', 'Referral: A Record', '#10b981');
            }, 720);
            enterStage(5);
          } else if (actionId === 'CONNECT_WEBSERVER' || actionId === 'CONNECT') {
            state.errors++;
            sfx.playError();
            flashErrorEdge('client', 'webserver');
            appendLog(
              '<strong>Error:</strong> You still only have the name of the Authoritative Name Server, not the Web Server\'s IP address.',
              'error'
            );
            syncVisuals();
          } else if (actionId === 'QUERY_ROOT') {
            state.errors++;
            sfx.playError();
            appendLog(
              '<strong>Redundant Loop:</strong> You already queried the Root Server and received the <code class="text-rose-300">.uk</code> TLD referral.',
              'error'
            );
            syncVisuals();
          }
          break;

        case 5:
          if (actionId === 'FETCH_A_RECORD' || actionId === 'RETURN_IP') {
            state.hops++;
            state.completedNodes.add('auth');
            sfx.playSuccess();
            activateEdge('edge-resolver-auth', 'label-resolver-auth', '#10b981', 'url(#arrow-emerald)', true);
            animatePacketTravel('resolver', 'auth', 'QUERY A RECORD', '#22d3ee');
            setTimeout(() => {
              animatePacketTravel('auth', 'resolver', 'A Record: 172.67.182.44', '#10b981');
            }, 720);
            enterStage(6);
          } else if (actionId === 'LOAD_WEBPAGE_HERE') {
            state.errors++;
            sfx.playError();
            flashNodeError('auth');
            appendLog(
              '<strong>Role Mismatch:</strong> Name servers only store DNS address records, not HTML/CSS website files. Return the IP address to the resolver first!',
              'error'
            );
            syncVisuals();
          }
          break;

        case 6:
          if (actionId === 'CACHE_AND_REPLY' || actionId === 'SAVE_CACHE' || actionId === 'STORE_CACHE') {
            state.hops++;
            state.resolvedIp = TARGET_IP;
            state.resolverCache = { domain: TARGET_DOMAIN, ip: TARGET_IP, ttl: '3600s' };
            state.clientCache = { domain: TARGET_DOMAIN, ip: TARGET_IP, ttl: '3600s', valid: true };
            state.completedNodes.add('resolver');
            state.completedNodes.add('localCache');
            state.discoveredNodes.add('webserver');
            sfx.playSuccess();
            animatePacketTravel('resolver', 'client', TARGET_IP, '#10b981');
            enterStage(7);
          } else if (actionId === 'REPLY_WITHOUT_CACHING' || actionId === 'REPLY_NO_CACHE') {
            state.errors++;
            state.stage6BVisited = true;
            sfx.playAlarm();
            enterStage('6B');
            setTimeout(() => {
              animateSwarm('resolver', 'auth', 22);
              setNodeOverloaded('auth', true);
              flashNodeError('auth');
              syncVisuals();
            }, 400);
          }
          break;

        case '6B':
          if (actionId === 'WAIT_RECOVER_CACHE_REPLY' || actionId === 'RECOVER_AND_CACHE') {
            state.hops += 6;
            state.resolvedIp = TARGET_IP;
            state.resolverCache = { domain: TARGET_DOMAIN, ip: TARGET_IP, ttl: '3600s' };
            state.clientCache = { domain: TARGET_DOMAIN, ip: TARGET_IP, ttl: '3600s', valid: true };
            setNodeOverloaded('auth', false);
            state.completedNodes.add('auth');
            state.completedNodes.add('resolver');
            state.completedNodes.add('localCache');
            state.discoveredNodes.add('webserver');
            sfx.playSuccess();
            animateSwarm('resolver', 'auth', 5);
            setTimeout(() => {
              animatePacketTravel('resolver', 'client', TARGET_IP, '#10b981');
            }, 600);
            enterStage(7);
            appendLog(
              '<strong>Recovery complete.</strong> The resolver finally cached <code class="text-cyan-300">www.wwt.org.uk &rarr; 172.67.182.44 (TTL: 3600s)</code> and replied to the client. <span class="text-amber-400">Hop penalty: +6 steps for repeated lookups and the outage.</span>',
              'info'
            );
          } else if (actionId === 'KEEP_QUERYING_NO_CACHE') {
            state.errors++;
            sfx.playError();
            animateSwarm('resolver', 'auth', 10);
            flashErrorEdge('resolver', 'auth');
            flashNodeError('auth');
            appendLog(
              '<strong>The authoritative server is still down and rate-limiting your ISP\'s resolver.</strong> No lookup will succeed until the record is cached somewhere.',
              'error'
            );
            syncVisuals();
          }
          break;

        case 7:
          if (actionId === 'CONNECT_WEBSERVER' || actionId === 'CONNECT' || actionId === 'HTTP') {
            state.hops++;
            state.completedNodes.add('webserver');
            sfx.playVictory();
            activateEdge('edge-client-web', 'label-client-web', '#10b981', 'url(#arrow-emerald)', true);
            animatePacketTravel('client', 'webserver', 'HTTPS GET /index.html', '#10b981');
            setTimeout(() => {
              animatePacketTravel('webserver', 'client', 'HTTP 200 OK', '#10b981');
            }, 720);
            enterStage(8);
            setTimeout(() => {
              appendLog(buildSummaryCard(), 'summary');
            }, 1600);
          } else if (actionId === 'QUERY_ROOT') {
            state.errors++;
            sfx.playError();
            appendLog(
              '<strong>DNS Resolution is already complete!</strong> You have the IP address—connect to the Web Server.',
              'error'
            );
            syncVisuals();
          }
          break;

        case 8:
          if (actionId === 'VISIT_SITE_AGAIN' || actionId === 'RELOAD') {
            state.hops++;
            state.clientCache.ttl = '3590s';
            state.bypassedNodes = new Set(['resolver', 'root', 'tld', 'auth']);
            sfx.playVictory();

            ['edge-client-resolver', 'edge-resolver-root', 'edge-resolver-tld', 'edge-resolver-auth'].forEach((id) => {
              const el = document.getElementById(id);
              if (el) {
                el.setAttribute('stroke', '#1e293b');
                el.classList.remove('edge-animated');
                el.setAttribute('stroke-dasharray', '4 4');
              }
            });
            ['label-client-resolver', 'label-resolver-root', 'label-resolver-tld', 'label-resolver-auth'].forEach((id) => {
              const el = document.getElementById(id);
              if (el) el.classList.add('opacity-0');
            });

            document.getElementById('labelText-client-cache').textContent = 'CACHE HIT (3590s)!';
            activateEdge('edge-client-cache', 'label-client-cache', '#fbbf24', 'url(#arrow-gold)', true);
            document.getElementById('labelText-client-web').textContent = 'DIRECT HTTPS (BYPASSED DNS)';
            activateEdge('edge-client-web', 'label-client-web', '#fbbf24', 'url(#arrow-gold)', true);

            animatePacketTravel('client', 'localCache', 'CACHE HIT!', '#fbbf24');
            setTimeout(() => {
              animatePacketTravel('client', 'webserver', 'DIRECT HTTPS', '#fbbf24');
            }, 720);

            enterStage(9);
          } else if (actionId === 'RESET_SIMULATION') {
            resetSimulation();
          }
          break;

        case 9:
          if (actionId === 'RESET_SIMULATION' || actionId === 'RESET_SIM') {
            resetSimulation();
          }
          break;
      }
    }

    /**
     * Natural Zork-Style Command Line Parser (per SPEC Section 4)
     */
    function parseTypedCommand(raw) {
      const cmd = raw.trim().toUpperCase();
      if (!cmd) return;

      if (cmd === 'LOOK' || cmd === 'L' || cmd === 'WHERE AM I') {
        dispatchAction('LOOK', raw);
      } else if (cmd.includes('INSPECT') || cmd === 'PACKET' || cmd === 'HEADER') {
        dispatchAction('INSPECT_PACKET', raw);
      } else if (cmd === 'HELP' || cmd === 'HINT' || cmd === '?') {
        dispatchAction('HINT', raw);
      } else if (cmd === 'RESET' || cmd === 'RESTART' || cmd.includes('RESET SIM')) {
        dispatchAction('RESET_SIMULATION', raw);
      } else if (cmd.includes('RELOAD') || cmd.includes('REFRESH') || cmd.includes('AGAIN') || cmd.includes('VISIT')) {
        dispatchAction('VISIT_SITE_AGAIN', raw);
      } else if (cmd.includes('EXPIRED') || cmd.includes('STALE') || cmd.includes('USE OLD')) {
        dispatchAction('USE_EXPIRED_CACHE', raw);
      } else if (cmd.includes('WITHOUT CACH') || cmd.includes('NO CACHE') || cmd.includes('SKIP CACHE') || cmd.includes('DON\'T CACHE') || cmd.includes('DONT CACHE')) {
        dispatchAction('REPLY_WITHOUT_CACHING', raw);
      } else if (cmd.includes('KEEP QUERY') || cmd.includes('RETRY') || cmd.includes('QUERY AGAIN')) {
        dispatchAction('KEEP_QUERYING_NO_CACHE', raw);
      } else if (cmd.includes('WAIT') || cmd.includes('RECOVER')) {
        if (state.stage === '6B') dispatchAction('WAIT_RECOVER_CACHE_REPLY', raw);
        else dispatchAction('CACHE_AND_REPLY', raw);
      } else if (cmd.includes('SAVE') || cmd.includes('STORE') || (cmd.includes('CACHE') && (cmd.includes('REPLY') || cmd.includes('AND')))) {
        dispatchAction('CACHE_AND_REPLY', raw);
      } else if (cmd.includes('RESOLVER CACHE') || cmd.includes('ISP CACHE') || cmd.includes('SERVER CACHE')) {
        dispatchAction('CHECK_RESOLVER_CACHE', raw);
      } else if (cmd.includes('CACHE') || cmd === 'C' || cmd.includes('CHECK LOCAL')) {
        if (state.stage === 2) dispatchAction('CHECK_RESOLVER_CACHE', raw);
        else if (state.stage === 6) dispatchAction('CACHE_AND_REPLY', raw);
        else dispatchAction('CHECK_LOCAL_CACHE', raw);
      } else if (cmd.includes('QUERY') || cmd.includes('SEND') || cmd.includes('ASK')) {
        if (cmd.includes('ROOT')) {
          if (cmd.includes('DEMAND') || cmd.includes('IP')) dispatchAction('DEMAND_IP_FROM_ROOT', raw);
          else dispatchAction('QUERY_ROOT', raw);
        } else if (cmd.includes('TLD') || cmd.includes('.UK') || cmd.includes(' UK')) {
          dispatchAction('QUERY_TLD', raw);
        } else if (cmd.includes('AUTH') || cmd.includes('NS1') || cmd.includes('AUTHORITATIVE')) {
          dispatchAction('QUERY_AUTHORITATIVE', raw);
        } else if (cmd.includes('RESOLVER') || cmd.includes('ISP')) {
          dispatchAction('QUERY_RESOLVER', raw);
        } else {
          dispatchAction('QUERY_ROOT', raw);
        }
      } else if (cmd.includes('FETCH') || cmd.includes('A RECORD') || cmd.includes('RETURN IP') || cmd.includes('GET RECORD')) {
        dispatchAction('FETCH_A_RECORD', raw);
      } else if (cmd.includes('DEMAND')) {
        dispatchAction('DEMAND_IP_FROM_ROOT', raw);
      } else if (cmd.includes('LOAD WEBPAGE') || cmd.includes('LOAD HTML') || cmd.includes('DOWNLOAD')) {
        dispatchAction('LOAD_WEBPAGE_HERE', raw);
      } else if (cmd.includes('CONNECT') || cmd.includes('HTTP') || cmd.includes('WEBSERVER') || cmd.includes('WEB SERVER')) {
        dispatchAction('CONNECT_WEBSERVER', raw);
      } else {
        appendLog(raw, 'user');
        sfx.playError();
        appendLog(
          `Command <code class="text-amber-300">"${escapeHtml(raw)}"</code> not recognized. Type <code class="text-emerald-300">LOOK</code>, <code class="text-emerald-300">INSPECT PACKET</code>, <code class="text-emerald-300">HELP</code>, or click a quick-action chip above.`,
          'info'
        );
      }
    }

    function resetSimulation() {
      state.stage = 0;
      state.hops = 0;
      state.errors = 0;
      state.resolvedIp = null;
      state.activeNode = 'client';
      state.discoveredNodes = new Set(['client', 'localCache', 'resolver']);
      state.completedNodes = new Set();
      state.bypassedNodes = new Set();
      state.overloadedNodes = new Set();
      state.stage6BVisited = false;
      state.clientCache = { domain: TARGET_DOMAIN, ip: TARGET_IP, ttl: '0s (EXPIRED)', valid: false };
      state.resolverCache = null;

      const swarmLayer = document.getElementById('swarmLayer');
      if (swarmLayer) swarmLayer.innerHTML = '';

      ['client', 'localCache', 'resolver', 'root', 'tld', 'auth', 'webserver'].forEach((key) => {
        const group = document.getElementById(`node-${key}`);
        if (group) group.classList.remove('node-overloaded', 'node-error-flash');
        const servfail = document.getElementById(`servfail-${key}`);
        if (servfail) servfail.classList.add('hidden');
      });

      const edgeIds = ['edge-client-cache','edge-client-resolver','edge-resolver-root','edge-resolver-tld','edge-resolver-auth','edge-client-web'];
      edgeIds.forEach((id) => {
        const el = document.getElementById(id);
        if (el) {
          el.setAttribute('stroke', id.includes('client-') && !id.includes('web') ? '#334155' : '#1e293b');
          el.setAttribute('stroke-dasharray', '4 4');
          el.classList.remove('edge-animated');
          if (id === 'edge-client-cache' || id === 'edge-client-resolver') {
            el.setAttribute('marker-end', 'url(#arrow-muted)');
          } else {
            el.removeAttribute('marker-end');
          }
        }
      });

      const labelIds = ['label-client-cache','label-client-resolver','label-resolver-root','label-resolver-tld','label-resolver-auth','label-client-web'];
      labelIds.forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.classList.add('opacity-0');
      });

      document.getElementById('labelText-client-cache').textContent = '1. Local Cache Check';
      document.getElementById('labelText-client-web').textContent = 'HTTPS GET /index.html';
      document.getElementById('labelText-resolver-root').textContent = 'Referral: .uk TLD';
      document.getElementById('labelText-resolver-tld').textContent = 'Referral: ns1.wwt.org.uk';
      document.getElementById('labelText-resolver-auth').textContent = 'A Record: 172.67.182.44';
      document.getElementById('animatedPacket').classList.add('opacity-0');

      terminalLog.innerHTML = '';
      enterStage(0);
    }
