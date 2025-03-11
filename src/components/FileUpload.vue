<template>
    <div>
      <label for="file-upload" class="custom-file-upload">Selecionar arquivo OFX</label>
      <input id="file-upload" type="file" @change="handleFileUpload" accept=".ofx" class="file-input" />
    </div>
  </template>
  
  <script>
  export default {
    methods: {
      handleFileUpload(event) {
        const file = event.target.files[0];
        if (file) {
          this.$emit('file-uploaded', file);
        }
      },
    },
  };
  </script>
  
  <style scoped>
  .custom-file-upload {
    display: inline-block;
    padding: 10px 15px;
    background: #ff4500;
    color: white;
    border-radius: 5px;
    cursor: pointer;
    margin-top: 15px;
  }
  
  .file-input {
    display: none;
  }
  </style>