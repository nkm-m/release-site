module.exports = class CloudFormation {
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
};
