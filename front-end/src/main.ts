import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import axios from 'axios';
import VueAxios from 'vue-axios';
import './index.css';
import BaseButton from '@/components/Ui/BaseButton.vue';
import BaseCard from '@/components/Ui/BaseCard.vue';
import BaseUi from '@/components/Ui/BaseUi.vue';
import BaseSpinner from '@/components/Ui/BaseSpinner.vue';
import TheFooter from '@/components/Ui/TheFooter.vue';
import TheHeader from '@/components/Ui/TheHeader.vue';
import CardLeft from '@/components/Ui/CardLeft.vue';
import CardRight from '@/components/Ui/CardRight.vue';
import Toast, { POSITION } from "vue-toastification";
import "vue-toastification/dist/index.css";

const app = createApp(App);

const pinia = createPinia();

const options = {
	position: POSITION.TOP_CENTER
    // You can set your default options here
};

app.use(Toast, options);
app.use(pinia);
app.use(router);
app.use(VueAxios, axios);
app.provide('axios', app.config.globalProperties.axios);

app.component('base-button', BaseButton);
app.component('base-card', BaseCard);
app.component('base-spinner', BaseSpinner);
app.component('base-ui', BaseUi);
app.component('the-footer', TheFooter);
app.component('the-header', TheHeader);
app.component('card-left', CardLeft);
app.component('card-right', CardRight);

app.mount('#app');
