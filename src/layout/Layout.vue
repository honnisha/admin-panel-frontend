<template>
  <v-layout class="h-screen">

    <template v-if="adminSchema">

      <Navbar ref="navbar" :admin-schema="adminSchema" :settings="settings"/>

      <Header
        :api-info="adminSchema"
        :settings="settings"
        :profile="profile"
        :langs="langs"
        @toggle-drawer="$refs.navbar.toggleDrawer()"
        @toggle-settings="$refs.settings.toggle()"
      />

      <v-main class="d-flex page-container">
        <Settings ref="settings"/>

        <router-view v-slot="{ Component }">
          <v-fade-transition>
            <component :is="Component" :key="$route.path" :admin-schema="adminSchema" :settings="settings"/>
          </v-fade-transition>
        </router-view>

      </v-main>

    </template>

    <template v-else-if="loading">

      <v-container fluid class="fill-height h-screen">
        <v-row>
          <v-col class="d-flex justify-center">
            <v-progress-circular
              :size="50"
              color="primary"
              indeterminate
            ></v-progress-circular>
          </v-col>
        </v-row>
      </v-container>

    </template>

  </v-layout>
</template>

<script>
import { toast } from "vue3-toastify"

import Navbar from '/src/layout/Navbar.vue'
import Header from '/src/layout/Header.vue'
import Settings from '/src/components/Settings.vue'

import { getAdminSchema } from '/src/api/scheme'
import { getToken } from '/src/utils/auth'
import { getSettings } from '/src/utils/settings'
import { removeToken } from '/src/utils/auth'

export default {
  components: {
    Navbar,
    Header,
    Settings,
  },
  data() {
    return {
      profile: {},
      adminSchema: null,
      settings: null,
      loading: true,
      langs: null,
    }
  },
  async created() {
    this.settings = getSettings()

    if (!getToken()) {
      this.$router.push({ path: '/login' })
      return
    }

    getAdminSchema().then(adminSchema => {
      this.adminSchema = adminSchema
      this.loading = false
    }).catch(error => {
      this.loading = false
      console.error('API error:', error)
      toast(error, {
        "theme": "auto",
        "type": "error",
        "position": "top-center",
        "dangerouslyHTMLString": true
      })
      if (error.response && (error.response.status == 401 || error.response.status == 403)) {
        removeToken()
        this.$router.push({ path: '/login' })
      }
    })
  },
  methods: {
  }
}
</script>
