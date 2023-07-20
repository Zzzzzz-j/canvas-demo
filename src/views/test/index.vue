<template>
    <div class="test-view">
        <div class="canvas-content">
            <canvas id="myCanvas"></canvas>
        </div>
    </div>
</template>
<script setup lang="ts">
import { onMounted } from 'vue';
import './index.scss';

onMounted(() => {
    initCnavas();
});

function initCnavas() {
    let c = document.getElementById("myCanvas") as any;
    let ctx = c.getContext("2d");

    ctx.fillStyle = "red";
    ctx.fillRect(20, 20, 75, 50);
    ctx.globalCompositeOperation = "destination-over";
    ctx.fillStyle = "blue";
    ctx.fillRect(50, 50, 75, 50);

    ctx.fillStyle = "red";
    ctx.fillRect(150, 20, 75, 50);
    ctx.globalCompositeOperation = "destination-over";
    ctx.fillStyle = "blue";
    ctx.fillRect(180, 50, 75, 50);
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "green";
    ctx.fillRect(200, 30, 75, 50);
}

</script>