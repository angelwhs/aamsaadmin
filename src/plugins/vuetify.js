import Vue from 'vue';
import Vuetify, { VSnackbar, VBtn, VIcon } from 'vuetify/lib';
import VuetifyToast from 'vuetify-toast-snackbar';
//import '../theme/default.styl';

// Vue.use(Vuetify, {
//     theme: {
//         primary: "#ee44aa",
//         secondary: "#424242",
//         accent: "#82B1FF",
//         error: "#FF5252",
//         info: "#2196F3",
//         success: "#4CAF50",
//         warning: "#FFC107"
//     },
// });

Vue.use(Vuetify, {
    components: {
        VSnackbar,
        VBtn,
        VIcon
    }
});

Vue.use(VuetifyToast);

export default new Vuetify({
    theme: {
        themes: {
            light: {
                primary: "#1976D2",
                secondary: "#424242",
                accent: "#82B1FF",
                error: "#FF5252",
                info: "#2196F3",
                success: "#4CAF50",
                warning: "#FFC107"
            }
        }
    },
});
