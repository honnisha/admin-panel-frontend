<template>
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

<script>
export default {
  props: {
  },
  methods: {
  },
}
</script>
