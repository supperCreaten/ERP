import type { IconComponentProps } from "@ant-design/icons/lib/components/Icon";

import Icon from "@ant-design/icons";
import { createElement } from "react";
import type { ComponentType, ReactElement, SVGProps } from "react";
import createComponent from "@/components/CreateComponent";

type SvgIconComponent = ComponentType<SVGProps<SVGSVGElement>>;

interface IconItem {
  label: ReactElement<SVGProps<SVGSVGElement>>;
  value: string;
}
const MENU_ICON_CLASS = "app-menu-themed-icon";

// Eagerly load all SVG files in the svg directory.
const svgModules = import.meta.glob("./svg/*.svg", {
  query: "?react",
  import: "default",
  eager: true,
}) as Record<string, SvgIconComponent>;

const iconMap: Record<string, SvgIconComponent> = Object.fromEntries(
  Object.entries(svgModules).map(([path, SvgComponent]) => {
    const iconName = path.replace(/^\.\/svg\/(.*)\.svg$/, "$1");
    return [iconName, SvgComponent];
  }),
) as Record<string, SvgIconComponent>;

/** 包装 SVG，使 path 上的硬编码 fill 可被 CSS 覆盖为 currentColor */
function createThemedSvgComponent(SvgComponent: SvgIconComponent): SvgIconComponent {
  return function ThemedSvg(props: SVGProps<SVGSVGElement>) {
    return createElement(SvgComponent, {
      ...props,
      className: [MENU_ICON_CLASS, props.className].filter(Boolean).join(" ") || undefined,
      focusable: "false",
      "aria-hidden": true,
    });
  };
}

export const createIconList = (): Array<IconItem> => {
  const iconList: IconItem[] = [];
  for (const item in iconMap) {
    const temp: IconItem = {
      label: createElement("div", {
        style: {
          display: "flex",
          alignItems: "center",
        },
        children: [createElement(iconMap[item], { width: "2em", height: "2em", key: item }), createElement("span", { children: item, style: { marginLeft: "5px" } })],
      }),
      value: item,
    };
    iconList.push(temp);
  }
  return iconList;
};
export function createIconifyIcon(iconPath: string) {
  const iconName = iconPath.replace(/^svg:/, "");
  const SvgComponent = iconMap[iconName];
  if (!SvgComponent) {
    return () => null;
  }
  const ThemedSvg = createThemedSvgComponent(SvgComponent);
  return function IconComponent(props: IconComponentProps) {
    const { className, style, ...rest } = props;
    return createElement(Icon, {
      ...rest,
      className: [MENU_ICON_CLASS, className].filter(Boolean).join(" ") || undefined,
      component: ThemedSvg,
      style: { color: "inherit", ...style },
    });
  };
}
