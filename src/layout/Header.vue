<template>
  <v-app-bar>
    <v-app-bar-nav-icon variant="text" @click="$emit('toggleDrawer')"/>

    <v-breadcrumbs :items="path">
      <template v-slot:divider>
        <v-icon icon="mdi-chevron-right"></v-icon>
      </template>
    </v-breadcrumbs>

    <v-spacer></v-spacer>

    <v-btn icon @click.native="$emit('toggleSettings')"><v-icon>mdi-cog-outline</v-icon></v-btn>

    <Language :langs="langs"/>

    {{ profile.username }}

    <v-btn icon @click.native="logout"><v-icon>mdi-logout</v-icon></v-btn>

  </v-app-bar>
</template>

<script>
import Language from '/src/components/Language.vue'
import { getBreadcrumbs } from '/src/utils/get-breadcrumb'
import { setLang, removeToken } from '/src/utils/auth'

export default {
  props: {
    adminSchema: {type: Object, required: true},
    settings: {type: Object, required: true},
    langs: {type: Object, required: true},
    profile: {type: Object, required: true},
  },
  components: {
    Language,
  },
  data() {
    return {
      drawer: null,
      path: [],
    }
  },
  watch: {
    $route() {
      this.getBreadcrumbInfo()
    }
  },
  created() {
    this.getBreadcrumbInfo()
  },
  methods: {
    getBreadcrumbInfo() {
      this.path = getBreadcrumbs(this.adminSchema, this.$router, this.$route)
    },
    changeLang(langSlug) {
      setLang(langSlug)
      document.location.reload()
    },
    logout() {
      removeToken()
      this.$router.push({ path: '/login' })
    },
  },
}
</script>
