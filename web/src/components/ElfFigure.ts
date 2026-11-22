import { defineComponent, h, type CSSProperties, type VNode } from "vue";

/**
 * Un elfo hecho con formas CSS (gorro con pompón, túnica en zigzag, cinturón,
 * medias de rayas y zapatos curvados). Copia de `elf()` del prototipo.
 */
export default defineComponent({
  name: "ElfFigure",
  props: {
    walk: { type: Boolean, default: false },
    wave: { type: Boolean, default: false },
    scale: { type: Number, default: 1 },
    hat: { type: String, default: "#BC4749" },
    tunic: { type: String, default: "#6A994E" },
  },
  setup(props) {
    const skin = "#F4C9A3";
    const stripes = "repeating-linear-gradient(180deg,#BC4749 0 4px,#fff 4px 8px)";
    const px = (style: Record<string, string | number>): CSSProperties => {
      const out: Record<string, string> = {};
      for (const [key, value] of Object.entries(style)) {
        const unitless = key === "opacity" || key === "zIndex";
        out[key] = typeof value === "number" && !unitless ? `${value}px` : String(value);
      }
      return out as CSSProperties;
    };
    const d = (style: Record<string, string | number>, ...children: VNode[]) =>
      h("div", { style: { position: "absolute", ...px(style) } }, children);

    const leg = (left: number, anim: string) =>
      d(
        {
          top: 74,
          left,
          width: 9,
          height: 30,
          transformOrigin: "top center",
          animation: props.walk ? `${anim} .45s ease-in-out infinite` : "none",
        },
        d({ inset: 0, background: stripes, borderRadius: 3, border: "1px solid #386641" }),
        d({
          top: 25,
          left: left < 30 ? -8 : -1,
          width: 18,
          height: 9,
          background: "#386641",
          borderRadius: left < 30 ? "10px 4px 4px 4px" : "4px 10px 4px 4px",
        }),
        d({ top: 21, left: left < 30 ? -11 : 14, width: 6, height: 6, borderRadius: "50%", background: "#A7C957" }),
      );

    const arm = (left: number, rot: number, anim?: string) =>
      d(
        {
          top: 52,
          left,
          width: 9,
          height: 22,
          background: props.tunic,
          borderRadius: 5,
          transformOrigin: "top center",
          transform: `rotate(${rot}deg)`,
          animation: anim ?? "none",
          border: "1px solid #386641",
        },
        d({ bottom: -6, left: -1, width: 10, height: 10, borderRadius: "50%", background: skin }),
      );

    return () =>
      h(
        "div",
        {
          style: {
            position: "relative",
            width: "60px",
            height: "112px",
            transform: `scale(${props.scale})`,
            transformOrigin: "bottom center",
          },
        },
        [
          leg(19, "legA"),
          leg(33, "legB"),
          arm(6, 25),
          arm(45, -25, props.wave ? "wave 1s ease-in-out infinite" : undefined),
          d({
            top: 50,
            left: 11,
            width: 38,
            height: 32,
            background: props.tunic,
            clipPath:
              "polygon(18% 0,82% 0,100% 78%,88% 100%,76% 84%,63% 100%,50% 84%,37% 100%,24% 84%,12% 100%,0 78%)",
          }),
          d({ top: 64, left: 14, width: 32, height: 5, background: "#386641" }),
          d({ top: 62, left: 25, width: 6, height: 5, border: "2px solid #F2E8CF", borderRadius: 2 }),
          d({ top: 29, left: 5, width: 13, height: 12, background: skin, clipPath: "polygon(0 0,100% 40%,100% 100%)" }),
          d({ top: 29, left: 42, width: 13, height: 12, background: skin, clipPath: "polygon(100% 0,0 40%,0 100%)" }),
          d({ top: 22, left: 14, width: 32, height: 31, borderRadius: "50%", background: skin }),
          d({ top: 31, left: 19, width: 8, height: 2, background: "#386641", transform: "rotate(18deg)", borderRadius: 2 }),
          d({ top: 31, left: 33, width: 8, height: 2, background: "#386641", transform: "rotate(-18deg)", borderRadius: 2 }),
          d({ top: 35, left: 22, width: 4, height: 5, borderRadius: "50%", background: "#2b2b2b", animation: "blink 4s infinite" }),
          d({ top: 35, left: 34, width: 4, height: 5, borderRadius: "50%", background: "#2b2b2b", animation: "blink 4s infinite" }),
          d({ top: 41, left: 17, width: 6, height: 4, borderRadius: "50%", background: "#E79A8E" }),
          d({ top: 41, left: 37, width: 6, height: 4, borderRadius: "50%", background: "#E79A8E" }),
          d({
            top: 41,
            left: 25,
            width: 12,
            height: 6,
            borderBottom: "2px solid #8a3a33",
            borderRadius: "0 0 10px 6px",
            transform: "rotate(-8deg)",
          }),
          d({
            top: -12,
            left: 14,
            width: 34,
            height: 36,
            background: props.hat,
            clipPath: "polygon(0 100%,100% 100%,72% 35%,108% 2%,48% 18%)",
          }),
          d({ top: -16, left: 44, width: 11, height: 11, borderRadius: "50%", background: "#fff", border: "1px solid #F2E8CF" }),
          d({ top: 19, left: 11, width: 38, height: 8, background: "#F2E8CF", borderRadius: 5 }),
        ],
      );
  },
});
