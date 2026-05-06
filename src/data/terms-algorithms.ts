import type { Term } from './types';

export const algorithmsTerms: Term[] = [
  {
    id: 'binary-search', word: 'Binary Search', category: 'Algorithms',
    pronunciation: 'BY-nuh-ree SURCH',
    explanation: {
      beginner: 'Binary search is like looking for a word in a dictionary — you open to the middle, check if your word comes before or after, and repeat with the correct half. It only works on sorted data.',
      intermediate: 'Binary search is a divide-and-conquer algorithm that finds a target value in a sorted array by repeatedly halving the search interval. It compares the target to the middle element and eliminates one half. Time complexity is O(log n), making it far more efficient than linear search for large datasets.',
      expert: 'Binary search operates on sorted sequences with O(log n) time and O(1) space complexity (iterative). Variants include lower_bound/upper_bound for finding insertion points, exponential search for unbounded lists, and fractional cascading for multi-dimensional searches. Numerically, it can solve monotonic predicate problems (binary search on answer). Care must be taken with integer overflow in mid calculation: use lo + (hi - lo) / 2.'
    },
    codeExample: { language: 'python', code: 'def binary_search(arr, target):\n    lo, hi = 0, len(arr) - 1\n    while lo <= hi:\n        mid = lo + (hi - lo) // 2\n        if arr[mid] == target:\n            return mid\n        elif arr[mid] < target:\n            lo = mid + 1\n        else:\n            hi = mid - 1\n    return -1', description: 'Iterative binary search returning index or -1' },
    relatedTerms: ['linear-search', 'binary-search-tree', 'interpolation-search'],
    historicalContext: 'First described by John Mauchly in 1946, but the first bug-free implementation was not published until 1962 by Hermann Bottenbruch.',
    tags: ['searching', 'divide-and-conquer', 'sorted']
  },
  {
    id: 'quicksort', word: 'Quicksort', category: 'Algorithms',
    pronunciation: 'KWIK-sort',
    explanation: {
      beginner: 'Quicksort picks one item (the pivot), puts all smaller items to its left and larger items to its right, then repeats this process on each side until everything is sorted.',
      intermediate: 'Quicksort is a divide-and-conquer sorting algorithm that selects a pivot element, partitions the array around it, and recursively sorts the sub-arrays. Average time complexity is O(n log n), but worst case is O(n²) when the pivot selection is poor. In practice, it\'s one of the fastest sorting algorithms.',
      expert: 'Quicksort\'s average-case O(n log n) relies on balanced partitions. Worst-case O(n²) occurs with sorted input and naive pivot selection. Mitigations include median-of-three pivot, randomized pivot, and Introsort (switching to heapsort at depth 2·log n). Hoare\'s partition scheme is more efficient than Lomuto\'s. 3-way partitioning (Dutch National Flag) handles duplicates optimally. Not stable, but in-place with O(log n) stack space.'
    },
    codeExample: { language: 'python', code: 'def quicksort(arr):\n    if len(arr) <= 1:\n        return arr\n    pivot = arr[len(arr) // 2]\n    left = [x for x in arr if x < pivot]\n    mid = [x for x in arr if x == pivot]\n    right = [x for x in arr if x > pivot]\n    return quicksort(left) + mid + quicksort(right)', description: 'Simple quicksort with list comprehensions' },
    relatedTerms: ['merge-sort', 'heap-sort', 'introsort', 'partition'],
    historicalContext: 'Developed by Tony Hoare in 1959 while working on machine translation at Moscow State University.',
    tags: ['sorting', 'divide-and-conquer', 'in-place']
  },
  {
    id: 'merge-sort', word: 'Merge Sort', category: 'Algorithms',
    pronunciation: 'MURJ sort',
    explanation: {
      beginner: 'Merge sort splits a list in half over and over until each piece has one item, then puts them back together in order — like sorting cards by splitting into piles and merging them.',
      intermediate: 'Merge sort divides the array into halves recursively, sorts each half, then merges them back. It guarantees O(n log n) time in all cases and is stable. The trade-off is O(n) extra space for the merge step.',
      expert: 'Merge sort is optimal comparison sort with Θ(n log n) in all cases. Bottom-up iterative variant avoids recursion overhead. Natural merge sort exploits existing runs (like Timsort). External merge sort handles data too large for memory. In-place merge sort exists but is complex (block merge sort). Used as the basis for stable sorting in many standard libraries.'
    },
    codeExample: { language: 'python', code: 'def merge_sort(arr):\n    if len(arr) <= 1:\n        return arr\n    mid = len(arr) // 2\n    left = merge_sort(arr[:mid])\n    right = merge_sort(arr[mid:])\n    return merge(left, right)\n\ndef merge(a, b):\n    result = []\n    i = j = 0\n    while i < len(a) and j < len(b):\n        if a[i] <= b[j]:\n            result.append(a[i]); i += 1\n        else:\n            result.append(b[j]); j += 1\n    return result + a[i:] + b[j:]', description: 'Recursive merge sort' },
    relatedTerms: ['quicksort', 'timsort', 'external-sorting'],
    historicalContext: 'Invented by John von Neumann in 1945, one of the earliest sorting algorithms for digital computers.',
    tags: ['sorting', 'divide-and-conquer', 'stable']
  },
  {
    id: 'dijkstra', word: "Dijkstra's Algorithm", category: 'Algorithms',
    pronunciation: 'DYKE-struh',
    explanation: {
      beginner: "Dijkstra's algorithm finds the shortest path between two points in a network — like GPS finding the fastest route on a map by always exploring the closest unvisited location next.",
      intermediate: "Dijkstra's algorithm computes shortest paths from a single source vertex to all other vertices in a weighted graph with non-negative edges. It uses a priority queue to greedily select the unvisited vertex with the smallest tentative distance. Time complexity is O((V + E) log V) with a binary heap.",
      expert: "Dijkstra's runs in O((V+E) log V) with binary heap, O(V² + E) with array, or O(V log V + E) with Fibonacci heap. Requires non-negative edge weights — use Bellman-Ford for negative weights. A* extends it with heuristics for goal-directed search. Bidirectional Dijkstra and contraction hierarchies enable fast point-to-point queries on road networks. Johnson's algorithm uses Dijkstra as a subroutine for all-pairs shortest paths."
    },
    codeExample: { language: 'python', code: 'import heapq\n\ndef dijkstra(graph, start):\n    dist = {v: float("inf") for v in graph}\n    dist[start] = 0\n    pq = [(0, start)]\n    while pq:\n        d, u = heapq.heappop(pq)\n        if d > dist[u]: continue\n        for v, w in graph[u]:\n            if dist[u] + w < dist[v]:\n                dist[v] = dist[u] + w\n                heapq.heappush(pq, (dist[v], v))\n    return dist', description: 'Dijkstra with priority queue' },
    relatedTerms: ['bellman-ford', 'a-star', 'bfs', 'shortest-path'],
    historicalContext: 'Conceived by Edsger W. Dijkstra in 1956 at the Mathematical Center in Amsterdam, published in 1959.',
    tags: ['graph', 'shortest-path', 'greedy']
  },
  {
    id: 'bfs', word: 'Breadth-First Search', category: 'Algorithms',
    pronunciation: 'BREDTH furst SURCH',
    explanation: {
      beginner: 'BFS explores a graph level by level — like ripples spreading outward from a stone dropped in water. It visits all neighbors first before going deeper.',
      intermediate: 'BFS traverses a graph by exploring all vertices at the present depth before moving to vertices at the next depth level. It uses a queue and runs in O(V + E). BFS finds the shortest path in unweighted graphs.',
      expert: 'BFS is optimal for unweighted shortest paths. Variants include multi-source BFS, 0-1 BFS (deque-based for 0/1 weights), bidirectional BFS for reduced search space. Used in level-order tree traversal, connected components, bipartiteness testing, and Ford-Fulkerson augmenting paths.'
    },
    codeExample: {"language":"python","code":"from collections import deque\ndef bfs(graph, start):\n    visited = set([start])\n    queue = deque([start])\n    while queue:\n        vertex = queue.popleft()\n        print(vertex)\n        for neighbor in graph[vertex]:\n            if neighbor not in visited:\n                visited.add(neighbor)\n                queue.append(neighbor)","description":"Breadth-First Search using a deque"},
    relatedTerms: ['dfs', 'dijkstra', 'queue', 'graph-traversal'],
    historicalContext: 'Independently discovered by Konrad Zuse (1945) and Edward F. Moore (1959) for maze-solving.',
    tags: ['graph', 'traversal', 'queue']
  },
  {
    id: 'dfs', word: 'Depth-First Search', category: 'Algorithms',
    pronunciation: 'DEPTH furst SURCH',
    explanation: {
      beginner: 'DFS explores as far as possible along each path before backtracking — like exploring a maze by always taking the first turn and going back when you hit a dead end.',
      intermediate: 'DFS traverses a graph by going as deep as possible before backtracking. Uses a stack (or recursion). Runs in O(V + E). Useful for topological sorting, cycle detection, and finding connected components.',
      expert: 'DFS classifies edges into tree, back, forward, and cross edges. Back edges indicate cycles. Applications include topological sort (reverse post-order), Tarjan\'s SCC algorithm, articulation points, bridge finding, and Euler path detection. Iterative deepening DFS combines BFS optimality with DFS space efficiency.'
    },
    codeExample: { language: 'python', code: 'def dfs(graph, start, visited=None):\n    if visited is None:\n        visited = set()\n    visited.add(start)\n    for neighbor in graph[start]:\n        if neighbor not in visited:\n            dfs(graph, neighbor, visited)\n    return visited', description: 'Recursive DFS' },
    relatedTerms: ['bfs', 'topological-sort', 'stack', 'backtracking'],
    historicalContext: 'Formalized by Charles Pierre Trémaux in the 19th century for maze-solving.',
    tags: ['graph', 'traversal', 'stack', 'recursion']
  },
  {
    id: 'dynamic-programming', word: 'Dynamic Programming', category: 'Algorithms',
    pronunciation: 'dy-NAM-ik PRO-gram-ing',
    explanation: {
      beginner: 'Dynamic programming solves big problems by breaking them into smaller overlapping sub-problems, solving each one only once and remembering the answer — like filling in a multiplication table so you never re-calculate.',
      intermediate: 'DP optimizes recursive solutions by storing sub-problem results (memoization) or building solutions bottom-up (tabulation). It applies when a problem has optimal substructure and overlapping sub-problems. Reduces exponential time to polynomial in many cases.',
      expert: 'DP transforms recursive problems with overlapping substructure from exponential to polynomial time. Key techniques: state space reduction, space optimization via rolling arrays, bitmask DP for subset problems, digit DP, tree DP, profile DP, and convex hull trick for optimization. Knuth\'s optimization and divide-and-conquer optimization handle special recurrence structures.'
    },
    codeExample: { language: 'python', code: '# Fibonacci with DP (bottom-up)\ndef fib(n):\n    if n <= 1: return n\n    dp = [0] * (n + 1)\n    dp[1] = 1\n    for i in range(2, n + 1):\n        dp[i] = dp[i-1] + dp[i-2]\n    return dp[n]', description: 'Bottom-up DP for Fibonacci' },
    relatedTerms: ['memoization', 'greedy-algorithm', 'recursion', 'knapsack'],
    historicalContext: 'Named by Richard Bellman in the 1950s; he chose "dynamic" partly to hide the mathematical nature of his work from a secretary of defense who disliked research.',
    tags: ['optimization', 'memoization', 'tabulation']
  },
  {
    id: 'greedy-algorithm', word: 'Greedy Algorithm', category: 'Algorithms',
    pronunciation: 'GREE-dee AL-go-rith-um',
    explanation: {
      beginner: 'A greedy algorithm always picks the best option available right now without worrying about the future — like always taking the largest coin when making change.',
      intermediate: 'Greedy algorithms build solutions incrementally by choosing the locally optimal option at each step. They work when the problem has the greedy-choice property and optimal substructure. Examples: Kruskal\'s MST, Huffman coding, activity selection.',
      expert: 'Greedy correctness proofs use exchange arguments or matroid theory. Greedy works for matroid intersection, scheduling, and some NP-hard approximation algorithms. Greedy fails for 0/1 knapsack but works for fractional knapsack. The greedy-choice property means locally optimal choices lead to globally optimal solutions.'
    },
    codeExample: {"language":"python","code":"def coin_change(coins, amount):\n    coins.sort(reverse=True)\n    count = 0\n    for coin in coins:\n        if amount == 0: break\n        count += amount // coin\n        amount %= coin\n    return count","description":"Greedy approach for coin change"},
    relatedTerms: ['dynamic-programming', 'kruskal', 'huffman-coding'],
    historicalContext: 'Greedy strategies have been used since antiquity; formal analysis developed alongside optimization theory in the mid-20th century.',
    tags: ['optimization', 'strategy']
  },
  {
    id: 'a-star', word: 'A* Search', category: 'Algorithms',
    pronunciation: 'AY star',
    explanation: {
      beginner: 'A* is like GPS navigation — it finds the shortest path by using a smart guess about how far away the goal is, so it doesn\'t waste time exploring wrong directions.',
      intermediate: 'A* is a best-first search algorithm that combines Dijkstra\'s (actual cost g(n)) with a heuristic estimate (h(n)) to the goal. It expands the node with lowest f(n) = g(n) + h(n). With an admissible heuristic, it guarantees the optimal path.',
      expert: 'A* is optimally efficient among algorithms that extend search paths from the root. Admissibility (h(n) ≤ h*(n)) guarantees optimality; consistency (h(n) ≤ c(n,n\') + h(n\')) ensures nodes are expanded at most once. Variants include IDA* (iterative deepening), SMA* (memory-bounded), D* (dynamic replanning), and Jump Point Search for grid pathfinding.'
    },
    codeExample: {"language":"python","code":"import heapq\ndef a_star(graph, start, goal, h):\n    pq = [(h(start), 0, start)]\n    visited = set()\n    while pq:\n        est, cost, node = heapq.heappop(pq)\n        if node == goal: return cost\n        if node in visited: continue\n        visited.add(node)\n        for neighbor, weight in graph[node]:\n            heapq.heappush(pq, (cost + weight + h(neighbor), cost + weight, neighbor))","description":"A* Search with a priority queue"},
    relatedTerms: ['dijkstra', 'bfs', 'heuristic'],
    historicalContext: 'Created by Peter Hart, Nils Nilsson, and Bertram Raphael at Stanford Research Institute in 1968.',
    tags: ['graph', 'pathfinding', 'heuristic']
  },
  {
    id: 'heap-sort', word: 'Heap Sort', category: 'Algorithms',
    pronunciation: 'HEEP sort',
    explanation: {
      beginner: 'Heap sort builds a special tree structure called a heap where the largest item is always on top, then repeatedly removes the top item to build a sorted list.',
      intermediate: 'Heap sort builds a max-heap from the array, then repeatedly extracts the maximum element and places it at the end. Time complexity is O(n log n) in all cases. In-place but not stable.',
      expert: 'Heap sort provides guaranteed O(n log n) with O(1) auxiliary space but has poor cache performance due to non-sequential memory access. Bottom-up heap construction is O(n). Used in Introsort as fallback when quicksort degrades. Smooth sort achieves O(n) on nearly sorted data using Leonardo heaps.'
    },
    codeExample: {"language":"python","code":"import heapq\ndef heap_sort(arr):\n    heapq.heapify(arr)\n    return [heapq.heappop(arr) for _ in range(len(arr))]","description":"Heap Sort using Python heapq"},
    relatedTerms: ['heap', 'quicksort', 'merge-sort', 'priority-queue'],
    historicalContext: 'Invented by J. W. J. Williams in 1964 as a byproduct of his invention of the binary heap.',
    tags: ['sorting', 'heap', 'in-place']
  },
  {
    id: 'insertion-sort', word: 'Insertion Sort', category: 'Algorithms',
    pronunciation: 'in-SUR-shun sort',
    explanation: {
      beginner: 'Insertion sort works like sorting cards in your hand — you pick up each card and insert it into the correct position among the cards you\'ve already sorted.',
      intermediate: 'Insertion sort iterates through the array, inserting each element into its correct position in the sorted portion. O(n²) worst/average case but O(n) for nearly sorted data. Stable and in-place. Excellent for small arrays.',
      expert: 'Insertion sort is adaptive (O(n) for nearly sorted), stable, and has low overhead making it optimal for small n. Used as the base case in hybrid sorts (Timsort uses it for runs ≤ 64). Binary insertion sort reduces comparisons to O(n log n) but still O(n²) shifts. Shell sort generalizes it with gap sequences.'
    },
    codeExample: {"language":"python","code":"def insertion_sort(arr):\n    for i in range(1, len(arr)):\n        key = arr[i]\n        j = i - 1\n        while j >= 0 and key < arr[j]:\n            arr[j + 1] = arr[j]\n            j -= 1\n        arr[j + 1] = key","description":"Insertion Sort implementation"},
    relatedTerms: ['selection-sort', 'bubble-sort', 'timsort', 'shell-sort'],
    historicalContext: 'One of the simplest and oldest sorting algorithms, analogous to the way people sort playing cards.',
    tags: ['sorting', 'simple', 'adaptive', 'stable']
  },
  {
    id: 'topological-sort', word: 'Topological Sort', category: 'Algorithms',
    pronunciation: 'top-oh-LOJ-ih-kul sort',
    explanation: {
      beginner: 'Topological sort arranges tasks in order so that every task comes after the things it depends on — like figuring out which school courses you need to take before others.',
      intermediate: 'Topological sort linearly orders vertices of a DAG such that for every edge (u, v), u comes before v. Implemented via DFS (reverse post-order) or Kahn\'s algorithm (BFS with in-degree tracking). Only possible for directed acyclic graphs.',
      expert: 'Kahn\'s algorithm detects cycles (if result size < |V|). All topological orderings can be enumerated but may be exponential. Applications: build systems (Make), task scheduling, course prerequisites, and data serialization. Lexicographically smallest ordering uses a min-heap in Kahn\'s.'
    },
    codeExample: { language: 'python', code: 'from collections import deque\n\ndef topo_sort(graph, n):\n    indegree = [0] * n\n    for u in range(n):\n        for v in graph[u]:\n            indegree[v] += 1\n    q = deque(v for v in range(n) if indegree[v] == 0)\n    order = []\n    while q:\n        u = q.popleft()\n        order.append(u)\n        for v in graph[u]:\n            indegree[v] -= 1\n            if indegree[v] == 0:\n                q.append(v)\n    return order if len(order) == n else []', description: 'Kahn\'s algorithm for topological sort' },
    relatedTerms: ['dfs', 'dag', 'dependency-graph'],
    historicalContext: 'Formalized in the context of PERT (Program Evaluation and Review Technique) scheduling in the 1950s.',
    tags: ['graph', 'dag', 'ordering']
  },
  {
    id: 'kruskal', word: "Kruskal's Algorithm", category: 'Algorithms',
    pronunciation: 'KRUS-kulz',
    explanation: {
      beginner: 'Kruskal\'s algorithm builds the cheapest network connecting all points by always adding the cheapest available connection that doesn\'t create a loop.',
      intermediate: 'Kruskal\'s finds the minimum spanning tree by sorting edges by weight and adding each edge if it doesn\'t form a cycle (checked via Union-Find). Time complexity: O(E log E). Works well for sparse graphs.',
      expert: 'Uses Union-Find with path compression and union by rank for near-O(α(n)) amortized cycle detection. Total complexity O(E log E) dominated by sorting. Randomized variants and filter-based approaches exist. Compare with Prim\'s O(E log V) which is better for dense graphs. Borůvka\'s algorithm parallelizes well.'
    },
    codeExample: {"language":"python","code":"def kruskal(edges, n):\n    parent = list(range(n))\n    def find(i): \n        if parent[i] == i: return i\n        parent[i] = find(parent[i])\n        return parent[i]\n    mst_weight = 0\n    edges.sort(key=lambda x: x[2])\n    for u, v, w in edges:\n        root_u, root_v = find(u), find(v)\n        if root_u != root_v:\n            parent[root_u] = root_v\n            mst_weight += w\n    return mst_weight","description":"Kruskal's algorithm with Union-Find"},
    relatedTerms: ['prim', 'union-find', 'minimum-spanning-tree', 'greedy-algorithm'],
    historicalContext: 'Published by Joseph Kruskal in 1956.',
    tags: ['graph', 'mst', 'greedy']
  },
  {
    id: 'knapsack', word: 'Knapsack Problem', category: 'Algorithms',
    pronunciation: 'NAP-sak',
    explanation: {
      beginner: 'Imagine packing a backpack with limited space — you want to pick items that give you the most value without exceeding the weight limit. That\'s the knapsack problem.',
      intermediate: 'The 0/1 knapsack problem: given items with weights and values and a capacity W, maximize total value without exceeding W. Solved by DP in O(nW) pseudo-polynomial time. Fractional knapsack is solvable greedily in O(n log n).',
      expert: 'The 0/1 knapsack is weakly NP-hard (pseudo-polynomial O(nW)). FPTAS exists with (1-ε) approximation. Variants: unbounded knapsack, multi-dimensional knapsack, subset sum. Branch-and-bound with LP relaxation is efficient in practice. Meet-in-the-middle achieves O(2^(n/2)) for small n.'
    },
    codeExample: {"language":"python","code":"def knapsack(weights, values, capacity):\n    n = len(weights)\n    dp = [[0] * (capacity + 1) for _ in range(n + 1)]\n    for i in range(1, n + 1):\n        for w in range(1, capacity + 1):\n            if weights[i-1] <= w:\n                dp[i][w] = max(dp[i-1][w], dp[i-1][w-weights[i-1]] + values[i-1])\n            else:\n                dp[i][w] = dp[i-1][w]\n    return dp[n][capacity]","description":"0/1 Knapsack using DP"},
    relatedTerms: ['dynamic-programming', 'greedy-algorithm', 'np-hard'],
    historicalContext: 'Mathematical formulation dates to 1897 by George Ballard Mathews; extensively studied in combinatorial optimization since.',
    tags: ['optimization', 'dp', 'np-hard']
  },
  {
    id: 'recursion', word: 'Recursion', category: 'Algorithms',
    pronunciation: 'ree-KUR-zhun',
    explanation: {
      beginner: 'Recursion is when a function calls itself to solve a problem by breaking it into smaller versions of the same problem — like Russian nesting dolls, each one containing a smaller copy.',
      intermediate: 'A recursive function has a base case (termination condition) and a recursive case. It solves problems like tree traversal, factorial, Fibonacci, and divide-and-conquer algorithms. Each call adds a frame to the call stack.',
      expert: 'Recursion maps to mathematical induction. Tail recursion can be optimized to loops by compilers (TCO). Continuation-passing style and trampolining handle stack limitations. Mutual recursion, primitive recursion, and μ-recursion form the theoretical foundation of computability. Memoization converts overlapping recursive sub-problems to DP.'
    },
    codeExample: { language: 'python', code: 'def factorial(n):\n    if n <= 1:  # base case\n        return 1\n    return n * factorial(n - 1)  # recursive case', description: 'Recursive factorial' },
    relatedTerms: ['dynamic-programming', 'stack', 'divide-and-conquer', 'backtracking'],
    historicalContext: 'Recursive functions were formalized by Kurt Gödel and Stephen Kleene in the 1930s as part of computability theory.',
    tags: ['fundamental', 'technique']
  },
  {
    id: 'backtracking', word: 'Backtracking', category: 'Algorithms',
    pronunciation: 'BAK-trak-ing',
    explanation: {
      beginner: 'Backtracking is like solving a maze — you try a path, and if it doesn\'t work, you go back and try a different one until you find the solution.',
      intermediate: 'Backtracking systematically explores all potential solutions by building candidates incrementally and abandoning ("pruning") a candidate as soon as it\'s determined it can\'t lead to a valid solution. Used for N-Queens, Sudoku, and constraint satisfaction problems.',
      expert: 'Backtracking explores the solution space tree with pruning. Constraint propagation (arc consistency, forward checking) reduces branching. For CSPs, backjumping skips irrelevant backtrack levels. Randomized restarts and conflict-driven clause learning extend it for SAT solving. Complexity depends on pruning efficiency.'
    },
    codeExample: {"language":"python","code":"def solve_n_queens(n):\n    res, board = [], [-1] * n\n    def is_safe(row, col):\n        for i in range(row):\n            if board[i] == col or abs(board[i] - col) == abs(i - row):\n                return False\n        return True\n    def place(row):\n        if row == n: res.append(board[:]); return\n        for col in range(n):\n            if is_safe(row, col):\n                board[row] = col\n                place(row + 1)\n    place(0)\n    return res","description":"N-Queens problem via Backtracking"},
    relatedTerms: ['recursion', 'dfs', 'constraint-satisfaction', 'n-queens'],
    historicalContext: 'Term coined by Derrick Henry Lehmer in the 1950s; the concept has been used in mathematical puzzles for centuries.',
    tags: ['technique', 'search', 'pruning']
  },
  {
    id: 'bubble-sort', word: 'Bubble Sort', category: 'Algorithms',
    pronunciation: 'BUH-bul sort',
    explanation: {
      beginner: 'Bubble sort repeatedly walks through the list, compares adjacent items, and swaps them if they\'re in the wrong order — like bubbles rising to the surface.',
      intermediate: 'Bubble sort repeatedly traverses the array, swapping adjacent elements that are out of order. O(n²) time, O(1) space. Stable. Can be optimized by stopping early if no swaps occur. Rarely used in practice due to poor performance.',
      expert: 'Bubble sort\'s only advantage is simplicity and best-case O(n) on sorted input with early termination. Cocktail shaker sort (bidirectional bubble sort) slightly improves performance. Primarily used for educational purposes to illustrate sorting concepts.'
    },
    codeExample: {"language":"python","code":"def bubble_sort(arr):\n    n = len(arr)\n    for i in range(n):\n        swapped = False\n        for j in range(0, n - i - 1):\n            if arr[j] > arr[j + 1]:\n                arr[j], arr[j + 1] = arr[j + 1], arr[j]\n                swapped = True\n        if not swapped: break\n    return arr","description":"Optimized Bubble Sort"},
    relatedTerms: ['insertion-sort', 'selection-sort', 'quicksort'],
    historicalContext: 'One of the earliest described sorting algorithms; its simplicity made it a staple in CS education.',
    tags: ['sorting', 'simple', 'stable']
  },
  {
    id: 'selection-sort', word: 'Selection Sort', category: 'Algorithms',
    pronunciation: 'seh-LEK-shun sort',
    explanation: {
      beginner: 'Selection sort finds the smallest item and puts it first, then finds the next smallest and puts it second, and so on — like picking the shortest person in a lineup one by one.',
      intermediate: 'Selection sort divides the array into sorted and unsorted regions. It repeatedly selects the minimum from the unsorted region and swaps it to the end of the sorted region. Always O(n²) — not adaptive. In-place but not stable.',
      expert: 'Selection sort makes the minimum number of swaps (O(n)), making it useful when write operations are expensive (e.g., flash memory). Cycle sort further minimizes writes. Tournament sort uses a tournament tree to find minimums more efficiently.'
    },
    codeExample: {"language":"python","code":"def selection_sort(arr):\n    for i in range(len(arr)):\n        min_idx = i\n        for j in range(i + 1, len(arr)):\n            if arr[j] < arr[min_idx]:\n                min_idx = j\n        arr[i], arr[min_idx] = arr[min_idx], arr[i]\n    return arr","description":"Selection Sort"},
    relatedTerms: ['insertion-sort', 'bubble-sort', 'heap-sort'],
    historicalContext: 'One of the most intuitive sorting algorithms, used in early computer science courses since the 1960s.',
    tags: ['sorting', 'simple', 'in-place']
  },
  {
    id: 'linear-search', word: 'Linear Search', category: 'Algorithms',
    pronunciation: 'LIN-ee-ur SURCH',
    explanation: {
      beginner: 'Linear search checks every item one by one from start to end until it finds what it\'s looking for — like reading every page of a book to find a specific word.',
      intermediate: 'Linear search sequentially checks each element until a match is found or the list ends. O(n) time, O(1) space. Works on unsorted data. Simple but inefficient for large datasets.',
      expert: 'Sentinel linear search eliminates the end-of-array boundary check by placing the target at the end. For repeated searches on static data, consider building an index or sorting + binary search. Self-organizing lists (move-to-front, transpose) improve average case for non-uniform access patterns.'
    },
    codeExample: {"language":"python","code":"def linear_search(arr, target):\n    for i, val in enumerate(arr):\n        if val == target:\n            return i\n    return -1","description":"Basic Linear Search"},
    relatedTerms: ['binary-search', 'hash-table', 'sentinel-search'],
    historicalContext: 'The most fundamental search algorithm, predating computers themselves.',
    tags: ['searching', 'simple', 'sequential']
  },
  {
    id: 'huffman-coding', word: 'Huffman Coding', category: 'Algorithms',
    pronunciation: 'HUFF-man KOH-ding',
    explanation: {
      beginner: 'Huffman coding compresses data by using shorter codes for common characters and longer codes for rare ones — like how "e" could be encoded with fewer bits than "z".',
      intermediate: 'Huffman coding builds an optimal prefix-free binary code by repeatedly combining the two least frequent symbols into a tree. More frequent symbols get shorter codes. Achieves optimal prefix coding for known symbol frequencies.',
      expert: 'Huffman coding is optimal among prefix codes but not among all uniquely decodable codes (arithmetic coding is better). Adaptive Huffman updates the tree dynamically. Canonical Huffman codes enable efficient decoding with lookup tables. Used in DEFLATE (gzip, PNG), JPEG, and MP3.'
    },
    codeExample: {"language":"python","code":"import heapq\nfrom collections import Counter\ndef huffman_tree(text):\n    freq = Counter(text)\n    heap = [[weight, [char, \"\"]] for char, weight in freq.items()]\n    heapq.heapify(heap)\n    while len(heap) > 1:\n        lo = heapq.heappop(heap)\n        hi = heapq.heappop(heap)\n        for pair in lo[1:]: pair[1] = '0' + pair[1]\n        for pair in hi[1:]: pair[1] = '1' + pair[1]\n        heapq.heappush(heap, [lo[0] + hi[0]] + lo[1:] + hi[1:])\n    return sorted(heapq.heappop(heap)[1:], key=lambda p: (len(p[-1]), p))","description":"Building a Huffman Tree"},
    relatedTerms: ['compression', 'greedy-algorithm', 'binary-tree', 'entropy'],
    historicalContext: 'Developed by David Huffman in 1952 as a term paper at MIT, improving on Shannon-Fano coding.',
    tags: ['compression', 'greedy', 'encoding']
  }
];
