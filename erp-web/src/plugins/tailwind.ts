import plugin from "tailwindcss/plugin";

/**
 * How to use custom plugin in tailwindcss
 * @see https://github.com/tailwindlabs/tailwindcss/discussions/13292#discussioncomment-14256365
 *
 * 注意：不要在 theme.colors 里展开几乎为空的 getColorPalettes()，否则会覆盖 Tailwind
 * 默认色板，导致 bg-gray-100 等工具类与编辑器补全全部消失。
 * 若需对接 Ant Design 色板，应在 createColorPalettes 中生成完整映射，或使用 extend 合并而非整表替换。
 */
export default plugin(() => {});
