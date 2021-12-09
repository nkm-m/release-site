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
      return result;
    } catch (err) {
      console.log("describeImagesでエラーが発生しました。");
    }
  }
};
