'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { getAssetUrl } from '@/lib/assets';

const MIN_WIDTH_FOR_TVS = 1370;
const MAX_ZOOM_FOR_TVS = 1.2;

// BO1 interrogation room vibe – 2 towers per side, stacked TVs, random offsets. Home page gets the menu bg behind them.

// Brighter static so it reads like a lit CRT
const STATIC_SVG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 128 128'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.92' numOctaves='3' stitchTiles='stitch' result='t'/%3E%3CfeColorMatrix in='t' type='saturate' values='0'/%3E%3CfeComponentTransfer%3E%3CfeFuncR type='linear' slope='1.4' intercept='0.15'/%3E%3CfeFuncG type='linear' slope='1.4' intercept='0.15'/%3E%3CfeFuncB type='linear' slope='1.4' intercept='0.15'/%3E%3C/feComponentTransfer%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E";

type Size = 'large' | 'medium' | 'small';

// Keep TVs compact so both towers sit in a narrow band on the edge (not “inner” one in middle)
const SIZES: Record<Size, { width: string; height: string; bezel: number }> = {
  large: {
    width: 'min(20vw, 224px)',
    height: 'min(15vw, 168px)',
    bezel: 20,
  },
  medium: {
    width: 'min(15.5vw, 175px)',
    height: 'min(11.5vw, 132px)',
    bezel: 17,
  },
  small: {
    width: 'min(11vw, 129px)',
    height: 'min(8.5vw, 97px)',
    bezel: 14,
  },
};

type TVInTower = {
  size: Size;
  rotateY: number;
  rotateX?: number;
  rotateZ?: number;
  /** Horizontal offset in px so stack isn’t perfectly aligned */
  offsetX?: number;
  staticBrightness?: number;
};

type Tower = {
  left?: string;
  right?: string;
  bottom?: string;
  tvs: TVInTower[];
};

// Index → size: 0,1,4,7,8,11 large | 2,5,9,12 medium | 3,6,10,13 small. Bottom row uses 0,4,7,11.
const SCREEN_CONTENTS: Array<{ type: 'image'; src: string } | { type: 'static' }> = [
  { type: 'image', src: '/images/tv/numbers.jpeg' },           // 0 bottom row left (large)
  { type: 'image', src: '/images/tv/der-eisendrache-loading.jpg' },
  { type: 'image', src: '/images/tv/victus-crew.jpg' },       // 2 medium
  { type: 'image', src: '/images/tv/presidents.jpg' },         // 3 small (always small TV)
  { type: 'image', src: '/images/tv/giant-loading.jpg' },      // 4 bottom row (large)
  { type: 'image', src: '/images/tv/burried-loading.jpg' },    // 5 medium
  { type: 'image', src: '/images/tv/mystery-box.webp' },       // 6 small
  { type: 'image', src: '/images/tv/revelations-loading.jpg' }, // 7 bottom row right (large)
  { type: 'image', src: '/images/tv/origins-loading.jpg' },    // 8 large
  { type: 'image', src: '/images/tv/transit.png' },           // 9 medium
  { type: 'image', src: '/images/tv/kennedy.jpg' },            // 10 small
  { type: 'image', src: '/images/tv/mob-of-the-dead-loading.webp' }, // 11 bottom row (large)
  { type: 'image', src: '/images/tv/bo4-crew.webp' },          // 12 medium
  { type: 'static' },                                         // 13 small
];

const BOTTOM_BASE = '2rem';
const GAP_BETWEEN_TOWERS = '0';

// Left: 2 towers, no horizontal overlap, all bottom: 0, varied bottom and per‑TV offset so it’s not uniform
const LEFT_TOWERS: Tower[] = [
  {
    tvs: [
      { size: 'large', rotateY: 6, offsetX: 1 },
      { size: 'large', rotateY: 5, offsetX: -2 },
      { size: 'medium', rotateY: 8, rotateZ: 0.3, offsetX: 2 },
      { size: 'small', rotateY: 4, offsetX: -1 },
    ],
  },
  {
    tvs: [
      { size: 'large', rotateY: 7, offsetX: -2 },
      { size: 'medium', rotateY: 5, rotateZ: -0.2, offsetX: 1 },
      { size: 'small', rotateY: 9, offsetX: 2 },
    ],
  },
];

const RIGHT_TOWERS: Tower[] = [
  {
    tvs: [
      { size: 'large', rotateY: -5, offsetX: -1 },
      { size: 'large', rotateY: -7, rotateZ: 0.3, offsetX: 2 },
      { size: 'medium', rotateY: -6, offsetX: 1 },
      { size: 'small', rotateY: -4, offsetX: -2 },
    ],
  },
  {
    tvs: [
      { size: 'large', rotateY: -8, offsetX: 2 },
      { size: 'medium', rotateY: -5, rotateZ: -0.3, offsetX: -1 },
      { size: 'small', rotateY: -7, offsetX: 1 },
    ],
  },
];

const CABINET_RADIUS = 10;
const SCREEN_RADIUS = 5;

type ScreenContent = { type: 'image'; src: string } | { type: 'static' };

function TVUnit({
  config,
  side,
  screenContent,
}: {
  config: TVInTower;
  side: 'left' | 'right';
  screenContent: ScreenContent;
}) {
  const {
    size,
    rotateY,
    rotateX = 0,
    rotateZ = 0,
    offsetX = 0,
    staticBrightness = 1,
  } = config;
  const { width, height, bezel } = SIZES[size];
  const hasImage = screenContent.type === 'image';
  const hasStatic = screenContent.type === 'static' || hasImage;
  const glowScale = bezel / 14;

  const translateX = side === 'left' ? offsetX : -offsetX;
  const transform = [
    `perspective(500px)`,
    `translateX(${translateX}px)`,
    `rotateY(${rotateY}deg)`,
    `rotateX(${rotateX}deg)`,
    `rotateZ(${rotateZ}deg)`,
  ].join(' ');

  const staticOpacity1 = Math.min(1, 1 * staticBrightness);
  const staticOpacity2 = Math.min(1, 0.85 * staticBrightness);

  return (
    <div
      className="overflow-visible flex-shrink-0"
      style={{
        width,
        height,
        transform,
        transformStyle: 'preserve-3d',
        transformOrigin: side === 'left' ? 'left bottom' : 'right bottom',
        margin: 0,
        padding: 0,
      }}
    >
      {/* Single face: flat cabinet (bezel) + screen, no depth styling */}
      <div
        className="absolute inset-0 overflow-visible"
        style={{
          borderRadius: CABINET_RADIUS,
          background: 'linear-gradient(165deg, #1e1e1e 0%, #161616 25%, #0f0f0f 50%, #0a0a0a 75%, #060606 100%)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04), inset 0 -1px 0 rgba(0,0,0,0.4)',
          border: '1px solid rgba(0,0,0,0.5)',
        }}
      >
        {/* Emitted light from screen */}
        <div
          className="absolute pointer-events-none"
          style={{
            inset: bezel,
            borderRadius: SCREEN_RADIUS,
            boxShadow: `
              0 0 ${Math.round(8 * glowScale)}px rgba(220,222,230,0.2),
              0 0 ${Math.round(18 * glowScale)}px rgba(200,202,210,0.1),
              0 0 ${Math.round(32 * glowScale)}px rgba(180,182,190,0.06)
            `,
          }}
          aria-hidden
        />
        {/* Screen well */}
        <div
          className="absolute overflow-hidden"
          style={{
            inset: bezel,
            borderRadius: SCREEN_RADIUS,
            background: '#0f0f0f',
            boxShadow: `
              inset 0 0 12px rgba(0,0,0,0.35),
              inset 0 0 0 1px rgba(0,0,0,0.25),
              0 0 ${Math.round(10 * glowScale)}px rgba(220,222,230,0.2),
              0 0 ${Math.round(22 * glowScale)}px rgba(200,202,210,0.08)
            `,
            border: '1px solid rgba(80,82,90,0.4)',
          }}
        >
          {hasImage && (
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url("${getAssetUrl(screenContent.src)}")`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                filter: 'brightness(1.12) contrast(1.06)',
              }}
              role="img"
              aria-hidden
            />
          )}
          {hasStatic && (
            <>
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `url("${STATIC_SVG}")`,
                  backgroundSize: '56px 56px',
                  opacity: hasImage ? 0.2 : staticOpacity1,
                }}
              />
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `url("${STATIC_SVG}")`,
                  backgroundSize: '88px 88px',
                  opacity: hasImage ? 0.15 : staticOpacity2,
                }}
              />
            </>
          )}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.06]"
            style={{
              backgroundImage:
                'repeating-linear-gradient(0deg, transparent 0px, transparent 2px, black 2px, black 3px)',
            }}
          />
          <div
            className="absolute inset-0 pointer-events-none rounded-[inherit]"
            style={{ boxShadow: 'inset 0 0 14px 1px rgba(0,0,0,0.12)' }}
          />
        </div>
      </div>
    </div>
  );
}

function TowerColumn({
  tower,
  side,
  towerIndex,
  inBlock,
  startGlobalIndex,
}: {
  tower: Tower;
  side: 'left' | 'right';
  towerIndex: number;
  inBlock?: boolean;
  startGlobalIndex: number;
}) {
  return (
    <div
      className="flex flex-col-reverse flex-shrink-0"
      style={{
        ...(inBlock ? {} : { position: 'absolute', left: tower.left, right: tower.right, bottom: tower.bottom }),
        perspective: 500,
        alignItems: side === 'left' ? 'flex-start' : 'flex-end',
        gap: 0,
        padding: 0,
        margin: 0,
      }}
    >
      {tower.tvs.map((tv, i) => (
        <TVUnit
          key={`${side}-${towerIndex}-${i}`}
          config={tv}
          side={side}
          screenContent={SCREEN_CONTENTS[startGlobalIndex + i]}
        />
      ))}
    </div>
  );
}

function useShowTvs() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(`(min-width: ${MIN_WIDTH_FOR_TVS}px)`);
    const getZoom = () => (window.visualViewport?.scale ?? 1);
    const update = () => {
      const widthOk = media.matches;
      const zoomOk = getZoom() <= MAX_ZOOM_FOR_TVS;
      setShow(widthOk && zoomOk);
    };
    update();
    media.addEventListener('change', update);
    window.visualViewport?.addEventListener('resize', update);
    window.visualViewport?.addEventListener('scroll', update);
    return () => {
      media.removeEventListener('change', update);
      window.visualViewport?.removeEventListener('resize', update);
      window.visualViewport?.removeEventListener('scroll', update);
    };
  }, []);

  return show;
}

function isAuthFlowRoute(pathname: string) {
  return pathname === '/dashboard' || pathname.startsWith('/auth');
}

export function TVRoomBackground() {
  const pathname = usePathname();
  const isHome = pathname === '/';
  const hideDecoration = isAuthFlowRoute(pathname);
  const showTvs = useShowTvs() && !hideDecoration;

  return (
    <>
      {/* Menu background image: only on home, behind everything (TVs and content) */}
      {isHome && !hideDecoration && (
        <div
          className="fixed inset-0 pointer-events-none z-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url("${getAssetUrl('/images/menu-background.jpeg')}")`,
          }}
          aria-hidden
        />
      )}
      {isHome && !hideDecoration && (
        <div
          className="fixed inset-0 pointer-events-none z-0"
          style={{
            background: 'linear-gradient(180deg, rgba(0,0,0,0.52) 0%, rgba(0,0,0,0.42) 50%, rgba(0,0,0,0.58) 100%)',
          }}
          aria-hidden
        />
      )}
      {showTvs && (
        <TVLayerFadeIn>
          <div
            className="fixed inset-0 pointer-events-none z-[1]"
            style={{ overflowY: 'hidden' }}
            aria-hidden
          >
            {/* Left: 2 towers in one block flush to left edge */}
            <div
              className="fixed flex flex-row items-end"
              style={{
                left: 0,
                bottom: BOTTOM_BASE,
                gap: GAP_BETWEEN_TOWERS,
                perspective: 500,
              }}
            >
              {LEFT_TOWERS.map((tower, i) => (
                <TowerColumn key={`left-${i}`} tower={tower} side="left" towerIndex={i} inBlock startGlobalIndex={i === 0 ? 0 : 4} />
              ))}
            </div>
            {/* Right: 2 towers in one block flush to right edge */}
            <div
              className="fixed flex flex-row-reverse items-end"
              style={{
                right: 0,
                bottom: BOTTOM_BASE,
                gap: GAP_BETWEEN_TOWERS,
                perspective: 500,
              }}
            >
              {RIGHT_TOWERS.map((tower, i) => (
                <TowerColumn key={`right-${i}`} tower={tower} side="right" towerIndex={i} inBlock startGlobalIndex={i === 0 ? 7 : 11} />
              ))}
            </div>
          </div>
          {/* Slightly lighter than pure black so TV frames (with rim) read as objects in front */}
          <div
            className="fixed inset-0 pointer-events-none z-[1]"
            aria-hidden
            style={{
              background: `radial-gradient(
                ellipse 75% 75% at 50% 50%,
                transparent 38%,
                rgba(8, 8, 8, 0.2) 62%,
                rgba(4, 4, 4, 0.35) 100%
              )`,
            }}
          />
        </TVLayerFadeIn>
      )}
    </>
  );
}

function TVLayerFadeIn({ children }: { children: React.ReactNode }) {
  const [opacity, setOpacity] = useState(0);
  const mountedRef = useRef(true);
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      if (mountedRef.current) setOpacity(1);
    });
    return () => {
      mountedRef.current = false;
      cancelAnimationFrame(id);
    };
  }, []);
  return (
    <div
      style={{
        opacity,
        transition: 'opacity 0.25s ease-out',
      }}
    >
      {children}
    </div>
  );
}
