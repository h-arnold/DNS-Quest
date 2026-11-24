# DNS Quest: Two-Panel Interactive Fiction & Network Visualizer
**Target Curriculum:** OCR GCSE Computer Science (J277 – Component 01: Computer Systems / Networks)  
**Core Objective:** Students act as the **DNS Packet Dispatcher**, guiding a web request from a browser URL entry through the hierarchical Domain Name System until the target webpage loads.

---

## 1. Layout & Dual-Panel Architecture

The web application is divided into two synchronized panels side-by-side (stacking vertically on narrow screens):

### Left Panel: Zork-Style Terminal (`45%` width)
* **Aesthetic:** Classic retro CRT terminal aesthetic (dark slate/phosphor green & amber highlights) with clean, readable typography suitable for classroom projectors and student laptops.
* **Hybrid Input System (Text + Quick-Action Chips):**
  * **Command Line Prompt (`>`):** Students can type classic Zork commands (e.g., `LOOK`, `INSPECT PACKET`, `CHECK CACHE`, `QUERY ROOT`, `CONNECT WEBSERVER`).
  * **Clickable Action Buttons:** Directly above the prompt, context-sensitive action pills appear for students who prefer point-and-click navigation or want to avoid spelling typos during timed lessons.
* **Persistent Packet HUD (Top of Terminal):** A compact status bar always visible to the student showing:
  * **Target Domain:** `www.wwt.org.uk`
  * **Resolved IP:** `??? (Unknown)` $\rightarrow$ updates to `172.67.182.44` upon resolution
  * **Current Node:** e.g., `Client Device (Browser)`
  * **Hop Counter:** Tracks steps taken vs. optimal path (`8 steps`)

### Right Panel: Live Network Graph & State Inspector (`55%` width)
* **Interactive SVG Topology Map:** Displays the network nodes and directional edges connecting them.
  * **Progressive Discovery (Fog of War):** Nodes that the client/resolver has not yet learned about (such as the `.uk` TLD Server, the Authoritative Name Server, and the Web Server) begin as dimmed, dashed "Undiscovered" silhouettes. They illuminate and unlock dynamically as referrals are returned!
  * **Animated Packet Travel:** Whenever a student executes a valid move, an animated packet icon travels along the connecting arrow from the source node to the destination node.
  * **Error Pulse Animation:** When a student chooses an invalid action (a common GCSE misconception), a red dashed arrow animates partway to the target and bounces back with a protocol error badge.
* **Live DNS Cache & Protocol Inspector (Bottom Drawer of Right Panel):**
  * Displays two live tables side-by-side: **Client Local Cache** and **ISP Recursive Resolver Cache**, showing `Domain`, `IP Address`, and `TTL (Time to Live)` updating in real time.

---

## 2. Node Visual States in the Graph Panel

| Visual State | Appearance in Graph | Meaning |
| :--- | :--- | :--- |
| **Undiscovered** | Dashed grey border, `?` icon, muted opacity | The resolver/client does not yet know this server's address or existence. |
| **Discovered / Ready** | Solid neutral border, full icon visibility | A referral or configuration has revealed this server as a reachable target. |
| **Active Location** | Glowing cyan/green border + pulsing Packet badge | The student's query/packet is currently at this node awaiting a command. |
| **Completed / Cached** | Solid emerald border + checkmark badge | Node has been successfully queried or holds a valid cached record. |
| **Error / Rejected** | Temporary red flash + jagged error line | Student attempted an invalid network operation (e.g., routing without an IP). |
| **Overloaded / Down** | Dark red border, warning triangle, `SERVFAIL` badge | Server overwhelmed by too many simultaneous queries—the consequence of skipping the cache (see Stage 6B). |

---

## 3. Complete Step-by-Step Gameplay & Graph Synchronization Plan

The primary scenario resolves **`www.wwt.org.uk`** starting with an **expired local cache** (forcing a full hierarchical lookup), an optional **Stage 6B consequence branch** demonstrating what happens when the resolver skips caching, and a **Stage 9 Bonus Turn** demonstrating an instant **Cache Hit**.

### Stage 0: The Browser Prompt (Starting State)
* **Location:** `Client Device (Browser)`
* **Terminal Narrative:** You are inside the student's web browser. The user has just typed `https://www.wwt.org.uk/` and pressed Enter, hoping to get more information about ducks and wildfowl—the best types of birds. Routers cannot forward packets using English words—you need an **IP Address** before you can contact the web server.
* **Student Options:**
  * `INSPECT PACKET` *(Info)*: Displays packet headers (`Src IP: 192.168.1.42`, `Dest Domain: www.wwt.org.uk`, `Dest IP: NULL`).
  * `CHECK LOCAL CACHE` *(Optimal Move $\rightarrow$ Stage 1)*: Checks the browser and OS DNS cache before sending traffic onto the internet.
  * `CONNECT WEBSERVER` *(Error Move)*: Terminal outputs: *"Connection Failed: Cannot route packet—Destination IP is NULL."* Graph flashes a red error arrow from Client into empty space.
  * `QUERY ROOT` *(Error Move)*: Terminal outputs: *"Network Policy Block: Home clients do not query Root Servers directly; check your local cache or ask your configured ISP DNS Resolver."*
* **Graph Panel Display:**
  * `Client Device` glows as **Active Location** with the unaddressed packet icon (`IP: ???`).
  * `Local Cache` and `ISP Recursive Resolver` are visible as **Discovered**.
  * `Root`, `TLD`, `Authoritative`, and `Web Server` remain **Undiscovered**.

---

### Stage 1: Checking the Local Cache
* **Location:** `Client Device -> Local OS/Browser Cache`
* **Terminal Narrative:** You inspect the device's local DNS cache table. There is an old entry for `www.wwt.org.uk`, but its **TTL (Time to Live)** counter has reached `0s` (Expired). This is a **Cache Miss**—you must ask an external DNS server for a fresh lookup.
* **Student Options:**
  * `QUERY RESOLVER` *(Optimal Move $\rightarrow$ Stage 2)*: Sends a recursive DNS query to the ISP's Recursive DNS Resolver (`8.8.8.8` / ISP DNS).
  * `USE EXPIRED CACHE` *(Error Move)*: Terminal warns: *"Stale Record Rejected: TTL is 0s. Using expired records risks connecting to an outdated or hijacked server."*
  * `QUERY ROOT` *(Error Move)*: Terminal reminds student: *"Your device is configured to delegate recursive lookups to your ISP Recursive Resolver first."*
* **Graph Panel Display:**
  * Dashed arrow pulses from `Client` to the `Local Cache` box; the cache row highlights amber with `TTL: 0s (EXPIRED)`.
  * `ISP Recursive Resolver` highlights as the recommended next hop.

---

### Stage 2: Arriving at the ISP Recursive Resolver
* **Location:** `ISP Recursive DNS Resolver`
* **Terminal Narrative:** Your DNS query arrives at your ISP's **Recursive DNS Resolver**. It checks its shared server cache—nobody else on your ISP has visited `www.wwt.org.uk` recently (**Cache Miss**). The resolver must now walk the global DNS hierarchy from the top down.
* **Student Options:**
  * `CHECK RESOLVER CACHE` *(Info)*: Confirms the ISP cache table has no entry for `www.wwt.org.uk`.
  * `QUERY ROOT` *(Optimal Move $\rightarrow$ Stage 3)*: Sends an iterative query to one of the 13 global **Root DNS Server (`.`)** clusters.
  * `QUERY TLD` *(Error Move)*: Terminal outputs: *"Unknown Target: The resolver hasn't asked the Root Server where the `.uk` registry is located yet."*
  * `QUERY AUTHORITATIVE` *(Error Move)*: Terminal outputs: *"Unknown Target: In a distributed database of billions of domains, the resolver does not know which Authoritative Server owns `wwt.org.uk`."*
* **Graph Panel Display:**
  * Packet animates along the arrow from `Client` $\rightarrow$ `ISP Recursive Resolver`.
  * `ISP Recursive Resolver` becomes **Active Location**.
  * `Root DNS Server (.)` unlocks from **Undiscovered** to **Discovered** (every resolver has the Root server addresses built in).

---

### Stage 3: Querying the Root DNS Server (`.`)
* **Location:** `Root DNS Server (.)`
* **Terminal Narrative:** You reach the **Root DNS Server (`.`)**. The Root server does *not* know the IP address of `www.wwt.org.uk`, nor does it store individual websites. However, it reads the rightmost part of the domain (`.uk`) and replies with a **referral** to the `.uk` Top-Level Domain (TLD) server.
* **Student Options:**
  * `RETURN REFERRAL TO RESOLVER` / `QUERY TLD` *(Optimal Move $\rightarrow$ Stage 4)*: Takes the referral address for the `.uk` TLD server and queries it next.
  * `DEMAND IP FROM ROOT` *(Error Move)*: Terminal explains: *"Root Server Response: 'I only manage top-level extensions (.com, .uk, .org). Ask the .uk TLD server I just referred you to!'"*
* **Graph Panel Display:**
  * Outbound arrow animates `ISP Resolver` $\rightarrow$ `Root DNS Server`, followed immediately by a return referral arrow `Root DNS Server` $\rightarrow$ `ISP Resolver` labeled `Referral: .uk TLD`.
  * `Root DNS Server` switches to **Completed** (green check).
  * `TLD DNS Server (.uk)` unlocks from **Undiscovered** to **Discovered**.

---

### Stage 4: Querying the TLD DNS Server (`.uk`)
* **Location:** `TLD DNS Server (.uk)`
* **Terminal Narrative:** The resolver contacts the **TLD DNS Server** responsible for `.uk` domains. Like the Root server, the TLD server does not store the webpage's IP address—instead, it maintains the registrar records showing which **Authoritative Name Server** manages `wwt.org.uk` (`ns1.wwt.org.uk`). It sends this referral back to the resolver.
* **Student Options:**
  * `QUERY AUTHORITATIVE` *(Optimal Move $\rightarrow$ Stage 5)*: Follows the referral to `ns1.wwt.org.uk` to request the final IP address.
  * `CONNECT WEBSERVER` *(Error Move)*: Terminal outputs: *"Error: You still only have the name of the Authoritative Name Server, not the Web Server's IP address."*
  * `QUERY ROOT` *(Error Move)*: Terminal outputs: *"Redundant Loop: You already queried the Root Server and received the `.uk` TLD referral."*
* **Graph Panel Display:**
  * Outbound and return arrows animate between `ISP Resolver` and `TLD DNS Server (.uk)` labeled `Referral: ns1.wwt.org.uk`.
  * `TLD DNS Server (.uk)` switches to **Completed**.
  * `Authoritative Name Server` unlocks from **Undiscovered** to **Discovered**.

---

### Stage 5: Querying the Authoritative Name Server
* **Location:** `Authoritative Name Server (ns1.wwt.org.uk)`
* **Terminal Narrative:** You have reached the **Authoritative Name Server** for `wwt.org.uk`—the definitive source of truth for this domain's DNS zone records. It looks up the **A Record (IPv4)** for `www.wwt.org.uk` and finds `172.67.182.44` with a `TTL` of `3600s`.
* **Student Options:**
  * `FETCH A RECORD` / `RETURN IP TO RESOLVER` *(Optimal Move $\rightarrow$ Stage 6)*: Retrieves `172.67.182.44` and sends the DNS response back to the ISP Recursive Resolver.
  * `LOAD WEBPAGE HERE` *(Error Move)*: Terminal clarifies: *"Role Mismatch: Name servers only store DNS address records, not HTML/CSS website files. Return the IP address to the resolver first!"*
* **Graph Panel Display:**
  * Query arrow animates `ISP Resolver` $\rightarrow$ `Authoritative Name Server`.
  * Response arrow animates `Authoritative Name Server` $\rightarrow$ `ISP Resolver` carrying a green badge: `A Record: 172.67.182.44`.
  * `Authoritative Name Server` switches to **Completed**.

---

### Stage 6: Caching at the Resolver & Replying to Client
* **Location:** `ISP Recursive Resolver -> Client Device`
* **Terminal Narrative:** The **ISP Recursive Resolver** now holds `172.67.182.44`. Before forwarding the answer back to the student's device, what should the resolver do so that future users can load the site faster—and so the Authoritative Name Server is not hammered by repeat lookups?
* **Student Options:**
  * `CACHE AND REPLY TO CLIENT` *(Optimal Move $\rightarrow$ Stage 7)*: Saves `www.wwt.org.uk -> 172.67.182.44 (TTL: 3600s)` in the ISP cache and sends the IP address back to the Client Device.
  * `REPLY WITHOUT CACHING` *(Consequence Move $\rightarrow$ Stage 6B)*: Forwards the IP to the client but stores nothing in the resolver cache.
* **Graph Panel Display:**
  * The **ISP Resolver Cache** table in the bottom inspector illuminates and adds the row: `www.wwt.org.uk | 172.67.182.44 | 3600s`.
  * Return response arrow animates `ISP Resolver` $\rightarrow$ `Client Device` with `172.67.182.44`.

---

### Stage 6B: The Cache-Miss Storm (Consequence of Not Caching)
* **Location:** `ISP Recursive Resolver -> Authoritative Name Server (ns1.wwt.org.uk)`
* **Terminal Narrative:** Because the resolver did **not** cache the answer, the next 10,000 ISP users who all type `https://www.wwt.org.uk/` at the same time each trigger a full recursive lookup. Every one of those queries ends at the **Authoritative Name Server** for `wwt.org.uk`—simultaneously. The authoritative server is overwhelmed by the query flood, starts returning `SERVFAIL`, and then goes down entirely. Your own page load fails: *"DNS resolution failed—authoritative server unreachable."* **This is the real-world cost of skipping the cache: one uncached record can let a traffic spike take an authoritative server offline.**
* **Student Options:**
  * `WAIT FOR RECOVERY, THEN CACHE AND REPLY` *(Recovery Move $\rightarrow$ Stage 7)*: Once the authoritative server recovers, the resolver finally caches `www.wwt.org.uk -> 172.67.182.44 (TTL: 3600s)` and replies to the client. The **Hop Counter** takes a penalty (e.g., `+6 steps` for the repeated lookups and the outage), and the end-of-run summary card flags the run: *"Authoritative server overloaded—caching the response would have prevented this."*
  * `KEEP QUERYING WITHOUT CACHING` *(Error Move)*: Terminal outputs: *"The authoritative server is still down and rate-limiting your ISP's resolver. No lookup will succeed until the record is cached somewhere."* Graph flashes red error pulses on every retry.
* **Graph Panel Display:**
  * A swarm of small red packet icons animates from `ISP Recursive Resolver` $\rightarrow$ `Authoritative Name Server`, visually saturating the link.
  * `Authoritative Name Server` flashes **Error / Rejected**, then enters the **Overloaded / Down** state (dark red border, warning triangle, `SERVFAIL` badge) before recovering to **Completed / Cached** once the record is finally stored.
  * The `ISP Resolver Cache` table finally adds the row `www.wwt.org.uk | 172.67.182.44 | 3600s`, and the return arrow `ISP Resolver` $\rightarrow$ `Client Device` animates carrying `172.67.182.44`.

---

### Stage 7: Updating Local Cache & Connecting to the Web Server
* **Location:** `Client Device (Browser)`
* **Terminal Narrative:** Success! Your browser receives `172.67.182.44` and saves it to your **Local DNS Cache**. Your packet's destination header is now complete (`Dest IP: 172.67.182.44`). You are ready to make the actual web request!
* **Student Options:**
  * `CONNECT WEBSERVER` *(Optimal Move $\rightarrow$ Stage 8)*: Dispatches an `HTTPS GET /index.html` packet directly to `172.67.182.44`.
  * `QUERY ROOT` *(Error Move)*: Terminal outputs: *"DNS Resolution is already complete! You have the IP address—connect to the Web Server."*
* **Graph Panel Display:**
  * **Client Local Cache** table updates from `TTL: 0s (EXPIRED)` to `172.67.182.44 | TTL: 3600s (VALID)`.
  * Top HUD updates **Resolved IP** to `172.67.182.44`.
  * `Web Server (172.67.182.44)` unlocks on the far right of the graph.

---

### Stage 8: Webpage Loaded & GCSE Exam Debrief
* **Location:** `Web Server (172.67.182.44) -> Client Device`
* **Terminal Narrative:** The Web Server responds with `HTTP 200 OK` and streams the HTML, CSS, and images back to the browser—articles, galleries, and facts about ducks and wildfowl, the best types of birds. **Mission Complete!**
* **Graph Panel Display:**
  * Bidirectional green arrows connect `Client Device` $\leftrightarrow$ `Web Server (172.67.182.44)`.
  * All nodes in the resolution chain glow green; a summary card displays the student's hop accuracy and key J277 exam takeaways—including **why resolvers cache records** (faster repeat lookups, less traffic) and **why skipping the cache can overload and take down an authoritative server** (Stage 6B).
* **Post-Mission Student Options:**
  * `VISIT SITE AGAIN (TEST CACHE HIT)` *(Bonus Stage 9)*: Simulates clicking refresh 10 seconds later.
  * `RESET SIMULATION`: Clears all caches and restarts from Stage 0.

---

### Bonus Stage 9: Testing a Warm Cache (Cache Hit Demonstration)
* **Student Action:** Clicks `VISIT SITE AGAIN` or types `RELOAD`.
* **Terminal Narrative:** The user clicks a link to `www.wwt.org.uk/wildfowl-and-ducks`. You check the **Local DNS Cache**—`172.67.182.44` is still valid (`TTL: 3590s`)! **Cache Hit!** You bypass the ISP Resolver, Root, TLD, and Authoritative servers completely and connect straight to `172.67.182.44`—the authoritative server is never queried again.
* **Graph Panel Display:**
  * `ISP Resolver`, `Root`, `TLD`, and `Authoritative` nodes dim out (`Bypassed via Cache`).
  * A single golden shortcut arrow animates from `Client` $\rightarrow$ `Local Cache (HIT)` $\rightarrow$ `Web Server`, visually proving why DNS caching reduces latency and network traffic.

---

## 4. Supported Zork Parser Commands & Classroom Safeguards

To ensure the game feels authentic like *Zork* while preventing classroom frustration:

| Command / Alias | Action Triggered |
| :--- | :--- |
| `LOOK` / `L` | Re-describes the current network node, its role in the DNS hierarchy, and available outgoing paths. |
| `INSPECT` / `PACKET` | Prints the current packet's source IP, target URL, resolved IP, and DNS record type (`A`). |
| `CACHE` / `CHECK CACHE` | Inspects the local or resolver cache table and checks `TTL` status. |
| `QUERY [NODE]` / `SEND [NODE]` | Dispatches the DNS query to `RESOLVER`, `ROOT`, `TLD`, or `AUTHORITATIVE`. |
| `SAVE` / `STORE CACHE` | Writes a newly resolved IP record into the active node's cache. |
| `CONNECT` / `HTTP` | Sends the HTTP/HTTPS request to the Web Server (only succeeds once `Dest IP` is populated). |
| `HELP` / `HINT` | Provides a GCSE-aligned hint without giving away the exact command immediately. |