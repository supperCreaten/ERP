import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";

export type CropBox = {
  x: number;
  y: number;
  size: number;
};

export type CropFrame = {
  stageWidth: number;
  stageHeight: number;
  box: CropBox;
  naturalWidth: number;
  naturalHeight: number;
};

type FixedImageCropperProps = {
  imageSrc: string;
  zoom: number;
  rotation: number;
  /** 裁剪框边长（舞台坐标 px） */
  cropViewPx?: number;
  onCropFrameChange: (frame: CropFrame) => void;
};

/** 裁剪框可活动范围（相对舞台左上角） */
type Bounds = {
  minX: number;
  minY: number;
  /** 右边界（开区间外沿） */
  right: number;
  /** 下边界（开区间外沿） */
  bottom: number;
  maxSize: number;
};

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function clampBox(box: CropBox, bounds: Bounds): CropBox {
  const size = Math.min(box.size, bounds.maxSize);
  const maxX = Math.max(bounds.minX, bounds.right - size);
  const maxY = Math.max(bounds.minY, bounds.bottom - size);
  return {
    size,
    x: clamp(box.x, bounds.minX, maxX),
    y: clamp(box.y, bounds.minY, maxY),
  };
}

/**
 * 用图片元素真实渲染盒（含 transform）与舞台求交，得到裁剪框活动范围。
 */
function measureCropBounds(
  stageEl: HTMLElement,
  imageEl: HTMLElement | null,
): Bounds | null {
  const stageRect = stageEl.getBoundingClientRect();
  const stageW = stageRect.width;
  const stageH = stageRect.height;
  if (stageW <= 0 || stageH <= 0) return null;

  if (!imageEl) {
    return { minX: 0, minY: 0, right: stageW, bottom: stageH, maxSize: Math.min(stageW, stageH) };
  }

  const imgRect = imageEl.getBoundingClientRect();
  const imgLeft = imgRect.left - stageRect.left;
  const imgTop = imgRect.top - stageRect.top;
  const imgRight = imgLeft + imgRect.width;
  const imgBottom = imgTop + imgRect.height;

  const minX = Math.max(0, imgLeft);
  const minY = Math.max(0, imgTop);
  const right = Math.min(stageW, imgRight);
  const bottom = Math.min(stageH, imgBottom);
  const maxSize = Math.max(0, Math.min(right - minX, bottom - minY));

  if (maxSize <= 0) {
    return { minX: 0, minY: 0, right: stageW, bottom: stageH, maxSize: Math.min(stageW, stageH) };
  }

  return { minX, minY, right, bottom, maxSize };
}

/**
 * 图片固定居中（cover 铺满 + 缩放/旋转），拖拽移动正方形裁剪框。
 * 裁剪框严格限制在图片可视区域内。
 */
export function FixedImageCropper({
  imageSrc,
  zoom,
  rotation,
  cropViewPx = 220,
  onCropFrameChange,
}: FixedImageCropperProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const boundsRef = useRef<Bounds | null>(null);
  const initializedRef = useRef(false);
  const [natural, setNatural] = useState({ w: 0, h: 0 });
  const [stageSize, setStageSize] = useState({ w: 0, h: 0 });
  const [box, setBox] = useState<CropBox>({ x: 0, y: 0, size: cropViewPx });
  const [coverBaseSize, setCoverBaseSize] = useState<{ width: number; height: number } | null>(null);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);

  const syncBoundsAndClamp = useCallback(
    (centerIfNeeded = false) => {
      const stageEl = stageRef.current;
      if (!stageEl) return;
      const bounds = measureCropBounds(stageEl, imageRef.current);
      boundsRef.current = bounds;
      if (!bounds || bounds.maxSize <= 0) return;

      const size = Math.min(cropViewPx, bounds.maxSize);
      setBox((prev) => {
        if (!initializedRef.current || centerIfNeeded) {
          initializedRef.current = true;
          return clampBox(
            {
              size,
              x: bounds.minX + (bounds.right - bounds.minX - size) / 2,
              y: bounds.minY + (bounds.bottom - bounds.minY - size) / 2,
            },
            bounds,
          );
        }
        return clampBox({ ...prev, size }, bounds);
      });
    },
    [cropViewPx],
  );

  useEffect(() => {
    initializedRef.current = false;
    const img = new Image();
    img.onload = () => setNatural({ w: img.naturalWidth, h: img.naturalHeight });
    img.src = imageSrc;
  }, [imageSrc]);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const sync = () => {
      const rect = el.getBoundingClientRect();
      setStageSize({ w: rect.width, h: rect.height });
    };
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!natural.w || !stageSize.w) {
      setCoverBaseSize(null);
      return;
    }
    const baseScale = Math.max(stageSize.w / natural.w, stageSize.h / natural.h);
    setCoverBaseSize({
      width: natural.w * baseScale,
      height: natural.h * baseScale,
    });
  }, [natural.w, natural.h, stageSize.w, stageSize.h]);

  /** 图片尺寸 / 变换就绪后，按真实渲染盒夹紧裁剪框 */
  useLayoutEffect(() => {
    if (!coverBaseSize) return;
    // 等浏览器应用 transform 后再测量
    const id = requestAnimationFrame(() => {
      syncBoundsAndClamp(!initializedRef.current);
    });
    return () => cancelAnimationFrame(id);
  }, [coverBaseSize, zoom, rotation, imageSrc, syncBoundsAndClamp]);

  useEffect(() => {
    if (!natural.w || !stageSize.w || box.size <= 0) return;
    onCropFrameChange({
      stageWidth: stageSize.w,
      stageHeight: stageSize.h,
      box,
      naturalWidth: natural.w,
      naturalHeight: natural.h,
    });
  }, [box, natural, stageSize, onCropFrameChange]);

  const onPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      // 拖拽开始前刷新边界，避免缩放/旋转后仍用旧范围
      syncBoundsAndClamp(false);
      dragRef.current = {
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        originX: box.x,
        originY: box.y,
      };
    },
    [box.x, box.y, syncBoundsAndClamp],
  );

  const onPointerMove = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    const bounds = boundsRef.current;
    if (!drag || drag.pointerId !== e.pointerId || !bounds) return;
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    setBox((prev) =>
      clampBox(
        {
          ...prev,
          x: drag.originX + dx,
          y: drag.originY + dy,
        },
        bounds,
      ),
    );
  }, []);

  const onPointerUp = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    if (dragRef.current?.pointerId === e.pointerId) {
      dragRef.current = null;
      // 松手后再夹紧一次，消除亚像素偏差
      syncBoundsAndClamp(false);
    }
  }, [syncBoundsAndClamp]);

  return (
    <div ref={stageRef} className="avatar-crop-upload__fixed-stage">
      {natural.w > 0 && coverBaseSize ? (
        <div className="avatar-crop-upload__fixed-media" aria-hidden>
          <img
            ref={imageRef}
            src={imageSrc}
            alt=""
            draggable={false}
            style={{
              width: coverBaseSize.width,
              height: coverBaseSize.height,
              transform: `translate(-50%, -50%) rotate(${rotation}deg) scale(${zoom})`,
            }}
            onLoad={() => syncBoundsAndClamp(true)}
          />
        </div>
      ) : null}

      <div
        className="avatar-crop-upload__crop-box"
        style={{
          width: box.size,
          height: box.size,
          transform: `translate(${box.x}px, ${box.y}px)`,
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        role="presentation"
        aria-label="拖动裁剪框"
      />
    </div>
  );
}
