<template>
  <div class="easy-screenshot">
    <div class="choice-file">
      <input id="fileInput" type="file" @change="onFileChange" style="display: none;" />
      <el-button color="#626aef" @click="btnClick">上传文件</el-button>
    </div>
    <div class="canvas-content">
      <div class="canvas-box">
        <canvas  v-if="isDraw" id="drawcanvas" class="draw-canvas" @mousedown="mouseDown" @mousemove="mouseMove"></canvas>
        <canvas id="clipcanvas"></canvas>
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
<script lang="ts" setup>
import { ref, onMounted, nextTick } from 'vue';
import './index.scss';

const isDraw = ref(false);
const imgUrl = ref('');
const startPosi: any = ref(null);
const endPosi: any = ref(null);

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

onMounted(() => {
  initSize = {
    width: 600,
    height: 600,
    proportion: 1,
  };

  document.addEventListener('mouseup', () => {
    cancelChangeSelect();
  });
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
 * 计算canvas-size
 */
const calcCanvasSize = () => {
  let canvasWidth = Math.min(initSize.width, imgSize.width * imgScale);
  let canvasHeight = Math.min(initSize.height, imgSize.height * imgScale);

  const clipCanvas = document.getElementById('clipcanvas') as HTMLCanvasElement;
  clipCanvas.style.width = `${canvasWidth}px`;
  clipCanvas.style.height = `${canvasHeight}px`;
  clipCanvas.width = canvasWidth;
  clipCanvas.height = canvasHeight;

  canvasSize = {
    width: canvasWidth,
    height: canvasHeight
  };

};

/**
 * 绘画图片
 */
const drawImage = () => {
  let { width: canvasWidth, height: canvasHeight } = canvasSize;

  const canvas = document.getElementById('clipcanvas') as HTMLCanvasElement;
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
  ctx.save();
  ctx.globalCompositeOperation = 'destination-over';
  ctx.translate(canvasWidth / 2, canvasHeight / 2);
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

const screenshot = () => {
  isDraw.value = true;
  drawCover();
}

/**
 * 画蒙层
 */
const drawCover = () => {
  nextTick(() => {
    const drawCanvas = document.getElementById('drawcanvas') as HTMLCanvasElement;
    const ctx = drawCanvas.getContext('2d') as CanvasRenderingContext2D;
    drawCanvas.style.width = `${canvasSize.width}px`;
    drawCanvas.style.height = `${canvasSize.height}px`;
    drawCanvas.width = canvasSize.width;
    drawCanvas.height = canvasSize.height;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.strokeStyle = 'rgba(0, 143, 255, 1)';
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);
  });
};

/**
* mouseDown事件
* @param e 
*/
const mouseDown = (e: any) => {
  startPosi.value = {
    x: e.offsetX,
    y: e.offsetY
  };
};

/**
* mouseMove事件
* @param e 
*/
const mouseMove = (e: any) => {
  if (startPosi.value) {
    const start = startPosi.value;
    fill(start.x, start.y, e.offsetX - start.x, e.offsetY - start.y);
  };
};

/**
 * 移动取消
 */
const cancelChangeSelect = async () => {
  if (!isDraw.value) {
    return;
  }
  console.log('cancelChangeSelect');
  isDraw.value = false;
  const canvas = document.createElement("canvas");
  canvas.width = endPosi.value.w;
  canvas.height = endPosi.value.h;

  const clipcanvas = document.getElementById('clipcanvas') as HTMLCanvasElement;
  const ctx = clipcanvas.getContext('2d') as CanvasRenderingContext2D;
  const data = ctx.getImageData(endPosi.value.x, endPosi.value.y, endPosi.value.w, endPosi.value.h);

  const context = canvas.getContext("2d") as any;
  context.putImageData(data,0,0);
  imgUrl.value = canvas.toDataURL("image/png",1);
  startPosi.value = null;
  endPosi.value = null;
};

const fill = (x: number, y: number, w: number, h: number) => {
  const drawcanvas = document.getElementById('drawcanvas') as HTMLCanvasElement;
  const ctx = drawcanvas.getContext('2d') as CanvasRenderingContext2D;
  ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);
  ctx.beginPath();
  //遮罩层
  ctx.globalCompositeOperation = "source-over";
  ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);
  //画框
  // ctx.globalCompositeOperation = 'destination-out';
  // ctx.fillRect(x, y, w, h);
  ctx.clearRect(x, y, w, h);
  //描边
  ctx.globalCompositeOperation = "source-over";
  ctx.moveTo(x, y);
  ctx.lineTo(x + w, y);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x, y + h);
  ctx.lineTo(x, y);
  ctx.stroke();
  ctx.closePath();

  endPosi.value = {
    x,
    y,
    w,
    h
  };
}
</script>