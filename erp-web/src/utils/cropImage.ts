/** 加载跨域图片（导出裁剪用） */
export function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });
}

export function getRadianAngle(degreeValue: number) {
  return (degreeValue * Math.PI) / 180;
}

export type VisibleCropInput = {
  imageSrc: string;
  stageWidth: number;
  stageHeight: number;
  box: { x: number; y: number; size: number };
  naturalWidth: number;
  naturalHeight: number;
  zoom: number;
  rotation: number;
};

/**
 * 按舞台上的固定图片 + 可移动正方形裁剪框导出高清 Blob。
 * 图片以 cover 铺满舞台，再应用 zoom / rotation；裁剪框为舞台坐标。
 */
export async function cropVisibleRegion(input: VisibleCropInput): Promise<Blob | null> {
  const {
    imageSrc,
    stageWidth,
    stageHeight,
    box,
    naturalWidth,
    naturalHeight,
    zoom,
    rotation,
  } = input;
  if (stageWidth <= 0 || stageHeight <= 0 || box.size <= 0 || naturalWidth <= 0) {
    return null;
  }

  const image = await createImage(imageSrc);
  const baseScale = Math.max(stageWidth / naturalWidth, stageHeight / naturalHeight);
  const outSize = Math.max(1, Math.round(box.size / (baseScale * zoom)));
  const scale = outSize / box.size;

  const canvas = document.createElement("canvas");
  canvas.width = outSize;
  canvas.height = outSize;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const cropCenterX = box.x + box.size / 2;
  const cropCenterY = box.y + box.size / 2;
  const imgCenterX = stageWidth / 2;
  const imgCenterY = stageHeight / 2;

  ctx.translate(outSize / 2, outSize / 2);
  ctx.translate((imgCenterX - cropCenterX) * scale, (imgCenterY - cropCenterY) * scale);
  ctx.rotate(getRadianAngle(rotation));
  const drawScale = baseScale * zoom * scale;
  ctx.drawImage(
    image,
    (-naturalWidth / 2) * drawScale,
    (-naturalHeight / 2) * drawScale,
    naturalWidth * drawScale,
    naturalHeight * drawScale,
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("裁剪失败"));
      },
      "image/png",
      1,
    );
  });
}
