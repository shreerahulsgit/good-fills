'use client';

import React, { useEffect, useLayoutEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export function HeroSection() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const taglineRef = useRef<HTMLSpanElement>(null);
  const scrollHintRef = useRef<HTMLDivElement>(null);

  const bgCardRef = useRef<HTMLDivElement>(null);
  const bgImgRef = useRef<HTMLImageElement>(null);
  const bgOverlayRef = useRef<HTMLDivElement>(null);

  const heroWrapperRef = useRef<HTMLDivElement>(null);
  const heroLabelRef = useRef<HTMLSpanElement>(null);
  const heroLineRef = useRef<HTMLDivElement>(null);
  const heroLinesRef = useRef<(HTMLDivElement | null)[]>([]);
  const heroDescRef = useRef<HTMLParagraphElement>(null);
  const heroCtaRef = useRef<HTMLDivElement>(null);

  const headlineLines = ['Traditional care,', 'made for everyday life.'];

  // Add intro-active on initial mount so master nav is tucked away during splash
  useLayoutEffect(() => {
    document.body.classList.add('intro-active');
    return () => document.body.classList.remove('intro-active');
  }, []);

  useEffect(() => {
    let ctx: gsap.Context | null = null;
    let lenisInstance: any = null;

    const setupTimeline = async () => {
      // Initialize Lenis for buttery-smooth inertial scrub
      try {
        const Lenis = (await import('lenis')).default;
        lenisInstance = new Lenis({
          lerp: 0.09,
          smoothWheel: true,
        });

        lenisInstance.on('scroll', ScrollTrigger.update);
        gsap.ticker.add((time) => {
          lenisInstance.raf(time * 1000);
        });
        gsap.ticker.lagSmoothing(0);
      } catch (err) {
        console.warn('Lenis could not be initialized:', err);
      }

      if (!wrapperRef.current || !sectionRef.current || !bgCardRef.current || !bgImgRef.current) return;

      ctx = gsap.context(() => {
        // Ensure splash elements are explicitly at 100% on start
        if (logoRef.current) gsap.set(logoRef.current, { opacity: 1, y: 0, scale: 1 });
        if (taglineRef.current) gsap.set(taglineRef.current, { opacity: 1, y: 0 });
        if (scrollHintRef.current) gsap.set(scrollHintRef.current, { opacity: 1, scale: 1 });
        if (heroWrapperRef.current) gsap.set(heroWrapperRef.current, { opacity: 0, pointerEvents: 'none' });

        const mm = gsap.matchMedia();

        // ── DESKTOP TIMELINE (min-width: 768px) ──
        mm.add('(min-width: 768px)', () => {
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: wrapperRef.current,
              start: 'top top',
              end: 'bottom bottom',
              scrub: 1.1,
              onUpdate: (self) => {
                if (self.progress > 0.45) {
                  document.body.classList.remove('intro-active');
                } else {
                  document.body.classList.add('intro-active');
                }

                // Guarantee splash elements stay 100% visible at the top
                if (self.progress <= 0.02) {
                  if (logoRef.current) gsap.set(logoRef.current, { opacity: 1, y: 0, scale: 1 });
                  if (taglineRef.current) gsap.set(taglineRef.current, { opacity: 1, y: 0 });
                  if (scrollHintRef.current) gsap.set(scrollHintRef.current, { opacity: 1, scale: 1 });
                  if (heroWrapperRef.current) gsap.set(heroWrapperRef.current, { opacity: 0, pointerEvents: 'none' });
                }
              },
              onLeave: () => {
                document.body.classList.remove('intro-active');
                const nav = document.getElementById('master-nav');
                if (nav) gsap.set(nav, { y: '0%', yPercent: 0, opacity: 1 });
              },
              onLeaveBack: () => {
                document.body.classList.add('intro-active');
                const nav = document.getElementById('master-nav');
                if (nav) gsap.set(nav, { y: '-100%', yPercent: 0, opacity: 0 });
                if (logoRef.current) gsap.set(logoRef.current, { opacity: 1, y: 0, scale: 1 });
                if (taglineRef.current) gsap.set(taglineRef.current, { opacity: 1, y: 0 });
                if (scrollHintRef.current) gsap.set(scrollHintRef.current, { opacity: 1, scale: 1 });
                if (heroWrapperRef.current) gsap.set(heroWrapperRef.current, { opacity: 0, pointerEvents: 'none' });
              },
            },
          });

          // STEP 1: Dissolve initial splash elements smoothly with card expansion
          if (logoRef.current) {
            tl.fromTo(
              logoRef.current,
              { opacity: 1, y: 0, scale: 1 },
              { opacity: 0, y: -28, scale: 0.96, duration: 0.22, ease: 'sine.out' },
              0.14
            );
          }
          if (taglineRef.current) {
            tl.fromTo(
              taglineRef.current,
              { opacity: 1, y: 0 },
              { opacity: 0, y: -16, duration: 0.20, ease: 'sine.out' },
              0.16
            );
          }
          if (scrollHintRef.current) {
            tl.fromTo(
              scrollHintRef.current,
              { opacity: 1, scale: 1 },
              { opacity: 0, scale: 0.85, duration: 0.16, ease: 'sine.out' },
              0.08
            );
          }

          // STEP 2: Card expansion to full viewport bleed
          tl.fromTo(
            bgCardRef.current,
            {
              width: 'clamp(280px, 30vw, 420px)',
              height: 'clamp(260px, 38vh, 440px)',
              bottom: 'clamp(1.5rem, 3.5vh, 3rem)',
              borderRadius: '24px',
              borderWidth: '1px',
              scale: 0.92,
              boxShadow: '0 24px 60px rgba(34, 24, 19, 0.22)',
            },
            {
              width: '100vw',
              height: '100vh',
              bottom: '0px',
              borderRadius: '0px',
              borderWidth: '0px',
              scale: 1,
              boxShadow: '0 0 0 rgba(0, 0, 0, 0)',
              ease: 'sine.inOut',
              duration: 0.70,
            },
            0
          );

          // Image counter-scale (optical anchor illusion)
          tl.fromTo(bgImgRef.current, { scale: 1.25 }, { scale: 1.0, ease: 'sine.out', duration: 0.70 }, 0);
          if (bgOverlayRef.current) {
            tl.fromTo(bgOverlayRef.current, { opacity: 0.15 }, { opacity: 1, ease: 'sine.out', duration: 0.55 }, 0.12);
          }

          // STEP 3: Hero content unmasking (crisp, zero blur)
          if (heroWrapperRef.current) {
            tl.fromTo(
              heroWrapperRef.current,
              { opacity: 0, pointerEvents: 'none' },
              { opacity: 1, pointerEvents: 'auto', duration: 0.10 },
              0.28
            );
          }

          heroLinesRef.current.filter(Boolean).forEach((el, i) => {
            const inner = el?.querySelector<HTMLSpanElement>('.hero-line-inner');
            if (!inner) return;
            tl.fromTo(
              inner,
              { y: '100%', opacity: 0 },
              { y: '0%', opacity: 1, duration: 0.24, ease: 'power3.out' },
              0.32 + i * 0.06
            );
          });

          if (heroLabelRef.current) {
            tl.fromTo(heroLabelRef.current, { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.18, ease: 'power3.out' }, 0.38);
          }
          if (heroLineRef.current) {
            tl.fromTo(heroLineRef.current, { scaleX: 0 }, { scaleX: 1, duration: 0.18, ease: 'power2.inOut' }, 0.40);
          }
          if (heroDescRef.current) {
            tl.fromTo(heroDescRef.current, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.18, ease: 'power3.out' }, 0.42);
          }
          if (heroCtaRef.current) {
            tl.fromTo(heroCtaRef.current, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.20, ease: 'back.out(1.4)' }, 0.46);
          }

          // Reveal Navigation Bar smoothly (explicit y: 0% to avoid pixel offset cache)
          const nav = document.getElementById('master-nav');
          if (nav) {
            gsap.set(nav, { y: '-100%', yPercent: 0, opacity: 0 });
            tl.fromTo(
              nav,
              { y: '-100%', yPercent: 0, opacity: 0 },
              { y: '0%', yPercent: 0, opacity: 1, duration: 0.20, ease: 'power2.out' },
              0.34
            );
          }
        });

        // ── MOBILE BREAKPOINT (max-width: 767px) ──
        mm.add('(max-width: 767px)', () => {
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: wrapperRef.current,
              start: 'top top',
              end: 'bottom bottom',
              scrub: 0.7,
              onUpdate: (self) => {
                if (self.progress > 0.40) document.body.classList.remove('intro-active');
                else document.body.classList.add('intro-active');

                if (self.progress <= 0.02) {
                  if (logoRef.current) gsap.set(logoRef.current, { opacity: 1, y: 0, scale: 1 });
                  if (taglineRef.current) gsap.set(taglineRef.current, { opacity: 1, y: 0 });
                  if (scrollHintRef.current) gsap.set(scrollHintRef.current, { opacity: 1, scale: 1 });
                  if (heroWrapperRef.current) gsap.set(heroWrapperRef.current, { opacity: 0, pointerEvents: 'none' });
                }
              },
              onLeave: () => {
                document.body.classList.remove('intro-active');
                const nav = document.getElementById('master-nav');
                if (nav) gsap.set(nav, { y: '0%', yPercent: 0, opacity: 1 });
              },
              onLeaveBack: () => {
                document.body.classList.add('intro-active');
                const nav = document.getElementById('master-nav');
                if (nav) gsap.set(nav, { y: '-100%', yPercent: 0, opacity: 0 });
                if (logoRef.current) gsap.set(logoRef.current, { opacity: 1, y: 0, scale: 1 });
                if (taglineRef.current) gsap.set(taglineRef.current, { opacity: 1, y: 0 });
                if (scrollHintRef.current) gsap.set(scrollHintRef.current, { opacity: 1, scale: 1 });
                if (heroWrapperRef.current) gsap.set(heroWrapperRef.current, { opacity: 0, pointerEvents: 'none' });
              },
            },
          });

          if (logoRef.current) {
            tl.fromTo(
              logoRef.current,
              { opacity: 1, y: 0, scale: 1 },
              { opacity: 0, y: -18, scale: 0.95, duration: 0.20, ease: 'sine.out' },
              0.12
            );
          }
          if (taglineRef.current) {
            tl.fromTo(
              taglineRef.current,
              { opacity: 1, y: 0 },
              { opacity: 0, y: -12, duration: 0.18, ease: 'sine.out' },
              0.14
            );
          }
          if (scrollHintRef.current) {
            tl.fromTo(
              scrollHintRef.current,
              { opacity: 1, scale: 1 },
              { opacity: 0, scale: 0.85, duration: 0.14, ease: 'sine.out' },
              0.06
            );
          }

          tl.fromTo(
            bgCardRef.current,
            { width: 'clamp(220px, 76vw, 320px)', height: 'clamp(200px, 32vh, 320px)', bottom: 'clamp(1.5rem, 5vh, 3rem)', borderRadius: '18px', scale: 0.95 },
            { width: '100vw', height: '100vh', bottom: '0px', borderRadius: '0px', scale: 1, ease: 'sine.inOut', duration: 0.65 },
            0
          );
          tl.fromTo(bgImgRef.current, { scale: 1.20 }, { scale: 1.0, duration: 0.65 }, 0);
          if (bgOverlayRef.current) {
            tl.fromTo(bgOverlayRef.current, { opacity: 0.2 }, { opacity: 1, duration: 0.55 }, 0.12);
          }

          if (heroWrapperRef.current) {
            tl.fromTo(
              heroWrapperRef.current,
              { opacity: 0, pointerEvents: 'none' },
              { opacity: 1, pointerEvents: 'auto', duration: 0.10 },
              0.26
            );
          }

          heroLinesRef.current.filter(Boolean).forEach((el, i) => {
            const inner = el?.querySelector<HTMLSpanElement>('.hero-line-inner');
            if (!inner) return;
            tl.fromTo(inner, { y: '100%', opacity: 0 }, { y: '0%', opacity: 1, duration: 0.22, ease: 'power3.out' }, 0.30 + i * 0.05);
          });

          if (heroLabelRef.current) tl.fromTo(heroLabelRef.current, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.16 }, 0.36);
          if (heroLineRef.current) tl.fromTo(heroLineRef.current, { scaleX: 0 }, { scaleX: 1, duration: 0.16 }, 0.38);
          if (heroDescRef.current) tl.fromTo(heroDescRef.current, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.16 }, 0.40);
          if (heroCtaRef.current) tl.fromTo(heroCtaRef.current, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.18 }, 0.44);

          const nav = document.getElementById('master-nav');
          if (nav) {
            gsap.set(nav, { y: '-100%', yPercent: 0, opacity: 0 });
            tl.fromTo(
              nav,
              { y: '-100%', yPercent: 0, opacity: 0 },
              { y: '0%', yPercent: 0, opacity: 1, duration: 0.18, ease: 'power2.out' },
              0.32
            );
          }
        });
      }, sectionRef.current);
    };

    setupTimeline();

    return () => {
      lenisInstance?.destroy();
      ctx?.revert();
      const nav = document.getElementById('master-nav');
      if (nav) {
        gsap.set(nav, { clearProps: 'all' });
      }
    };
  }, []);

  return (
    <div ref={wrapperRef} className="hero-scroll-track">
      <div ref={sectionRef} className="hero-sticky-viewport">
        {/* Layer 1: Splash Brand Logo & Tagline (Scroll 0% to 50%) */}
        <div className="hero-splash-layer">
          <div ref={logoRef} className="hero-splash-logo-wrap">
            <img
              src="/logo.png"
              alt="Good Fills Homemade Products"
              className="hero-splash-logo"
              loading="eager"
              fetchPriority="high"
              decoding="sync"
            />
          </div>
          <span ref={taglineRef} className="hero-splash-tagline">
            Traditional Care, Prepared with Intention
          </span>
        </div>

        {/* Layer 2: Expanding Image Card with Counter-Scaling Grains */}
        <div ref={bgCardRef} className="hero-expanding-card">
          <img
            ref={bgImgRef}
            src="/HeroBG.png"
            alt="Sunlit Organic Grains and Handcrafted Care"
            className="hero-card-img"
          />
          <div ref={bgOverlayRef} className="hero-card-overlay" />
          <div ref={scrollHintRef} className="hero-scroll-hint">
            <span className="hero-scroll-hint-arrow">&darr;</span>
            <span>Scroll to explore</span>
          </div>
        </div>

        {/* Layer 3: Pinned Final Hero Content (Scroll 50% to 100%) */}
        <div ref={heroWrapperRef} className="hero-pinned-content">
          <div className="container">
            <div className="hero-pinned-inner">
              <div className="hero-category-row">
                <span ref={heroLabelRef} className="hero-category-label">
                  01 &mdash; TRADITION &amp; PURITY
                </span>
                <div ref={heroLineRef} className="hero-category-line" />
              </div>

              <h1 className="hero-3d-headline">
                {headlineLines.map((line, idx) => (
                  <div
                    key={line}
                    ref={(el) => {
                      heroLinesRef.current[idx] = el;
                    }}
                    className="hero-line-mask"
                  >
                    <span className="hero-line-inner">
                      {line}
                    </span>
                  </div>
                ))}
              </h1>

              <p ref={heroDescRef} className="hero-pinned-desc">
                Homemade food, nutrition, skincare and bath products prepared with care and made to order in Bengaluru.
              </p>

              <div ref={heroCtaRef} className="hero-pinned-actions">
                <Link href="/shop" className="btn btn-primary hero-minimal-btn group-btn">
                  <span>Shop Products</span>
                  <ArrowRight size={16} className="btn-arrow" />
                </Link>

                <Link href="/our-story" className="btn btn-outline hero-minimal-btn">
                  <span>Our Story</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
