/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Offline practice question bank.
 * Every question carries evaluation metadata (expectedConcepts + idealAnswer)
 * so the offline evaluator can score meaningfully without any API key.
 */

export type PracticeType = "text" | "mcq" | "coding" | "hr" | "behavioral";
export type Difficulty = "easy" | "medium" | "hard";

export interface PracticeQuestion {
  id: string;
  category: string;
  topic: string;
  difficulty: Difficulty;
  type: PracticeType;
  question: string;
  expectedConcepts: string[];
  idealAnswer: string;
  interviewTip?: string;
  /** MCQ only */
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
  /** Coding only */
  examples?: string;
  constraints?: string;
  starterCode?: string;
}

export const PRACTICE_CATEGORIES = [
  "Python", "Java", "C/C++", "SQL", "HTML/CSS/JavaScript", "OOP", "DBMS",
  "Operating Systems", "Computer Networks", "Data Structures", "Algorithms",
  "Aptitude", "HR Interview", "Behavioral Interview", "Communication",
  "Resume-based Questions", "Coding Interview",
];

const q = (x: PracticeQuestion) => x;

export const QUESTION_BANK: PracticeQuestion[] = [
  // ---------------------------------------------------------------- OOP
  q({ id: "oop-1", category: "OOP", topic: "Polymorphism", difficulty: "medium", type: "text",
    question: "Explain polymorphism in object-oriented programming with an example.",
    expectedConcepts: ["object oriented programming", "same interface", "different implementations", "method overriding", "runtime polymorphism", "compile time overloading", "example"],
    idealAnswer: "Polymorphism means one interface with many implementations. A base type declares a method and each subclass provides its own behaviour. Compile-time polymorphism is method overloading; runtime polymorphism is method overriding resolved through dynamic dispatch. Example: a Shape base class with draw(), and Circle and Square overriding draw() — calling shape.draw() runs the subclass version.",
    interviewTip: "Always name both compile-time and runtime polymorphism, then give one concrete class example." }),
  q({ id: "oop-2", category: "OOP", topic: "Inheritance", difficulty: "easy", type: "text",
    question: "What is inheritance in OOP?",
    expectedConcepts: ["parent class", "child class", "code reuse", "extends", "base derived", "is-a relationship", "override"],
    idealAnswer: "Inheritance lets a child (derived) class reuse and extend the properties and methods of a parent (base) class, modelling an is-a relationship. It promotes code reuse and lets the child override behaviour where needed.",
    interviewTip: "Mention 'is-a' and code reuse, and be ready for a follow-up on composition vs inheritance." }),
  q({ id: "oop-3", category: "OOP", topic: "Encapsulation", difficulty: "easy", type: "text",
    question: "What is encapsulation and why does it matter?",
    expectedConcepts: ["data hiding", "private fields", "getters setters", "access modifiers", "internal state", "maintainability"],
    idealAnswer: "Encapsulation bundles data and the methods operating on it inside one unit and hides internal state behind access modifiers. Fields are private and exposed through getters/setters or behaviour methods, so invariants stay valid and internals can change without breaking callers.",
    interviewTip: "Tie it to a real benefit: you can change internals without breaking callers." }),
  q({ id: "oop-4", category: "OOP", topic: "Abstraction", difficulty: "medium", type: "text",
    question: "What is the difference between an abstract class and an interface?",
    expectedConcepts: ["abstract class partial implementation", "interface contract", "multiple inheritance of interfaces", "constructor state fields", "when to use"],
    idealAnswer: "An abstract class can hold state and partial implementation and is inherited once; an interface is a pure contract of method signatures and a class can implement many. Use an abstract class for shared code among closely related types, an interface for capability that unrelated types can share.",
    interviewTip: "Answer with the rule of thumb: 'is-a shared base' vs 'can-do capability'." }),
  q({ id: "oop-5", category: "OOP", topic: "SOLID", difficulty: "hard", type: "text",
    question: "Explain the SOLID principles and why they help maintainability.",
    expectedConcepts: ["single responsibility", "open closed", "liskov substitution", "interface segregation", "dependency inversion", "maintainable testable"],
    idealAnswer: "Single Responsibility: one reason to change. Open/Closed: extend without modifying. Liskov: subtypes must be substitutable. Interface Segregation: many small interfaces beat one fat one. Dependency Inversion: depend on abstractions, not concretions. Together they keep modules loosely coupled, testable and maintainable.",
    interviewTip: "Name all five quickly, then expand on the one you have actually applied." }),

  // ---------------------------------------------------------------- Python
  q({ id: "py-1", category: "Python", topic: "Data types", difficulty: "easy", type: "text",
    question: "What is the difference between a list and a tuple in Python?",
    expectedConcepts: ["mutable list", "immutable tuple", "square brackets parentheses", "hashable dictionary key", "performance memory"],
    idealAnswer: "Lists are mutable and written with square brackets; tuples are immutable and written with parentheses. Because tuples are immutable they are hashable and can be dictionary keys, and they are slightly faster and lighter. Use tuples for fixed records, lists for collections that change.",
    interviewTip: "Add the hashability point — most candidates stop at 'mutable vs immutable'." }),
  q({ id: "py-2", category: "Python", topic: "Decorators", difficulty: "medium", type: "text",
    question: "What is a decorator in Python and when would you use one?",
    expectedConcepts: ["function that wraps another function", "higher order function", "@ syntax", "cross cutting concerns logging timing caching", "functools wraps"],
    idealAnswer: "A decorator is a higher-order function that takes a function and returns a wrapped version, applied with @ syntax. It is used for cross-cutting concerns such as logging, timing, caching, retries or authentication, keeping that logic out of the business function. Use functools.wraps to preserve metadata.",
    interviewTip: "Name a real decorator you have used: @lru_cache, @app.route, @staticmethod." }),
  q({ id: "py-3", category: "Python", topic: "Memory model", difficulty: "medium", type: "text",
    question: "Explain how Python manages memory and what the GIL is.",
    expectedConcepts: ["reference counting", "garbage collector cycles", "private heap", "global interpreter lock", "one thread executes bytecode", "multiprocessing for cpu bound"],
    idealAnswer: "CPython stores objects on a private heap and frees them with reference counting plus a cyclic garbage collector. The Global Interpreter Lock allows only one thread to execute Python bytecode at a time, so threads help I/O-bound work while CPU-bound work needs multiprocessing or native extensions.",
    interviewTip: "Finish with the practical rule: threads for I/O, processes for CPU." }),
  q({ id: "py-4", category: "Python", topic: "Generators", difficulty: "medium", type: "text",
    question: "What is a generator and how does it differ from a list comprehension?",
    expectedConcepts: ["yield", "lazy evaluation", "memory efficient", "iterator protocol", "single pass", "large streams"],
    idealAnswer: "A generator uses yield to produce values lazily, one at a time, so it holds constant memory and can model infinite or very large streams. A list comprehension builds the whole list eagerly in memory. Generators are single-pass; lists can be reused and indexed.",
    interviewTip: "Mention memory: it's the reason interviewers ask this." }),
  q({ id: "py-5", category: "Python", topic: "Basics", difficulty: "easy", type: "mcq",
    question: "What is the output of: print(type([]) is list)",
    options: ["A) True", "B) False", "C) TypeError", "D) None"],
    correctAnswer: "A",
    explanation: "type([]) returns the list class object itself, and `is list` compares identity with the same class object, so it prints True.",
    expectedConcepts: ["type", "identity comparison"], idealAnswer: "True" }),

  // ---------------------------------------------------------------- Java
  q({ id: "java-1", category: "Java", topic: "Memory", difficulty: "medium", type: "text",
    question: "Explain the difference between the stack and the heap in Java.",
    expectedConcepts: ["stack stores frames locals references", "heap stores objects", "thread local stack", "garbage collection heap", "stackoverflow outofmemory"],
    idealAnswer: "Each thread has its own stack holding method frames, local primitives and object references, freed automatically when the frame pops. Objects live on the shared heap and are reclaimed by the garbage collector. Deep recursion causes StackOverflowError; leaked objects cause OutOfMemoryError.",
    interviewTip: "Name the two errors — it shows you have actually debugged them." }),
  q({ id: "java-2", category: "Java", topic: "Collections", difficulty: "medium", type: "text",
    question: "What is the difference between HashMap and ConcurrentHashMap?",
    expectedConcepts: ["thread safety", "not synchronized hashmap", "segment bucket level locking", "null keys", "fail fast iterator", "concurrent reads"],
    idealAnswer: "HashMap is not thread-safe and can corrupt or throw ConcurrentModificationException under concurrent writes. ConcurrentHashMap allows concurrent reads and locks only individual buckets for writes, giving thread safety with far less contention than Collections.synchronizedMap. ConcurrentHashMap also disallows null keys and values.",
    interviewTip: "Contrast it with synchronizedMap, not only with HashMap." }),
  q({ id: "java-3", category: "Java", topic: "Equality", difficulty: "easy", type: "text",
    question: "What is the difference between == and equals() in Java?",
    expectedConcepts: ["reference comparison", "value logical equality", "override equals hashcode", "string pool", "primitives"],
    idealAnswer: "== compares references (or raw values for primitives) while equals() compares logical equality as defined by the class. Overriding equals() requires overriding hashCode() so hash-based collections behave. String literals can share a pool instance which makes == accidentally look correct.",
    interviewTip: "Always mention the equals/hashCode contract." }),
  q({ id: "java-4", category: "Java", topic: "Exceptions", difficulty: "easy", type: "text",
    question: "Explain checked vs unchecked exceptions in Java.",
    expectedConcepts: ["checked compile time declared throws", "unchecked runtime exception", "recoverable vs programming error", "ioexception nullpointerexception"],
    idealAnswer: "Checked exceptions extend Exception and must be declared or caught at compile time — they model recoverable conditions such as IOException. Unchecked exceptions extend RuntimeException and signal programming errors such as NullPointerException; the compiler does not force handling.",
    interviewTip: "Give one example of each type by name." }),

  // ---------------------------------------------------------------- C/C++
  q({ id: "cpp-1", category: "C/C++", topic: "Pointers", difficulty: "medium", type: "text",
    question: "What is the difference between a pointer and a reference in C++?",
    expectedConcepts: ["pointer can be null reseated", "reference must be initialised alias", "arithmetic", "syntax dereference", "safety"],
    idealAnswer: "A pointer is a variable holding an address: it can be null, reassigned and used with pointer arithmetic, and must be dereferenced. A reference is an alias that must be bound at initialisation, can never be null or rebound, and is used with normal value syntax — which makes it safer for parameters.",
    interviewTip: "State the default guidance: prefer references unless you need null or rebinding." }),
  q({ id: "cpp-2", category: "C/C++", topic: "Memory", difficulty: "medium", type: "text",
    question: "Explain memory leaks in C++ and how smart pointers help.",
    expectedConcepts: ["new without delete", "raii", "unique_ptr shared_ptr", "ownership", "reference count", "weak_ptr cycles"],
    idealAnswer: "A leak happens when heap memory allocated with new is never deleted, often on an early return or exception path. RAII ties lifetime to scope; unique_ptr expresses single ownership and frees automatically, shared_ptr reference-counts shared ownership, and weak_ptr breaks reference cycles.",
    interviewTip: "Say 'RAII' explicitly — it is the keyword interviewers listen for." }),
  q({ id: "cpp-3", category: "C/C++", topic: "Basics", difficulty: "easy", type: "text",
    question: "What is the difference between struct and class in C++?",
    expectedConcepts: ["default access public struct", "default private class", "otherwise identical", "inheritance default", "convention plain data"],
    idealAnswer: "The only language difference is default access: struct members and default inheritance are public, class members and default inheritance are private. Both support constructors, methods and inheritance. By convention struct is used for plain data aggregates.",
    interviewTip: "Emphasise 'the only difference is defaults' — many candidates over-answer here." }),

  // ---------------------------------------------------------------- SQL
  q({ id: "sql-1", category: "SQL", topic: "Joins", difficulty: "medium", type: "text",
    question: "Explain the difference between INNER JOIN, LEFT JOIN and FULL OUTER JOIN.",
    expectedConcepts: ["inner matching rows both tables", "left all rows left table nulls", "full outer both sides nulls", "join condition on key", "example"],
    idealAnswer: "INNER JOIN returns only rows with a match on both sides. LEFT JOIN returns every row of the left table, filling right-side columns with NULL when there is no match. FULL OUTER JOIN returns unmatched rows from both sides with NULLs. For example, customers LEFT JOIN orders lists customers who have never ordered.",
    interviewTip: "Give the customers/orders example — it proves you understand NULL padding." }),
  q({ id: "sql-2", category: "SQL", topic: "Aggregation", difficulty: "medium", type: "text",
    question: "What is the difference between WHERE and HAVING?",
    expectedConcepts: ["where filters rows before grouping", "having filters groups after aggregation", "aggregate functions", "group by", "execution order"],
    idealAnswer: "WHERE filters individual rows before grouping and cannot use aggregate functions. HAVING filters the grouped result after GROUP BY and aggregation, so it can reference COUNT, SUM or AVG. Logical order: FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY.",
    interviewTip: "Recite the logical execution order — it answers most SQL follow-ups." }),
  q({ id: "sql-3", category: "SQL", topic: "Indexes", difficulty: "hard", type: "text",
    question: "How do database indexes work and what are their trade-offs?",
    expectedConcepts: ["b-tree structure", "faster lookup range scan", "slower writes inserts updates", "extra storage", "selectivity composite index", "covering index"],
    idealAnswer: "An index is usually a B-tree keyed on one or more columns, turning a full table scan into a logarithmic lookup and enabling ordered range scans. The trade-off is extra storage and slower INSERT/UPDATE/DELETE because every index must be maintained. Indexes pay off on selective, frequently filtered columns; a composite or covering index can serve a query entirely.",
    interviewTip: "Mention write amplification — that's the trade-off part they want." }),
  q({ id: "sql-4", category: "SQL", topic: "Query writing", difficulty: "medium", type: "text",
    question: "How would you find the second highest salary from an Employee table?",
    expectedConcepts: ["dense_rank or row_number window", "subquery max less than max", "limit offset", "handle duplicates ties", "null when not exists"],
    idealAnswer: "With a window function: SELECT DISTINCT salary FROM (SELECT salary, DENSE_RANK() OVER (ORDER BY salary DESC) r FROM Employee) t WHERE r = 2. Alternatively SELECT MAX(salary) FROM Employee WHERE salary < (SELECT MAX(salary) FROM Employee). DENSE_RANK handles duplicate salaries correctly and returns nothing when there is no second value.",
    interviewTip: "Call out the duplicate-salary edge case before they ask." }),

  // ---------------------------------------------------------------- HTML/CSS/JS
  q({ id: "web-1", category: "HTML/CSS/JavaScript", topic: "Closures", difficulty: "medium", type: "text",
    question: "What is a closure in JavaScript and give a practical use.",
    expectedConcepts: ["function remembers lexical scope", "outer variables after return", "private state", "counter factory module", "example"],
    idealAnswer: "A closure is a function that keeps access to variables from the lexical scope where it was created, even after that outer function returned. It is used for private state — for example a makeCounter() that returns an increment function owning a private count — and underpins module patterns, memoisation and event handlers.",
    interviewTip: "Write or describe a two-line counter example; it lands better than a definition." }),
  q({ id: "web-2", category: "HTML/CSS/JavaScript", topic: "Event loop", difficulty: "hard", type: "text",
    question: "Explain the JavaScript event loop, microtasks and macrotasks.",
    expectedConcepts: ["single threaded call stack", "task queue macrotask", "microtask queue promises", "microtasks drain before next macrotask", "settimeout", "non blocking"],
    idealAnswer: "JavaScript runs on a single thread with a call stack. Async callbacks are queued: promise callbacks go to the microtask queue, setTimeout and I/O to the macrotask queue. After the stack empties, the event loop drains all microtasks, then takes one macrotask, so a resolved promise always runs before a setTimeout(0).",
    interviewTip: "State the ordering rule explicitly — that's the graded part." }),
  q({ id: "web-3", category: "HTML/CSS/JavaScript", topic: "CSS layout", difficulty: "easy", type: "text",
    question: "What is the difference between Flexbox and CSS Grid?",
    expectedConcepts: ["flexbox one dimensional", "grid two dimensional rows columns", "content vs layout first", "when to use each", "responsive"],
    idealAnswer: "Flexbox lays out content along one axis and is content-driven, ideal for toolbars, nav bars and card rows. Grid is two-dimensional with explicit rows and columns and is layout-driven, ideal for page structure. They compose: a grid page with flex components.",
    interviewTip: "Answer with 'one-dimensional vs two-dimensional' first, then examples." }),
  q({ id: "web-4", category: "HTML/CSS/JavaScript", topic: "Semantics", difficulty: "easy", type: "text",
    question: "Why does semantic HTML matter?",
    expectedConcepts: ["accessibility screen readers", "seo crawlers", "meaningful elements header nav main article", "maintainability", "landmark navigation"],
    idealAnswer: "Semantic elements like header, nav, main, article and footer describe meaning rather than appearance. Screen readers use them as landmarks, search engines use them to understand structure, and developers read the markup faster. Divs with class names give none of that.",
    interviewTip: "Lead with accessibility; SEO second." }),

  // ---------------------------------------------------------------- DBMS
  q({ id: "dbms-1", category: "DBMS", topic: "Normalization", difficulty: "medium", type: "text",
    question: "What is normalization and explain 1NF, 2NF and 3NF.",
    expectedConcepts: ["reduce redundancy anomalies", "1nf atomic values", "2nf no partial dependency", "3nf no transitive dependency", "primary key functional dependency"],
    idealAnswer: "Normalization organises tables to remove redundancy and update anomalies. 1NF requires atomic column values and no repeating groups. 2NF additionally removes partial dependencies on part of a composite key. 3NF removes transitive dependencies, so every non-key attribute depends only on the primary key.",
    interviewTip: "Add when you would denormalize — read-heavy reporting workloads." }),
  q({ id: "dbms-2", category: "DBMS", topic: "Transactions", difficulty: "medium", type: "text",
    question: "Explain ACID properties of a transaction.",
    expectedConcepts: ["atomicity all or nothing", "consistency valid state constraints", "isolation concurrent transactions", "durability committed survives crash", "rollback commit"],
    idealAnswer: "Atomicity: a transaction commits fully or rolls back entirely. Consistency: it moves the database from one valid state to another respecting constraints. Isolation: concurrent transactions do not observe each other's partial work, controlled by isolation levels. Durability: once committed, data survives crashes via the write-ahead log.",
    interviewTip: "Mention isolation levels — it invites a follow-up you can control." }),
  q({ id: "dbms-3", category: "DBMS", topic: "Keys", difficulty: "easy", type: "text",
    question: "What is the difference between a primary key and a foreign key?",
    expectedConcepts: ["primary key unique not null identifies row", "one per table", "foreign key references another table primary key", "referential integrity", "can be null duplicate"],
    idealAnswer: "A primary key uniquely identifies each row, cannot be NULL and there is one per table. A foreign key is a column referencing another table's primary key, enforcing referential integrity; it may be NULL and duplicated on the many side of a relationship.",
    interviewTip: "Use the word 'referential integrity'." }),

  // ---------------------------------------------------------------- OS
  q({ id: "os-1", category: "Operating Systems", topic: "Processes", difficulty: "medium", type: "text",
    question: "What is the difference between a process and a thread?",
    expectedConcepts: ["process own memory address space", "thread shares memory within process", "context switch cost", "communication ipc vs shared variables", "isolation crash"],
    idealAnswer: "A process has its own address space and resources; threads live inside a process and share its memory and file handles. Thread context switches are cheaper and communication is via shared variables (needing synchronisation), while processes need IPC but are isolated, so one crash does not kill the others.",
    interviewTip: "Close with the trade-off: isolation vs cheap sharing." }),
  q({ id: "os-2", category: "Operating Systems", topic: "Deadlock", difficulty: "medium", type: "text",
    question: "What is a deadlock and what are its four necessary conditions?",
    expectedConcepts: ["mutual exclusion", "hold and wait", "no preemption", "circular wait", "prevention avoidance detection", "lock ordering"],
    idealAnswer: "A deadlock is a set of processes each waiting for a resource held by another, so none proceeds. It needs mutual exclusion, hold-and-wait, no preemption and circular wait simultaneously. Breaking any one prevents it — a consistent global lock ordering removes circular wait; timeouts and detection with rollback are alternatives.",
    interviewTip: "Name all four conditions, then the practical fix (lock ordering)." }),
  q({ id: "os-3", category: "Operating Systems", topic: "Memory", difficulty: "hard", type: "text",
    question: "Explain virtual memory, paging and thrashing.",
    expectedConcepts: ["virtual address space per process", "page table mmu translation", "page fault disk swap", "tlb", "thrashing excessive paging", "working set"],
    idealAnswer: "Virtual memory gives each process a private address space mapped to physical frames through page tables and the MMU, cached in the TLB. Pages not resident cause a page fault that loads from disk. When the working set exceeds RAM, the system spends most of its time paging instead of executing — thrashing — fixed by adding memory or reducing the degree of multiprogramming.",
    interviewTip: "The word 'working set' signals real OS knowledge." }),

  // ---------------------------------------------------------------- Networks
  q({ id: "net-1", category: "Computer Networks", topic: "Transport", difficulty: "easy", type: "text",
    question: "What is the difference between TCP and UDP?",
    expectedConcepts: ["tcp connection oriented handshake", "reliable ordered retransmission", "udp connectionless best effort", "lower latency overhead", "use cases streaming dns http"],
    idealAnswer: "TCP is connection-oriented: a three-way handshake, acknowledgements, retransmission, ordering and congestion control give reliable delivery at the cost of latency and overhead. UDP is connectionless best-effort with no ordering or retransmission, so it suits DNS, gaming, VoIP and live video where latency matters more than perfect delivery.",
    interviewTip: "End with one use case per protocol." }),
  q({ id: "net-2", category: "Computer Networks", topic: "HTTP", difficulty: "medium", type: "text",
    question: "What happens when you type a URL in the browser and press Enter?",
    expectedConcepts: ["dns resolution ip", "tcp handshake", "tls handshake https", "http request response", "server processing", "browser renders dom css javascript"],
    idealAnswer: "The browser checks its cache, resolves the domain to an IP via DNS, opens a TCP connection (plus a TLS handshake for HTTPS), sends an HTTP request, the server responds with HTML, and the browser parses the HTML into the DOM, fetches CSS/JS/images, builds the render tree and paints — running JavaScript that may fetch more data.",
    interviewTip: "Go layer by layer; interviewers score breadth here, not depth." }),
  q({ id: "net-3", category: "Computer Networks", topic: "Models", difficulty: "medium", type: "text",
    question: "Explain the OSI model layers briefly.",
    expectedConcepts: ["physical", "data link", "network", "transport", "session", "presentation", "application"],
    idealAnswer: "Seven layers: Physical (bits on the wire), Data Link (frames, MAC), Network (packets, IP routing), Transport (segments, TCP/UDP ports), Session (connection management), Presentation (encoding, encryption) and Application (HTTP, DNS, SMTP). Each layer serves the one above it.",
    interviewTip: "Give one protocol or unit per layer instead of just the names." }),

  // ---------------------------------------------------------------- DS
  q({ id: "ds-1", category: "Data Structures", topic: "Hash tables", difficulty: "medium", type: "text",
    question: "How does a hash table work and how are collisions handled?",
    expectedConcepts: ["hash function maps key to bucket index", "average o(1) lookup", "collision chaining", "open addressing probing", "load factor resize rehash", "worst case o(n)"],
    idealAnswer: "A hash function maps a key to a bucket index, giving average O(1) insert and lookup. Collisions are resolved by chaining (a list or tree per bucket) or open addressing (linear/quadratic probing). When the load factor grows too high the table resizes and rehashes. Worst case degrades to O(n), or O(log n) with treeified buckets.",
    interviewTip: "Always state both the average and worst case complexity." }),
  q({ id: "ds-2", category: "Data Structures", topic: "Lists", difficulty: "easy", type: "text",
    question: "Compare arrays and linked lists.",
    expectedConcepts: ["array contiguous memory random access o(1)", "linked list pointers sequential access o(n)", "insertion deletion cost", "cache locality", "dynamic size"],
    idealAnswer: "Arrays store elements contiguously, giving O(1) indexed access and excellent cache locality, but insertion or deletion in the middle is O(n) and resizing copies. Linked lists allocate nodes individually so insertion/deletion at a known position is O(1), but access is O(n) and pointer chasing hurts cache performance.",
    interviewTip: "Cache locality is the differentiator answer." }),
  q({ id: "ds-3", category: "Data Structures", topic: "Trees", difficulty: "medium", type: "text",
    question: "What is a binary search tree and why can it degrade?",
    expectedConcepts: ["left smaller right larger", "in-order traversal sorted", "o(log n) balanced", "skewed becomes linked list o(n)", "avl red black self balancing"],
    idealAnswer: "In a BST every left descendant is smaller and every right larger than a node, so search, insert and delete are O(log n) when balanced and in-order traversal yields sorted output. Inserting sorted data skews the tree into a linked list with O(n) operations, which self-balancing trees such as AVL or red-black trees prevent by rotating.",
    interviewTip: "Bring up the sorted-insert degradation before being asked." }),

  // ---------------------------------------------------------------- Algorithms
  q({ id: "algo-1", category: "Algorithms", topic: "Complexity", difficulty: "easy", type: "text",
    question: "What is Big-O notation and why do we use it?",
    expectedConcepts: ["asymptotic upper bound growth", "input size n", "ignores constants lower order terms", "compare algorithms hardware independent", "time and space"],
    idealAnswer: "Big-O describes the asymptotic upper bound on how an algorithm's time or space grows with input size, ignoring constants and lower-order terms. It lets us compare algorithms independently of hardware and predict behaviour at scale, e.g. O(n log n) sorting beats O(n²) once n is large.",
    interviewTip: "Mention that constants matter for small n — it shows judgement." }),
  q({ id: "algo-2", category: "Algorithms", topic: "Sorting", difficulty: "medium", type: "text",
    question: "Compare quicksort and mergesort.",
    expectedConcepts: ["quicksort average o(n log n) worst o(n^2)", "in place low memory", "mergesort guaranteed o(n log n)", "stable extra o(n) space", "pivot choice", "external sorting"],
    idealAnswer: "Quicksort partitions around a pivot: average O(n log n), in-place with O(log n) stack, but O(n²) on bad pivots and unstable. Mergesort always runs in O(n log n), is stable, but needs O(n) extra space, which makes it the choice for linked lists and external sorting. Quicksort is usually faster in practice due to cache behaviour.",
    interviewTip: "Stability and memory are the two axes interviewers grade." }),
  q({ id: "algo-3", category: "Algorithms", topic: "Dynamic programming", difficulty: "hard", type: "text",
    question: "What is dynamic programming and when is it applicable?",
    expectedConcepts: ["overlapping subproblems", "optimal substructure", "memoization top down", "tabulation bottom up", "avoid recomputation", "example fibonacci knapsack"],
    idealAnswer: "Dynamic programming solves problems with overlapping subproblems and optimal substructure by storing subproblem results instead of recomputing them — top-down with memoisation or bottom-up with tabulation. Fibonacci drops from exponential to O(n); knapsack, edit distance and longest common subsequence are classic examples.",
    interviewTip: "Say both conditions by name — that's the checklist answer." }),

  // ---------------------------------------------------------------- Aptitude (MCQ)
  q({ id: "apt-p1", category: "Aptitude", topic: "Time & Work", difficulty: "medium", type: "mcq",
    question: "A can finish a work in 15 days and B in 20 days. Working together for 4 days, what fraction of the work is left?",
    options: ["A) 7/15", "B) 8/15", "C) 11/15", "D) 2/15"], correctAnswer: "B",
    explanation: "Combined one-day work = 1/15 + 1/20 = 7/60. In 4 days = 28/60 = 7/15. Remaining = 1 − 7/15 = 8/15.",
    expectedConcepts: ["rate of work", "fraction remaining"], idealAnswer: "8/15" }),
  q({ id: "apt-p2", category: "Aptitude", topic: "Speed & Distance", difficulty: "medium", type: "mcq",
    question: "A train at 60 km/hr crosses a pole in 9 seconds. What is its length?",
    options: ["A) 120 m", "B) 180 m", "C) 324 m", "D) 150 m"], correctAnswer: "D",
    explanation: "60 km/hr = 60 × 5/18 = 16.67 m/s. Length = 16.67 × 9 = 150 m.",
    expectedConcepts: ["unit conversion", "distance = speed × time"], idealAnswer: "150 m" }),
  q({ id: "apt-p3", category: "Aptitude", topic: "Percentages", difficulty: "easy", type: "mcq",
    question: "If a number is increased by 20% and then decreased by 20%, the net change is:",
    options: ["A) No change", "B) 4% decrease", "C) 4% increase", "D) 2% decrease"], correctAnswer: "B",
    explanation: "1.2 × 0.8 = 0.96, i.e. a 4% net decrease.",
    expectedConcepts: ["successive percentage change"], idealAnswer: "4% decrease" }),
  q({ id: "apt-p4", category: "Aptitude", topic: "Probability", difficulty: "hard", type: "mcq",
    question: "Three unbiased coins are tossed. What is the probability of getting at least 2 heads?",
    options: ["A) 1/4", "B) 3/8", "C) 1/2", "D) 3/4"], correctAnswer: "C",
    explanation: "Favourable: HHH, HHT, HTH, THH = 4 of 8 outcomes = 1/2.",
    expectedConcepts: ["sample space", "favourable outcomes"], idealAnswer: "1/2" }),
  q({ id: "apt-p5", category: "Aptitude", topic: "Number Series", difficulty: "easy", type: "mcq",
    question: "Find the next term: 2, 1, 1/2, 1/4, ...",
    options: ["A) 1/3", "B) 1/8", "C) 2/8", "D) 1/16"], correctAnswer: "B",
    explanation: "Each term is half of the previous term, so the next is 1/8.",
    expectedConcepts: ["geometric progression"], idealAnswer: "1/8" }),
  q({ id: "apt-p6", category: "Aptitude", topic: "Ratios", difficulty: "medium", type: "mcq",
    question: "The ratio of two numbers is 3:5 and their sum is 96. The larger number is:",
    options: ["A) 36", "B) 60", "C) 54", "D) 64"], correctAnswer: "B",
    explanation: "3x + 5x = 96 → x = 12, larger = 5 × 12 = 60.",
    expectedConcepts: ["ratio parts"], idealAnswer: "60" }),
  q({ id: "apt-p7", category: "Aptitude", topic: "Coding-Decoding", difficulty: "medium", type: "mcq",
    question: "If COMPUTER is written as OCPMTURE, how is MEDICINE written?",
    options: ["A) EMIDICEN", "B) EMIDCIEN", "C) EMIDICNE", "D) EMDIICNE"], correctAnswer: "A",
    explanation: "Letters are swapped in consecutive pairs: ME→EM, DI→ID, CI→IC, NE→EN.",
    expectedConcepts: ["pattern recognition"], idealAnswer: "EMIDICEN" }),

  // ---------------------------------------------------------------- HR
  q({ id: "hr-1", category: "HR Interview", topic: "Introduction", difficulty: "easy", type: "hr",
    question: "Tell me about yourself.",
    expectedConcepts: ["current status role or education", "relevant skills and technologies", "one concrete achievement or project", "why this role now", "concise structured"],
    idealAnswer: "Present → past → future: who you are today, two or three relevant achievements with evidence, and why this role is the logical next step. Keep it under 90 seconds and tie every point to the job.",
    interviewTip: "Use present–past–future and end with why this specific role." }),
  q({ id: "hr-2", category: "HR Interview", topic: "Fit", difficulty: "medium", type: "hr",
    question: "Why should we hire you?",
    expectedConcepts: ["match to job requirements", "specific evidence of impact", "unique differentiator", "value to the team", "enthusiasm for the role"],
    idealAnswer: "Map the two or three things the role most needs to concrete evidence you have done them, add what differentiates you, and finish with the value you would add in the first months.",
    interviewTip: "Quote the job description back with proof — never generic adjectives." }),
  q({ id: "hr-3", category: "HR Interview", topic: "Strengths", difficulty: "easy", type: "hr",
    question: "What are your greatest strengths?",
    expectedConcepts: ["two or three relevant strengths", "evidence example", "relevance to role", "measurable outcome", "self awareness"],
    idealAnswer: "Pick two or three strengths the role actually needs, prove each with a short example and an outcome, and avoid a list of adjectives with no evidence.",
    interviewTip: "One strength plus one story beats five adjectives." }),
  q({ id: "hr-4", category: "HR Interview", topic: "Weaknesses", difficulty: "medium", type: "hr",
    question: "What is your greatest weakness?",
    expectedConcepts: ["genuine real weakness", "self awareness", "concrete corrective action", "measurable improvement", "not a disguised strength"],
    idealAnswer: "Name a real, non-critical weakness, explain how it showed up, what specific steps you took, and the improvement so far. Avoid 'I'm a perfectionist'.",
    interviewTip: "The improvement plan is what is actually being scored." }),
  q({ id: "hr-5", category: "HR Interview", topic: "Goals", difficulty: "easy", type: "hr",
    question: "Where do you see yourself in five years?",
    expectedConcepts: ["realistic growth path", "skills to develop", "alignment with company", "commitment", "contribution not just title"],
    idealAnswer: "Describe a realistic growth path in this discipline, the depth you want to build, and how it aligns with the company's trajectory — focus on responsibility and contribution, not job titles.",
    interviewTip: "Align your five-year answer with the company's own career ladder." }),
  q({ id: "hr-6", category: "HR Interview", topic: "Motivation", difficulty: "easy", type: "hr",
    question: "Why do you want this role at our company?",
    expectedConcepts: ["specific knowledge of company product", "match with your skills", "growth opportunity", "genuine motivation", "long term fit"],
    idealAnswer: "Show you researched the product and team, connect two concrete aspects to your skills and interests, and explain what you would learn and contribute.",
    interviewTip: "Name something specific about the company; generic praise reads as no research." }),

  // ---------------------------------------------------------------- Behavioural
  q({ id: "beh-1", category: "Behavioral Interview", topic: "Challenge", difficulty: "medium", type: "behavioral",
    question: "Tell me about a challenging problem you faced and how you handled it.",
    expectedConcepts: ["situation context", "task responsibility", "action steps you took", "result measurable outcome", "what you learned"],
    idealAnswer: "Use STAR: set the situation and stakes, your specific task, the actions YOU took (decisions, trade-offs, collaboration), and the measurable result plus the lesson carried forward.",
    interviewTip: "Say 'I' not 'we' in the Action section." }),
  q({ id: "beh-2", category: "Behavioral Interview", topic: "Conflict", difficulty: "medium", type: "behavioral",
    question: "Describe a time you disagreed with a teammate. How did you resolve it?",
    expectedConcepts: ["situation disagreement context", "task shared goal", "action listened data driven discussion", "result resolution outcome", "relationship preserved learning"],
    idealAnswer: "Describe the disagreement neutrally, the shared goal, how you sought their reasoning and used data or a small experiment to decide, the outcome, and how the working relationship improved.",
    interviewTip: "Never make the other person the villain." }),
  q({ id: "beh-3", category: "Behavioral Interview", topic: "Failure", difficulty: "hard", type: "behavioral",
    question: "Tell me about a time you failed.",
    expectedConcepts: ["real failure ownership", "situation and task", "what went wrong action", "result impact and recovery", "concrete lesson applied later"],
    idealAnswer: "Pick a genuine failure, own your part without blaming, explain the impact, how you recovered, and specifically what you changed afterwards — plus evidence the change held.",
    interviewTip: "Ownership plus a lesson you later applied is the scoring pattern." }),
  q({ id: "beh-4", category: "Behavioral Interview", topic: "Deadline", difficulty: "medium", type: "behavioral",
    question: "Describe a time you had to deliver under a tight deadline.",
    expectedConcepts: ["situation deadline pressure", "task scope priorities", "action prioritisation communication", "result delivered outcome", "trade offs made"],
    idealAnswer: "Explain the deadline and constraint, how you prioritised and cut scope, how you communicated risk early, what you delivered, and the measurable result.",
    interviewTip: "Mention what you deliberately cut — that shows prioritisation." }),

  // ---------------------------------------------------------------- Communication
  q({ id: "comm-1", category: "Communication", topic: "Explaining", difficulty: "medium", type: "text",
    question: "Explain a technical project you built to a completely non-technical person.",
    expectedConcepts: ["plain language no jargon", "what problem it solves", "who benefits", "analogy", "outcome or impact", "structured explanation"],
    idealAnswer: "Start with the problem and who suffered from it, describe the solution in everyday language with an analogy, then give the outcome in terms the listener values — time saved, errors avoided, money earned.",
    interviewTip: "Lead with the problem, not the technology stack." }),
  q({ id: "comm-2", category: "Communication", topic: "Feedback", difficulty: "medium", type: "text",
    question: "How do you give constructive feedback to a peer?",
    expectedConcepts: ["private timely", "specific behaviour not person", "impact explanation", "suggested improvement", "invite their perspective", "follow up"],
    idealAnswer: "Give it privately and soon after, describe the specific behaviour and its impact rather than judging the person, propose a concrete alternative, ask for their view, and follow up later.",
    interviewTip: "Use situation–behaviour–impact as your framework." }),
  q({ id: "comm-3", category: "Communication", topic: "Clarification", difficulty: "easy", type: "text",
    question: "What do you do when you do not understand a requirement?",
    expectedConcepts: ["ask clarifying questions early", "restate understanding confirm", "write it down document", "examples edge cases", "avoid assumptions"],
    idealAnswer: "Ask early rather than assuming, restate the requirement in my own words to confirm, ask for a concrete example and the edge cases, and write the agreed understanding down where the team can see it.",
    interviewTip: "'Restate to confirm' is the phrase interviewers listen for." }),

  // ---------------------------------------------------------------- Resume-based
  q({ id: "res-1", category: "Resume-based Questions", topic: "Projects", difficulty: "medium", type: "text",
    question: "Walk me through the most technically challenging project on your resume.",
    expectedConcepts: ["problem and goal", "your specific role", "architecture and technology choices", "hardest technical challenge", "trade offs", "outcome and metrics"],
    idealAnswer: "State the problem and goal, your specific role, the architecture and why you chose it, the hardest technical obstacle and how you solved it, the trade-offs you accepted and the measurable outcome.",
    interviewTip: "Be ready to defend every technology choice you name." }),
  q({ id: "res-2", category: "Resume-based Questions", topic: "Tech choices", difficulty: "medium", type: "text",
    question: "Why did you choose the tech stack you used in your main project?",
    expectedConcepts: ["requirements driven choice", "alternatives considered", "trade offs performance ecosystem", "team familiarity", "what you would change now"],
    idealAnswer: "Tie the choice to the requirements, name the alternatives you considered and why they lost, be honest about trade-offs, and say what you would do differently now with hindsight.",
    interviewTip: "'What I would change now' turns a normal answer into a senior one." }),
  q({ id: "res-3", category: "Resume-based Questions", topic: "Ownership", difficulty: "medium", type: "text",
    question: "What part of your resume are you proudest of and why?",
    expectedConcepts: ["specific achievement", "your contribution", "difficulty overcome", "measurable impact", "personal growth"],
    idealAnswer: "Choose one specific achievement, explain what made it hard, exactly what you contributed, the measurable impact, and what it changed about how you work.",
    interviewTip: "Quantify the impact — numbers make an achievement credible." }),

  // ---------------------------------------------------------------- Coding
  q({ id: "code-1", category: "Coding Interview", topic: "Arrays / Hashing", difficulty: "easy", type: "coding",
    question: "Given an array of integers and a target, return the indices of the two numbers that add up to the target.",
    examples: "Input: nums = [2,7,11,15], target = 9 → Output: [0,1]\nInput: nums = [3,2,4], target = 6 → Output: [1,2]",
    constraints: "2 ≤ nums.length ≤ 10^4, only one valid answer exists, you may not use the same element twice.",
    starterCode: "function twoSum(nums, target) {\n  // your solution\n}",
    expectedConcepts: ["hash map of value to index", "single pass o(n) time", "o(n) space", "complement target minus current", "edge case duplicates negatives"],
    idealAnswer: "Iterate once storing each value's index in a hash map; for each element check whether target − value is already in the map and return both indices. O(n) time and O(n) space, versus the O(n²) brute force. Handles duplicates and negatives because we check before inserting.",
    interviewTip: "State the brute force, then the hash-map optimisation and both complexities." }),
  q({ id: "code-2", category: "Coding Interview", topic: "Strings", difficulty: "easy", type: "coding",
    question: "Write a function that checks whether a string is a palindrome, ignoring case and non-alphanumeric characters.",
    examples: "Input: \"A man, a plan, a canal: Panama\" → true\nInput: \"race a car\" → false",
    constraints: "0 ≤ s.length ≤ 2 × 10^5, s consists of printable ASCII.",
    starterCode: "function isPalindrome(s) {\n  // your solution\n}",
    expectedConcepts: ["two pointer from both ends", "skip non alphanumeric", "case insensitive compare", "o(n) time o(1) space", "empty string edge case"],
    idealAnswer: "Use two pointers moving inwards, skipping non-alphanumeric characters and comparing lowercased characters. O(n) time, O(1) extra space — better than building a filtered reversed copy, which costs O(n) space. Empty and single-character strings are palindromes.",
    interviewTip: "Two pointers beats reverse-and-compare on space; say so." }),
  q({ id: "code-3", category: "Coding Interview", topic: "Sliding window", difficulty: "medium", type: "coding",
    question: "Find the length of the longest substring without repeating characters.",
    examples: "Input: \"abcabcbb\" → 3 (\"abc\")\nInput: \"bbbbb\" → 1",
    constraints: "0 ≤ s.length ≤ 5 × 10^4.",
    starterCode: "function lengthOfLongestSubstring(s) {\n  // your solution\n}",
    expectedConcepts: ["sliding window two pointers", "hash map last seen index", "move left pointer past duplicate", "o(n) time", "o(min(n,charset)) space"],
    idealAnswer: "Maintain a sliding window with a map of each character's last index. When a repeat inside the window appears, jump the left pointer past its previous occurrence and track the maximum window size. O(n) time, O(min(n, alphabet)) space.",
    interviewTip: "Say 'sliding window' immediately — it signals pattern recognition." }),
  q({ id: "code-4", category: "Coding Interview", topic: "Trees", difficulty: "medium", type: "coding",
    question: "Given a binary tree, return its level-order (breadth-first) traversal as an array of levels.",
    examples: "Input: [3,9,20,null,null,15,7] → [[3],[9,20],[15,7]]",
    constraints: "0 ≤ number of nodes ≤ 2000.",
    starterCode: "function levelOrder(root) {\n  // your solution\n}",
    expectedConcepts: ["queue breadth first search", "process level by level size snapshot", "null root edge case", "o(n) time", "o(n) space queue"],
    idealAnswer: "Use a queue seeded with the root; on each iteration snapshot the queue length, pop exactly that many nodes into one level array while enqueuing their children. O(n) time and O(n) space. Return an empty array when root is null.",
    interviewTip: "The level-size snapshot is the trick — mention it explicitly." }),
  q({ id: "code-5", category: "Coding Interview", topic: "Dynamic programming", difficulty: "hard", type: "coding",
    question: "Given an array of prices where prices[i] is the price of a stock on day i, find the maximum profit from a single buy and sell.",
    examples: "Input: [7,1,5,3,6,4] → 5 (buy at 1, sell at 6)\nInput: [7,6,4,3,1] → 0",
    constraints: "1 ≤ prices.length ≤ 10^5.",
    starterCode: "function maxProfit(prices) {\n  // your solution\n}",
    expectedConcepts: ["track minimum price so far", "max profit running maximum", "single pass o(n)", "o(1) space", "no profit case returns zero"],
    idealAnswer: "Scan once tracking the minimum price seen so far and the best profit if selling today (price − minSoFar). O(n) time, O(1) space. If prices only fall, the answer is 0 because no transaction is allowed to lose money.",
    interviewTip: "Call out the 'return 0 when never profitable' case." }),
];

export function getCategories(): string[] {
  return PRACTICE_CATEGORIES.filter((c) => QUESTION_BANK.some((qq) => qq.category === c));
}

export function findQuestion(id: string): PracticeQuestion | undefined {
  return QUESTION_BANK.find((x) => x.id === id);
}

export function filterQuestions(opts: { category?: string; difficulty?: string; type?: string; exclude?: string[] }): PracticeQuestion[] {
  const exclude = new Set(opts.exclude || []);
  return QUESTION_BANK.filter(
    (x) =>
      (!opts.category || opts.category === "all" || x.category === opts.category) &&
      (!opts.difficulty || opts.difficulty === "all" || x.difficulty === opts.difficulty) &&
      (!opts.type || opts.type === "all" || x.type === opts.type) &&
      !exclude.has(x.id),
  );
}
