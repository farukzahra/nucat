import { createVuetify } from 'vuetify';
import 'vuetify/styles';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import '@mdi/font/css/materialdesignicons.css'; // Importe o CSS dos ícones

export default createVuetify({
  icons: {
    defaultSet: 'mdi', // Use o Material Design Icons
  },
  components,
  directives,
});