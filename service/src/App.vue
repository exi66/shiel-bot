<script setup>
import API from '@/js/Api.js'
import Funs from '@/js/Funs.js'
import Multiselect from '@vueform/multiselect'
</script>

<script>
export default {
  components: {
    Multiselect
  },
  data() {
    return {
      token: window.token || null,
      prevItems: [],
      items: [],
      allItems: [],
      showModal: false,
      notifyCoupons: false,
      notifyQueue: false,
      loading: true,
      waitAPI: false,
      errorsAPI: [],
      theme: 'dark'
    };
  },
  watch: {

  },
  updated() {

  },
  created() {

  },
  async mounted() {
    if (this.allowSettings) {
      await this.getAllItems();
      await this.getItems();
      await this.getCoupons();
      await this.getQueue();
      this.theme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    }
    this.loading = false;
  },
  computed: {
    allowSettings() {
      return this.token !== null;
    },
    selectItems() {
      return this.allItems.map(e => ({
        label: e.name + '' + Funs.lvlToString(e.enhancement_level),
        value: e.id + '-' + e.enhancement_level,
        icon: "https://cdn.bdolytics.com/img/" + e.icon,
        grade: e.grade
      }));
    },
    isEdited() {
      return JSON.stringify(this.items) != JSON.stringify(this.prevItems)
    },
    isDark() {
      return this.theme === 'dark';
    }
  },
  methods: {
    toggleTheme() {
      if (this.theme === 'dark') {
        this.theme = 'light';
        document.documentElement.classList.remove('dark');
      } else {
        this.theme = 'dark';
        document.documentElement.classList.add('dark');
      }
    },
    getItemByID(id) {
      if (!id) return;
      const __id = parseInt(id.split('-')[0]);
      const __lvl = parseInt(id.split('-')[1]);

      let e = this.allItems.find(e => e.id == __id && e.enhancement_level == __lvl);
      return e ? {
        label: e.name + '' + Funs.lvlToString(e.enhancement_level),
        value: e.id + '-' + e.enhancement_level,
        icon: "https://cdn.bdolytics.com/img/" + e.icon,
        grade: e.grade
      } : {
        label: `Неизвестный ${id}`,
        value: id,
        icon: null,
        grade: 0
      }
    },
    cancelItems() {
      this.items = this.prevItems;
    },
    async saveItems() {
      this.waitAPI = true;
      this.errorsAPI = [];
      let res = await API.items.edit(this.items);
      if (res.result) {
        this.prevItems = this.items;
      }
      if (res.errors) {
        this.errorsAPI = res.errors;
      }
      this.waitAPI = false;
    },
    async getAllItems() {
      this.waitAPI = true;
      this.errorsAPI = [];
      let res = await API.items.all();
      if (res.result) {
        this.allItems = res.result;
      }
      if (res.errors) {
        this.errorsAPI = res.errors;
      }
      this.waitAPI = false;
    },
    async getItems() {
      this.waitAPI = true;
      this.errorsAPI = [];
      let res = await API.items.get();
      if (res.result) {
        this.items = res.result;
        this.prevItems = res.result;
      }
      if (res.errors) {
        this.errorsAPI = res.errors;
      }
      this.waitAPI = false;
    },
    async getCoupons() {
      this.waitAPI = true;
      this.errorsAPI = [];
      let res = await API.coupons.get();
      if (res.result) {
        this.notifyCoupons = res.result === 1;
      }
      if (res.errors) {
        this.errorsAPI = res.errors;
      }
      this.waitAPI = false;
    },
    async getQueue() {
      this.waitAPI = true;
      this.errorsAPI = [];
      let res = await API.queue.get();
      if (res.result) {
        this.notifyQueue = res.result === 1;
      }
      this.waitAPI = false;
    },
    async toggleCoupons() {
      this.waitAPI = true;
      this.errorsAPI = [];
      let res = await API.coupons.toggle();
      if (res.result) {
        this.notifyCoupons = !this.notifyCoupons;
      }
      if (res.errors) {
        this.errorsAPI = res.errors;
      }
      this.waitAPI = false;
    },
    async toggleQueue() {
      this.waitAPI = true;
      this.errorsAPI = [];
      let res = await API.queue.toggle();
      if (res.result) {
        this.notifyQueue = !this.notifyQueue;
      }
      if (res.errors) {
        this.errorsAPI = res.errors;
      }
      this.waitAPI = false;
    },
  }
}
</script>

<template>
  <div v-show="loading" class="fixed w-full h-full z-10 flex bg-black bg-opacity-20 backdrop-blur transition-all"></div>
  <button @click="toggleTheme" type="button" :title="isDark ? 'Светлая тема' : 'Тёмная тема'"
    class="flex xl:fixed xl:top-0 xl:right-0 mt-4 ml-auto mr-4 xl:ml-2 xl:mb-2 xl:mr-2 xl:mt-2 p-2 z-10 transition-all leading-none rounded bg-gray-200 bg-opacity-0 hover:bg-opacity-50 dark:bg-slate-700 dark:bg-opacity-0 dark:hover:bg-opacity-50"
    :class="isDark ? 'text-sky-100' : 'text-yellow-500'">
    <i v-if="isDark" class="bi bi-moon-fill"></i>
    <i v-else class="bi bi-brightness-high-fill"></i>
  </button>
  <main class="container mx-auto p-4 flex flex-col gap-4" v-if="allowSettings">
    <div v-show="errorsAPI.length > 0"
      class="flex items-center p-4 text-sm text-red-800 border border-red-300 rounded bg-red-50 dark:bg-slate-700 dark:text-red-400 dark:border-red-800 transition-all"
      role="alert">
      <i class="bi bi-info-circle-fill me-3"></i>
      <span class="sr-only">Ошибка</span>
      <div>
        <span class="font-medium">Возникла ошибка: </span> {{ errorsAPI.join('.\r\n') }}
      </div>
    </div>
    <div class="relative shadow-md w-full text-gray-700 bg-gray-50 dark:bg-slate-700 dark:text-gray-400 p-5 rounded-md">
      <div class="flex mb-4">
        <span class="text-lg font-bold text-black dark:text-white w-full">
          Настройки уведомлений
        </span>
      </div>
      <div class="flex gap-4">
        <button type="button" @click="toggleCoupons" :disabled="waitAPI"
          class="px-3 py-2 text-xs font-medium text-center inline-flex rounded hover:opacity-80 transition-all disabled:cursor-wait"
          :class="notifyCoupons ? 'text-white bg-blue-700 dark:bg-blue-500 border border-blue-700 dark:border-blue-500' : 'bg-transparent border text-red-700  border-red-700 dark:text-red-500 dark:border-red-500'">
          Уведомления о аукционе
        </button>
        <button type="button" @click="toggleQueue" :disabled="waitAPI"
          class="px-3 py-2 text-xs font-medium text-center inline-flex rounded hover:opacity-80 transition-all disabled:cursor-wait"
          :class="notifyQueue ? 'text-white bg-blue-700 dark:bg-blue-500 border border-blue-700 dark:border-blue-500' : 'bg-transparent border text-red-700  border-red-700 dark:text-red-500 dark:border-red-500'">
          Уведомления о купонах
        </button>
      </div>
    </div>
    <div class="relative shadow-md w-full text-gray-700 bg-gray-50 dark:bg-slate-700 dark:text-gray-400 p-5 rounded-md">
      <div class="flex mb-4">
        <span class="text-lg font-bold text-black dark:text-white">
          Настройки предметов
        </span>
      </div>
      <multiselect id="itemsSelect" name="itemsSelect"
        class="dark:bg-slate-800 dark:border-white dark:border-opacity-20 transition-all" v-model="items"
        :options="selectItems" mode="multiple" noResultsText="Нет совпадений" noOptionsText="Нет данных" locale="ru"
        :closeOnSelect="false" :clearOnSelect="false" :canClear="false" :searchable="true" :caret="false">
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
          <div class="multiselect-multiple-label">
            {{ values.length + ' ' + Funs.declOfNum(values.length, ['предмет', 'предмета', 'предметов']) }} выбрано
          </div>
        </template>
      </multiselect>
      <div v-show="items.length > 0"
        class="mt-4 border bg-transparent border-black border-opacity-20 dark:bg-slate-800 dark:border-white dark:border-opacity-20 transition-all rounded flex flex-col overflow-y-scroll max-h-[28.25rem]">
        <div v-for="item in items" :key="item"
          class="flex p-2 odd:bg-gray-200 odd:bg-opacity-30 dark:odd:bg-slate-700 dark:odd:bg-opacity-30">
          <img :src="getItemByID(item).icon" class="my-auto w-[34px] h-[34px] border rounded-sm" alt="icon"
            :class="getItemByID(item).grade > 3 ? 'border-orange-600 dark:border-[#ce5f4a]' : 'border-yellow-600 dark:border-[#f3b93c]'">
          <span class="my-auto mx-2"
            :class="getItemByID(item).grade > 3 ? 'text-orange-600 dark:text-[#ce5f4a]' : 'text-yellow-600 dark:text-[#f3b93c]'">
            {{ getItemByID(item).label }}
          </span>
          <button v-show="!disabled" @click="items = items.filter(e => e !== item)" type="button"
            class="ml-auto p-2 rounded transition-all text-red-600 dark:text-red-500 bg-opacity-0 bg-gray-200 dark:bg-slate-700 dark:bg-opacity-0 hover:text-opacity-100 hover:bg-opacity-50 dark:hover:text-opacity-100 dark:hover:bg-opacity-50"
            style="line-height: 0;">
            <i class="bi bi-trash3"></i>
          </button>
        </div>
      </div>
      <div v-show="isEdited" class="mt-4 flex w-full gap-4">
        <button type="button" @click="saveItems" :disabled="waitAPI"
          class="ml-auto px-3 py-2 text-xs font-medium text-center inline-flex rounded text-white bg-blue-700 dark:bg-blue-500 hover:opacity-80 transition-all disabled:cursor-wait">
          Сохранить
        </button>
        <button type="button" @click="cancelItems"
          class="px-3 py-2 text-xs font-medium text-center inline-flex rounded text-white bg-red-700 dark:bg-red-500 hover:opacity-80 transition-all disabled:cursor-wait">
          Отменить
        </button>
      </div>
    </div>
  </main>
  <main class="container mx-auto p-4 flex flex-col gap-4" v-else>
    <div class="relative shadow-md w-full text-gray-700 bg-gray-50 dark:bg-slate-700 dark:text-gray-400 p-5 rounded-md">
      <div class="flex mb-4">
        <span class="text-lg font-bold text-black dark:text-white">
          О проекте
        </span>
      </div>
      <div class="mb-4">
        Discord.js бот для отслеживания регистрации редких предметов на аукционе игры Black Desert Online. Поддерживает
        только русскоговорящий регион
      </div>
      <div class="flex gap-4">
        <a href="https://discord.com/api/oauth2/authorize?client_id=822596673524072529&permissions=0&scope=bot"
          target="_blank" type="button"
          class="px-3 py-2 text-xs font-medium text-center inline-flex rounded text-white bg-blue-700 dark:bg-blue-500 hover:opacity-80 transition-all disabled:cursor-wait">
          Добавить бота<i class="bi bi-box-arrow-up-right ms-2"></i>
        </a>
        <a href="https://new.donatepay.ru/@exi" target="_blank" type="button"
          class="px-3 py-2 text-xs font-medium text-center inline-flex rounded text-white bg-blue-700 dark:bg-blue-500 hover:opacity-80 transition-all disabled:cursor-wait">
          Поддержать<i class="bi bi-box-arrow-up-right ms-2"></i>
        </a>
      </div>
    </div>
  </main>
  <footer class="container mx-auto px-4">
    <div class="w-full flex flex-row opacity-80">
      <a href="https://github.com/exi66/bdo-market-wait-list" class="hover:underline flex">
        <i class="bi bi-github me-2 text-xl"></i><small class="my-auto">by exi66</small>
      </a>
    </div>
  </footer>
</template>

<style src="@vueform/multiselect/themes/tailwind.css"></style>
<style>
.container {
  max-width: 1280px;
}

.multiselect input {
  background-color: transparent;
  position: static;
  min-height: 38px;
}

.multiselect.is-active {
  --tw-ring-color: rgb(29 78 216 / var(--tw-ring-opacity)) !important;
}

.dark .multiselect.is-active {
  --tw-ring-color: rgb(59 130 246 / var(--tw-ring-opacity)) !important;
}

.multiselect-dropdown {
  max-height: 19rem;
}

.dark .multiselect-dropdown {
  background-color: theme('colors.slate.800');
  color: theme('colors.white');
  border-color: rgb(255 255 255 / 0.2);
}

.dark .multiselect-clear-icon {
  background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 320 512' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M207.6 256l107.72-107.72c6.23-6.23 6.23-16.34 0-22.58l-25.03-25.03c-6.23-6.23-16.34-6.23-22.58 0L160 208.4 52.28 100.68c-6.23-6.23-16.34-6.23-22.58 0L4.68 125.7c-6.23 6.23-6.23 16.34 0 22.58L112.4 256 4.68 363.72c-6.23 6.23-6.23 16.34 0 22.58l25.03 25.03c6.23 6.23 16.34 6.23 22.58 0L160 303.6l107.72 107.72c6.23 6.23 16.34 6.23 22.58 0l25.03-25.03c6.23-6.23 6.23-16.34 0-22.58L207.6 256z'%3e%3c/path%3e%3c/svg%3e");
}

.dark .multiselect-no-results {
  background-color: theme('colors.slate.800');
  color: theme('colors.white');
  border-color: rgb(255 255 255 / 0.2);
}

.multiselect-option.is-pointed {
  background-color: rgb(229 231 235 / 0.5) !important;
}

.dark .multiselect-option.is-pointed {
  background-color: rgb(51 65 85 / 0.5) !important;
}
</style>
