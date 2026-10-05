# Architectural Blueprint: Scroll-Driven Expanding Intro & Hero Sequence

> **Instruction for the Target Agent:**
> **DO NOT alter your site's existing design system, brand colors, typography, or component library.**
> Keep your existing CSS variables, color tokens, and font families intact. 
> Your sole objective is to transplant the **motion engineering, scroll-pinned geometry, and GSAP ScrollTrigger timeline** detailed below into your existing Hero section.

---

## 1. High-Level Concept & Motion Architecture

This animation replaces standard static hero sections and boring preloaders with a continuous, scroll-driven interactive sequence:

```
[ SCROLL = 0% ]
┌────────────────────────────────────────────────────────┐
│                                                        │
│               [ YOUR BRAND LOGO / WORDMARK ]           │
│                                                        │
│  [Existing Tagline]                                    │
│                                                        │
│                   ┌──────────────────┐                 │
│                   │ Compact Floating │                 │
│                   │    Image Card    │                 │
│                   │  [↓ Scroll Hint] │                 │
│                   └──────────────────┘                 │
└────────────────────────────────────────────────────────┘

[ SCROLL 0% ──► 50% ]
• Logo & initial text dissolve upward with blur (y: -35px, blur: 6px, opacity: 0).
• The compact card expands outwards from center-bottom to fill 100vw × 100vh full-bleed.
• Inner image counter-scales (1.25 ──► 1.0) for optical viewport stabilization.
• Dark backdrop overlay fades in over the image.

[ SCROLL 50% ──► 100% ]
┌────────────────────────────────────────────────────────┐
│ [Master Nav slides down]                               │
│                                                        │
│ 01 — CATEGORY LINE ─────────────                       │
│                                                        │
│ ┌────────────────────────────────────────────────────┐ │
│ │ HEADLINE LINE 1 (Rises from overflow-hidden mask)  │ │
│ │ HEADLINE LINE 2 (with 3D perspective rotateX: 0deg)│ │
│ └────────────────────────────────────────────────────┘ │
│                                                        │
│ [Supporting Brand Description]      [View Products CTA]│
└────────────────────────────────────────────────────────┘
```

---

## 2. The Geometry & Structural Setup

To prevent browser scroll jumps, the sequence uses a **scroll-track envelope**:
1. **Outer Track:** `position: relative; width: 100%; height: clamp(150vh, 175vh, 190vh);` (determines total scrub distance).
2. **Sticky Viewport:** `position: sticky; top: 0; width: 100%; height: 100vh; overflow: hidden;` (pins the screen while the user scrubs through the height).
3. **Layer 1 (Z-index 12):** Logo, wordmark, and initial caption.
4. **Layer 2 (Z-index 15):** The expanding card (`will-change: width, height, bottom, border-radius, transform`).
5. **Layer 3 (Z-index 20):** The final hero headline with masked line wrappers (`overflow: hidden`) and CTA buttons.

---

## 3. The GSAP Scrubbed Timeline (Desktop & Mobile)

Install dependencies if not already present:
```bash
npm install gsap lenis
```

### Motion Timeline Logic

```ts
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

const mm = gsap.matchMedia();

// ── DESKTOP TIMELINE (min-width: 768px) ──
mm.add("(min-width: 768px)", () => {
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: wrapperElement,
      start: "top top",
      end: "bottom bottom",
      scrub: 1.1, // Smooth dampening
      onUpdate: (self) => {
        // Toggle body class to control navbar visibility
        if (self.progress > 0.45) {
          document.body.classList.remove("intro-active");
        } else {
          document.body.classList.add("intro-active");
        }
      },
      onLeave: () => document.body.classList.remove("intro-active"),
      onLeaveBack: () => document.body.classList.add("intro-active"),
    },
  });

  // STEP 1: Dissolve initial splash elements
  tl.to(logoRef, { opacity: 0, y: -35, scale: 0.96, filter: "blur(6px)", duration: 0.25, ease: "sine.out" }, 0);
  tl.to(taglineRef, { opacity: 0, y: 25, filter: "blur(4px)", duration: 0.25, ease: "sine.out" }, 0);
  tl.to(scrollHintRef, { opacity: 0, scale: 0.85, duration: 0.15, ease: "sine.out" }, 0);

  // STEP 2: Card expansion to full viewport bleed
  tl.fromTo(
    cardRef,
    {
      width: "clamp(260px, 30vw, 420px)",
      height: "clamp(280px, 40vh, 460px)",
      bottom: "clamp(1.5rem, 3.5vh, 3rem)",
      borderRadius: "24px",
      borderWidth: "1px",
      scale: 0.92,
      boxShadow: "0 24px 60px rgba(0, 0, 0, 0.75)",
    },
    {
      width: "100vw",
      height: "100vh",
      bottom: "0px",
      borderRadius: "0px",
      borderWidth: "0px",
      scale: 1,
      boxShadow: "0 0 0 rgba(0, 0, 0, 0)",
      ease: "sine.inOut",
      duration: 0.70,
    },
    0
  );

  // Image counter-scale (optical anchor illusion)
  tl.fromTo(imgRef, { scale: 1.25 }, { scale: 1.0, ease: "sine.out", duration: 0.70 }, 0);
  tl.fromTo(overlayRef, { opacity: 0.2 }, { opacity: 0.65, ease: "sine.out", duration: 0.55 }, 0.12);

  // STEP 3: Hero content 3D curtain unmasking
  tl.to(heroWrapperRef, { opacity: 1, pointerEvents: "auto", duration: 0.10 }, 0.35);

  headlineLineInners.forEach((innerSpan, i) => {
    tl.fromTo(
      innerSpan,
      { y: "110%", rotateX: 75, opacity: 0, filter: "blur(6px)" },
      { y: "0%", rotateX: 0, opacity: 1, filter: "blur(0px)", duration: 0.28, ease: "power3.out" },
      0.38 + i * 0.07
    );
  });

  tl.fromTo(categoryLabelRef, { opacity: 0, x: -25, filter: "blur(3px)" }, { opacity: 1, x: 0, filter: "blur(0px)", duration: 0.22, ease: "power3.out" }, 0.48);
  tl.fromTo(categoryLineRef, { scaleX: 0 }, { scaleX: 1, duration: 0.22, ease: "power2.inOut" }, 0.50);
  tl.fromTo(descriptionRef, { opacity: 0, y: 14, filter: "blur(2px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.22, ease: "power3.out" }, 0.52);
  tl.fromTo(ctaButtonRef, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.22, ease: "back.out(1.4)" }, 0.60);

  // Reveal Navigation Bar smoothly
  const nav = document.getElementById("master-nav");
  if (nav) {
    tl.fromTo(nav, { yPercent: -100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.22, ease: "power2.out" }, 0.42);
  }
});

// ── MOBILE BREAKPOINT (max-width: 767px) ──
mm.add("(max-width: 767px)", () => {
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: wrapperElement,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.7, // Snappier for touch screens
      onUpdate: (self) => {
        if (self.progress > 0.40) document.body.classList.remove("intro-active");
        else document.body.classList.add("intro-active");
      },
    },
  });

  tl.to(logoRef, { opacity: 0, y: -20, scale: 0.94, filter: "blur(4px)", duration: 0.22 }, 0);
  tl.fromTo(
    cardRef,
    { width: "clamp(220px, 72vw, 320px)", height: "clamp(200px, 32vh, 320px)", bottom: "clamp(1.5rem, 5vh, 3rem)", borderRadius: "18px", scale: 0.95 },
    { width: "100vw", height: "100vh", bottom: "0px", borderRadius: "0px", scale: 1, ease: "sine.inOut", duration: 0.65 },
    0
  );
  tl.fromTo(imgRef, { scale: 1.20 }, { scale: 1.0, duration: 0.65 }, 0);
  tl.to(heroWrapperRef, { opacity: 1, pointerEvents: "auto", duration: 0.10 }, 0.32);

  headlineLineInners.forEach((innerSpan, i) => {
    tl.fromTo(innerSpan, { y: "100%", opacity: 0 }, { y: "0%", opacity: 1, duration: 0.25, ease: "power3.out" }, 0.35 + i * 0.06);
  });
  tl.fromTo(ctaButtonRef, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.20 }, 0.54);
});
```

---

## 4. Drop-in Component Template

Adapt your existing colors (`var(--color-background)`, `var(--color-primary)`, etc.) and typography classes directly into this structure:

```tsx
"use client";

import React, { useEffect, useLayoutEffect, useRef } from "react";

interface IntroHeroProps {
  logo?: React.ReactNode;
  heroImage: string;
  categoryLabel?: string;
  headlineLines: string[];
  description?: string;
  ctaText?: string;
  ctaHref?: string;
}

export function IntroHeroAnimation({
  logo,
  heroImage,
  categoryLabel = "01 — TRADITION & PURITY",
  headlineLines = ["PREPARED", "WITH CARE,", "ROOTED."],
  description = "Pure traditional formulations crafted with authentic generational methodology.",
  ctaText = "Explore Collection",
  ctaHref = "#products",
}: IntroHeroProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const scrollHintRef = useRef<HTMLDivElement>(null);

  const bgCardRef = useRef<HTMLDivElement>(null);
  const bgImgRef = useRef<HTMLImageElement>(null);
  const bgOverlayRef = useRef<HTMLDivElement>(null);

  const heroWrapperRef = useRef<HTMLDivElement>(null);
  const heroLabelRef = useRef<HTMLSpanElement>(null);
  const heroLineRef = useRef<HTMLDivElement>(null);
  const heroLinesRef = useRef<(HTMLDivElement | null)[]>([]);
  const heroDescRef = useRef<HTMLParagraphElement>(null);
  const heroCtaRef = useRef<HTMLAnchorElement>(null);

  useLayoutEffect(() => {
    document.body.classList.add("intro-active");
    return () => document.body.classList.remove("intro-active");
  }, []);

  useEffect(() => {
    let ctx: any;
    const init = async () => {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      if (!wrapperRef.current || !sectionRef.current || !bgCardRef.current || !bgImgRef.current) return;

      ctx = gsap.context(() => {
        const mm = gsap.matchMedia();

        mm.add("(min-width: 768px)", () => {
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: wrapperRef.current,
              start: "top top",
              end: "bottom bottom",
              scrub: 1.1,
              onUpdate: (self) => {
                if (self.progress > 0.45) document.body.classList.remove("intro-active");
                else document.body.classList.add("intro-active");
              },
            },
          });

          if (logoRef.current) {
            tl.to(logoRef.current, { opacity: 0, y: -35, scale: 0.96, filter: "blur(6px)", duration: 0.25 }, 0);
          }
          if (scrollHintRef.current) {
            tl.to(scrollHintRef.current, { opacity: 0, scale: 0.85, duration: 0.15 }, 0);
          }

          tl.fromTo(
            bgCardRef.current,
            { width: "clamp(260px, 30vw, 420px)", height: "clamp(280px, 40vh, 460px)", bottom: "clamp(1.5rem, 3.5vh, 3rem)", borderRadius: "24px", scale: 0.92 },
            { width: "100vw", height: "100vh", bottom: "0px", borderRadius: "0px", scale: 1, duration: 0.70, ease: "sine.inOut" },
            0
          );
          tl.fromTo(bgImgRef.current, { scale: 1.25 }, { scale: 1.0, duration: 0.70, ease: "sine.out" }, 0);
          if (bgOverlayRef.current) {
            tl.fromTo(bgOverlayRef.current, { opacity: 0.2 }, { opacity: 0.65, duration: 0.55 }, 0.12);
          }

          if (heroWrapperRef.current) {
            tl.to(heroWrapperRef.current, { opacity: 1, pointerEvents: "auto", duration: 0.10 }, 0.35);
          }

          heroLinesRef.current.filter(Boolean).forEach((el, i) => {
            const inner = el?.querySelector<HTMLSpanElement>(".hero-line-inner");
            if (!inner) return;
            tl.fromTo(inner, { y: "110%", rotateX: 75, opacity: 0 }, { y: "0%", rotateX: 0, opacity: 1, duration: 0.28, ease: "power3.out" }, 0.38 + i * 0.07);
          });

          if (heroLabelRef.current) tl.fromTo(heroLabelRef.current, { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.22 }, 0.48);
          if (heroLineRef.current) tl.fromTo(heroLineRef.current, { scaleX: 0 }, { scaleX: 1, duration: 0.22 }, 0.50);
          if (heroDescRef.current) tl.fromTo(heroDescRef.current, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.22 }, 0.52);
          if (heroCtaRef.current) tl.fromTo(heroCtaRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.22, ease: "back.out(1.4)" }, 0.60);
        });
      }, sectionRef.current);
    };

    init();
    return () => ctx?.revert();
  }, []);

  return (
    <div ref={wrapperRef} style={{ position: "relative", width: "100%", height: "clamp(150vh, 175vh, 190vh)" }}>
      <div ref={sectionRef} style={{ position: "sticky", top: 0, width: "100%", height: "100vh", overflow: "hidden", zIndex: 10 }}>
        {/* Layer 1: Existing Brand Logo */}
        <div ref={logoRef} style={{ position: "absolute", inset: 0, display: "flex", justifyContent: "center", alignItems: "center", zIndex: 12, pointerEvents: "none" }}>
          {logo}
        </div>

        {/* Layer 2: Expanding Image Card */}
        <div
          ref={bgCardRef}
          style={{
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
            overflow: "hidden",
            zIndex: 15,
            transformOrigin: "center bottom",
          }}
        >
          <img ref={bgImgRef} src={heroImage} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          <div ref={bgOverlayRef} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", opacity: 0.2 }} />
          <div ref={scrollHintRef} style={{ position: "absolute", bottom: "16px", left: "50%", transform: "translateX(-50%)", zIndex: 2 }}>
            ↓ Scroll to explore
          </div>
        </div>

        {/* Layer 3: Pinned Final Hero Content */}
        <div ref={heroWrapperRef} style={{ position: "absolute", inset: 0, zIndex: 20, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 5vw", opacity: 0, pointerEvents: "none" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
            <span ref={heroLabelRef}>{categoryLabel}</span>
            <div ref={heroLineRef} style={{ width: "60px", height: "2px", background: "currentColor", transformOrigin: "left center" }} />
          </div>

          <h1 style={{ margin: 0, perspective: "1000px" }}>
            {headlineLines.map((line, idx) => (
              <div key={line} ref={(el) => { heroLinesRef.current[idx] = el; }} style={{ overflow: "hidden" }}>
                <span className="hero-line-inner" style={{ display: "block", fontSize: "clamp(2.5rem, 8vw, 7rem)", fontWeight: 900, lineHeight: 1 }}>
                  {line}
                </span>
              </div>
            ))}
          </h1>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", marginTop: "2rem" }}>
            <p ref={heroDescRef} style={{ maxWidth: "420px" }}>{description}</p>
            <a ref={heroCtaRef} href={ctaHref} style={{ pointerEvents: "auto" }}>{ctaText} →</a>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## 5. Key Rules for the Target Agent
1. **Retain Existing Theme Tokens:** Replace raw color codes (`#f7f6f2`, `#e25c34`, etc.) with your project's existing Tailwind classes or CSS variables (e.g., `var(--color-bg)`, `var(--primary)`).
2. **Typography Integrity:** Apply your project's custom font families to the headline, body, and label spans.
3. **No React Re-Render Jank:** Keep the animation parameters inside GSAP refs; do not bind scroll positions to React `useState`.
