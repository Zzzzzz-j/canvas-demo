<template>
  <div class="drag-resizable">
    <Vue3DraggableResizable
      :x="posi.x"
      :y="posi.y"
      :w="posi.w"
      :h="posi.h"
      :active="active"
      :draggable="true"
      :resizable="true"
      :disabledH="type === 'text'"
      referenceLineColor = "#0f0"
      @activated="actived"
      @deactivated="print('deactivated')"
      @drag-start="print('drag-start')"
      @resize-start="print('resize-start')"
      @dragging="print('dragging')"
      @resizing="resizing"
      @drag-end="dragEnd"
      @resize-end="resizeEnd"
      :style="{ zIndex: zIndex }"
      :handles="type === 'img' ? imgHandles : textHandles"
    >
      <img v-show="type === 'img'" src="../../assets/cat.jpg" :style="{ width: posi.w + 'px', height: posi.h + 'px' }" />
      <div class="drag-text" v-show="type === 'text'" :style="{ color: color, fontSize: fontSize + 'px' }">{{ text }}</div>
      <img class="close-img" src="../../assets/close-circle-fill.png" @click="deleteDrag" />
    </Vue3DraggableResizable>
  </div>
</template>

<script setup>
import { defineProps, ref, onMounted, defineEmits } from 'vue'
import Vue3DraggableResizable from 'vue3-draggable-resizable'
//default styles
import 'vue3-draggable-resizable/dist/Vue3DraggableResizable.css'

const props = defineProps({
  position: {
    type: Object,
    default: () => {},
  },
  url: {
    type: String,
    default: null,
  },
  text: {
    type: String,
    default: '',
  },
  color: {
    type: String,
    default: '#000',
  },
  fontSize: {
    type: Number,
    default: 16,
  },
  type: {
    type: String,
    default: 'img',
  },
  index: {
    type: Number,
    default: 0,
  },
  zIndex: {
    type: Number,
    default: 10,
  },
});

const imgHandles = ['tl', 'tm', 'tr', 'ml', 'mr', 'bl', 'bm', 'br'];
const textHandles = ['ml', 'mr'];

const emits = defineEmits(['deleteDragItem', 'setCurIndex']);
const posi = ref({x: 100, y: 100, w: 100, h: 100});
const active = ref(false);

onMounted(() => {
  posi.value = props.position;
})

function print(val) {
  console.log(val, '  ', props.index)
}

function resizing(value) {
  posi.value = value;
  console.log(value);
}

function dragEnd(value) {
  let obj = posi.value;
  obj.x = value.x;
  obj.y = value.y;
  posi.value = obj;
  console.log('dragEnd', value, posi.value);
}

function resizeEnd(value) {
  posi.value = value;
  console.log('resizeEnd', value);
}

function deleteDrag() {
  console.log('deleteDrag', props.index);
  emits('deleteDragItem', props.index);
}

function actived() {
  active.value = true;
  emits('setCurIndex', props.index);
}

</script>
<style>
.drag-resizable {
  width: 100%;
  height: 100%;
}

.drag-text {
  cursor: default;
}

.close-img {
  width: 24px;
  height: 24px;
  position: absolute;
  top: 1px;
  right: 1px;
  cursor: pointer;
}

.vdr-container.active {
  border: 1px solid #3980EA;
}

.vdr-handle {
  width: 6px;
  height: 6px;
  background: #3980EA;
  border: 1px solid #FFFFFF;
  border-radius: 50%;
}
</style>