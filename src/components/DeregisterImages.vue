<template>
  <div class="main__container">
    <modal
      confirmationMessage="下記のAMIを削除してもよろしいですか？"
      :target="imageName"
      v-show="modal"
      @get-modal-result="getModalResult"
    ></modal>

    <h3 class="main__container--heading">AMI削除</h3>

    <!-- AMI選択セレクトボックス -->
    <select
      id="deregister-image"
      class="main__container--select main__container--select-deregister-image"
    >
      <option hidden>AMIを選択</option>
      <option v-for="(image, i) in images" :key="i" :value="image.imageId">{{
        image.imageName
      }}</option>
    </select>

    <!-- 削除ボタン -->
    <button
      type="button"
      class="main__container--btn main__container--deregister-btn"
      @click="showModal()"
    >
      AMI削除
    </button>

    <!-- 削除状況表示 -->
    <div>
      <span v-if="deregistrationState === 'deregistering'">
        <img src="../assets/waiting.gif" class="main__container--waiting-img" />
      </span>
      <span
        :style="{ color }"
        class="main__container-deregister-images-message"
        >{{ deregistrationMessage }}</span
      >
    </div>
  </div>
</template>

<script>
import Modal from "./Modal";
export default {
  name: "DeregisterImages",
  components: {
    Modal
  },
  data() {
    return {
      modal: false,
      imageName: "",
      imageId: "",
      deregistrationState: "",
      deregistrationMessage: "",
      color: ""
    };
  },
  props: ["images"],
  methods: {
    showModal() {
      this.deregistrationMessage = "";
      const selectImage = document.getElementById("deregister-image");
      const selectedIndex = selectImage.selectedIndex;
      this.imageName = this.target = selectImage.options[selectedIndex].text;
      this.imageId = selectImage.value;
      if (this.imageName === "AMIを選択") {
        this.changeState(null, "AMIを選択してください。", "#ff0000");
        return;
      }
      this.modal = true;
    },
    async getModalResult(result) {
      this.modal = false;
      if (result) {
        await this.deregisterImages();
      }
    },
    async deregisterImages() {
      //待機メッセージ表示し、更新ボタンを非活性にする
      this.changeState("deregistering", "AMIを削除しています。", "#0064c8");

      try {
        await this.requestToDeregisterImages();
        this.changeState(
          "complete",
          `${this.imageName}のAMIを削除しました。`,
          "#00c800"
        );

        //AMI削除後に一覧からも対象のAMIを削除
        for (let i = 0; i < this.images.length; i++) {
          if (this.images[i].imageId === this.imageId) {
            this.images.splice(i, 1);
          }
        }
        this.$emit("new-images", this.images);

        //選択状態を初期化
        document.getElementById("deregister-image").selectedIndex = -1;
      } catch (err) {
        this.deregistrationMessage = err;
      }
    },
    requestToDeregisterImages() {
      return new Promise((resolve, reject) => {
        this.$api
          .del(this.$apiName, "/deregisterimages", {
            body: {
              imageId: this.imageId
            }
          })
          .then(() => {
            resolve();
          })
          .catch(err => {
            reject(err);
          });
      });
    },
    changeState(state, creationMessage, color) {
      this.deregistrationState = state;
      this.deregistrationMessage = creationMessage;
      this.color = color;
    }
    //AMIの活性/非活性を切り替えるメソッド
    // disableLatestImage() {
    //   const options = document.getElementById("deregister-image").options;
    //   if (this.images.length > 2) {
    //     for (let i = 1; i < options.length; i++) {
    //       if (i < options.length - 2) {
    //         options[i].disabled = false;
    //       } else {
    //         options[i].disabled = true;
    //       }
    //     }
    //   }
    // },
  }
};
</script>

<style>
.main__container--select-deregister-image {
  margin: 25px 0;
  margin-bottom: 0;
}

.main__container--deregister-btn {
  margin: 30px auto;
}

.main__container-deregister-images-message {
  font-weight: bold;
}
</style>
