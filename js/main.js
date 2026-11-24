// === js/main.js — event-listener wiring + boot. Load order: 7th (last). ===
    // Event Listeners
    commandForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = commandInput.value;
      commandInput.value = '';
      parseTypedCommand(val);
    });

    document.getElementById('hintQuickBtn').addEventListener('click', () => {
      dispatchAction('HINT', 'HINT');
    });

    document.getElementById('resetBtn').addEventListener('click', () => {
      sfx.playTone(330, 'sine', 0.08, 0.05);
      resetSimulation();
    });

    const soundToggleBtn = document.getElementById('soundToggleBtn');
    const soundOnIcon = document.getElementById('soundOnIcon');
    const soundOffIcon = document.getElementById('soundOffIcon');
    soundToggleBtn.addEventListener('click', () => {
      sfx.enabled = !sfx.enabled;
      soundOnIcon.classList.toggle('hidden', !sfx.enabled);
      soundOffIcon.classList.toggle('hidden', sfx.enabled);
      if (sfx.enabled) sfx.playSuccess();
    });

    const examModal = document.getElementById('examModal');
    document.getElementById('examNotesBtn').addEventListener('click', () => {
      examModal.classList.remove('hidden');
    });
    document.getElementById('closeExamModalBtn').addEventListener('click', () => {
      examModal.classList.add('hidden');
    });
    document.getElementById('doneExamModalBtn').addEventListener('click', () => {
      examModal.classList.add('hidden');
    });
    examModal.addEventListener('click', (e) => {
      if (e.target === examModal) examModal.classList.add('hidden');
    });

    const nodeInspectorCard = document.getElementById('nodeInspectorCard');
    document.querySelectorAll('.node-group').forEach((nodeEl) => {
      nodeEl.addEventListener('click', () => {
        const key = nodeEl.getAttribute('data-node');
        if (!state.discoveredNodes.has(key)) {
          sfx.playTone(220, 'sine', 0.07, 0.04);
          appendLog(
            'That server is still hidden in the <strong>Fog of War</strong>. Progress through the DNS referrals to discover it!',
            'info'
          );
          return;
        }
        const meta = NODE_METADATA[key];
        if (!meta) return;
        sfx.playTone(520, 'sine', 0.06, 0.04);
        document.getElementById('inspectorTag').textContent = meta.tag;
        document.getElementById('inspectorTitle').textContent = meta.title;
        document.getElementById('inspectorDesc').textContent = meta.desc;
        document.getElementById('inspectorIp').textContent = meta.ip;
        nodeInspectorCard.classList.remove('hidden');
      });
    });

    document.getElementById('closeInspectorBtn').addEventListener('click', () => {
      nodeInspectorCard.classList.add('hidden');
    });

    window.addEventListener('DOMContentLoaded', () => {
      resetSimulation();
    });

