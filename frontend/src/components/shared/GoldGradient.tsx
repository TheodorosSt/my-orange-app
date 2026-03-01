/* ===================================
   ORANGE — SVG Gold Gradient Definition
   Include once at app root, reference everywhere.
   =================================== */

export function GoldGradientDefs() {
  return (
    <svg
      style={{ position: 'absolute', width: 0, height: 0 }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id="orangeGold"
          x1="0%"
          y1="100%"
          x2="100%"
          y2="0%"
          gradientUnits="objectBoundingBox"
        >
          <stop offset="0" stopColor="#785723" />
          <stop offset="0.02" stopColor="#99722d" />
          <stop offset="0.05" stopColor="#b68937" />
          <stop offset="0.08" stopColor="#bd8f39" />
          <stop offset="0.15" stopColor="#bf913a" />
          <stop offset="0.28" stopColor="#be994a" />
          <stop offset="0.4" stopColor="#be9e53" />
          <stop offset="0.43" stopColor="#c5ac65" />
          <stop offset="0.5" stopColor="#dad395" />
          <stop offset="0.55" stopColor="#cebc79" />
          <stop offset="0.6" stopColor="#c7ad67" />
          <stop offset="0.85" stopColor="#b28636" />
          <stop offset="0.95" stopColor="#a97e33" />
          <stop offset="0.98" stopColor="#8c6629" />
          <stop offset="1" stopColor="#64451b" />
        </linearGradient>

        <linearGradient
          id="orangeGoldHorizontal"
          x1="0%"
          y1="50%"
          x2="100%"
          y2="50%"
        >
          <stop offset="0" stopColor="#785723" />
          <stop offset="0.15" stopColor="#bf913a" />
          <stop offset="0.5" stopColor="#dad395" />
          <stop offset="0.85" stopColor="#b28636" />
          <stop offset="1" stopColor="#64451b" />
        </linearGradient>
      </defs>
    </svg>
  );
}