<template>
  <div class="main__container">
    <modal
      confirmationMessage="下記のAMIを作成してもよろしいですか？"
      :target="imageName"
      v-show="modal"
      @get-modal-result="getModalResult"
    ></modal>

    <h3 class="main__container--heading">AMI作成</h3>

    <!-- AMI一覧表示 -->
    <div class="main__container--display-images">
      <p class="main__container--list-images">AMI一覧</p>
      <p v-for="(image, i) in images" :key="i">
        {{ image.imageName }}
      </p>
    </div>

    <!-- バージョン番号入力 -->
    <p class="main__container--version-no">バージョン番号</p>
    <input
      type="text"
      class="main__container--input-version"
      v-model="version"
      placeholder="例：1.0.0"
    />

    <!-- 作成・確認ボタン -->
    <div class="main__container--create-images-btn-area">
      <button
        type="button"
        class="main__container--btn main__container-create-images-btn"
        id="create-image-btn"
        @click="showModal()"
      >
        作成
      </button>

      <button
        type="button"
        class="main__container--btn main__container-create-images-btn"
        id="check-image-state-btn"
        @click="checkImageStateOnClick()"
      >
        確認
      </button>
    </div>

    <!-- 作成状況表示 -->
    <div>
      <span v-if="creationState === 'checking' || creationState === 'creating'">
        <img src="../assets/waiting.gif" class="main__container--waiting-img" />
      </span>
      <span
        :style="{ color }"
        class="main__container-creation-images-message"
        >{{ creationMessage }}</span
      >
    </div>
  </div>
</template>

<script>
import Modal from "./Modal";
export default {
  name: "CreateImages",
  components: {
    Modal
  },
  data() {
    return {
      version: "",
      imageId: "",
      imageName: "",
      creationState: "",
      creationMessage: "",
      color: "",
      modal: false
    };
  },
  props: ["images"],
  methods: {
    showModal() {
      this.creationMessage = "";
      //入力チェック
      if (this.version === "") {
        this.changeCreationState(null, "バージョンが未入力です。", "#ff0000");
        return;
      }
      if (!this.version.match(/^[0-9a-z\\.]+$/)) {
        this.changeCreationState(
          null,
          "半角英数字とドットで入力してください。",
          "#ff0000"
        );
        return;
      }

      this.imageName = `${this.$project}_Dev${this.version}`;
      for (let i = 0; i < this.images.length; i++) {
        if (this.imageName === this.images[i].imageName) {
          this.changeCreationState(null, "存在するバージョンです。", "#ff0000");
          return;
        }
      }
      this.modal = true;
    },
    async getModalResult(result) {
      this.modal = false;
      if (result) {
        await this.createImages();
      }
    },
    //AMIを作成するメソッド
    async createImages() {
      this.$disableButton("create-image-btn");
      this.$disableButton("check-image-state-btn");
      this.changeCreationState("creating", "AMI作成中", "#0064c8");

      try {
        await this.requestToCreateImages();
        const isCompleted = await this.checkImageState();
        if (!isCompleted) {
          this.changeCreationState(
            "error",
            "AMI作成中にエラーが発生しました。",
            "#ff0000"
          );
          this.$enableButton("check-image-state-btn");
          return;
        }

        //AMI情報を更新
        this.images.push({
          imageName: this.imageName,
          imageId: this.imageId
        });
        this.$emit("new-images", this.images);
        this.changeCreationState(
          "complete",
          "AMIの作成が完了しました。",
          "#00c800"
        );
        this.$notifySlack(`${this.$project}のAMIの作成が完了しました。`, "ec2");
      } catch (err) {
        console.log(err);
        this.changeCreationState("error", err, "#ff0000");
      }
      this.$enableButton("create-image-btn");
      this.$enableButton("check-image-state-btn");
    },
    async checkImageStateOnClick() {
      this.creationMessage = "";
      this.creationState = "checking";
      this.$disableButton("check-image-state-btn");

      //リロード後のAMI ID再設定
      if (this.imageId === "") {
        this.imageId = this.images[this.images.length - 1].imageId;
      }

      try {
        const isCompleted = await this.checkImageState();
        if (!isCompleted) {
          this.changeCreationState(
            "error",
            "AMI作成中にエラーが発生しました。",
            "#ff0000"
          );
          this.$enableButton("check-image-state-btn");
          return;
        }
        this.changeCreationState(
          "complete",
          "AMIの作成が完了しました。",
          "#00c800"
        );
        this.$notifySlack(`${this.$project}のAMIの作成が完了しました。`, "ec2");
      } catch (err) {
        console.log(err);
        this.changeCreationState("error", err, "#ff0000");
      }
      this.$enableButton("check-image-state-btn");
    },
    async checkImageState() {
      try {
        let state = await this.requestToGetImageState();
        if (state === "available") {
          return true;
        }
        while (state !== "available") {
          this.changeCreationState("creating", "AMI作成中", "#0064c8");
          await new Promise(resolve => setTimeout(resolve, 30000));
          state = await this.requestToGetImageState();
          if (state === "available") {
            return true;
          } else if (state !== "pending") {
            return false;
          }
        }
      } catch (err) {
        console.log(err);
        this.changeCreationState("error", err, "#ff0000");
      }
    },
    requestToCreateImages() {
      return new Promise((resolve, reject) => {
        this.$api
          .post(this.$apiName, "/createimages", {
            body: this.imageName
          })
          .then(res => {
            this.imageId = res;
            resolve(res);
          })
          .catch(err => {
            reject(err);
          });
      });
    },
    requestToGetImageState() {
      return new Promise((resolve, reject) => {
        this.$api
          .get(this.$apiName, "/getimagestate", {
            queryStringParameters: {
              imageId: this.imageId
            }
          })
          .then(res => {
            resolve(res);
          })
          .catch(err => {
            reject(err);
          });
      });
    },
    changeCreationState(creationState, creationMessage, color) {
      this.creationState = creationState;
      this.creationMessage = creationMessage;
      this.color = color;
    }
  }
};
</script>

<style scoped>
.main__container--display-images {
  border: 2px solid var(--base-color);
  background-color: var(--bg-color);
  padding: 3px 20px;
  width: fit-content;
  margin: 35px auto;
  border-radius: 10px;
}

.main__container--list-images {
  margin: 5px 0;
}

.main__container--version-no {
  margin-top: 40px;
}

.main__container--input-version {
  font-size: 15px;
  text-align: center;
  box-sizing: border-box;
  width: 100px;
  height: 40px;
  transition: 0.3s;
  border: 1px solid #1b2538;
  border-radius: 4px;
}

.main__container--input-version::placeholder {
  text-align: center;
}

.main__container--input-version:focus {
  border: 1px solid var(--base-color);
  outline: none;
  box-shadow: 0 0 5px 1px var(--base-color);
}

.main__container--create-images-btn-area {
  margin: 30px auto;
}

.main__container-create-images-btn {
  display: inline-block;
  margin: 0px 15px;
}

.main__container-creation-images-message {
  font-weight: bold;
}
</style>
