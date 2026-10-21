export const loadingId = "loading-e8a3a985";
export const loadingContainerId = "loading-container-e8a3a985";

/**
 * 首屏 loading 已内联在 index.html；此处仅作兜底（例如 HTML 被改坏时）。
 * 切勿依赖 store：setupLoading 应尽早可调用，避免拉长白屏窗口。
 */
export function setupLoading() {
  if (document.getElementById(loadingContainerId)) {
    return;
  }

  const loading = `
<style>
#${loadingContainerId} {
	position: fixed;
	inset: 0;
	z-index: 9999999;
	display: flex;
	align-items: center;
	justify-content: center;
	height: 100vh;
	width: 100vw;
	background-color: #fff;
	overflow: hidden;
}
#${loadingId},
#${loadingId}::before,
#${loadingId}::after {
	width: 2.5em;
	height: 2.5em;
	border-radius: 50%;
	animation: animation-loader 1.8s infinite ease-in-out;
	animation-fill-mode: both;
}

#${loadingId} {
	position: relative;
	top: 0;
	margin: 80px auto;
	font-size: 10px;
	color: #1677ff;
	text-indent: -9999em;
	transform: translateZ(0);
	transform: translate(-50%, 0);
	animation-delay: -0.16s;
}

#${loadingId}::before,
#${loadingId}::after {
	position: absolute;
	top: 0;
	content: "";
}

#${loadingId}::before {
	left: -3.5em;
	animation-delay: -0.32s;
}

#${loadingId}::after {
	left: 3.5em;
}

@keyframes animation-loader {
	0%,
	80%,
	100% {
		box-shadow: 0 2.5em 0 -1.3em;
	}

	40% {
		box-shadow: 0 2.5em 0 0;
	}
}
</style>
<div id="${loadingId}">Loading</div>
`;
  const loadingDiv = document.createElement("div");
  loadingDiv.id = loadingContainerId;
  loadingDiv.setAttribute("aria-busy", "true");
  loadingDiv.setAttribute("aria-live", "polite");
  loadingDiv.innerHTML = loading;

  const app = document.getElementById("root");
  if (app) {
    app.before(loadingDiv);
  }
}
