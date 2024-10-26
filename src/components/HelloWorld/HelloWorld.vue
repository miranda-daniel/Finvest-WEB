<script setup lang="ts">
import styles from './HelloWorld.module.scss';
</script>

<template>
  <div class="p-4 rounded-lg">
    <p>TEST</p>
    <h1 class="text-2xl font-bold text-blue-500"> Hello </h1>
    <p :class="styles.specialStyle">Este es un componente de prueba con Tailwind CSS.</p>
  </div>
</template>