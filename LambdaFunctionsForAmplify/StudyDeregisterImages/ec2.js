module.exports = class EC2 {
  constructor(AWS) {
    this.ec2 = new AWS.EC2();
  }

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
