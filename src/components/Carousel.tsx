import { createSignal, onCleanup, Show } from "solid-js";
import CarouselElement, { type CarouselData } from "./CarouselElement.tsx";

import styles from "./Carousel.module.css";
import { onMount } from "solid-js";

function getEdgeRange(number: number, elements: CarouselData[]) {
  return elements.slice(number < 0 ? number : 0, number < 0 ? undefined : number);
}

const ILLUSION_ELEMENTS = 2;
export default function Carousel({ navDots, elements }: { elements: CarouselData[]; navDots: boolean }) {
  let carouselView: HTMLDivElement | undefined;
  let carouselScroll: HTMLUListElement | undefined;

  const [selected, setSelected] = createSignal<number>(0);
  const [observer, setObserver] = createSignal<IntersectionObserver>();
  const [scrolling, setScrolling] = createSignal<boolean>(false);
  const [illusionPointer, setIllusionPointer] = createSignal<number | undefined>(undefined);

  function slideCarouselTo(index: number, instant?: boolean) {
    carouselScroll!.scrollTo({
      behavior: instant ? "instant" : "smooth",
      left: (index + ILLUSION_ELEMENTS) * (carouselScroll!.clientWidth * 0.8), // item width 80%, TODO change to CSS var
    });
  }

  function changeSlide(delta: number) {
    const newIndex = selected() + delta;
    const isIllusion = newIndex > elements.length - 1 || newIndex < 0;
    const illusionTarget = newIndex < 0 ? elements.length - 1 : 0;

    setIllusionPointer(!isIllusion ? newIndex : illusionTarget);
    slideCarouselTo(newIndex);

    if (isIllusion) {
      carouselScroll!.querySelector<HTMLLIElement>(`li[data-index="${illusionTarget}"]`)!.dataset.active = "true";
    }
  }

  function scrollStart() {
    setScrolling(true);
  }

  function scrollEnd() {
    const realTarget = illusionPointer();
    if (realTarget === undefined) return;

    slideCarouselTo(realTarget, true);

    setScrolling(false);
  }

  onMount(() => {
    carouselScroll!.addEventListener("scroll", scrollStart);
    carouselScroll!.addEventListener("scrollend", scrollEnd);

    setObserver(
      new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setSelected(parseInt((entry.target as HTMLElement).dataset.index!));
            }
          });
        },
        {
          root: carouselView!,
          threshold: 0.5,
        }
      )
    );

    const items = carouselView!.querySelectorAll<HTMLLIElement>(`li`);
    items.forEach((item) => observer()!.observe(item));

    slideCarouselTo(selected(), true);
  });

  onCleanup(() => {
    if (carouselScroll) {
      carouselScroll.removeEventListener("scrollstart", scrollStart);
      carouselScroll.removeEventListener("scrollend", scrollEnd);
    }
    observer()?.disconnect();
  });

  return (
    <div class={styles.carousel__container}>
      <div class={styles.carousel__view} ref={carouselView}>
        <button type="button" class={styles.carousel__sliderBtn} onClick={() => changeSlide(-1)} disabled={scrolling()}>
          ←
        </button>

        <ul class={styles.carousel__scroll} ref={carouselScroll}>
          {[
            ...getEdgeRange(-ILLUSION_ELEMENTS, elements),
            ...elements,
            ...getEdgeRange(ILLUSION_ELEMENTS, elements),
          ].map((item, i, array) => {
            const isIllusion = i < ILLUSION_ELEMENTS || i >= array.length - ILLUSION_ELEMENTS;
            return (
              <CarouselElement
                {...item}
                index={i - ILLUSION_ELEMENTS}
                illusion={isIllusion}
                active={() => selected() == i - ILLUSION_ELEMENTS}
              />
            );
          })}
        </ul>

        <button type="button" class={styles.carousel__sliderBtn} onClick={() => changeSlide(1)} disabled={scrolling()}>
          →
        </button>
      </div>

      <Show when={navDots}>
        <nav class={styles.carousel__nav}>
          {elements.map((el, i) => (
            <button
              type="button"
              class={styles.carouselNav__btn}
              data-active={selected() == i}
              onClick={() => {
                slideCarouselTo(i);
              }}
            >
              <div class={styles.nav__btnInner} aria-hidden />
            </button>
          ))}
        </nav>
      </Show>
    </div>
  );
}
