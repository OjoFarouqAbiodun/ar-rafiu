import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Motion entry point. Staged, not yet imported by any page.
 *
 * It exists so that the eventual animation work has one reviewed contract
 * rather than ad-hoc timelines scattered through components, and so GSAP stays
 * out of the production bundle until there is something worth animating.
 *
 * Two rules make the reduced-motion requirement in FRONTEND-CORE-RULES 11.2 and
 * PRD section 20 hold for scripted animation. The CSS media query in
 * `base.css` only neutralises CSS animation and transitions; it has no effect
 * on GSAP timelines.
 *
 * 1. Content must be visible by default in CSS. Animations may only move
 *    elements from a visible state to a hidden one *inside* the animated branch,
 *    never in the stylesheet. Otherwise a visitor with reduced motion, or a
 *    visitor whose JavaScript fails, would be left with invisible content.
 * 2. Every animation runs through `gsap.matchMedia`, so the reduced-motion
 *    branch can guarantee a reset rather than merely skipping new tweens.
 */

export const reducedMotionQuery = '(prefers-reduced-motion: reduce)';

export interface MotionContext {
  /** False when the visitor has asked for reduced motion. */
  animate: boolean;
}

export type MotionCleanup = () => void;

export type MotionSetup = (context: MotionContext) => MotionCleanup | void;

const setups: MotionSetup[] = [];

/**
 * Registers a motion module. Each module receives the motion context and
 * returns an optional teardown function that runs when its media query stops
 * matching, so nothing survives a preference change.
 */
export function registerMotion(setup: MotionSetup): void {
  setups.push(setup);
}

export function initMotion(): void {
  const media = gsap.matchMedia();

  media.add(reducedMotionQuery, () => {
    // Anything already moved by a previous preference state is returned to its
    // natural position, which is the accessible resting state.
    gsap.set('[data-motion]', { clearProps: 'all' });
    setups.forEach((setup) => setup({ animate: false }));
    return () => {};
  });

  media.add('(prefers-reduced-motion: no-preference)', () => {
    const cleanups = setups
      .map((setup) => setup({ animate: true }))
      .filter((cleanup): cleanup is MotionCleanup => typeof cleanup === 'function');

    return () => cleanups.forEach((cleanup) => cleanup());
  });
}