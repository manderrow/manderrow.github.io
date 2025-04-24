import type { Accessor } from "solid-js";
import styles from "./CarouselElement.module.css";

export interface CarouselData {
  id: string;
  subtitle?: string;
  image?: { src: string; alt: string };
}

export interface CarouselElementProps extends CarouselData {
  illusion: boolean;
  active: Accessor<boolean>;
  ref: (element: HTMLLIElement) => void;
}

export default function CarouselElement({ id, image, illusion, active, ref }: CarouselElementProps) {
  return (
    <li class={styles.carousel__item} data-illusion={illusion} data-carousel-id={id} data-active={active()} ref={ref}>
      <div class={styles.item__container}>
        {image != null ? <img src={image.src} alt={image.alt} class={styles.carousel__image} /> : <slot />}
      </div>
    </li>
  );
}
