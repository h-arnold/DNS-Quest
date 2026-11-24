// === js/visuals.js — SVG network-graph visuals: packet/swarm animations, node states,
// syncVisuals(), activateEdge(). Load order: 5th. Depends on data.js + state.js. ===
    let activeAnimationFrame = null;

    function animatePacketTravel(fromNode, toNode, labelText, color = '#22d3ee', isBounce = false) {
      if (activeAnimationFrame) cancelAnimationFrame(activeAnimationFrame);

      const packetGroup = document.getElementById('animatedPacket');
      const pillBg = document.getElementById('packetPillBg');
      const pillText = document.getElementById('packetPillText');
      const circles = packetGroup.querySelectorAll('circle');

      const start = NODE_CENTERS[fromNode];
      const end = NODE_CENTERS[toNode];
      if (!start || !end) return;

      pillText.textContent = labelText;
      pillBg.setAttribute('stroke', color);
      circles[0].setAttribute('fill', color);
      circles[1].setAttribute('fill', color);

      packetGroup.classList.remove('opacity-0');
      const duration = isBounce ? 750 : 650;
      const startTime = performance.now();

      function step(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;

        let factor = ease;
        if (isBounce) {
          factor = progress < 0.5
            ? (progress * 2) * 0.55
            : (1 - (progress - 0.5) * 2) * 0.55;
        }

        const currentX = start.x + (end.x - start.x) * factor;
        const currentY = start.y + (end.y - start.y) * factor;
        packetGroup.setAttribute('transform', `translate(${currentX.toFixed(1)}, ${currentY.toFixed(1)})`);

        if (progress < 1) {
          activeAnimationFrame = requestAnimationFrame(step);
        } else if (isBounce) {
          setTimeout(() => packetGroup.classList.add('opacity-0'), 350);
        }
      }

      activeAnimationFrame = requestAnimationFrame(step);
    }

    function flashErrorEdge(fromNode, toNode) {
      const errorPath = document.getElementById('errorPulsePath');
      const start = NODE_CENTERS[fromNode];
      const end = NODE_CENTERS[toNode];
      if (!start || !end) return;

      const midX = start.x + (end.x - start.x) * 0.58;
      const midY = start.y + (end.y - start.y) * 0.58;
      errorPath.setAttribute('d', `M ${start.x} ${start.y} L ${midX} ${midY}`);
      errorPath.classList.remove('opacity-0');

      setTimeout(() => { errorPath.classList.add('opacity-0'); }, 1100);
    }

    /**
     * Swarm animation for Stage 6B — many small red packets flying resolver -> auth
     */
    function animateSwarm(fromNode, toNode, count = 18) {
      const swarmLayer = document.getElementById('swarmLayer');
      const svg = document.getElementById('networkSvg');
      const start = NODE_CENTERS[fromNode];
      const end = NODE_CENTERS[toNode];
      if (!start || !end || !swarmLayer) return;

      const dx = end.x - start.x;
      const dy = end.y - start.y;

      for (let i = 0; i < count; i++) {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        const jitterX = (Math.random() - 0.5) * 20;
        const jitterY = (Math.random() - 0.5) * 20;
        circle.setAttribute('cx', start.x + jitterX);
        circle.setAttribute('cy', start.y + jitterY);
        circle.setAttribute('r', '3.5');
        circle.setAttribute('fill', i % 3 === 0 ? '#f43f5e' : '#fb7185');
        circle.classList.add('swarm-packet');
        circle.style.animationDelay = (i * 0.06) + 's';

        // Use SMIL animate for movement (works in all browsers within SVG)
        const animateX = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
        animateX.setAttribute('attributeName', 'cx');
        animateX.setAttribute('from', start.x + jitterX);
        animateX.setAttribute('to', end.x + jitterX);
        animateX.setAttribute('dur', '1.1s');
        animateX.setAttribute('begin', (i * 0.06) + 's');
        animateX.setAttribute('fill', 'freeze');

        const animateY = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
        animateY.setAttribute('attributeName', 'cy');
        animateY.setAttribute('from', start.y + jitterY);
        animateY.setAttribute('to', end.y + jitterY);
        animateY.setAttribute('dur', '1.1s');
        animateY.setAttribute('begin', (i * 0.06) + 's');
        animateY.setAttribute('fill', 'freeze');

        const animateOp = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
        animateOp.setAttribute('attributeName', 'opacity');
        animateOp.setAttribute('values', '0;1;1;0');
        animateOp.setAttribute('keyTimes', '0;0.15;0.85;1');
        animateOp.setAttribute('dur', '1.1s');
        animateOp.setAttribute('begin', (i * 0.06) + 's');
        animateOp.setAttribute('fill', 'freeze');

        circle.appendChild(animateX);
        circle.appendChild(animateY);
        circle.appendChild(animateOp);
        swarmLayer.appendChild(circle);

        setTimeout(() => {
          if (circle.parentNode) circle.parentNode.removeChild(circle);
        }, 2500 + i * 60);
      }
    }

    function flashNodeError(nodeKey) {
      const group = document.getElementById(`node-${nodeKey}`);
      if (!group) return;
      group.classList.add('node-error-flash');
      setTimeout(() => group.classList.remove('node-error-flash'), 1300);
    }

    function setNodeOverloaded(nodeKey, overloaded) {
      const group = document.getElementById(`node-${nodeKey}`);
      if (!group) return;
      if (overloaded) {
        group.classList.add('node-overloaded');
        group.classList.remove('opacity-40');
        state.overloadedNodes.add(nodeKey);
        const servfail = document.getElementById(`servfail-${nodeKey}`);
        if (servfail) servfail.classList.remove('hidden');
        const badge = document.getElementById(`badge-${nodeKey}`);
        if (badge) badge.classList.add('hidden');
        const check = document.getElementById(`check-${nodeKey}`);
        if (check) check.classList.add('hidden');
        const sub = document.getElementById(`nodeSub-${nodeKey}`);
        if (sub) { sub.textContent = 'SERVFAIL — Overloaded'; sub.setAttribute('fill', '#fca5a5'); }
      } else {
        group.classList.remove('node-overloaded');
        state.overloadedNodes.delete(nodeKey);
        const servfail = document.getElementById(`servfail-${nodeKey}`);
        if (servfail) servfail.classList.add('hidden');
      }
    }

    function syncVisuals() {
      const stageKey = state.stage;
      let displayNum = stageKey;
      if (stageKey === '6B') displayNum = '6B';
      else if (stageKey === 9) displayNum = 'BONUS';
      stageBadge.textContent = typeof displayNum === 'number' ? `${displayNum} / 8` : displayNum;

      let progressPct = 10;
      if (typeof stageKey === 'number') progressPct = Math.max(10, (stageKey / 8) * 100);
      else if (stageKey === '6B') progressPct = 72;
      else if (stageKey === 9) progressPct = 100;
      progressBar.style.width = `${progressPct}%`;

      const hopColor = state.hops <= OPTIMAL_STEPS ? 'text-emerald-400' : 'text-amber-400';
      hudStats.innerHTML = `Hop Counter: <strong class="${hopColor}">${state.hops}</strong> / ${OPTIMAL_STEPS} optimal | Errors: <strong class="${state.errors > 0 ? 'text-rose-400' : 'text-slate-200'}">${state.errors}</strong>`;

      if (state.resolvedIp) {
        hudResolvedIp.textContent = state.resolvedIp;
        hudResolvedIp.className = 'text-emerald-400 font-semibold';
      } else {
        hudResolvedIp.textContent = '??? (Unknown)';
        hudResolvedIp.className = 'text-amber-400 font-semibold';
      }

      const activeMeta = NODE_METADATA[state.activeNode];
      hudCurrentNode.textContent = activeMeta ? activeMeta.title : state.activeNode;

      hudPacketStatus.textContent = `${state.hops} / ${OPTIMAL_STEPS} steps`;
      hudPacketStatus.className = state.hops <= OPTIMAL_STEPS
        ? 'text-emerald-400 font-semibold truncate'
        : 'text-amber-400 font-semibold truncate';

      const totalNodes = 7;
      const discoveredCount = state.discoveredNodes.size;
      if (stageKey === 9) {
        graphStatusBadge.textContent = 'Cache Hit Shortcut Active';
        graphStatusBadge.className = 'text-[11px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/40';
      } else if (discoveredCount === totalNodes) {
        graphStatusBadge.textContent = 'All Nodes Discovered (7/7)';
        graphStatusBadge.className = 'text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30';
      } else {
        graphStatusBadge.textContent = `Fog of War: ${discoveredCount}/${totalNodes} discovered`;
        graphStatusBadge.className = 'text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700';
      }

      const allNodeKeys = ['client', 'localCache', 'resolver', 'root', 'tld', 'auth', 'webserver'];
      allNodeKeys.forEach((key) => {
        const group = document.getElementById(`node-${key}`);
        const box = group.querySelector('.node-box');
        const halo = group.querySelector('.active-halo');
        const isDiscovered = state.discoveredNodes.has(key);
        const isActive = state.activeNode === key;
        const isCompleted = state.completedNodes.has(key);
        const isBypassed = state.bypassedNodes.has(key);
        const isOverloaded = state.overloadedNodes.has(key);

        const badge = document.getElementById(`badge-${key}`);
        const check = document.getElementById(`check-${key}`);
        if (badge) badge.classList.add('hidden');
        if (check) check.classList.add('hidden');

        if (isBypassed) {
          group.classList.remove('opacity-40');
          group.classList.add('opacity-30');
          halo.classList.add('hidden');
          box.setAttribute('stroke', '#475569');
          box.setAttribute('stroke-dasharray', '4 4');
          box.setAttribute('stroke-width', '1.5');
          return;
        }

        if (isOverloaded) {
          group.classList.remove('opacity-40', 'opacity-30');
          halo.classList.add('hidden');
          return;
        }

        if (!isDiscovered) {
          group.classList.add('opacity-40');
          group.classList.remove('opacity-30');
          halo.classList.add('hidden');
          box.setAttribute('stroke', '#475569');
          box.setAttribute('stroke-dasharray', '5 4');
          box.setAttribute('stroke-width', '1.8');
          const title = document.getElementById(`nodeTitle-${key}`);
          if (title && key !== 'webserver') title.textContent = '??? (Undiscovered)';
        } else {
          group.classList.remove('opacity-40', 'opacity-30');
          box.removeAttribute('stroke-dasharray');

          if (isActive) {
            halo.classList.remove('hidden');
            box.setAttribute('stroke', '#22d3ee');
            box.setAttribute('stroke-width', '2.5');
            if (badge) badge.classList.remove('hidden');
          } else if (isCompleted) {
            halo.classList.add('hidden');
            box.setAttribute('stroke', '#10b981');
            box.setAttribute('stroke-width', '2');
            if (check) check.classList.remove('hidden');
          } else {
            halo.classList.add('hidden');
            box.setAttribute('stroke', '#64748b');
            box.setAttribute('stroke-width', '1.8');
          }
        }
      });

      if (state.discoveredNodes.has('root')) {
        document.getElementById('nodeTitle-root').textContent = 'Root DNS Server (.)';
        if (!state.overloadedNodes.has('root')) {
          document.getElementById('nodeSub-root').textContent = 'Refers .uk -> TLD';
          document.getElementById('nodeSub-root').setAttribute('fill', '#34d399');
        }
      } else {
        document.getElementById('nodeTitle-root').textContent = '??? (Undiscovered)';
        document.getElementById('nodeSub-root').textContent = 'Awaiting Resolver';
        document.getElementById('nodeSub-root').setAttribute('fill', '#64748b');
      }

      if (state.discoveredNodes.has('tld')) {
        document.getElementById('nodeTitle-tld').textContent = 'TLD Server (.uk)';
        document.getElementById('nodeSub-tld').textContent = 'Refers -> ns1.wwt.org.uk';
        document.getElementById('nodeSub-tld').setAttribute('fill', '#34d399');
      } else {
        document.getElementById('nodeTitle-tld').textContent = '??? (Undiscovered)';
        document.getElementById('nodeSub-tld').textContent = 'Requires Root Referral';
        document.getElementById('nodeSub-tld').setAttribute('fill', '#64748b');
      }

      if (state.discoveredNodes.has('auth')) {
        document.getElementById('nodeTitle-auth').textContent = 'ns1.wwt.org.uk';
        if (!state.overloadedNodes.has('auth')) {
          document.getElementById('nodeSub-auth').textContent = 'A: 172.67.182.44';
          document.getElementById('nodeSub-auth').setAttribute('fill', '#34d399');
        }
      } else {
        document.getElementById('nodeTitle-auth').textContent = '??? (Undiscovered)';
        document.getElementById('nodeSub-auth').textContent = 'Requires TLD Referral';
        document.getElementById('nodeSub-auth').setAttribute('fill', '#64748b');
      }

      if (state.discoveredNodes.has('webserver')) {
        document.getElementById('nodeTitle-webserver').textContent = 'Web Server (172.67.182.44)';
        document.getElementById('nodeSub-webserver').textContent = 'IPv4: 172.67.182.44';
        document.getElementById('nodeSub-webserver').setAttribute('fill', '#34d399');
      } else {
        document.getElementById('nodeTitle-webserver').textContent = 'Web Server (IP Unknown)';
        document.getElementById('nodeSub-webserver').textContent = 'Port 443 (HTTPS)';
        document.getElementById('nodeSub-webserver').setAttribute('fill', '#64748b');
      }

      const clientCacheBody = document.getElementById('clientCacheBody');
      const clientCacheBadge = document.getElementById('clientCacheBadge');
      const nodeSubLocalCache = document.getElementById('nodeSub-localCache');

      if (state.clientCache.valid) {
        clientCacheBadge.textContent = stageKey === 9 ? 'CACHE HIT! (3590s)' : 'VALID';
        clientCacheBadge.className = 'text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold';
        clientCacheBody.innerHTML = `
          <tr class="text-emerald-300">
            <td class="pt-1.5 font-semibold">${state.clientCache.domain}</td>
            <td class="pt-1.5">${state.clientCache.ip}</td>
            <td class="pt-1.5 text-right font-bold">${state.clientCache.ttl}</td>
          </tr>`;
        nodeSubLocalCache.textContent = `TTL: ${state.clientCache.ttl}`;
        nodeSubLocalCache.setAttribute('fill', '#34d399');
      } else {
        clientCacheBadge.textContent = 'STALE (TTL 0s)';
        clientCacheBadge.className = 'text-[10px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30';
        clientCacheBody.innerHTML = `
          <tr class="text-amber-300/90">
            <td class="pt-1.5">${state.clientCache.domain}</td>
            <td class="pt-1.5">${state.clientCache.ip}</td>
            <td class="pt-1.5 text-right font-semibold">${state.clientCache.ttl}</td>
          </tr>`;
        nodeSubLocalCache.textContent = 'TTL: 0s (Expired)';
        nodeSubLocalCache.setAttribute('fill', '#f59e0b');
      }

      const resolverCacheBody = document.getElementById('resolverCacheBody');
      const resolverCacheBadge = document.getElementById('resolverCacheBadge');

      if (state.resolverCache) {
        resolverCacheBadge.textContent = stageKey === 9 ? 'BYPASSED VIA CACHE' : 'CACHED';
        resolverCacheBadge.className = 'text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold';
        resolverCacheBody.innerHTML = `
          <tr class="text-emerald-300">
            <td class="pt-1.5 font-semibold">${state.resolverCache.domain}</td>
            <td class="pt-1.5">${state.resolverCache.ip}</td>
            <td class="pt-1.5 text-right font-bold">${state.resolverCache.ttl}</td>
          </tr>`;
      } else {
        resolverCacheBadge.textContent = 'EMPTY';
        resolverCacheBadge.className = 'text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700';
        resolverCacheBody.innerHTML = `
          <tr class="text-slate-500 italic">
            <td colspan="3" class="pt-1.5">No cached record for ${TARGET_DOMAIN}</td>
          </tr>`;
      }

      renderQuickActions();
    }

    function activateEdge(edgeId, labelId, color = '#10b981', marker = 'url(#arrow-emerald)', animated = false) {
      const edge = document.getElementById(edgeId);
      const label = document.getElementById(labelId);
      if (edge) {
        edge.setAttribute('stroke', color);
        edge.setAttribute('marker-end', marker);
        if (animated) {
          edge.classList.add('edge-animated');
          edge.removeAttribute('stroke-dasharray');
        } else {
          edge.classList.remove('edge-animated');
          edge.removeAttribute('stroke-dasharray');
        }
      }
      if (label) label.classList.remove('opacity-0');
    }
