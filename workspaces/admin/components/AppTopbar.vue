<template>
  <div class="layout-topbar">
    <router-link to="/" class="layout-topbar-logo">
      <img alt="Logo" src="/logo.png" />
      <span>UNICORECMS</span>
    </router-link>
    <button class="p-link layout-menu-button layout-topbar-button" @click="onMenuToggle">
      <i class="pi pi-bars"></i>
    </button>

    <button
      class="p-link layout-topbar-menu-button layout-topbar-button"
      v-styleclass="{
        selector: '@next',
        enterClass: 'hidden',
        enterActiveClass: 'scalein',
        leaveToClass: 'hidden',
        leaveActiveClass: 'fadeout',
        hideOnOutsideClick: true,
      }"
    >
      <i class="pi pi-ellipsis-v"></i>
    </button>
    <ul class="layout-topbar-menu hidden lg:flex origin-top">
      <li>
        <nuxt-link class="p-link layout-topbar-button" :to="'/users/' + $auth.user.uuid">
          <i class="pi pi-user"></i>
          <span>Профиль</span>
        </nuxt-link>
      </li>
      <li>
        <button class="p-link layout-topbar-button" @click="$auth.logout()">
          <i class="pi pi-sign-out"></i>
          <span>Выйти</span>
        </button>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  methods: {
    onMenuToggle(event) {
      this.$emit('menu-toggle', event)
    },
    onTopbarMenuToggle(event) {
      this.$emit('topbar-menu-toggle', event)
    },
    topbarImage() {
      return '/images/logo-white.svg'
    },
  },
}
</script>
