import { createSignal, onCleanup, Show } from "solid-js";
import CarouselElement, { type CarouselData } from "./CarouselElement.tsx";

import styles from "./Carousel.module.css";
import { onMount } from "solid-js";

function getEdgeRange(number: number, elements: CarouselData[]) {
  return elements.slice(number < 0 ? number : 0, number < 0 ? undefined : number);
}

export default function Carousel({ navDots, elements }: { elements: CarouselData[]; navDots: boolean }) {
  let carouselView!: HTMLDivElement;
  const idToIndex: Map<string, number> = new Map(elements.map((el, i) => [el.id, i]));
  const idToElement: Map<string, HTMLLIElement> = new Map();

  const [selected, setSelected] = createSignal<string>(elements[0].id);
  const [observer, setObserver] = createSignal<IntersectionObserver>();

  function slideCarouselTo(id: string) {
    idToElement.get(id)!.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function changeSlide(delta: number) {
    const currentIndex = idToIndex.get(selected())!;

    let newIndex = currentIndex + delta;
    if (newIndex >= elements.length) {
      newIndex = 0; // Loop from front to back
    } else if (newIndex < 0) {
      newIndex = elements.length - 1; // Loop from back to front
    }

    idToElement.get(elements[newIndex].id)!.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  onMount(() => {
    setObserver(
      new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setSelected((entry.target as HTMLElement).dataset.carouselId!);
            }
          });
        },
        {
          root: carouselView,
          threshold: 0.5,
        }
      )
    );

    const items = carouselView.querySelectorAll<HTMLLIElement>(`li[data-illusion="false"]`);
    items.forEach((item) => observer()!.observe(item));
  });

  onCleanup(() => {
    observer()?.disconnect();
  });

  return (
    <div class={styles.carousel__container}>
      <div class={styles.carousel__view} ref={carouselView}>
        <button type="button" class={styles.carousel__sliderBtn} onClick={() => changeSlide(-1)}>
          ←
        </button>

        <ul class={styles.carousel__scroll}>
          {[...getEdgeRange(-2, elements), ...elements, ...getEdgeRange(2, elements)].map((item, i, array) => {
            const isIllusion = i < 2 || i >= array.length - 2;
            return (
              <CarouselElement
                {...item}
                illusion={isIllusion}
                active={() => selected() == item.id}
                ref={(element: HTMLLIElement) => {
                  if (!isIllusion) {
                    idToElement.set(item.id, element);
                  }
                }}
              />
            );
          })}
        </ul>

        <button type="button" class={styles.carousel__sliderBtn} onClick={() => changeSlide(1)}>
          →
        </button>
      </div>

      <Show when={navDots}>
        <nav class={styles.carousel__nav}>
          {elements.map((el) => (
            <button
              type="button"
              class={styles.carouselNav__btn}
              data-active={selected() == el.id}
              onClick={() => {
                slideCarouselTo(el.id);
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
