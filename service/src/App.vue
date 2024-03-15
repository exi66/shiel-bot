<script setup>
import { ref, onMounted, computed } from 'vue'

import API from '@/js/Api.js'
import Funs from '@/js/Funs.js'
import Multiselect from '@vueform/multiselect'

const token = ref(window.token || null)
const prevItems = ref([])
const items = ref([])
const allItems = ref([])
const notifyCoupons = ref(false)
const notifyQueue = ref(false)
const loading = ref(true)
const waitAPI = ref(false)
const errorsAPI = ref([])
const theme = ref(localStorage.getItem('theme') || 'dark')
const itemsSelect = ref()

function changeTheme() {
  if (theme.value == 'light') {
    document.documentElement.classList.remove('dark')
  } else {
    document.documentElement.classList.add('dark')
  }
}
function toggleTheme() {
  if (theme.value == 'dark') {
    theme.value = 'light'
    localStorage.setItem('theme', 'light')
  } else {
    theme.value = 'dark'
    localStorage.setItem('theme', 'dark')
  }
  changeTheme()
}
function getItemByID(id) {
  if (!id) return
  const __id = parseInt(id.split('-')[0]);
  const __lvl = parseInt(id.split('-')[1]);

  let e = allItems.value.find(e => e.id == __id && e.enhancement_level == __lvl);
  return e ? {
    label: e.name + '' + Funs.lvlToString(e.enhancement_level),
    value: e.id + '-' + e.enhancement_level,
    icon: 'https://cdn.bdolytics.com/img/' + e.icon,
    grade: e.grade
  } : {
    label: `Неизвестный ${id}`,
    value: id,
    icon: null,
    grade: 0
  }
}
function cancelItems() {
  items.value = JSON.parse(JSON.stringify(prevItems.value));
}
async function saveItems() {
  waitAPI.value = true;
  errorsAPI.value = [];
  let res = await API.items.edit(items.value);
  if (res.result) {
    prevItems.value = JSON.parse(JSON.stringify(items.value));
  }
  if (res.errors) {
    errorsAPI.value = res.errors;
  }
  waitAPI.value = false;
}
async function getAllItems() {
  waitAPI.value = true;
  errorsAPI.value = [];
  let res = await API.items.all();
  if (res.result) {
    allItems.value = res.result;
  }
  if (res.errors) {
    errorsAPI.value = res.errors;
  }
  waitAPI.value = false;
}
async function getItems() {
  waitAPI.value = true;
  errorsAPI.value = [];
  let res = await API.items.get();
  if (res.result) {
    items.value = res.result;
    prevItems.value = res.result;
  }
  if (res.errors) {
    errorsAPI.value = res.errors;
  }
  waitAPI.value = false;
}
async function getCoupons() {
  waitAPI.value = true;
  errorsAPI.value = [];
  let res = await API.coupons.get();
  if (res.result) {
    notifyCoupons.value = res.result === 1;
  }
  if (res.errors) {
    errorsAPI.value = res.errors;
  }
  waitAPI.value = false;
}
async function getQueue() {
  waitAPI.value = true;
  errorsAPI.value = [];
  let res = await API.queue.get();
  if (res.result) {
    notifyQueue.value = res.result === 1;
  }
  waitAPI.value = false;
}
async function toggleCoupons() {
  waitAPI.value = true;
  errorsAPI.value = [];
  let res = await API.coupons.toggle();
  if (res.result) {
    notifyCoupons.value = !notifyCoupons.value;
  }
  if (res.errors) {
    errorsAPI.value = res.errors;
  }
  waitAPI.value = false;
}
async function toggleQueue() {
  waitAPI.value = true;
  errorsAPI.value = [];
  let res = await API.queue.toggle();
  if (res.result) {
    notifyQueue.value = !notifyQueue.value;
  }
  if (res.errors) {
    errorsAPI.value = res.errors;
  }
  waitAPI.value = false;
}

const allowSettings = computed(() => {
  return token.value != null
})

const isEdited = computed(() => {
  return JSON.stringify(items.value) != JSON.stringify(prevItems.value)
})

const isDark = computed(() => {
  return theme.value === 'dark'
})

const selectItems = computed(() => {
  return allItems.value.map(e => ({
    label: e.name + '' + Funs.lvlToString(e.enhancement_level),
    value: e.id + '-' + e.enhancement_level,
    icon: 'https://cdn.bdolytics.com/img/' + e.icon,
    grade: e.grade
  }))
})

onMounted(async () => {
  changeTheme()
  if (allowSettings.value) {
    await getAllItems()
    await getItems()
    await getCoupons()
    await getQueue()
    itemsSelect.value.input.addEventListener('keydown', (e) => {
      if (e.which === 8 && !e.target.value.length) {
        e.stopImmediatePropagation()
        e.preventDefault()
      }
    })
  }
  loading.value = false
})
</script>

<template>
  <div v-show="loading" class="fixed w-full h-full z-10 flex bg-black bg-opacity-20 backdrop-blur transition-all"></div>
  <button @click="toggleTheme()" type="button" :title="isDark ? 'Светлая тема' : 'Тёмная тема'"
    class="flex xl:fixed xl:top-0 xl:right-0 mt-4 ml-auto mr-4 xl:ml-2 xl:mb-2 xl:mr-2 xl:mt-2 p-2 z-10 transition-all leading-none rounded bg-transparent border border-transparent hover:bg-black/10 dark:hover:bg-white/10 text-yellow-500 dark:text-sky-100">
    <i class="bi bi-moon-fill hidden dark:inline-block"></i>
    <i class="bi bi-brightness-high-fill inline-block dark:hidden"></i>
  </button>
  <main class="container mx-auto p-3 flex flex-col gap-4" v-if="allowSettings">
    <div v-show="errorsAPI.length > 0"
      class="rounded-md p-3 flex items-center border bg-red-50 dark:bg-white/5 text-red-800 border-red-300 dark:border-red-800 dark:text-red-400"
      role="alert">
      <i class="bi bi-info-circle-fill me-3"></i>
      <div>
        <span class="font-medium">Возникла ошибка: </span> {{ errorsAPI.join('.\r\n') }}
      </div>
    </div>
    <div
      class="relative w-full p-3 lg:p-5 rounded-md bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
      <div class="flex mb-4">
        <span class="text-lg font-medium text-black dark:text-white w-full">
          Настройки уведомлений
        </span>
      </div>
      <div class="flex gap-4">
        <button type="button" @click="toggleCoupons" :disabled="waitAPI" :aria-checked="notifyQueue"
          class="p-2 text-center text-sm font-semibold leading-4 border border-accent text-accent rounded uppercase transition-all dark:hover:text-shark-900 hover:text-white hover:bg-accent  aria-checked:bg-accent dark:aria-checked:text-shark-900 aria-checked:text-white aria-checked:border-accent aria-checked:hover:opacity-80 disabled:opacity-50 disabled:cursor-wait">
          Уведомления о аукционе
        </button>
        <button type="button" @click="toggleQueue" :disabled="waitAPI" :aria-checked="notifyCoupons"
          class="p-2 text-center text-sm font-semibold leading-4 border border-accent text-accent rounded uppercase transition-all dark:hover:text-shark-900 hover:text-white hover:bg-accent  aria-checked:bg-accent dark:aria-checked:text-shark-900 aria-checked:text-white aria-checked:border-accent aria-checked:hover:opacity-80 disabled:opacity-50 disabled:cursor-wait">
          Уведомления о купонах
        </button>
      </div>
    </div>
    <div
      class="relative w-full p-3 lg:p-5 rounded-md bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
      <div class="flex mb-4">
        <span class="text-lg font-medium text-black dark:text-white">
          Настройки предметов
        </span>
      </div>
      <Multiselect ref="itemsSelect" v-model="items" :options="selectItems" mode="multiple"
        noResultsText="Нет совпадений" noOptionsText="Нет данных" locale="ru" :closeOnSelect="false"
        :clearOnSelect="false" :canClear="false" :searchable="true" :caret="false">
        <template #option="{ option }">
          <div class="flex m-0 p-0 w-full">
            <img v-bind:src="option.icon" class="my-auto w-[34px] h-[34px] border rounded-sm" alt="icon"
              :class="option.grade > 3 ? 'border-orange-600 dark:border-[#ce5f4a]' : 'border-yellow-600 dark:border-[#f3b93c]'">
            <span class="my-auto mx-2"
              :class="option.grade > 3 ? 'text-orange-600 dark:text-[#ce5f4a]' : 'text-yellow-600 dark:text-[#f3b93c]'">
              {{ option.label }}
            </span>
          </div>
        </template>
        <template v-slot:multiplelabel="{ values }">
          <div class="multiselect-multiple-label text-sm">
            {{ values.length + ' ' + Funs.declOfNum(values.length, ['предмет', 'предмета', 'предметов']) }} выбрано
          </div>
        </template>
      </multiselect>
      <div v-show="items.length > 0"
        class="mt-4 border bg-gray-50 border-black/10 dark:bg-shark-900 dark:border-white/10 transition-all rounded flex flex-col overflow-y-scroll max-h-[28.25rem]">
        <div v-for="item in items" :key="item" class="flex p-2 odd:bg-black/5 dark:odd:bg-white/5">
          <img :src="getItemByID(item).icon" class="my-auto w-[34px] h-[34px] border rounded-sm" alt="icon"
            :class="getItemByID(item).grade > 3 ? 'border-orange-600 dark:border-[#ce5f4a]' : 'border-yellow-600 dark:border-[#f3b93c]'">
          <span class="my-auto mx-2"
            :class="getItemByID(item).grade > 3 ? 'text-orange-600 dark:text-[#ce5f4a]' : 'text-yellow-600 dark:text-[#f3b93c]'">
            {{ getItemByID(item).label }}
          </span>
          <button @click="items = items.filter(e => e !== item)" type="button"
            class="ml-auto p-2 rounded transition-all text-red-600 dark:text-red-500 hover:bg-black/10 dark:hover:bg-white/10"
            style="line-height: 0;">
            <i class="bi bi-trash3"></i>
          </button>
        </div>
      </div>
      <div v-show="isEdited" class="mt-4 flex w-full gap-4">
        <button type="button" @click="saveItems" :disabled="waitAPI"
          class="ml-auto p-2 text-center text-sm font-semibold leading-4 border bg-accent dark:text-shark-900 text-white border-accent hover:opacity-80 rounded uppercase transition-all disabled:opacity-50 disabled:cursor-wait">
          Сохранить
        </button>
        <button type="button" @click="cancelItems"
          class="p-2 text-center text-sm font-semibold leading-4 border border-accent text-accent rounded uppercase transition-all dark:hover:text-shark-900 hover:text-white hover:bg-accent disabled:opacity-50 disabled:cursor-wait">
          Отменить
        </button>
      </div>
    </div>
  </main>
  <main class="container mx-auto p-3 flex flex-col gap-4" v-else>
    <div
      class="relative w-full p-3 lg:p-5 rounded-md bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
      <div class="flex mb-4">
        <span class="text-lg font-medium text-black dark:text-white">
          О проекте
        </span>
      </div>
      <div class="mb-2">
        Discord.js бот для отслеживания регистрации редких предметов на аукционе игры Black Desert Online. Поддерживает
        только русскоговорящий регион
      </div>
      <div class="flex gap-4">
        <a href="https://discord.com/api/oauth2/authorize?client_id=822596673524072529&permissions=0&scope=bot"
          target="_blank" type="button"
          class="p-2 text-center text-sm font-semibold leading-4 border border-accent text-accent rounded uppercase transition-all dark:hover:text-shark-900 hover:text-white hover:bg-accent disabled:opacity-50">
          Добавить бота<i class="bi bi-box-arrow-up-right ms-2"></i>
        </a>
        <a href="https://new.donatepay.ru/@exi" target="_blank" type="button"
          class="p-2 text-center text-sm font-semibold leading-4 border border-accent text-accent rounded uppercase transition-all dark:hover:text-shark-900 hover:text-white hover:bg-accent disabled:opacity-50 ">
          Поддержать<i class="bi bi-box-arrow-up-right ms-2"></i>
        </a>
      </div>
    </div>
  </main>
  <footer class="container mx-auto px-3">
    <div class="w-full flex flex-row opacity-80">
      <a href="https://github.com/exi66/bdo-market-wait-list" class="hover:underline flex">
        <i class="bi bi-github me-2 text-xl"></i><small class="my-auto">by exi66</small>
      </a>
    </div>
  </footer>
</template>

<style src="@/assets/multiselect.css"></style>