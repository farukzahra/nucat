<template>
  <v-btn color="primary" @click="signInWithGoogle">
    <v-icon left>mdi-google</v-icon>
    Continue com Google
  </v-btn>
</template>

<script>
import { auth, GoogleAuthProvider, signInWithPopup } from "@/firebase";

export default {
  methods: {
    async signInWithGoogle() {
      const provider = new GoogleAuthProvider();
      try {
        const result = await signInWithPopup(auth, provider);
        this.$emit('login-success', result.user);
      } catch (error) {
        console.error("Erro ao fazer login:", error);
      }
    },
  },
};
</script>

<style scoped>
/* Remova os estilos antigos, pois o Vuetify já cuida do estilo do botão */
</style>