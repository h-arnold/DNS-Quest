// === js/state.js — mutable `state` object + cached DOM element references.
// Load order: 3rd. Depends on data.js (TARGET_DOMAIN/TARGET_IP) and DOM (scripts at end of <body>). ===
    /**
     * Application State Object
     */
    const state = {
      stage: 0,
      hops: 0,
      errors: 0,
      resolvedIp: null,
      activeNode: 'client',
      discoveredNodes: new Set(['client', 'localCache', 'resolver']),
      completedNodes: new Set(),
      bypassedNodes: new Set(),
      overloadedNodes: new Set(),
      stage6BVisited: false,
      clientCache: {
        domain: TARGET_DOMAIN,
        ip: TARGET_IP,
        ttl: '0s (EXPIRED)',
        valid: false
      },
      resolverCache: null
    };

    // DOM Elements
    const terminalLog = document.getElementById('terminalLog');
    const quickActionsContainer = document.getElementById('quickActionsContainer');
    const commandForm = document.getElementById('commandForm');
    const commandInput = document.getElementById('commandInput');
    const hudResolvedIp = document.getElementById('hudResolvedIp');
    const hudCurrentNode = document.getElementById('hudCurrentNode');
    const hudPacketStatus = document.getElementById('hudPacketStatus');
    const hudStats = document.getElementById('hudStats');
    const progressBar = document.getElementById('progressBar');
    const stageBadge = document.getElementById('stageBadge');
    const graphStatusBadge = document.getElementById('graphStatusBadge');
