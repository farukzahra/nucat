<template>
  <v-file-input variant="underlined" label="Selecionar arquivo OFX" @change="handleFileUpload" accept=".ofx" dense />
</template>

<script>
export default {
  methods: {
    handleFileUpload(event) {
      const file = event.target.files ? event.target.files[0] : event;
      if (file) {
        this.$emit('file-uploaded', file);
      }
    },
  },
};
</script>

<style scoped>
/* Remova os estilos antigos, pois o Vuetify já cuida do estilo do input */
</style>