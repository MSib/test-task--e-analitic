<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ChartBar from '@/components/ChartElement.vue'
import { fetchData } from '@/useFetchData.ts'
import type { Endpoint, IncomeItem, IncomesResponse } from '@/endpoints.ts'
import { getEndpoint, getApiKey } from '@/endpoints.ts'
import { formatDate } from '@/utils.ts'
import type { ChartDataset } from '@/types.ts'

const TODAY_ONLY = false
const endpoint: Endpoint = 'incomes'
const endpointURL = getEndpoint(endpoint)

const data = ref<IncomesResponse | null>(null)
const error = ref<string | null>(null)
const loading = ref(false)
const perPage = ref(100)
const page = ref(1)
// Fields with numeric values
const filterFields: Array<[keyof IncomeItem, string]> = [
  ['quantity', 'Количество'],
  ['total_price', 'Цена'],
]
const groupDefault: keyof IncomeItem = 'warehouse_name'
const filterDefault: keyof IncomeItem = filterFields[0][0]
const filter = ref(filterDefault)

const chartData = ref<{ labels?: string[]; datasets: ChartDataset[] }>({ datasets: [] })

const daysInMs = 30 * 24 * 60 * 60 * 1000 // 30 days
const dateFrom = ref(
  TODAY_ONLY
    ? formatDate(new Date(), 'YYYY-MM-DD')
    : formatDate(new Date(Date.now() - daysInMs), 'YYYY-MM-DD'),
)
const dateTo = ref(formatDate(new Date(), 'YYYY-MM-DD'))
const apiKey = getApiKey()

async function getData() {
  if (endpointURL && apiKey && dateFrom.value && dateTo.value) {
    loading.value = true
    error.value = null
    const { data: responseData, error: responseError } = await fetchData<'incomes'>(
      endpointURL,
      'GET',
      {
        dateFrom: dateFrom.value,
        dateTo: TODAY_ONLY ? undefined : dateTo.value,
        page: page.value,
        limit: perPageValidation(perPage.value),
        key: apiKey,
      },
    )
    loading.value = false
    if (responseError) {
      error.value = responseError
      data.value = null
      convertData()
      return
    }
    if (!responseData?.data.length) {
      error.value = 'Нет данных'
      data.value = null
      convertData()
      return
    }

    data.value = responseData ?? null
    page.value = responseData.meta.current_page
    convertData()
  }
}

function perPageValidation(v: number): number {
  if (v < 10) return 10
  if (v > 500) return 500
  return v
}

function convertData() {
  if (!data.value || !data.value.data.length) {
    chartData.value = { datasets: [] }
    return
  }
  chartData.value = convertDataGeneric(
    data.value.data,
    groupDefault,
    filter.value,
    filterFields.find(([key]) => key === filter.value)?.[1] || 'Значение',
  )
}

function convertDataGeneric<T extends Record<string, unknown>>(
  dataList: T[],
  groupBy: keyof T,
  valueField: keyof T,
  datasetLabel = 'Значение',
  color = 'rgba(54, 162, 235, 0.5)',
) {
  const groupMap: Record<string, number> = {}
  dataList.forEach((item) => {
    const groupKey = String(item[groupBy])
    const value = Number(item[valueField]) || 0
    groupMap[groupKey] = (groupMap[groupKey] || 0) + value
  })

  const labels = Object.keys(groupMap)
  const values = labels.map((label) => groupMap[label])

  return {
    labels,
    datasets: [
      {
        label: datasetLabel,
        data: values,
        backgroundColor: color,
      },
    ],
  }
}

function nextPage() {
  page.value++
  getData()
}

function prevPage() {
  page.value--
  getData()
}

onMounted(() => {
  getData()
})
</script>

<template>
  <div>
    <h1 class="title">Доходы</h1>
    <div v-if="endpointURL">
      <div class="toolbar">
        <form @submit.prevent class="toolbar__form" action="#" :disabled="loading">
          <fieldset class="toolbar__fieldset">
            <label class="toolbar__label" for="dateFrom">{{
              TODAY_ONLY ? 'Дата:' : 'Дата с:'
            }}</label>
            <input
              class="toolbar__input button"
              type="date"
              name="dateFrom"
              id="dateFrom"
              v-model="dateFrom"
              :readonly="TODAY_ONLY"
            />
          </fieldset>
          <fieldset v-if="!TODAY_ONLY" class="toolbar__fieldset">
            <label class="toolbar__label" for="dateTo">Дата по:</label>
            <input
              class="toolbar__input button"
              type="date"
              name="dateTo"
              id="dateTo"
              v-model="dateTo"
            />
          </fieldset>
          <button @click="getData" class="button toolbar__button" type="button">Показать</button>
        </form>
        <form @submit.prevent class="toolbar__form" action="#" :disabled="loading">
          <fieldset class="toolbar__fieldset">
            <label class="toolbar__label" for="filter">Фильтр по:</label>
            <select v-model="filter" @change="convertData" name="filter" id="filter" class="button">
              <option
                v-for="field in filterFields"
                :key="field[0]"
                :value="field[0]"
                :selected="field[0] === filterDefault"
              >
                {{ field[1] }}
              </option>
            </select>
          </fieldset>
        </form>
      </div>
      <div>
        <p v-if="loading" class="loading">Загрузка...</p>
        <p v-if="error" class="error">{{ error }}</p>
      </div>
      <div v-if="chartData" :style="{ opacity: loading ? '0.5' : '1' }">
        <ChartBar id="chart" :data="chartData" />
        <div class="pagination">
          <form v-if="data" @submit.prevent action="#" class="pagination__form" :disabled="loading">
            <fieldset class="pagination__fieldset">
              <button @click="prevPage" class="button" type="button" :disabled="!data.links.prev">
                Предыдущая страница
              </button>
              <button @click="nextPage" class="button" type="button" :disabled="!data.links.next">
                Следующая страница
              </button>
            </fieldset>
            <fieldset class="pagination__fieldset">
              Количество на странице:
              <select v-model="perPage" class="button" @change="getData">
                <option value="10">10</option>
                <option value="50">50</option>
                <option value="100">100</option>
                <option value="500">500</option>
              </select>
            </fieldset>
          </form>
        </div>
      </div>
      <div v-else>
        <p>Нет данных</p>
      </div>
    </div>
    <div v-else>
      <p>Отсутствует путь к данным</p>
    </div>
  </div>
</template>

<style>
.title {
  margin: 0;
  margin-bottom: 24px;
}
.loading {
  color: #cccccc;
}
.error {
  color: crimson;
}
.toolbar {
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.toolbar__form,
.toolbar__fieldset,
.pagination__form,
.pagination__fieldset {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}
.toolbar__form {
  gap: 24px;
}
.pagination__form {
  margin-top: 36px;
  flex-direction: column;
}
.toolbar__fieldset,
.pagination__fieldset {
  margin: 0;
  padding: 0;
  border: none;
}
.pagination__fieldset {
  font-size: 12px;
}
</style>
