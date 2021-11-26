module.exports = class EC2API {
  constructor(AWS) {
    this.ec2 = new AWS.EC2();
  }

  //スナップショットのidを取得するメソッド
  async describeImages(imageId) {
    const params = {
      ImageIds: [imageId]
    };
    try {
      const result = await this.ec2.describeImages(params).promise();
      return result.Images[0].BlockDeviceMappings[0].Ebs.SnapshotId;
    } catch (err) {
      console.log("describeImagesでエラーが発生しました。");
      throw err;
    }
  }

  //AMIを削除するメソッド
  async deregisterImage(ImageId) {
    const params = {
      ImageId /* required */,
      DryRun: false
    };
    try {
      await this.ec2.deregisterImage(params).promise();
    } catch (err) {
      console.log("deregisterImageでエラーが発生しました。");
      throw err;
    }
  }

  //スナップショットを削除するメソッド
  async deleteSnapshot(SnapshotId) {
    const params = {
      SnapshotId /* required */,
      DryRun: false
    };
    try {
      await this.ec2.deleteSnapshot(params).promise();
    } catch (err) {
      console.log("deleteSnapshotでエラーが発生しました。");
      throw err;
    }
  }
};
