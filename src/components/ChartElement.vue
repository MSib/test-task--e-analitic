<script lang="ts" setup>
import { ref } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)
import type { ChartData } from 'chart.js'

defineProps<{ id: string; data: ChartData<'bar', (number | [number, number] | null)[], unknown> }>()

const chartOptions = ref({
  responsive: true,
})
</script>

<template>
  <Bar :id :options="chartOptions" :data="data" />
</template>

<style></style>
