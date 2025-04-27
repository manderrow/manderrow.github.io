import { Show } from "solid-js";
import styles from "./ElegantGameIcons.module.css";

const DEBUG = false;

interface GameIconProps {
  point: number[];
  img: ImageMetadata;
}

const inflationConstant = 3;
const target = [0, 0];
const RAD_TO_DEG = 180 / Math.PI;
const PI_OVER_TWO = Math.PI / 2;

export const ICON_CLASS = styles.icon;

export default function ElegantGameIcons({ id, icons }: { id: string; icons: GameIconProps[] }) {
  return (
    <ul class={styles.icons} id={id}>
      {icons.map((icon) => (
        <ElegantGameIcon {...icon} />
      ))}
    </ul>
  );
}

function ElegantGameIcon({ point, img }: GameIconProps) {
  function fixAngle(angleDeg: number) {
    return (point[0] < 0 ? -(angleDeg + 90) - 90 : angleDeg) + 180;
    // return angleDeg;
  }

  // Visualization at https://www.desmos.com/calculator/bcwzbmdvod

  const deltaX = point[0] - target[0];
  const deltaY = point[1] - target[1];

  const minDiameter = Math.sqrt(deltaX ** 2 + deltaY ** 2);
  const radius = (minDiameter / 2) * inflationConstant;

  const midpointX = (target[0] + point[0]) / 2;
  const midpointY = (target[1] + point[1]) / 2;

  // cosine law, a = minDiameter, b = radius, c = radius
  const angleThetaRadians = Math.acos(minDiameter ** 2 / (2 * minDiameter * radius));
  const offset = radius * Math.sin(angleThetaRadians);

  const anglePhiRadians = PI_OVER_TWO - Math.atan((midpointX - point[0]) / (midpointY - point[1]));
  const opposite = Math.cos(anglePhiRadians) * offset;
  const adjacent = Math.sin(anglePhiRadians) * offset;

  const negative = point[0] < target[0];
  const x = midpointX + (negative ? -adjacent : adjacent);
  const y = midpointY + (negative ? opposite : -opposite);

  const center = [x, y];

  const angleStart = fixAngle(RAD_TO_DEG * Math.asin((center[1] - point[1]) / radius));
  const percentStart = angleStart / 360;
  const angleEnd = fixAngle(RAD_TO_DEG * Math.asin((center[1] - target[1]) / radius));
  const percentEnd = angleEnd / 360;

  return (
    <>
      <li
        class={styles.icon}
        style={{
          "--radius": `${radius}vmin`,
          "--x": `${center[0]}vmin`,
          "--y": `${center[1]}vmin`,
          "--offset": "0",
          "--rotation": "0deg",
          "--start": `${percentStart}`,
          "--diff": `${percentEnd - percentStart}`,
        }}
        data-negative={negative}
      >
        <img src={img.src} alt="" width={32} height={32} />
      </li>
      <Show when={DEBUG}>
        <li
          class={styles.dot}
          style={{
            "--x": `${center[0]}vmin`,
            "--y": `${center[1]}vmin`,
            "background-color": "black",
          }}
        ></li>
        <li
          class={styles.dot}
          style={{
            "--x": `${point[0]}vmin`,
            "--y": `${point[1]}vmin`,
            "background-color": "red",
          }}
        ></li>
        <li
          class={styles.test}
          style={{
            "--radius": `${radius}vmin`,
            "--x": `${center[0]}vmin`,
            "--y": `${center[1]}vmin`,
          }}
        ></li>
      </Show>
    </>
  );
}
