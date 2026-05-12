'use client';
import gsap from 'gsap';
import { AnimationName, TransitionName } from '../types/editor.types';

export function playEnterAnimation(element: HTMLElement, name: AnimationName, duration: number = 1): gsap.core.Tween | gsap.core.Timeline {
  gsap.set(element, { clearProps: 'all' });

  switch (name) {
    case 'fadeIn':
      return gsap.from(element, { opacity: 0, duration });
    case 'enterLeft':
      return gsap.from(element, { x: -100, opacity: 0, duration, ease: 'power2.out' });
    case 'enterRight':
      return gsap.from(element, { x: 100, opacity: 0, duration, ease: 'power2.out' });
    case 'enterUp':
      return gsap.from(element, { y: -80, opacity: 0, duration, ease: 'power2.out' });
    case 'enterDown':
      return gsap.from(element, { y: 80, opacity: 0, duration, ease: 'power2.out' });
    case 'rotateIn':
      return gsap.from(element, { rotation: -180, opacity: 0, duration, ease: 'back.out(1.5)' });
    case 'flipX':
      return gsap.from(element, { rotationX: 90, opacity: 0, duration, ease: 'power2.out' });
    case 'flipY':
      return gsap.from(element, { rotationY: 90, opacity: 0, duration, ease: 'power2.out' });
    case 'flip':
      return gsap.from(element, { scaleX: 0, opacity: 0, duration, ease: 'back.out(2)' });
    case 'zoomIn':
      return gsap.from(element, { scale: 0, opacity: 0, duration, ease: 'back.out(1.7)' });
    case 'rollIn':
      return gsap.from(element, { x: -200, rotation: -120, opacity: 0, duration, ease: 'power2.out' });
    case 'slideIn':
      return gsap.from(element, { x: -60, opacity: 0, duration, ease: 'power3.out' });
    case 'blurIn':
      return gsap.from(element, { filter: 'blur(20px)', opacity: 0, duration, ease: 'power2.out' });
    default:
      return gsap.from(element, { opacity: 0, duration });
  }
}

export function playEmphasisAnimation(element: HTMLElement, name: AnimationName, duration: number = 1): gsap.core.Timeline {
  const tl = gsap.timeline();

  switch (name) {
    case 'pulse':
      tl.to(element, { scale: 1.1, duration: duration / 2, ease: 'power2.inOut' })
        .to(element, { scale: 1, duration: duration / 2, ease: 'power2.inOut' });
      break;
    case 'shake':
      tl.to(element, { x: -10, duration: 0.05 })
        .to(element, { x: 10, duration: 0.1 })
        .to(element, { x: -8, duration: 0.1 })
        .to(element, { x: 8, duration: 0.1 })
        .to(element, { x: 0, duration: 0.05 });
      break;
    case 'bounce':
      tl.to(element, { y: -30, duration: duration / 3, ease: 'power2.out' })
        .to(element, { y: 0, duration: duration / 3, ease: 'bounce.out' });
      break;
    case 'spin':
      tl.to(element, { rotation: 360, duration, ease: 'linear' });
      break;
    case 'flash':
      tl.to(element, { opacity: 0, duration: 0.1 })
        .to(element, { opacity: 1, duration: 0.1 })
        .to(element, { opacity: 0, duration: 0.1 })
        .to(element, { opacity: 1, duration: 0.1 });
      break;
    case 'swing':
      tl.to(element, { rotation: 15, duration: 0.25, transformOrigin: 'top center' })
        .to(element, { rotation: -10, duration: 0.2 })
        .to(element, { rotation: 5, duration: 0.2 })
        .to(element, { rotation: -5, duration: 0.2 })
        .to(element, { rotation: 0, duration: 0.15 });
      break;
    case 'tada':
      tl.to(element, { scale: 0.9, rotation: -3, duration: 0.1 })
        .to(element, { scale: 1.1, rotation: 3, duration: 0.1 })
        .to(element, { scale: 1.1, rotation: -3, duration: 0.1 })
        .to(element, { scale: 1, rotation: 0, duration: 0.1 });
      break;
    case 'rubber':
      tl.to(element, { scaleX: 1.25, scaleY: 0.75, duration: 0.1 })
        .to(element, { scaleX: 0.75, scaleY: 1.25, duration: 0.1 })
        .to(element, { scaleX: 1.15, scaleY: 0.85, duration: 0.1 })
        .to(element, { scaleX: 1, scaleY: 1, duration: 0.3, ease: 'elastic.out(1, 0.3)' });
      break;
    case 'jello':
      tl.to(element, { skewX: -12.5, skewY: -12.5, duration: 0.1 })
        .to(element, { skewX: 6.25, skewY: 6.25, duration: 0.1 })
        .to(element, { skewX: 0, skewY: 0, duration: 0.3, ease: 'elastic.out(1, 0.3)' });
      break;
    case 'heartBeat':
      tl.to(element, { scale: 1.3, duration: 0.14, ease: 'power2.out' })
        .to(element, { scale: 1, duration: 0.14 })
        .to(element, { scale: 1.3, duration: 0.14, ease: 'power2.out' })
        .to(element, { scale: 1, duration: 0.5, ease: 'power2.inOut' });
      break;
    case 'wobble':
      tl.to(element, { x: -25, rotation: -5, duration: 0.2 })
        .to(element, { x: 20, rotation: 3, duration: 0.2 })
        .to(element, { x: -15, rotation: -3, duration: 0.2 })
        .to(element, { x: 10, rotation: 2, duration: 0.2 })
        .to(element, { x: 0, rotation: 0, duration: 0.2 });
      break;
    case 'headShake':
      tl.to(element, { x: -6, rotationY: -9, duration: 0.1 })
        .to(element, { x: 5, rotationY: 7, duration: 0.1 })
        .to(element, { x: -3, rotationY: -5, duration: 0.1 })
        .to(element, { x: 0, rotationY: 0, duration: 0.1 });
      break;
    default:
      tl.to(element, { scale: 1.05, duration: 0.2 }).to(element, { scale: 1, duration: 0.2 });
  }
  return tl;
}

export function playExitAnimation(element: HTMLElement, name: AnimationName, duration: number = 1): gsap.core.Tween | gsap.core.Timeline {
  switch (name) {
    case 'fadeOut':
      return gsap.to(element, { opacity: 0, duration });
    case 'exitLeft':
      return gsap.to(element, { x: -100, opacity: 0, duration, ease: 'power2.in' });
    case 'exitRight':
      return gsap.to(element, { x: 100, opacity: 0, duration, ease: 'power2.in' });
    case 'exitUp':
      return gsap.to(element, { y: -80, opacity: 0, duration, ease: 'power2.in' });
    case 'exitDown':
      return gsap.to(element, { y: 80, opacity: 0, duration, ease: 'power2.in' });
    case 'zoomOut':
      return gsap.to(element, { scale: 0, opacity: 0, duration, ease: 'power2.in' });
    case 'rotateOut':
      return gsap.to(element, { rotation: 180, opacity: 0, duration, ease: 'power2.in' });
    case 'flipOutX':
      return gsap.to(element, { rotationX: 90, opacity: 0, duration, ease: 'power2.in' });
    case 'flipOutY':
      return gsap.to(element, { rotationY: 90, opacity: 0, duration, ease: 'power2.in' });
    case 'slideOut':
      return gsap.to(element, { x: 60, opacity: 0, duration, ease: 'power3.in' });
    case 'rollOut':
      return gsap.to(element, { x: 200, rotation: 120, opacity: 0, duration, ease: 'power2.in' });
    case 'blurOut':
      return gsap.to(element, { filter: 'blur(20px)', opacity: 0, duration, ease: 'power2.in' });
    case 'hinge': {
      const tl = gsap.timeline();
      tl.to(element, { rotation: 80, transformOrigin: 'top left', duration: 0.3, ease: 'power1.inOut' })
        .to(element, { rotation: 60, duration: 0.2 })
        .to(element, { y: 700, opacity: 0, duration: 0.5, ease: 'power2.in' });
      return tl;
    }
    default:
      return gsap.to(element, { opacity: 0, duration });
  }
}

export function playSidebarAnimation(element: HTMLElement, show: boolean) {
  if (show) {
    gsap.from(element, { x: -20, opacity: 0, duration: 0.3, ease: 'power2.out' });
  } else {
    gsap.to(element, { x: -20, opacity: 0, duration: 0.2, ease: 'power2.in' });
  }
}

export function staggerMediaCards(elements: NodeListOf<Element> | HTMLElement[]) {
  gsap.from(elements, {
    opacity: 0,
    y: 10,
    duration: 0.3,
    stagger: 0.05,
    ease: 'power2.out',
  });
}

export function playTransitionAnimation(container: HTMLElement, name: TransitionName, duration: number = 1) {
  gsap.set(container, { clearProps: 'all' });
  
  switch (name) {
    case 'fade':
      return gsap.fromTo(container, { opacity: 0 }, { opacity: 1, duration, ease: 'power2.inOut' });
    case 'fadeBlack': {
      const tl = gsap.timeline();
      tl.fromTo(container, { opacity: 0 }, { opacity: 1, duration, ease: 'power2.inOut' });
      return tl;
    }
    case 'slideLeft':
      return gsap.fromTo(container, { x: 800, opacity: 0 }, { x: 0, opacity: 1, duration, ease: 'power3.out' });
    case 'slideRight':
      return gsap.fromTo(container, { x: -800, opacity: 0 }, { x: 0, opacity: 1, duration, ease: 'power3.out' });
    case 'slideUp':
      return gsap.fromTo(container, { y: 600, opacity: 0 }, { y: 0, opacity: 1, duration, ease: 'power3.out' });
    case 'slideDown':
      return gsap.fromTo(container, { y: -600, opacity: 0 }, { y: 0, opacity: 1, duration, ease: 'power3.out' });
    case 'zoom':
      return gsap.fromTo(container, { scale: 0.5, opacity: 0 }, { scale: 1, opacity: 1, duration, ease: 'back.out(1.2)' });
    case 'flip':
      return gsap.fromTo(container, { rotationY: 90, opacity: 0 }, { rotationY: 0, opacity: 1, duration, ease: 'power2.out' });
    case 'rotate':
      return gsap.fromTo(container, { rotation: -180, scale: 0.5, opacity: 0 }, { rotation: 0, scale: 1, opacity: 1, duration, ease: 'power2.out' });
    case 'wipe':
      return gsap.fromTo(container, { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration, ease: 'power1.inOut' });
    case 'blur':
      return gsap.fromTo(container, { filter: 'blur(20px)', opacity: 0 }, { filter: 'blur(0px)', opacity: 1, duration, ease: 'power2.out' });
    case 'none':
      return null;
    default:
      if (name === 'none') return null;
      return gsap.fromTo(container, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power1.out' });
  }
}
