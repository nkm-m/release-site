import Vue from "vue";
import App from "./App.vue";
import axios from "axios";
import VueAxios from "vue-axios";
//Amplifyの設定
import Amplify, * as AmplifyModules from "aws-amplify";
import { AmplifyPlugin } from "aws-amplify-vue";
import aws_exports from "./aws-exports";
import { API } from "aws-amplify";
Amplify.configure(aws_exports);
//プロジェクト名
Vue.prototype.$project = "Study";
//API GatewayのAPI名
Vue.prototype.$apiName = "StudyApiReleaseSite";
Vue.prototype.$api = API;
Vue.prototype.$slackWebhookUrl = "";
//ログイン関連の日本語化
const messageResource = {
  ja: {
    Username: "ユーザー名",
    "Enter your Username": "ユーザ名を入力",
    "Sign In": "ログイン",
    Password: "パスワード",
    "Enter your password": "パスワードを入力",
    "Forgot your password? ": "パスワードを忘れた場合",
    "Reset password": "パスワードリセット",
    "Back to Sign In": "ログインに戻る",
    "Sign in to your account": "ログイン",
    "Sign Out": "ログアウト",
    "Reset your password": "パスワードをリセット",
    "Send Code": "送信"
  }
};
Vue.prototype.$notifySlack = async function(text, icon_emoji) {
  const payload = {
    username: `${this.$project} ReleaseSite Notification`,
    text,
    icon_emoji
  };
  await this.axios.post(this.$slackWebhookUrl, JSON.stringify(payload));
};
Vue.prototype.$disableButton = function(target) {
  const btn = document.getElementById(target);
  btn.disabled = true;
  btn.style.cursor = "not-allowed";
};
Vue.prototype.$enableButton = function(target) {
  const btn = document.getElementById(target);
  btn.disabled = false;
  btn.style.cursor = "pointer";
};

AmplifyModules.I18n.putVocabularies(messageResource);
Vue.config.productionTip = false;
Vue.use(VueAxios, axios);
Vue.use(AmplifyPlugin, AmplifyModules);
new Vue({
  render: h => h(App)
}).$mount("#app");
