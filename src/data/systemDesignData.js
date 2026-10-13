// System Design Primer Knowledge Base
// Based on donnemartin/system-design-primer and real-world FAANG interview architectures

export const LATENCY_NUMBERS = [
  { event: "L1 cache reference", time: "0.5 ns", comparison: "1 heart beat" },
  { event: "Branch mispredict", time: "5 ns", comparison: "10 heart beats" },
  { event: "L2 cache reference", time: "7 ns", comparison: "14 heart beats" },
  { event: "Mutex lock/unlock", time: "25 ns", comparison: "50 heart beats" },
  { event: "Main memory (RAM) reference", time: "100 ns", comparison: "200 heart beats" },
  { event: "Compress 1 KB with Snappy/Zippy", time: "3 µs (3,000 ns)", comparison: "6,000 heart beats" },
  { event: "Send 1 KB over 1 Gbps network", time: "10 µs (10,000 ns)", comparison: "20,000 heart beats" },
  { event: "Read 4 KB randomly from SSD", time: "150 µs", comparison: "300,000 heart beats" },
  { event: "Read 1 MB sequentially from RAM", time: "250 µs", comparison: "500,000 heart beats" },
  { event: "Round trip within same datacenter", time: "500 µs (0.5 ms)", comparison: "1,000,000 heart beats" },
  { event: "Read 1 MB sequentially from SSD", time: "1 ms (1,000 µs)", comparison: "2,000,000 heart beats" },
  { event: "Disk seek (Mechanical HDD)", time: "10 ms", comparison: "20,000,000 heart beats" },
  { event: "Read 1 MB sequentially from 1 Gbps network", time: "10 ms", comparison: "20,000,000 heart beats" },
  { event: "Read 1 MB sequentially from HDD", time: "30 ms", comparison: "60,000,000 heart beats" },
  { event: "Send packet US East to Europe (Cross-Atlantic)", time: "150 ms", comparison: "Limited by speed of light in fiber" },
];

export const POWERS_OF_TWO = [
  { power: "2^10", exact: "1,024", approx: "1 Thousand (1 KB / 1K QPS)" },
  { power: "2^20", exact: "1,048,576", approx: "1 Million (1 MB / 1M QPS)" },
  { power: "2^30", exact: "1,073,741,824", approx: "1 Billion (1 GB / 1B requests)" },
  { power: "2^40", exact: "1,099,511,627,776", approx: "1 Trillion (1 TB storage)" },
  { power: "2^50", exact: "1,125,899,906,842,624", approx: "1 Petabyte (1 PB big data)" },
];

export const ESTIMATION_CHEAT_SHEET = [
  {
    metric: "Seconds in a day",
    formula: "24 × 60 × 60 ≈ 86,400 seconds",
    ruleOfThumb: "Round to 100,000 (10^5) seconds for fast mental math in interviews.",
  },
  {
    metric: "Requests to QPS conversion",
    formula: "Daily Requests / 86,400",
    ruleOfThumb: "10 Million requests/day ≈ 100 QPS (Average). Peak QPS ≈ 2x to 3x Average (200 - 300 QPS).",
  },
  {
    metric: "Storage over 5 years",
    formula: "Daily Write Volume × 365 × 5",
    ruleOfThumb: "Daily Write × ~2,000. E.g., 50 GB/day × 2,000 ≈ 100 TB over 5 years.",
  },
  {
    metric: "Bandwidth calculation",
    formula: "QPS × Average Request Size",
    ruleOfThumb: "1,000 QPS × 100 KB = 100 MB/second = 800 Mbps network throughput.",
  },
];

export const SYSTEM_DESIGN_MODULES = [
  {
    id: "framework",
    title: "1. The 4-Step Interview Framework",
    badge: "Interview Strategy",
    summary: "How FAANG interviewers evaluate candidates across the 45-minute architectural session.",
    color: "from-indigo-500/20 to-blue-500/10 border-indigo-500/30",
    sections: [
      {
        heading: "Step 1: Understand the Goal & Clarify Scope (0 - 5 min)",
        details: [
          "Never jump straight to drawing databases! Ask probing clarifying questions.",
          "Functional Requirements: What are the 2-3 core user journeys? (e.g. Can users post tweets? Follow users? Search tweets? Or is timeline feed the main focus?)",
          "Non-Functional Requirements: High availability (AP) vs strict consistency (CP)? Target latency (<200ms read, <500ms write)? Scale (DAU, Read:Write ratio)?",
          "Out of Scope: Explicitly agree on what NOT to design (e.g., analytics pipeline, ad recommendations, push notifications).",
        ],
      },
      {
        heading: "Step 2: Back-of-the-Envelope Estimation (5 - 10 min)",
        details: [
          "Estimate QPS: Total DAU × Avg actions / 86,400 = Read QPS and Write QPS.",
          "Peak Traffic: Peak QPS is generally 2x to 5x average QPS.",
          "Storage Requirements: Bytes per record × Records per day × 365 × 5 years.",
          "Memory / Cache Requirements: 80-20 Pareto Rule: Cache the 20% most popular items which generate 80% of reads.",
        ],
      },
      {
        heading: "Step 3: High-Level Architecture & API Contracts (10 - 25 min)",
        details: [
          "Define REST or gRPC endpoints: e.g., POST /v1/tweets, GET /v1/timeline?cursor=xyz.",
          "Draw the initial flow: Client -> DNS / CDN -> Load Balancer -> API Gateway -> Stateless Web Services -> Database.",
          "Choose Data Store: Relational (Postgres/MySQL) vs NoSQL (Cassandra/DynamoDB/Redis) based on access patterns and schema variability.",
        ],
      },
      {
        heading: "Step 4: Deep Dive & Scale Bottlenecks (25 - 45 min)",
        details: [
          "Identify single points of failure (SPOF) and introduce redundancy.",
          "Scaling Read Path: Multi-tier caching (Redis), Read Replicas, CDN for static & media assets.",
          "Scaling Write Path: Message Queues (Apache Kafka / RabbitMQ) for asynchronous writes and backpressure.",
          "Data Partitioning / Sharding: Consistent Hashing, shard key selection, hot partitions (celebrity problem).",
        ],
      },
    ],
  },
  {
    id: "cap-and-tradeoffs",
    title: "2. Scalability, Latency & The CAP Theorem",
    badge: "Core Foundations",
    summary: "Fundamental distributed systems trade-offs that govern all architecture decisions.",
    color: "from-cyan-500/20 to-teal-500/10 border-cyan-500/30",
    sections: [
      {
        heading: "Vertical vs Horizontal Scaling",
        details: [
          "Vertical Scaling (Scale Up): Adding more CPU, RAM, and NVMe SSDs to a single machine. Hard hardware ceiling, single point of failure, exponential cost.",
          "Horizontal Scaling (Scale Out): Adding commodity machines into a distributed cluster. Requires stateless services, load balancing, and distributed data partitioning.",
        ],
      },
      {
        heading: "Performance vs Scalability & Latency vs Throughput",
        details: [
          "Performance: How fast a system serves a single request (low latency).",
          "Scalability: System ability to handle growing load proportionally by adding hardware without degrading latency.",
          "Latency: Time taken to process an individual request (e.g., 25ms).",
          "Throughput: Number of operations processed per unit time (e.g., 50,000 queries per second / QPS).",
        ],
      },
      {
        heading: "The CAP Theorem in Practice",
        details: [
          "In any distributed asynchronous network, network partitions (P) are unavoidable. You must choose between:",
          "CP (Consistency + Partition Tolerance): If a partition occurs, refuse writes to preserve uniform state. Examples: Google Spanner, MongoDB (primary write), Banking Ledgers, ZooKeeper/etcd.",
          "AP (Availability + Partition Tolerance): If a partition occurs, accept writes on all surviving nodes and reconcile later (Eventual Consistency). Examples: Amazon DynamoDB, Apache Cassandra, Couchbase, DNS, Social feeds.",
          "PACELC Theorem: If Partition (P), trade Availability (A) vs Consistency (C); Else (E), trade Latency (L) vs Consistency (C).",
        ],
      },
      {
        heading: "Consistency Patterns",
        details: [
          "Weak Consistency: After write, reads may or may not see the update (e.g., VoIP video call packet loss, live chat typing indicators).",
          "Eventual Consistency: After write, all replicas eventually converge given sufficient time with no new updates (e.g., DNS, YouTube view counts, Twitter likes).",
          "Strong (Linearizable) Consistency: After write completes, every subsequent read across any node immediately returns the updated value.",
        ],
      },
    ],
  },
  {
    id: "caching",
    title: "3. Caching Strategies & Eviction Policies",
    badge: "Performance",
    summary: "Placing fast in-memory stores (Redis, Memcached) to eliminate database bottlenecks.",
    color: "from-amber-500/20 to-orange-500/10 border-amber-500/30",
    sections: [
      {
        heading: "Where to Cache (Multi-Tier Caching)",
        details: [
          "Client-side: Browser HTTP cache headers (Cache-Control: max-age, ETag).",
          "Edge / CDN: Cloudflare/CloudFront caches static files, images, and full HTTP responses close to user POPs.",
          "API Gateway / Reverse Proxy: Nginx / Varnish caches idempotent GET API responses.",
          "Application Cache: In-memory distributed cache (Redis, Memcached) for database queries, session tokens, user profiles.",
          "Database Cache: Buffer pool and query cache native to PostgreSQL and MySQL.",
        ],
      },
      {
        heading: "Cache Invalidation & Update Strategies",
        details: [
          "Cache-Aside (Lazy Loading): Application queries Redis. If hit -> return. If miss -> query DB, write to Redis, return. Pros: Only caches requested data. Cons: Cache miss latency penalty.",
          "Write-Through: App writes data to cache, and cache synchronously writes to DB before returning success. Pros: Cache is never stale. Cons: Higher write latency.",
          "Write-Behind / Write-Back: App writes to cache immediately; cache asynchronously batches writes to DB. Pros: Extremely fast writes. Cons: Risk of permanent data loss if cache node crashes before flush.",
          "Refresh-Ahead: Cache automatically refreshes frequently accessed items before their TTL expires based on historical access timestamps.",
        ],
      },
      {
        heading: "Eviction Policies & Common Pitfalls",
        details: [
          "LRU (Least Recently Used): Discards items not accessed for the longest time. Standard for 90% of applications.",
          "LFU (Least Frequently Used): Counts access frequency; discards items accessed least frequently.",
          "FIFO (First In, First Out): Evicts oldest keys regardless of access frequency.",
          "Cache Avalanche: Millions of cached keys expire simultaneously, causing all traffic to hammer the database. Fix: Add random jitter to TTLs (e.g., TTL = base + random(0, 300s)).",
          "Cache Stampede / Dogpiling: A popular key expires, and thousands of concurrent requests query the database at once. Fix: Distributed lock or mutex on cache miss.",
          "Cache Penetration: Requests for non-existent keys bypass cache to database. Fix: Cache null values with short TTL or use a Bloom Filter.",
        ],
      },
    ],
  },
  {
    id: "load-balancing-proxies",
    title: "4. Load Balancing, Reverse Proxies & CDN",
    badge: "Traffic Management",
    summary: "Distributing millions of incoming connections gracefully across stateless pools.",
    color: "from-emerald-500/20 to-teal-500/10 border-emerald-500/30",
    sections: [
      {
        heading: "Load Balancers: Layer 4 vs Layer 7",
        details: [
          "Layer 4 (Transport Layer): Routes based on IP and TCP/UDP ports without inspecting packet payloads. High throughput, low CPU cost (e.g., AWS NLB, HAProxy TCP).",
          "Layer 7 (Application Layer): Inspects HTTP headers, cookies, URL paths, and JSON bodies. Can route /api/users to UserService and /api/video to StreamingService (e.g., AWS ALB, Nginx, Envoy).",
          "Balancing Algorithms: Round Robin, Weighted Round Robin, Least Connections, IP Hash / Session Affinity, Least Response Time.",
        ],
      },
      {
        heading: "Reverse Proxy vs Load Balancer",
        details: [
          "Load Balancer: Distributes incoming network requests across multiple backend servers to balance compute load.",
          "Reverse Proxy (Nginx, Caddy): Sits in front of servers to handle TLS termination (SSL handshake offload), gzip/brotli compression, request rate limiting, DDoS mitigation, and static asset serving.",
        ],
      },
      {
        heading: "Content Delivery Networks (CDN)",
        details: [
          "Push CDN: Content is uploaded directly to CDN servers when updated. Good for small, rarely changing websites or fixed release artifacts.",
          "Pull CDN: CDN pulls new content from origin web server when the first user requests it. Standard for web apps, user media (avatars, uploads), and streaming.",
        ],
      },
    ],
  },
  {
    id: "databases-sharding",
    title: "5. Databases: SQL vs NoSQL, Replication & Sharding",
    badge: "Data Storage",
    summary: "Handling terabytes of structured and unstructured data with zero downtime.",
    color: "from-violet-500/20 to-purple-500/10 border-violet-500/30",
    sections: [
      {
        heading: "SQL vs NoSQL Decision Matrix",
        details: [
          "Pick SQL (PostgreSQL, MySQL): Strict ACID compliance, relational schemas, foreign keys, complex multi-table joins, financial ledger transactions.",
          "Pick Key-Value (Redis, DynamoDB): Extreme read/write throughput by simple key lookup (session stores, leaderboards, shopping carts).",
          "Pick Document Store (MongoDB, CouchDB): Hierarchical, JSON-like data with evolving schema (user profiles, CMS, product catalogs).",
          "Pick Wide-Column (Cassandra, ScyllaDB, HBase): High write throughput at petabyte scale, time-series data, append-only logs, IoT metrics.",
          "Pick Graph Database (Neo4j): Complex relationships with deep graph traversals (social networks, fraud detection graphs, recommendation engines).",
        ],
      },
      {
        heading: "Replication Strategies",
        details: [
          "Master-Slave (Primary-Replica): Primary handles all writes; replicas asynchronously stream write-ahead logs (WAL) to serve read queries. If primary dies, promote replica.",
          "Master-Master (Multi-Primary): Both nodes accept writes. High availability for multi-region; requires conflict resolution (last-write-wins or CRDTs).",
          "Replication Lag: Replicas may be milliseconds behind primary; read-your-own-writes consistency requires routing fresh user reads to primary.",
        ],
      },
      {
        heading: "Database Sharding & Consistent Hashing",
        details: [
          "Horizontal Partitioning (Sharding): Splits table rows across multiple database instances using a Shard Key (e.g., hash(user_id) % num_shards).",
          "Consistent Hashing: Maps both database nodes and data keys onto a virtual 360° hash ring. When nodes are added or removed, only k/N keys need relocation instead of re-hashing all data.",
          "Hot Partition / Celebrity Problem: A celebrity (e.g., 50M followers) causes a single shard to experience 100x traffic. Mitigation: Add random salt to partition keys or serve celebrities from dedicated cache layers.",
        ],
      },
    ],
  },
  {
    id: "asynchronism-queues",
    title: "6. Asynchronous Processing & Message Queues",
    badge: "Decoupling",
    summary: "Eliminating synchronous bottlenecks with message brokers (Kafka, RabbitMQ, SQS).",
    color: "from-pink-500/20 to-rose-500/10 border-pink-500/30",
    sections: [
      {
        heading: "Why Asynchronism?",
        details: [
          "Reduces user-facing latency: Send email confirmation, video transcoding, or AI analysis in background without blocking the HTTP response.",
          "Buffers traffic spikes (Backpressure): Message queues absorb flash crowds (e.g., Black Friday orders) and allow workers to consume at a steady, sustainable rate.",
          "Decouples microservices: Producers publish events without knowing or depending on the internal architecture of downstream consumers.",
        ],
      },
      {
        heading: "Kafka vs RabbitMQ vs SQS",
        details: [
          "RabbitMQ: Traditional message broker. Pushes messages to consumers. Supports complex routing (exchanges, topics, headers). Messages deleted once acknowledged.",
          "Apache Kafka: Distributed, partitioned, append-only commit log. Consumers pull at their own pace and track their offset. Replayable events, massive throughput (millions of msgs/sec).",
          "Amazon SQS: Fully managed cloud queue. Simple setup, standard queue (at-least-once delivery) vs FIFO queue (strict ordering).",
        ],
      },
      {
        heading: "Delivery Guarantees & Idempotency",
        details: [
          "At-most-once: Messages may be lost, but never duplicated. Good for telemetry or sensor pings.",
          "At-least-once: Messages are never lost, but may be delivered more than once due to network retries. Industry standard.",
          "Idempotency: Processing a message multiple times produces the exact same result as processing it once (e.g., use unique idempotency keys in payment transactions).",
        ],
      },
    ],
  },
  {
    id: "communication-security",
    title: "7. Protocols & System Security",
    badge: "Networking & Auth",
    summary: "Choosing communication protocols and hardening distributed systems against attacks.",
    color: "from-blue-500/20 to-indigo-500/10 border-blue-500/30",
    sections: [
      {
        heading: "Communication Protocols",
        details: [
          "HTTP/1.1 vs HTTP/2 vs HTTP/3: HTTP/2 introduces multiplexing over single TCP connection; HTTP/3 uses QUIC over UDP to eliminate head-of-line blocking.",
          "WebSockets: Full-duplex, persistent TCP connection. Ideal for live chat, collaborative whiteboards, multiplayer gaming, financial order books.",
          "Server-Sent Events (SSE): Unidirectional streaming from server to client over standard HTTP. Ideal for live stock tickers, AI response streaming, notification feeds.",
          "gRPC: High-performance RPC framework using HTTP/2 and Protocol Buffers (binary serialization). 7x to 10x faster than JSON REST for inter-service microservice communication.",
        ],
      },
      {
        heading: "Distributed Security & Rate Limiting",
        details: [
          "Rate Limiting Algorithms: Token Bucket (allows bursts), Leaky Bucket (smooths outflow), Fixed Window Counter, Sliding Window Log.",
          "DDoS Protection: Cloudflare / AWS Shield absorbs SYN floods, HTTP floods, and volumetric DNS amplification at edge scrubbers.",
          "Authentication: Asymmetric JWT tokens (RS256) verified statelessly by microservices; refresh tokens stored in secure HttpOnly cookies.",
        ],
      },
    ],
  },
  {
    id: "observability-monitoring",
    title: "8. Observability & Monitoring",
    badge: "Telemetry & SRE",
    summary: "Metrics, structured logs, distributed tracing (OpenTelemetry), and SLAs/SLOs.",
    color: "from-teal-500/20 to-emerald-500/10 border-teal-500/30",
    sections: [
      {
        heading: "The 3 Pillars of Observability",
        details: [
          "Metrics (Prometheus / Datadog): Numeric time-series values aggregated over time (Counters, Gauges, Histograms). Ideal for real-time alerting and capacity planning.",
          "Structured Logs (ELK Stack / Loki): Context-rich JSON events with correlation IDs. Crucial for forensic debugging of single-request failures.",
          "Distributed Tracing (OpenTelemetry / Jaeger): Tracks request spans across dozens of microservices. Reveals latency bottlenecks and critical-path call trees.",
        ],
      },
      {
        heading: "SRE Reliability Metrics: SLI, SLO, SLA & Error Budgets",
        details: [
          "SLI (Service Level Indicator): What you measure (e.g. 99.5% of successful requests respond under 200ms).",
          "SLO (Service Level Objective): Target agreed by engineering (e.g. 99.9% uptime per calendar month).",
          "SLA (Service Level Agreement): Contractual promise to customers with monetary penalties if breached.",
          "Error Budget: Allowed downtime per month (99.9% uptime = 43.8 minutes downtime per month). Exhausted budget freezes new feature deploys to focus on reliability.",
        ],
      },
    ],
  },
  {
    id: "service-mesh-discovery",
    title: "9. Service Discovery, Service Mesh & Microservices",
    badge: "Microservices",
    summary: "Dynamic service registries (Consul, Eureka) and Envoy/Istio sidecar communication.",
    color: "from-amber-500/20 to-yellow-500/10 border-amber-500/30",
    sections: [
      {
        heading: "Service Discovery Mechanisms",
        details: [
          "Client-Side Discovery: Client queries service registry (Netflix Eureka, Consul), picks available node via load balancer algorithm, and calls directly.",
          "Server-Side Discovery: Client calls reverse proxy / AWS ALB / Kubernetes ClusterIP; load balancer queries registry and proxies traffic.",
        ],
      },
      {
        heading: "Service Mesh Architecture (Istio / Linkerd / Envoy)",
        details: [
          "Data Plane: Lightweight Envoy sidecar proxies running next to every container intercepting all inbound and outbound network calls.",
          "Control Plane: Central controller (Istiod) pushing routing rules, mTLS certificates, and circuit breaker policies to sidecars.",
          "Zero-Trust mTLS: Automatic mutual TLS encryption and cryptographic service identity validation between internal microservices.",
        ],
      },
    ],
  },
];

export const SYSTEM_DESIGN_CASE_STUDIES = [
  {
    id: "pastebin-url-shortener",
    title: "Design a URL Shortener & Pastebin (TinyURL / Bit.ly)",
    difficulty: "Medium",
    scale: "100M URLs/month, 100:1 Read:Write ratio",
    companies: ["Google", "Amazon", "Microsoft", "Meta"],
    summary: "Shorten long URLs into unique short keys with lightning-fast redirects and custom aliases.",
    architecture: {
      step1: "Requirements: Create short URL (7-8 chars base62), redirect HTTP 301/302 to original URL, optional expiration, 100M new URLs/month, 10B redirects/month (~4,000 read QPS).",
      step2: "Storage Math: 100M × 12 × 5 years = 6 Billion URLs. At 500 bytes per record, total storage = 3 Terabytes over 5 years. Fits easily on a partitioned SQL or NoSQL database.",
      step3: "Key Generation Strategy: Base62 encoding (a-z, A-Z, 0-9). 62^7 = ~3.5 Trillion unique combinations. Use a Key Generation Service (KGS) with pre-generated keys in Redis to avoid runtime hash collisions.",
      step4: "Caching & Scale: 80-20 rule -> Cache top 20% URLs in Redis cluster (approx 20 GB RAM). Use HTTP 302 redirect if you want analytics tracking on every click; HTTP 301 if you want browsers to cache redirection.",
    },
    keyDiagram: "Client -> CDN/LB -> API Servers -> Redis Cache -> MongoDB / DynamoDB (URL mappings)",
  },
  {
    id: "twitter-newsfeed",
    title: "Design Twitter / Instagram Feed (Timeline Architecture)",
    difficulty: "Hard",
    scale: "300M DAU, 500M tweets/day, Read:Write ratio 100:1",
    companies: ["Meta", "Twitter/X", "Uber", "ByteDance"],
    summary: "Architect real-time newsfeed generation with massive fan-out and celebrity hot-key handling.",
    architecture: {
      step1: "Requirements: Post tweet, follow users, view home feed of recent 800 tweets from followees, <200ms latency.",
      step2: "The Fan-Out Dilemma: Push Model (Fan-out on write) writes tweet to all followers' timeline caches. Pull Model (Fan-out on read) aggregates followees' tweets on request.",
      step3: "Hybrid Fan-Out (Industry Standard): For regular users with <5,000 followers, use Push Model (Redis sorted sets). For celebrities (>50,000 followers like Elon Musk), use Pull Model and dynamically merge on feed request to avoid write amplification.",
      step4: "Storage & Media: Tweets stored in Cassandra partitioned by user_id. Media stored in S3/GCS with CloudFront CDN caching. Social graph (follows) stored in Graph DB or partitioned MySQL.",
    },
    keyDiagram: "Tweet Post -> Kafka Queue -> Fan-out Workers -> Redis Timeline Cache -> Hybrid Pull for Celebrities",
  },
  {
    id: "realtime-chat-whatsapp",
    title: "Design a Real-Time Chat & Collaboration System (WhatsApp / Slack)",
    difficulty: "Hard",
    scale: "50M active concurrent connections, end-to-end encryption",
    companies: ["Meta", "Slack", "Discord", "Apple"],
    summary: "Persistent bidirectional WebSocket connections, presence indicators, and offline message queues.",
    architecture: {
      step1: "Requirements: 1-on-1 chat, group chat (up to 500 members), online/offline presence status, message delivery receipts (sent, delivered, read), offline delivery.",
      step2: "Connection Management: Stateful WebSocket Gateway cluster maintaining millions of open TCP sockets. A Redis cluster maps userId -> WebSocket Server IP.",
      step3: "Message Flow: Sender sends to Gateway A -> Chat Service writes to Cassandra -> Service queries Redis to find Recipient on Gateway B -> Gateway B pushes packet down socket. If recipient offline -> queue in message broker.",
      step4: "Group Chat Optimization: Small groups (up to 100 members) fan out to each member. Large channels (Discord style) use publish-subscribe message buses with client-side polling windows.",
    },
    keyDiagram: "Client A -> WebSocket Gateway -> Redis Connection Registry -> Message Broker -> WebSocket Gateway -> Client B",
  },
  {
    id: "distributed-rate-limiter",
    title: "Design an API Rate Limiter (Cloudflare / Stripe)",
    difficulty: "Medium",
    scale: "1 Million requests/sec, <5ms latency overhead",
    companies: ["Stripe", "Google", "Cloudflare", "Amazon"],
    summary: "Protect backend APIs against DoS attacks, scraping, and noisy neighbors with distributed tokens.",
    architecture: {
      step1: "Requirements: Rate limit by IP, user_id, or API key. Support tiers (e.g. 100 req/min). Distributed across multi-region edge gateways. Return HTTP 429 Too Many Requests with Retry-After header.",
      step2: "Algorithm Choice: Token Bucket allows bursts while enforcing average rate. Sliding Window Log provides exact accuracy with higher memory. Sliding Window Counter offers best balance of speed and memory.",
      step3: "Distributed State: Store counters in Redis using atomic Lua scripts or Redis hashes with EXPIRE. Lua script guarantees atomic read-and-decrement to prevent race conditions across parallel requests.",
      step4: "Resilience: If Redis is temporarily unreachable, fail-open (allow traffic with alert) or fall back to local in-memory rate limiting on each web node.",
    },
    keyDiagram: "Client -> Reverse Proxy / Envoy -> Redis Rate Limiter (Lua Script) -> Backend Services",
  },
  {
    id: "youtube-video-streaming",
    title: "Design YouTube / Netflix (Video Streaming & Transcoding)",
    difficulty: "Hard",
    scale: "2 Billion users, 500 hours uploaded per minute",
    companies: ["Google / YouTube", "Netflix", "Amazon Prime"],
    summary: "Ingest multi-gigabyte video files, transcode into adaptive bitrates (HLS/DASH), and stream globally.",
    architecture: {
      step1: "Requirements: Upload video, transcode into multiple resolutions (1080p, 720p, 480p, 360p), adaptive bitrate streaming based on user bandwidth, view count analytics.",
      step2: "Upload & Ingestion: Client uploads directly to Blob Storage (S3/GCS) via pre-signed chunked multipart URLs to avoid proxying heavy bytes through application servers.",
      step3: "Transcoding Pipeline: Blob upload triggers event into Kafka / RabbitMQ. Transcoder workers pull tasks, split video into chunks, transcode into H.264/AV1 with HLS (.m3u8 index and .ts chunks).",
      step4: "Global Streaming: CDN caches video segments at edge servers. Player automatically switches resolutions dynamically as client bandwidth fluctuates.",
    },
    keyDiagram: "Client Upload -> S3 Pre-signed URL -> Kafka -> Transcoding Workers -> HLS Chunks -> CDN Edge POPs -> User Player",
  },
  {
    id: "uber-dispatch-matching",
    title: "Design Uber / Lyft (Real-Time Geospatial Ride Matching)",
    difficulty: "Hard",
    scale: "25M Active Riders, 5M Drivers, sub-100ms match latency",
    companies: ["Uber", "Lyft", "DoorDash"],
    summary: "Geospatial indexing (Google S2 / Uber H3), dynamic driver location tracking, and real-time dispatch matching.",
    architecture: {
      step1: "Requirements: Drivers broadcast GPS every 4 seconds. Riders request ride with pickup/dropoff. System matches nearest available drivers. Real-time ETA and surge pricing.",
      step2: "Location Ingestion Math: 5M drivers × 1 ping / 4s = 1.25M location updates/sec. Requires an ultra-fast in-memory geohash buffer (Redis Geospatial / H3 hexagonal hierarchy).",
      step3: "Geospatial Indexing: Hexagonal spatial index (Uber H3 cells). Divides globe into hierarchical hexagons. Finding nearby drivers becomes a constant-time cell radius neighbor lookup (k-ring lookup).",
      step4: "Dispatch Engine: Match Service selects top candidate drivers, executes an atomic lock on the driver ID in Redis to prevent double-booking, and pushes ride offers via persistent WebSocket connections.",
    },
    keyDiagram: "Driver GPS -> Netty Gateway -> Kafka -> Location Service (Redis H3 Index) -> Match Service -> WebSocket -> Driver Accept",
  },
  {
    id: "dropbox-google-drive",
    title: "Design Dropbox / Google Drive (File Sync & Deduplication)",
    difficulty: "Hard",
    scale: "700M users, billions of files, multi-device instant sync",
    companies: ["Dropbox", "Google", "Box", "Microsoft"],
    summary: "Block-level delta sync, content-addressable storage, cross-user file deduplication, and chunk encryption.",
    architecture: {
      step1: "Requirements: Upload, download, automatic sync across desktop/mobile, offline edits, conflict handling, and revision history.",
      step2: "Storage Math: Average file size = 2 MB. Chunk into 4 MB fixed blocks. 100M daily uploads = 200 TB/day. Block-level deduplication eliminates 60-70% of redundant chunks across global users.",
      step3: "Chunking & Deduplication: Client splits file into 4 MB chunks and hashes each chunk with SHA-256. Checks metadata service: if hash already exists in cloud, avoid uploading (instant upload deduplication).",
      step4: "Notification & Sync Engine: When file changes locally, client uploads only modified chunks. Long-polling / WebSocket Notification Service alerts all other user devices to pull new metadata and download only updated chunk blocks.",
    },
    keyDiagram: "Client Chunking (SHA-256) -> Metadata DB (Postgres/CockroachDB) -> S3/Blob Storage (Blocks) -> Notification Service -> Sync to Devices",
  },
];
