<template>
  <div class="drag-resize-comp">
    <div class="body-content">
      <div class="drag-resize-content" id="drag-resize-content">
        <div v-for="(item, index) in dragResizableList" :key="uuidv4()">
          <DragResizable
            :url="item.url"
            :type="item.type"
            :color="item.color"
            :font-size="item.fontSize"
            :text="item.text"
            :position="item.position"
            :index="index"
            :z-index="item.zIndex"
            @deleteDragItem="deleteDragItem"
            @setCurIndex="setCurIndex"
          />
        </div>
      </div>
      <div class="operation">
        <el-button class="button" color="#626aef" @click="addImg">添加图片</el-button>
        <div class="slider-demo-block">
          <el-slider v-model="sizeValue" show-input size="small" @input="sizeChange" />
        </div>
        <el-input
          class="operation-input"
          v-model="textarea"
          :autosize="{ minRows: 2, maxRows: 4 }"
          type="textarea"
          placeholder="Please input"
          @input="inputChange"
        />
        <!-- <el-color-picker v-model="color" /> -->
        <div class="sketch-picker">
          <div class="color-picker-btn" :style="{ background: color }" @click="showSketchPicker"></div>
          <div class="sketch">
            <Sketch v-show="showSketch" v-model="color" :styles="{ backgroundColor: 'red'}" @update:modelValue="updateValue" />
          </div>
        </div>
        <el-button color="#626aef" @click="addText">添加文本</el-button>
        <div class="change-z-index">
          <el-button class="z-index-btn" color="#626aef" @click="changeZIndex('up')">上移</el-button>
          <el-button class="z-index-btn" color="#626aef" @click="changeZIndex('down')">下移</el-button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import DragResizable from '../../components/dragResizable/index.vue';
import { v4 as uuidv4 } from 'uuid';
import { Sketch } from "@lk77/vue3-color";
import './index.scss';

const dragResizableList: any = ref([]);
const color = ref('#000');
const fontSize = ref(18);
const textarea = ref('请输入文本');
const showSketch = ref(false);
const curIndex = ref(0);
const sizeValue = ref(18);

const imgInitPosi = {
  x: 250,
  y: 450,
  w: 100,
  h: 100
}

const textInitPosi = {
  x: 300,
  y: 300,
  w: 150,
  h: 100
}

function addImg() {
  let arr = dragResizableList.value;
  const obj = {
    type: 'img',
    url: '../../assets/cat.jpg',
    text: null,
    color: null,
    fontSize: null,
    position: JSON.parse(JSON.stringify(imgInitPosi)),
    active: false,
    zIndex: 10
  }
  arr.push(obj);
  console.log('arr', arr);
  dragResizableList.value = arr;
}

function addText() {
  color.value = '#000';
  textarea.value = '请输入文本';
  sizeValue.value = fontSize.value;
  let arr = dragResizableList.value;
  const obj = {
    type: 'text',
    url: null,
    text: '请输入文本',
    color: '#000',
    fontSize: fontSize.value,
    position: JSON.parse(JSON.stringify(textInitPosi)),
    active: false,
    zIndex: 10
  }
  arr.push(obj);
  console.log('arr', arr);
  dragResizableList.value = arr;
  curIndex.value = arr.length - 1;
}

function deleteDragItem(index: number) {
  console.log("delete-index", index);
  let arr = [...dragResizableList.value];
  arr.splice(index, 1);
  dragResizableList.value = [...arr];
}

function updateValue(item: any) {
  console.log(item);
  color.value = item.hex8;
  let arr = dragResizableList.value;
  let dragItem = arr[curIndex.value];
  if (dragItem.type === 'text') {
    dragItem.color = item.hex8;
  }
}

function showSketchPicker() {
  showSketch.value = !showSketch.value;
}

function setCurIndex(index: number) {
  curIndex.value = index;
  let arr = dragResizableList.value;
  let dragItem = arr[index];
  if (dragItem.type === 'text') {
    color.value = dragItem.color;
    textarea.value = dragItem.text;
    sizeValue.value = dragItem.fontSize;
  }
}

function changeZIndex(type: string) {
  let arr = [...dragResizableList.value];
  let dragItem = arr[curIndex.value];
  if (type === 'up') {
    dragItem.zIndex += 10;
  } else {
    dragItem.zIndex -= 10;
  }
}

function inputChange(value: string | number) {
  console.log('inputChange', value);
  let arr = dragResizableList.value;
  let dragItem = arr[curIndex.value];
  if (dragItem.type === 'text') {
    dragItem.text = value;
  }
}

function sizeChange(value: any) {
  console.log('sizeChange', value);
  let arr = dragResizableList.value;
  let dragItem = arr[curIndex.value];
  if (dragItem.type === 'text') {
    dragItem.fontSize = value;
  }
}

</script>