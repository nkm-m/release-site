<template>
  <div class="main__container">
    <modal
      confirmationMessage="下記のAMIでCloudFormationを実行してもよろしいですか？"
      :target="imageName"
      v-show="modal"
      @get-modal-result="getModalResult"
    ></modal>

    <h3 class="main__container--heading">CloudFormation実行</h3>

    <div class="main__container--radio-area">
      <label
        class="main__container--radio-label"
        @click="isCheckedOldVersion = false"
      >
        <input
          type="radio"
          name="version"
          id="latest-version"
          class="main__container--radio"
          checked
        />最新版をリリース
      </label>
      <label
        class="main__container--radio-label"
        @click="isCheckedOldVersion = true"
      >
        <input
          type="radio"
          name="version"
          class="main__container--radio"
        />バージョンを戻す
      </label>
    </div>

    <div v-show="isCheckedOldVersion">
      <!-- AMI選択セレクトボックス -->
      <select id="select-image" class="main__container--select ">
        <option hidden>AMIを選択</option>
        <option v-for="(image, i) in images" :key="i" :value="image.imageId">{{
          image.imageName
        }}</option>
      </select>
    </div>

    <!-- 更新ボタン -->
    <button
      type="button"
      class="main__container--btn main__container--update-btn"
      @click="showModal()"
    >
      更新
    </button>

    <span class="main__container--update-stack-error">{{ error }}</span>

    <!-- 更新状況表示 -->
    <div class="main__container--status">
      <div class="main__container--update-status">
        <p class="main__container--status-header">
          更新状況
        </p>

        <img
          src="../assets/reload.png"
          class="main__container--reload-img"
          @click="checkStackState()"
          v-show="isLoading === false"
        />
        <img
          src="../assets/half_circle.png"
          class="main__container--reload-wait-img"
          @click="checkStackState()"
          v-show="isLoading === true"
        />
      </div>

      <div class="main__container--scroll">
        <div
          class="main__container--status-message"
          v-for="(message, i) in messages"
          :key="i"
          :style="{ color: message.color }"
        >
          {{ message.date }}<br />{{ message.event }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Modal from "./Modal";
export default {
  name: "UpdateStack",
  components: {
    Modal
  },
  data() {
    return {
      modal: false,
      imageName: "",
      imageId: "",
      isCheckedOldVersion: false,
      stackName: "",
      isLoading: false,
      error: "",
      events: [],
      messages: [],
      color: ""
    };
  },
  props: ["images"],
  methods: {
    showModal() {
      this.error = "";
      if (!this.isCheckedOldVersion) {
        this.imageName = this.images[this.images.length - 1].imageName;
        this.imageId = this.images[this.images.length - 1].imageId;
      } else {
        const select = document.getElementById("select-image");
        const selectedIndex = select.selectedIndex;
        this.imageName = select.options[selectedIndex].text;
        this.imageId = select.value;
        if (this.imageName === "AMIを選択") {
          this.error = "AMIを選択してください。";
          return;
        }
      }
      this.modal = true;
    },
    async getModalResult(result) {
      this.modal = false;
      if (result) {
        await this.updateStack();
      }
    },
    //CloudFormationを実行するメソッド
    async updateStack() {
      try {
        //最新バージョンの場合
        if (!this.isCheckedOldVersion) {
          this.pushEvent(
            new Date().toLocaleString({ timeZone: "Asia/Tokyo" }),
            "Update request accepted",
            "#0064c8"
          );

          //変更セット実行リクエスト
          const res = await this.requestToExecuteChangeSet();
          //ドリフトの検出または変更セットで削除が検出されたら実行しない
          if (res == "DRIFTED") {
            this.pushEvent(
              new Date().toLocaleString({ timeZone: "Asia/Tokyo" }),
              "Detected stack drift. Check resource configuration",
              "#ff0000"
            );
            return;
          } else if (res === "Remove") {
            this.pushEvent(
              new Date().toLocaleString({ timeZone: "Asia/Tokyo" }),
              "The resource will be deleted. Please check the template.",
              "#ff0000"
            );
            return;
          } else {
            this.stackName = res;
          }
        } else {
          //バージョンを戻す場合
          this.pushEvent(
            new Date().toLocaleString({ timeZone: "Asia/Tokyo" }),
            "Rollback request accepted",
            "#0064c8"
          );

          //以前のバージョンのAMIでスタックを更新するリクエスト
          const res = await this.requestToRollbackStack();
          //ドリフトを検出した場合更新しない
          if (res == "DRIFTED") {
            this.pushEvent(
              new Date().toLocaleString({ timeZone: "Asia/Tokyo" }),
              "Detected stack drift. Check resource configuration",
              "#ff0000"
            );
            return;
          } else {
            this.stackName = res;
          }
        }
      } catch (err) {
        this.error = err;
      }
    },
    requestToExecuteChangeSet() {
      return new Promise((resolve, reject) => {
        this.$api
          .post(this.$apiName, "/executechangeset")
          .then(res => {
            resolve(res);
          })
          .catch(err => {
            reject(err);
          });
      });
    },
    requestToRollbackStack() {
      return new Promise((resolve, reject) => {
        this.$api
          .post(this.$apiName, "/rollbackstack", {
            body: this.imageId
          })
          .then(res => {
            resolve(res);
          })
          .catch(err => {
            reject(err);
          });
      });
    },
    async checkStackState() {
      this.isLoading = true;
      try {
        const res = await this.requestToGetStackState();
        if (res !== "Event does not exist") {
          this.stackName = res.stackName;
          for (let i = 0; i < res.state.length; i++) {
            //更新失敗
            if (
              res.state[i].includes("FAILED") ||
              res.state[i].includes("ROLLBACK")
            ) {
              this.pushEvent(res.time[i], res.state[i], "#ff0000");
            } else if (res.state[i] === `${this.stackName} : UPDATE_COMPLETE`) {
              //更新完了
              this.pushEvent(res.time[i], res.state[i], "#00c800");
            } else {
              //更新中
              this.pushEvent(res.time[i], res.state[i], "#0064c8");
            }
          }
        }
      } catch (err) {
        this.error = err;
      }
      this.isLoading = false;
    },
    requestToGetStackState() {
      return new Promise((resolve, reject) => {
        this.$api
          .get(this.$apiName, "/getstackstate")
          .then(res => {
            resolve(res);
          })
          .catch(err => {
            reject(err);
          });
      });
    },
    //日付順にソートして更新メッセージを蓄積するメソッド
    pushEvent(time, event, color) {
      if (!this.events.includes(`${time}${event}`)) {
        this.events.push(`${time}${event}`);
        const date = new Date(time).toLocaleString({ timeZone: "Asia/Tokyo" });
        this.messages.push({ date, event, color });
        this.messages.sort(function(a, b) {
          return new Date(b.date) - new Date(a.date);
        });
      }
    }
  }
};
</script>

<style scoped>
.main__container--radio-area {
  margin: 35px auto;
  margin-bottom: 10px;
}

.main__container--radio-label {
  display: flex;
  justify-content: left;
  width: 155px;
  margin: 10px auto;
}

.main__container--radio {
  width: 15px;
  height: 15px;
  position: relative;
  right: 5px;
}

.main__container--update-btn {
  margin: 30px auto;
  margin-bottom: 10px;
}

.main__container--update-stack-error {
  display: inline-block;
  margin: 10px;
  color: #ff0000;
  font-weight: bold;
}

.main__container--status {
  border: var(--base-color) solid 2px;
  border-radius: 5px;
  background-color: var(--bg-color);
  margin-top: 10px;
}

.main__container--update-status {
  text-align: center;
  border-bottom: 2px solid var(--base-color);
  padding: 7px;
  padding-left: 15px;
  display: flex;
  justify-content: center;
  position: relative;
}

.main__container--status-header {
  margin: 0;
}

.main__container--reload-img {
  width: 25px;
  position: absolute;
  right: 3%;
  border: #000 solid 1px;
  border-radius: 8px;
}

.main__container--reload-wait-img {
  width: 20px;
  position: absolute;
  right: 3%;
  animation: 1s linear infinite rotation1;
}

@keyframes rotation1 {
  0% {
    transform: rotate(0);
  }
  100% {
    transform: rotate(360deg);
  }
}

.main__container--reload-img:hover {
  cursor: pointer;
  border: #000 solid 2px;
}

.main__container--scroll {
  width: 500px;
  height: 300px;
  /* background-color: red; */
  overflow: scroll;
  margin: 0 auto;
  margin-top: 10px;
  text-align: left;
  padding-left: 15px;
}

.main__container--status-message {
  padding: 10px 0;
  border-bottom: var(--base-color) dotted 2px;
  font-weight: bold;
}
</style>
