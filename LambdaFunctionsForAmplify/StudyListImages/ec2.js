module.exports = class EC2 {
  constructor(AWS) {
    this.ec2 = new AWS.EC2();
  }

  async describeImages() {
    const params = {
      Filters: [
        {
          Name: "is-public",
          Values: [
            "false"
            /* more items */
          ]
        }
        /* more items */
      ]
    };

    try {
      const result = await this.ec2.describeImages(params).promise();
      return result;
    } catch (err) {
      console.log("describeImagesでエラーが発生しました。");
    }
  }

  async describeInstances() {
    try {
      const result = await this.ec2.describeInstances().promise();
      return result;
    } catch (err) {
      console.log("describeInstancesでエラーが発生しました。");
      throw err;
    }
  }
};
