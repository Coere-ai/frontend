/**
 * The dashboard keeps its scope (All, Company, Clients) and its view
 * (Graph, List) per viewer in this browser's localStorage. Each play of
 * the film starts as a person's first look does: on All, as a graph.
 * Imported before the dashboard's own code reads them.
 */
try {
  localStorage.removeItem("coere.solution.scope");
  localStorage.removeItem("coere.memory.view");
} catch {
  // No storage: the page starts on All anyway.
}
