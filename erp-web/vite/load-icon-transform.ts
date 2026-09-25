export async function loadIconTransform(isDev: boolean) {
  if (isDev) {
    return undefined;
  }

  const { cleanupSVG, isEmptyColor, parseColors, runSVGO, SVG } =
    await import("@iconify/tools");

  return (svg: string, collection: string) => {
    if (collection === "svg") {
      const svgObject = new SVG(svg);
      cleanupSVG(svgObject);
      runSVGO(svgObject);
      parseColors(svgObject, {
        defaultColor: "currentColor",
        callback: (attr: string, colorStr: string, color: unknown) => {
          if (!color) {
            throw new Error(`Invalid color: "${colorStr}" in attribute ${attr}`);
          }
          if (isEmptyColor(color)) {
            return color;
          }
          return color;
        },
      });
      return svgObject.toString({ height: "1em", width: "1em" });
    }
    return svg;
  };
}
