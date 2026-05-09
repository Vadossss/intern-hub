"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

const stickyGap = 24;
const desktopBreakpoint = 1024;

type StickyMode = "normal" | "top" | "fixed" | "bottom";

interface AppliedStyle {
  mode: StickyMode;
  left: number;
  minHeight: number;
  width: number;
}

const baseContentStyle: CSSProperties = {
  willChange: "position, transform",
};

export function StickyFilterSidebar({ children }: { children: ReactNode }) {
  const wrapperRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | null>(null);
  const appliedRef = useRef<AppliedStyle>({
    mode: "normal",
    left: 0,
    minHeight: 0,
    width: 0,
  });

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const content = contentRef.current;
    const container = wrapper?.parentElement;

    if (!wrapper || !content || !container) {
      return;
    }

    const wrapperElement = wrapper;
    const contentElement = content;
    const containerElement = container;

    function applyMode(
      mode: StickyMode,
      left: number,
      width: number,
      minHeight: number,
    ) {
      const previous = appliedRef.current;

      if (
        previous.mode === mode &&
        previous.left === left &&
        previous.width === width &&
        previous.minHeight === minHeight
      ) {
        return;
      }

      appliedRef.current = { mode, left, width, minHeight };
      wrapperElement.style.minHeight =
        mode === "fixed" || mode === "bottom" ? `${minHeight}px` : "";

      contentElement.style.bottom = "";
      contentElement.style.left = "";
      contentElement.style.position = "";
      contentElement.style.top = "";
      contentElement.style.width = "";
      contentElement.style.zIndex = "";

      if (mode === "top") {
        contentElement.style.position = "sticky";
        contentElement.style.top = `${stickyGap}px`;
        return;
      }

      if (mode === "fixed") {
        contentElement.style.bottom = `${stickyGap}px`;
        contentElement.style.left = `${left}px`;
        contentElement.style.position = "fixed";
        contentElement.style.width = `${width}px`;
        contentElement.style.zIndex = "30";
        return;
      }

      if (mode === "bottom") {
        contentElement.style.bottom = "0";
        contentElement.style.left = "0";
        contentElement.style.position = "absolute";
        contentElement.style.width = "100%";
        contentElement.style.zIndex = "20";
      }
    }

    function updatePosition() {
      frameRef.current = null;

      const wrapperRect = wrapperElement.getBoundingClientRect();
      const containerRect = containerElement.getBoundingClientRect();
      const contentHeight = contentElement.offsetHeight;
      const wrapperTop = wrapperRect.top + window.scrollY;
      const containerBottom = containerRect.bottom + window.scrollY;
      const viewportHeight = window.innerHeight;
      const viewportBottom = window.scrollY + viewportHeight - stickyGap;

      if (window.innerWidth < desktopBreakpoint) {
        applyMode("normal", 0, 0, 0);
        return;
      }

      const canUseTopSticky = contentHeight <= viewportHeight - stickyGap * 2;
      const shouldUseBottomSticky =
        !canUseTopSticky && viewportBottom >= wrapperTop + contentHeight;

      if (canUseTopSticky) {
        applyMode("top", 0, 0, 0);
        return;
      }

      if (!shouldUseBottomSticky) {
        applyMode("normal", 0, 0, 0);
        return;
      }

      if (viewportBottom >= containerBottom) {
        applyMode("bottom", 0, 0, contentHeight);
        return;
      }

      applyMode("fixed", wrapperRect.left, wrapperRect.width, contentHeight);
    }

    function scheduleUpdate() {
      if (frameRef.current !== null) {
        return;
      }

      frameRef.current = window.requestAnimationFrame(updatePosition);
    }

    scheduleUpdate();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);

    const resizeObserver = new ResizeObserver(scheduleUpdate);
    resizeObserver.observe(contentElement);
    resizeObserver.observe(containerElement);

    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      resizeObserver.disconnect();

      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  return (
    <aside ref={wrapperRef} className="lg:relative lg:self-stretch sticky">
      <div ref={contentRef} style={baseContentStyle}>
        {children}
      </div>
    </aside>
  );
}
