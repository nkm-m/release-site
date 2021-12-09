module.exports = class CloudFormation {
  constructor(AWS) {
    this.cloudformation = new AWS.CloudFormation();
  }

  async describeStackDriftDetectionStatus(StackDriftDetectionId) {
    const params = {
      StackDriftDetectionId /* required */
    };

    try {
      const result = this.cloudformation
        .describeStackDriftDetectionStatus(params)
        .promise();
      return result;
    } catch (err) {
      console.log("describeStackDriftDetectionStatusでエラーが発生しました。");
      throw err;
    }
  }
};
