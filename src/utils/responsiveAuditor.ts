/**
 * Responsive & Overflow Auditor
 * Continuously monitors document.documentElement.scrollWidth against window.innerWidth
 * Identifies any offending DOM element causing horizontal overflow without masking with overflow-x: hidden.
 */

export interface OverflowAuditResult {
  hasOverflow: boolean;
  scrollWidth: number;
  clientWidth: number;
  innerWidth: number;
  difference: number;
  offendingElements: Array<{
    tag: string;
    id: string;
    className: string;
    right: number;
    width: number;
  }>;
}

export function auditHorizontalOverflow(): OverflowAuditResult {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return {
      hasOverflow: false,
      scrollWidth: 0,
      clientWidth: 0,
      innerWidth: 0,
      difference: 0,
      offendingElements: [],
    };
  }

  const docEl = document.documentElement;
  const scrollWidth = docEl.scrollWidth;
  const clientWidth = docEl.clientWidth;
  const innerWidth = window.innerWidth;
  // A horizontal overflow occurs if scrollWidth exceeds clientWidth or innerWidth
  const hasOverflow = scrollWidth > clientWidth;
  const offendingElements: OverflowAuditResult['offendingElements'] = [];

  if (hasOverflow) {
    const all = document.querySelectorAll('*');
    for (let i = 0; i < all.length; i++) {
      const el = all[i] as HTMLElement;
      if (!el.getBoundingClientRect) continue;
      const rect = el.getBoundingClientRect();
      if (rect.right > clientWidth + 1) {
        offendingElements.push({
          tag: el.tagName.toLowerCase(),
          id: el.id || '',
          className: el.className ? String(el.className).slice(0, 80) : '',
          right: Math.round(rect.right),
          width: Math.round(rect.width),
        });
      }
    }
  }

  return {
    hasOverflow,
    scrollWidth,
    clientWidth,
    innerWidth,
    difference: Math.max(0, scrollWidth - clientWidth),
    offendingElements: offendingElements.slice(0, 10), // return top offenders
  };
}

export function initResponsiveAuditor() {
  if (typeof window === 'undefined') return;

  // Attach to window for runtime validation & testing
  (window as any).__runResponsiveAudit = auditHorizontalOverflow;

  const runCheck = () => {
    const result = auditHorizontalOverflow();
    if (result.hasOverflow) {
      console.warn(
        `⚠️ [Responsive Auditor] Horizontal overflow detected! scrollWidth (${result.scrollWidth}px) > innerWidth (${result.innerWidth}px).`,
        result.offendingElements
      );
    }
  };

  // Run on load and on resize
  if (document.readyState === 'complete') {
    runCheck();
  } else {
    window.addEventListener('load', runCheck, { once: true });
  }

  let resizeTimer: any;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(runCheck, 200);
  });
}
