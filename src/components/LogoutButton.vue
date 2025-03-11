<template>
  <div class="logout-container">
    <a href="#" @click.prevent="handleLogout" class="logout-link">Sair</a>
  </div>
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
.logout-container {
  position: absolute;
  top: 20px;
  right: 20px;
}

.logout-link {
  color: #ff4500;
  text-decoration: none;
  font-size: 16px;
  transition: color 0.3s ease;
}

.logout-link:hover {
  color: #e63900;
  text-decoration: underline;
}
</style>