module.exports = class CloudFormation {
  constructor(AWS) {
    this.cloudformation = new AWS.CloudFormation();
  }

  async describeChangeSet(ChangeSetName) {
    const params = {
      ChangeSetName,
      StackName: process.env.StackName
    };

    try {
      const result = await this.cloudformation
        .describeChangeSet(params)
        .promise();
      return result;
    } catch (err) {
      console.log("describeChangeSetでエラーが発生しました。");
      throw err;
    }
  }
};
