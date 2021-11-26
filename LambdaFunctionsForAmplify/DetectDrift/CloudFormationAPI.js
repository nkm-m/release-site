module.exports = class CloudFormationAPI {
  constructor(AWS) {
    this.cloudformation = new AWS.CloudFormation();
  }

  async detectStackDrift() {
    const params = {
      StackName: process.env.StackName /* required */
      // LogicalResourceIds: [
      //   'STRING_VALUE',
      //   /* more items */
      // ],
    };
    try {
      const result = await this.cloudformation
        .detectStackDrift(params)
        .promise();
      return result;
    } catch (err) {
      console.log("detectStackDriftでエラーが発生しました。");
      throw err;
    }
  }

  async describeStackDriftDetectionStatus(StackDriftDetectionId) {
    const params = {
      StackDriftDetectionId /* required */
    };
    try {
      const result = await this.cloudformation
        .describeStackDriftDetectionStatus(params)
        .promise();
      return result;
    } catch (err) {
      console.log("describeStackDriftDetectionStatusでエラーが発生しました。");
      throw err;
    }
  }
};
