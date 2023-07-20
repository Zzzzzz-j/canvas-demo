<template>
  <div class="screenshot">
    <div class="choice-file">
      <input id="fileInput" type="file" @change="onFileChange" style="display: none;" />
      <el-button color="#626aef" @click="btnClick">上传文件</el-button>
    </div>
    <div class="canvas-content">
      <div class="canvas-box">
        <canvas ref="canvasRef" @mousedown="mouseDown" @mousemove="mouseMove"></canvas>
      </div>
      <div class="operation-view">
        <div class="view">
          <img v-if="imgUrl" :src="imgUrl" />
        </div>
        <div class="operation">
          <el-button color="#626aef" @click="screenshot">截图</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import {
  getMousePosi,
  getDotPosition,
  getDashPosition,
  checkSelectBoundary,
  getCursorStyle,
  handleMouseInfo,
  getPhotoData,
  getAnewXY,
} from '../../util';
import './index.scss';

const canvasRef: any = ref(null);
const imgUrl: any = ref(null);
const isScreenShot: any = ref(false);

let ctx: CanvasRenderingContext2D;

let initSize = {} as {
  width: number,
  height: number,
  proportion: number
};

let canvasSize = {} as {
  width: number;
  height: number;
};

let img: HTMLImageElement;
let imgSize = {} as {
  width: number,
  height: number
};
let imgScale: number; // 图片缩放比
let rotate: number = 0;

let mousePosi: number[][] = [];
let canChangeSelect: boolean = false;
let initMousePosi: {
  x: number,
  y: number
};

let cursorIndex: number;
let tempCursorIndex: number | null = null;
let resetSelect: boolean = false;

let selectPosi = {
  x: 0,
  y: 0,
  w: 0,
  h: 0
};

onMounted(() => {
  initSize = {
    width: 600,
    height: 600,
    proportion: 1,
  };
  ctx = canvasRef.value.getContext('2d') as CanvasRenderingContext2D;

  document.addEventListener('mouseup', () => {
    cancelChangeSelect();
  })
  console.log('ctx', ctx);
});

const btnClick = () => {
  const fileInput = document.getElementById('fileInput');
  fileInput?.click();
}

const onFileChange = (event: any) => {
  const file = event.target.files[0];
  // 读取文件内容
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => {
    img = new Image();
    img.onload = () => {
      initImageCanvas(img);
      calcCanvasSize();
      drawImage();  //绘画img
    };
    img.src = reader.result as any;
  };

  console.log('file', file);

}

/**
 * 计算canvas-size
 */
const calcCanvasSize = () => {
  console.log("canvasRef.value", canvasRef.value);
  let canvasWidth = Math.min(initSize.width, imgSize.width * imgScale);
  let canvasHeight = Math.min(initSize.height, imgSize.height * imgScale);

  if (rotate % 180 !== 0) {
    [canvasWidth, canvasHeight] = [canvasHeight, canvasWidth];
  };

  canvasRef.value.style.width = `${canvasWidth}px`;
  canvasRef.value.style.height = `${canvasHeight}px`;
  canvasRef.value.width = canvasWidth;
  canvasRef.value.height = canvasHeight;

  canvasSize = {
    width: canvasWidth,
    height: canvasHeight
  };

};

const initImageCanvas = (img: HTMLImageElement) => {
  console.log("initImageCanvas");
  const { width: imgWidth, height: imgHeight } = img;
  const imgProportion = imgWidth / imgHeight;

  imgSize = {
    width: imgWidth,
    height: imgHeight
  };

  if (imgWidth <= initSize.width && imgHeight <= initSize.height) {
    imgScale = 1;
    return;
  };

  if (imgProportion > initSize.proportion) {
    imgScale = initSize.width / imgWidth;
  } else {
    imgScale = initSize.height / imgHeight;
  };
};

/**
 * 绘画图片
 */
const drawImage = () => {
  let { width: canvasWidth, height: canvasHeight } = canvasSize;

  ctx.save();
  ctx.globalCompositeOperation = 'destination-over';
  ctx.translate(canvasWidth / 2, canvasHeight / 2);
  ctx.rotate(Math.PI / 180 * rotate);
  if (rotate % 180 !== 0) {
    [canvasWidth, canvasHeight] = [canvasHeight, canvasWidth];
  };
  ctx.translate(- canvasWidth / 2, - canvasHeight / 2);

  const scaleImgWidth = imgScale * imgSize.width;
  const scaleImgHeight = imgScale * imgSize.height;

  console.log((canvasWidth - scaleImgWidth), (canvasHeight - scaleImgHeight), scaleImgWidth, scaleImgHeight);

  ctx.drawImage(
    img,
    (canvasWidth - scaleImgWidth) / 2, (canvasHeight - scaleImgHeight) / 2,
    scaleImgWidth, scaleImgHeight
  );

  ctx.restore();
};

/**
 * 画蒙层
 */
const drawCover = () => {
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);
  // ctx.globalCompositeOperation = 'source-atop';
  ctx.restore();
};

const screenshot = () => {
  isScreenShot.value = true;
  drawCover();
}

/**
* mouseDown事件
* @param e 
*/
const mouseDown = (e: any) => {
  if (!isScreenShot.value) {
    return;
  }
  if (cursorIndex === 9) {
    resetSelect = true;
  };
  console.log(e, e.nativeEvent);
  canChangeSelect = true;
  initMousePosi = {
    x: e.offsetX,
    y: e.offsetY
  };
};

/**
 * 判断x,y是否在select路径上
 * @param pathX
 * @param pathY
 */
const checkInPath = (pathX: number, pathY: number, rectPosi: number[]) => {
  ctx.beginPath();
  // @ts-ignore
  ctx.rect(...rectPosi);
  const result = ctx.isPointInPath(pathX, pathY);
  ctx.closePath();
  return result;
};

/**
 * 鼠标滑动事件
 * @param e 
 */
const mouseMove = (e: any) => {
  if (!isScreenShot.value) {
    return;
  }

  const { offsetX, offsetY } = e;
  const pathX = offsetX;
  const pathY = offsetY;
  let cursor = 'crosshair';
  cursorIndex = 9;

  for (let i = 0; i < mousePosi.length; i++) {
    if (checkInPath(pathX, pathY, mousePosi[i])) {
      cursor = getCursorStyle(i);
      cursorIndex = i;
      break;
    }
  }

  canvasRef.value.style.cursor = cursor;

  if (!canChangeSelect) {
    return;
  };

  if (resetSelect) {
    selectPosi = {
      x: initMousePosi.x,
      y: initMousePosi.y,
      w: 4,
      h: 4
    };
    tempCursorIndex = 2;
    resetSelect = false;
  };

  const distanceX = offsetX - initMousePosi.x;
  const distanceY = offsetY - initMousePosi.y;

  selectPosi = handleMouseInfo(
    tempCursorIndex !== null ? tempCursorIndex : cursorIndex,
    selectPosi,
    { x: distanceX, y: distanceY }
  );
  selectPosi = checkSelectBoundary(canvasSize.width, canvasSize.height, selectPosi);

  drawSelect(selectPosi.x, selectPosi.y, selectPosi.w, selectPosi.h);

  initMousePosi = {
    x: offsetX,
    y: offsetY
  };

  if (tempCursorIndex === null) {
    tempCursorIndex = cursorIndex;
  };
};

/**
 * 绘画选择框
 * @param x 
 * @param y 
 * @param w 
 * @param h 
 */
const drawSelect = (x: number, y: number, w: number, h: number) => {
  ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);
  drawCover();
  ctx.save();
  ctx.clearRect(x, y, w, h);
  ctx.strokeStyle = '#5696f8';
  ctx.strokeRect(x, y, w, h);

  ctx.fillStyle = '#5696f8';
  const dots = getDotPosition(x, y, w, h);
  //@ts-ignore
  dots.map(v => ctx.fillRect(...v));

  ctx.lineWidth = 1;
  ctx.strokeStyle = 'rgba(255, 255, 255, .75)';
  const dashs = getDashPosition(x, y, w, h);
  dashs.map(v => {
    ctx.beginPath();
    ctx.setLineDash([2, 4]);
    ctx.moveTo(v[0], v[1]);
    ctx.lineTo(v[2], v[3]);
    ctx.closePath();
    ctx.stroke();
    return null;
  });

  ctx.restore();

  drawImage();

  mousePosi = getMousePosi(x, y, w, h);
  mousePosi.push([selectPosi.x, selectPosi.y, selectPosi.w, selectPosi.h]);
};

/**
 * 移动取消
 */
const cancelChangeSelect = async () => {
  if (!isScreenShot.value) {
    return;
  }
  if (selectPosi.w < 0 || selectPosi.h < 0) {
    selectPosi = getAnewXY(selectPosi);
    const { x, y, w, h } = selectPosi;
    mousePosi = getMousePosi(x, y, w, h);
  };

  if (canChangeSelect) {
    const blob = await getPhotoData({
      imgSize,
      rotate,
      img,
      canvasSize,
      imgScale,
      selectPosi
    }) as Blob;
    const newDataUrl = window.URL.createObjectURL(blob);
    imgUrl.value = newDataUrl;
  };

  canChangeSelect = false;
  tempCursorIndex = null;
};
</script>