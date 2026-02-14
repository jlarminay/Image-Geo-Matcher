<script setup lang="ts"></script>

<template>
  <q-layout>
    <router-view :key="$route.fullPath" class="h-screen" />
  </q-layout>
</template>

<style scoped></style>
