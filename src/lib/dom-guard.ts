// dom-guard.ts — keep React alive when something outside React edits the page.
// Browser translation (Chrome/Edge "Translate this page") and some extensions (Grammarly,
// password managers) replace or move text nodes that React rendered. React later calls
// insertBefore/removeChild with those nodes, the browser throws NotFoundError, and the whole app
// crashes ("Unexpected Application Error"). Known React issue #11538; this is the standard guard:
// if the node React expects is no longer where it put it, skip the operation instead of throwing.
export function installDomGuard() {
  if (typeof Node !== 'function' || !Node.prototype) return;
  const proto = Node.prototype as Node & { __kscwcGuard?: boolean };
  if (proto.__kscwcGuard) return;
  proto.__kscwcGuard = true;

  const originalRemoveChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function <T extends Node>(this: Node, child: T): T {
    if (child.parentNode !== this) {
      if (import.meta.env.DEV) console.warn('dom-guard: skipped removeChild of a node moved by something outside React', child);
      return child;
    }
    return originalRemoveChild.call(this, child) as T;
  };

  const originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function <T extends Node>(this: Node, newNode: T, referenceNode: Node | null): T {
    if (referenceNode && referenceNode.parentNode !== this) {
      if (import.meta.env.DEV) console.warn('dom-guard: reference node moved outside React; appending instead', referenceNode);
      return originalInsertBefore.call(this, newNode, null) as T;
    }
    return originalInsertBefore.call(this, newNode, referenceNode) as T;
  };
}
