// === js/data.js — static game data: constants, NODE_METADATA, NODE_CENTERS, STAGES.
// Load order: 2nd. Depends on nothing. ===
    const TARGET_DOMAIN = 'www.wwt.org.uk';
    const TARGET_IP = '172.67.182.44';
    const AUTH_NS = 'ns1.wwt.org.uk';
    const OPTIMAL_STEPS = 8;

    /**
     * Node Metadata for Clickable Topology Inspector
     */
    const NODE_METADATA = {
      client: {
        tag: 'End Device',
        title: 'Client Device (Browser)',
        desc: 'Where the user types a human-readable URL (www.wwt.org.uk). Routers cannot forward packets using English words—you need an IP Address before you can contact the web server.',
        ip: 'Local IPv4: 192.168.1.42'
      },
      localCache: {
        tag: 'Local Storage',
        title: 'OS & Browser DNS Cache',
        desc: 'A small temporary table on your device storing recent domain-to-IP lookups. Checked FIRST before sending any DNS traffic over the network. Entries expire when their TTL reaches 0s.',
        ip: 'Scope: Local Device Only'
      },
      resolver: {
        tag: 'ISP Infrastructure',
        title: 'ISP Recursive DNS Resolver',
        desc: 'Operated by your Internet Service Provider (or public resolvers like 8.8.8.8). Acts as a middleman: checks its shared cache, and on a miss, walks the global DNS hierarchy on your behalf.',
        ip: 'Resolver IP: 8.8.8.8 / ISP DNS'
      },
      root: {
        tag: 'Tier 1 Global DNS',
        title: 'Root DNS Server (.)',
        desc: 'The top of the DNS hierarchy (13 global logical server clusters). Does NOT know individual website IPs—reads the domain extension (.uk) and refers the resolver to the right TLD server.',
        ip: 'Root Zone: . (e.g. 198.41.0.4)'
      },
      tld: {
        tag: 'Tier 2 Global DNS',
        title: 'TLD DNS Server (.uk)',
        desc: 'Top-Level Domain server responsible for all .uk domains. Holds registrar records pointing to the specific Authoritative Name Server managing wwt.org.uk (ns1.wwt.org.uk).',
        ip: 'Registry: .uk TLD Server'
      },
      auth: {
        tag: 'Tier 3 Domain Zone',
        title: 'Authoritative Name Server (ns1.wwt.org.uk)',
        desc: 'The definitive source of truth for wwt.org.uk DNS zone records. Holds the A Record (IPv4) returning 172.67.182.44 back to the Recursive Resolver. Can be overwhelmed (SERVFAIL) if resolvers skip caching.',
        ip: 'Host: ns1.wwt.org.uk'
      },
      webserver: {
        tag: 'Origin Host',
        title: 'Web Server (172.67.182.44)',
        desc: 'Hosts the HTML, CSS, JavaScript, and images for www.wwt.org.uk—articles, galleries, and facts about ducks and wildfowl. Listens on TCP Port 443 (HTTPS) once the browser knows its IP address.',
        ip: 'Server IPv4: 172.67.182.44'
      }
    };

    /**
     * SVG Center Coordinates for Packet Animations
     */
    const NODE_CENTERS = {
      client: { x: 115, y: 210 },
      localCache: { x: 115, y: 362 },
      resolver: { x: 350, y: 210 },
      root: { x: 645, y: 80 },
      tld: { x: 645, y: 184 },
      auth: { x: 645, y: 288 },
      webserver: { x: 645, y: 413 }
    };

    /**
     * Complete Stage Definitions (Stages 0-8 + Stage 6B + Bonus Stage 9)
     */
    const STAGES = {
      0: {
        location: 'Stage 0: Client Device (Browser)',
        activeNode: 'client',
        narrative: [
          'You are inside the student\'s web browser. The user has just typed <span class="text-emerald-300 font-semibold">https://www.wwt.org.uk/</span> and pressed Enter, hoping to get more information about <strong>ducks and wildfowl</strong>—the best types of birds.',
          'Routers cannot forward packets using English words—you need an <strong>IP Address</strong> before you can contact the web server. Your packet\'s Destination IP is currently <span class="text-rose-400 font-semibold">NULL</span>.'
        ],
        hint: 'Before sending traffic onto the internet, always check your device\'s own Local DNS Cache first.',
        actions: [
          { id: 'CHECK_LOCAL_CACHE', label: 'CHECK LOCAL CACHE', style: 'primary' },
          { id: 'INSPECT_PACKET', label: 'INSPECT PACKET', style: 'neutral' },
          { id: 'CONNECT_WEBSERVER', label: 'CONNECT WEBSERVER', style: 'danger' },
          { id: 'QUERY_ROOT', label: 'QUERY ROOT', style: 'danger' }
        ]
      },
      1: {
        location: 'Stage 1: Client Device &rarr; Local OS/Browser Cache',
        activeNode: 'localCache',
        narrative: [
          'You inspect the device\'s <span class="text-amber-300 font-semibold">local DNS cache</span> table. There is an old entry for <span class="text-slate-200">www.wwt.org.uk</span>, but its <span class="text-amber-400 font-semibold">TTL (Time to Live)</span> counter has reached <span class="text-rose-400 font-semibold">0s (Expired)</span>.',
          'This is a <span class="text-amber-300 font-semibold">Cache Miss</span>—you must ask an external DNS server for a fresh lookup.'
        ],
        hint: 'Home devices delegate recursive lookups to their configured ISP Recursive DNS Resolver (8.8.8.8 / ISP DNS).',
        actions: [
          { id: 'QUERY_RESOLVER', label: 'QUERY RESOLVER', style: 'primary' },
          { id: 'USE_EXPIRED_CACHE', label: 'USE EXPIRED CACHE', style: 'danger' },
          { id: 'QUERY_ROOT', label: 'QUERY ROOT', style: 'danger' }
        ]
      },
      2: {
        location: 'Stage 2: ISP Recursive DNS Resolver',
        activeNode: 'resolver',
        narrative: [
          'Your DNS query arrives at your ISP\'s <span class="text-purple-300 font-semibold">Recursive DNS Resolver</span>. It checks its shared server cache—nobody else on your ISP has visited <span class="text-slate-200">www.wwt.org.uk</span> recently (<span class="text-amber-300 font-semibold">Cache Miss</span>).',
          'The resolver must now walk the global DNS hierarchy from the top down. Which server sits at the very top?'
        ],
        hint: 'Every recursive resolver has the addresses of the 13 global Root DNS Server (.) clusters built in.',
        actions: [
          { id: 'QUERY_ROOT', label: 'QUERY ROOT', style: 'primary' },
          { id: 'CHECK_RESOLVER_CACHE', label: 'CHECK RESOLVER CACHE', style: 'neutral' },
          { id: 'QUERY_TLD', label: 'QUERY TLD', style: 'danger' },
          { id: 'QUERY_AUTHORITATIVE', label: 'QUERY AUTHORITATIVE', style: 'danger' }
        ]
      },
      3: {
        location: 'Stage 3: Root DNS Server (.)',
        activeNode: 'root',
        narrative: [
          'You reach the <span class="text-emerald-300 font-semibold">Root DNS Server (.)</span>. The Root server does <em>not</em> know the IP address of <span class="text-slate-200">www.wwt.org.uk</span>, nor does it store individual websites.',
          'However, it reads the rightmost part of the domain (<span class="text-cyan-300 font-semibold">.uk</span>) and replies with a <strong>referral</strong> to the <span class="text-emerald-300 font-semibold">.uk Top-Level Domain (TLD) server</span>.',
          'The <span class="text-cyan-300">.uk TLD Server</span> is now unlocked! Follow the referral.'
        ],
        hint: 'Take the referral address for the .uk TLD server and query it next.',
        actions: [
          { id: 'QUERY_TLD', label: 'RETURN REFERRAL / QUERY TLD', style: 'primary' },
          { id: 'DEMAND_IP_FROM_ROOT', label: 'DEMAND IP FROM ROOT', style: 'danger' }
        ]
      },
      4: {
        location: 'Stage 4: TLD DNS Server (.uk)',
        activeNode: 'tld',
        narrative: [
          'The resolver contacts the <span class="text-emerald-300 font-semibold">TLD DNS Server</span> responsible for <span class="text-cyan-300">.uk</span> domains.',
          'Like the Root server, the TLD server does not store the webpage\'s IP address—instead, it maintains the registrar records showing which <strong>Authoritative Name Server</strong> manages <span class="text-slate-200">wwt.org.uk</span> (<span class="text-cyan-300">ns1.wwt.org.uk</span>). It sends this referral back to the resolver.',
          'The Authoritative Name Server is now unlocked! Query it for the final IP.'
        ],
        hint: 'Follow the referral to ns1.wwt.org.uk to request the final IP address.',
        actions: [
          { id: 'QUERY_AUTHORITATIVE', label: 'QUERY AUTHORITATIVE', style: 'primary' },
          { id: 'CONNECT_WEBSERVER', label: 'CONNECT WEBSERVER', style: 'danger' },
          { id: 'QUERY_ROOT', label: 'QUERY ROOT', style: 'danger' }
        ]
      },
      5: {
        location: 'Stage 5: Authoritative Name Server (ns1.wwt.org.uk)',
        activeNode: 'auth',
        narrative: [
          'You have reached the <span class="text-emerald-300 font-semibold">Authoritative Name Server</span> for <span class="text-slate-200">wwt.org.uk</span>—the definitive source of truth for this domain\'s DNS zone records!',
          'It looks up the <span class="text-cyan-300 font-semibold">A Record (IPv4)</span> for <span class="text-slate-200">www.wwt.org.uk</span> and finds <span class="text-emerald-400 font-bold">172.67.182.44</span> with a <span class="text-slate-200">TTL of 3600s</span>.'
        ],
        hint: 'Name servers only store DNS records, not webpages. Fetch the A Record and return the IP to the resolver.',
        actions: [
          { id: 'FETCH_A_RECORD', label: 'FETCH A RECORD / RETURN IP TO RESOLVER', style: 'primary' },
          { id: 'LOAD_WEBPAGE_HERE', label: 'LOAD WEBPAGE HERE', style: 'danger' }
        ]
      },
      6: {
        location: 'Stage 6: Caching at the Resolver & Replying to Client',
        activeNode: 'resolver',
        narrative: [
          'The <span class="text-purple-300 font-semibold">ISP Recursive Resolver</span> now holds <span class="text-emerald-400 font-bold">172.67.182.44</span>.',
          'Before forwarding the answer back to the student\'s device, what should the resolver do so that future users can load the site faster—and so the Authoritative Name Server is not hammered by repeat lookups?'
        ],
        hint: 'Save www.wwt.org.uk &rarr; 172.67.182.44 (TTL: 3600s) in the ISP cache, then reply to the client.',
        actions: [
          { id: 'CACHE_AND_REPLY', label: 'CACHE AND REPLY TO CLIENT', style: 'primary' },
          { id: 'REPLY_WITHOUT_CACHING', label: 'REPLY WITHOUT CACHING', style: 'danger' }
        ]
      },
      '6B': {
        location: 'Stage 6B: The Cache-Miss Storm (Consequence of Not Caching)',
        activeNode: 'auth',
        narrative: [
          'Because the resolver did <strong>not</strong> cache the answer, the next <span class="text-rose-300 font-semibold">10,000 ISP users</span> who all type <span class="text-slate-200">https://www.wwt.org.uk/</span> at the same time each trigger a full recursive lookup.',
          'Every one of those queries ends at the <span class="text-emerald-300 font-semibold">Authoritative Name Server</span> for <span class="text-slate-200">wwt.org.uk</span>—simultaneously. The authoritative server is overwhelmed by the query flood, starts returning <span class="text-rose-400 font-bold">SERVFAIL</span>, and then goes down entirely.',
          'Your own page load fails: <span class="text-rose-400 font-semibold">"DNS resolution failed—authoritative server unreachable."</span> <strong>This is the real-world cost of skipping the cache: one uncached record can let a traffic spike take an authoritative server offline.</strong>'
        ],
        hint: 'Wait for the authoritative server to recover, then cache the record and reply to the client.',
        actions: [
          { id: 'WAIT_RECOVER_CACHE_REPLY', label: 'WAIT FOR RECOVERY, THEN CACHE AND REPLY', style: 'primary' },
          { id: 'KEEP_QUERYING_NO_CACHE', label: 'KEEP QUERYING WITHOUT CACHING', style: 'danger' }
        ]
      },
      7: {
        location: 'Stage 7: Updating Local Cache & Connecting to the Web Server',
        activeNode: 'client',
        narrative: [
          'Success! Your browser receives <span class="text-emerald-400 font-bold">172.67.182.44</span> and saves it to your <span class="text-cyan-300 font-semibold">Local DNS Cache</span>. Your packet\'s destination header is now complete (<span class="text-emerald-400">Dest IP: 172.67.182.44</span>).',
          'You are ready to make the actual web request!'
        ],
        hint: 'Now that the packet has a valid Destination IP, connect directly to the Web Server.',
        actions: [
          { id: 'CONNECT_WEBSERVER', label: 'CONNECT WEBSERVER', style: 'primary' },
          { id: 'QUERY_ROOT', label: 'QUERY ROOT', style: 'danger' }
        ]
      },
      8: {
        location: 'Stage 8: Webpage Loaded & GCSE Exam Debrief',
        activeNode: 'webserver',
        narrative: [
          '<span class="text-emerald-400 font-bold text-base">&#10003; HTTP 200 OK — Mission Complete!</span>',
          'The Web Server responds with <span class="text-emerald-300 font-semibold">HTTP 200 OK</span> and streams the HTML, CSS, and images back to the browser—articles, galleries, and facts about <strong>ducks and wildfowl, the best types of birds</strong>.',
          '<span class="text-cyan-300 font-semibold">Bonus:</span> What happens if the user clicks a link on the same site 10 seconds later? Test a <strong>Cache Hit</strong> below!'
        ],
        hint: 'Click "VISIT SITE AGAIN (TEST CACHE HIT)" to see how a warm local cache bypasses the entire DNS hierarchy.',
        actions: [
          { id: 'VISIT_SITE_AGAIN', label: 'VISIT SITE AGAIN (TEST CACHE HIT)', style: 'primary' },
          { id: 'RESET_SIMULATION', label: 'RESET SIMULATION', style: 'neutral' }
        ]
      },
      9: {
        location: 'Bonus Stage 9: Testing a Warm Cache (Cache Hit)',
        activeNode: 'webserver',
        narrative: [
          '<span class="text-amber-300 font-bold text-base">&#9889; INSTANT CACHE HIT! (0 External DNS Queries)</span>',
          'The user clicks a link to <span class="text-cyan-300">www.wwt.org.uk/wildfowl-and-ducks</span>. You check the <span class="text-emerald-300 font-semibold">Local DNS Cache</span>—<span class="text-emerald-400">172.67.182.44</span> is still valid (<span class="text-amber-300">TTL: 3590s</span>)! <strong>Cache Hit!</strong>',
          'You bypass the ISP Resolver, Root, TLD, and Authoritative servers completely and connect straight to <span class="text-emerald-400">172.67.182.44</span>—the authoritative server is never queried again.'
        ],
        hint: 'You have mastered both Cold Cache Resolution and Warm Cache Hits for OCR J277!',
        actions: [
          { id: 'RESET_SIMULATION', label: 'RESET SIMULATION', style: 'primary' }
        ]
      }
    };
