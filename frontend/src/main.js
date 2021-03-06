import Vue from "vue";
import App from "./App.vue";

import Notifications from "vue-notification";
Vue.use(Notifications);

import axios from "axios";
import VueAxios from "vue-axios";
axios.defaults.withCredentials = true;
axios.defaults.baseURL = process.env.VUE_APP_API_URL;
Vue.use(VueAxios, axios);

import VueSocketIO from 'vue-socket.io'
import SocketIO from "socket.io-client"
Vue.use(new VueSocketIO({
  debug: true,
  connection: SocketIO('http://localhost:3000'),
}))

const getAPI = {
  install(Vue) {
    Vue.prototype.getAPI = (url) => {
      return new Promise((resolve, reject) => {
        Vue.axios
          .get(url)
          .then((response) => {
            resolve(response.data);
          })
          .catch((error) => {
            console.log(error)
            Vue.notify({
              title: "Network Error",
              type: "error",
              text: (error.response) ? (error.response.data) ? error.response.data : "Could not get API: " + error.response.config.url : "Unknown",
            });
            reject();
          });
      });
    };
  },
};
Vue.use(getAPI);

import "./assets/styles/normalize.css";

Vue.config.productionTip = false;

new Vue({
  render: (h) => h(App),
}).$mount("#app");
