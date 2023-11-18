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
      id: window.id || null,
      prevItems: [],
      items: [],
      allItems: [],
      showModal: false,
      notifyCoupons: false,
      notifyQueue: false,
      loading: true,
      waitAPI: false,
      errorsAPI: [],
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
    }
    this.loading = false;
  },
  computed: {
    allowSettings() {
      return this.id !== null;
    },
    selectItems() {
      return this.allItems.map(e => ({
        label: e.name + '' + Funs.lvlToString(e.enhancement_level),
        value: e.id + '-' + e.enhancement_level,
        icon: "https://cdn.bdolytics.com/img/" + e.icon + ".webp",
        grade: e.grade
      }));
    },
    isEdited() {
      return JSON.stringify(this.items) != JSON.stringify(this.prevItems)
    },
  },
  methods: {
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
        <span class="text-lg font-bold text-white w-full">
          Настройки уведомлений
        </span>
      </div>
      <div class="flex gap-4">
        <button type="button" @click="toggleCoupons" :disabled="waitAPI"
          class="px-3 py-2 text-xs font-medium text-center inline-flex rounded hover:opacity-80 transition-all disabled:cursor-wait"
          :class="notifyCoupons ? 'text-white bg-blue-700 dark:bg-blue-500 border border-blue-700 dark:border-blue-500' : 'bg-transparent border text-blue-700 border-blue-700 dark:text-blue-500 dark:border-blue-500'">
          Уведомления о аукционе
        </button>
        <button type="button" @click="toggleQueue" :disabled="waitAPI"
          class="px-3 py-2 text-xs font-medium text-center inline-flex rounded hover:opacity-80 transition-all disabled:cursor-wait"
          :class="notifyQueue ? 'text-white bg-blue-700 dark:bg-blue-500 border border-blue-700 dark:border-blue-500' : 'bg-transparent border text-blue-700 border-blue-700 dark:text-blue-500 dark:border-blue-500'">
          Уведомления о купонах
        </button>
      </div>
    </div>
    <div class="relative shadow-md w-full text-gray-700 bg-gray-50 dark:bg-slate-700 dark:text-gray-400 p-5 rounded-md">
      <div class="flex mb-4">
        <span class="text-lg font-bold text-white">
          Настройки предметов
        </span>
      </div>
      <multiselect id="itemsSelect" name="itemsSelect"
        class="dark:bg-slate-800 dark:border-white dark:border-opacity-20 transition-all" v-model="items"
        :options="selectItems" mode="tags" noResultsText="Нет совпадений" noOptionsText="Нет данных" locale="ru"
        :closeOnSelect="false" :clearOnSelect="false" :canClear="false" :searchable="true" :caret="false">
        <template #option="{ option }">
          <div class="flex m-0 p-0 w-full">
            <img v-bind:src="option.icon" class="my-auto w-[34px] h-[34px] border rounded-sm" alt="icon"
              :class="option.grade > 3 ? 'border-[#ce5f4a]' : 'border-[#f3b93c]'">
            <span class="my-auto mx-2" :class="option.grade > 3 ? 'text-[#ce5f4a]' : 'text-[#f3b93c]'">
              {{ option.label }}
            </span>
          </div>
        </template>
        <template #tag="{ option, disabled, handleTagRemove }">
          <div class="flex m-0 p-0 w-full">
            <img v-bind:src="option.icon" class="my-auto w-[34px] h-[34px] border rounded-sm" alt="icon"
              :class="option.grade > 3 ? 'border-[#ce5f4a]' : 'border-[#f3b93c]'">
            <span class="my-auto mx-2" :class="option.grade > 3 ? 'text-[#ce5f4a]' : 'text-[#f3b93c]'">
              {{ option.label }}
            </span>
            <button v-show="!disabled" @click="handleTagRemove(option, $event)" type="button"
              class="ml-auto p-2 hover:opacity-80 transition-all" style="line-height: 0;">
              <i class="bi bi-x"></i>
            </button>
          </div>
        </template>
      </multiselect>
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
        <span class="text-lg font-bold text-white w-full">
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
      <a href="https://github.com/exi66/bdo-market-wait-list" class="hover:underline">
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
}

.multiselect.is-active {
  --tw-ring-color: rgb(29 78 216 / var(--tw-ring-opacity)) !important;
}

.dark .multiselect.is-active {
  --tw-ring-color: rgb(59 130 246 / var(--tw-ring-opacity)) !important;
}

.dark .multiselect-dropdown {
  background-color: theme('colors.slate.800');
  color: theme('colors.white');
  border-color: rgb(255 255 255 / 0.2);
}

.dark .multiselect-clear-icon {
  background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 320 512' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M207.6 256l107.72-107.72c6.23-6.23 6.23-16.34 0-22.58l-25.03-25.03c-6.23-6.23-16.34-6.23-22.58 0L160 208.4 52.28 100.68c-6.23-6.23-16.34-6.23-22.58 0L4.68 125.7c-6.23 6.23-6.23 16.34 0 22.58L112.4 256 4.68 363.72c-6.23 6.23-6.23 16.34 0 22.58l25.03 25.03c6.23 6.23 16.34 6.23 22.58 0L160 303.6l107.72 107.72c6.23 6.23 16.34 6.23 22.58 0l25.03-25.03c6.23-6.23 6.23-16.34 0-22.58L207.6 256z'%3e%3c/path%3e%3c/svg%3e");
}

.multiselect-tag {
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
  margin-right: 0.5rem !important;
  width: 100%;
  background-color: rgb(29 78 216 / var(--tw-bg-opacity)) !important;
}

.dark .multiselect-tag {
  background-color: rgb(59 130 246 / var(--tw-bg-opacity)) !important;
}

.multiselect-tags {
  gap: 0.5rem;
  padding: 0 !important;
  margin: 0.5rem !important;
  flex-direction: column-reverse;
  align-items: normal;
}

.multiselect-tag-remove {
  margin-left: auto;
}

.dark .multiselect-tag-remove-icon {
  background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 320 512' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M207.6 256l107.72-107.72c6.23-6.23 6.23-16.34 0-22.58l-25.03-25.03c-6.23-6.23-16.34-6.23-22.58 0L160 208.4 52.28 100.68c-6.23-6.23-16.34-6.23-22.58 0L4.68 125.7c-6.23 6.23-6.23 16.34 0 22.58L112.4 256 4.68 363.72c-6.23 6.23-6.23 16.34 0 22.58l25.03 25.03c6.23 6.23 16.34 6.23 22.58 0L160 303.6l107.72 107.72c6.23 6.23 16.34 6.23 22.58 0l25.03-25.03c6.23-6.23 6.23-16.34 0-22.58L207.6 256z'%3e%3c/path%3e%3c/svg%3e");
}

.multiselect-tags-search-wrapper {
  width: 100%;
}

.multiselect-tags-search {
  display: block;
  width: 100%;
}

.dark .multiselect-no-results {
  background-color: theme('colors.slate.800');
  color: theme('colors.white');
  border-color: rgb(255 255 255 / 0.2);
}

.multiselect-option.is-pointed {
  background-color: rgb(255 255 255 / 0.1) !important;
}
</style>
