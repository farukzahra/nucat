<template>

  <section id="sobre">
    <p><v-img src="logo.png" class="logo-image" /></p>
    <h2>Sobre o NUcat</h2>
    <p>O NUcat é um aplicativo projetado para ajudar você a entender melhor seus gastos. Com ele, você pode carregar
      extratos bancários no formato OFX, categorizar automaticamente seus gastos e visualizar gráficos detalhados para
      saber exatamente onde seu dinheiro está sendo gasto.</p>
  </section>
  <section id="login">
    <v-btn color="primary" @click="signInWithGoogle">
      <v-icon left>mdi-google</v-icon>
      &nbsp;Continue com Google
    </v-btn>
  </section>
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
.logo-image {
  max-width: 100px;
  margin: 0 auto 20px auto;
  display: block;
}

section {
  padding: 80px 10%;
  text-align: center;
}

section h2 {
  font-size: 2.2em;
  margin-bottom: 20px;
  color: #8A05BE;
  /* Cor base */
}

section p,
section ul,
section ol {
  font-size: 1.1em;
  line-height: 1.8;
  color: #555;
}

section ul,
section ol {
  text-align: left;
  display: inline-block;
  max-width: 600px;
}

section ul li,
section ol li {
  margin-bottom: 10px;
}
</style>