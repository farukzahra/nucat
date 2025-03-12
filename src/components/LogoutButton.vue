<template>
  <v-btn color="error" @click="handleLogout" class="logout-button">
    Sair
  </v-btn>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  methods: {
    ...mapActions(['logout']),
    async handleLogout() {
      await this.logout();
    },
  },
};
</script>

<style scoped>

</style>