<script>
export default {
  props: {
    open: {
      type: Boolean,
      required: true
    },
    width: {
      type: Number,
      required: false
    },
  },
  computed: {
    style() {
      let style = '';
      style += this.width ? 'width: ' + this.width + '%;' : 'width: 33%;';
      return style;
    }
  },
}
</script>

<template>
  <div class="modal">
    <transition name="fade">
      <div class="modal-backdrop z-20 bg-black bg-opacity-50" @click="$emit('update:open', !open)" v-show="open"></div>
    </transition>
    <transition name="fade">
      <div
        class="modal-window fixed left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-md shadow-sm z-30 bg-white dark:bg-slate-900"
        :style="style" v-show="open">
        <div class="absolute right-0 top-[-32px]">
          <button @click="$emit('update:open', !open)" class="p-2 hover:opacity-80 transition-opacity"
            style="line-height: 0;">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
        <div ref="modalBody">
          <slot></slot>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.modal-window {
  top: var(--offset, 50%);
  --tw-translate-y: calc(var(--offset-translate, 50%) * -1) !important;
}

.modal-backdrop {
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity .3s linear;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
