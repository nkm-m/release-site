module.exports = class CloudFormation {
  constructor(AWS) {
    this.cloudformation = new AWS.CloudFormation();
  }

  async describeStackEvents() {
    const params = {
      //NextToken: 'STRING_VALUE',
      StackName: process.env.StackName
    };

    try {
      const result = await this.cloudformation
        .describeStackEvents(params)
        .promise();
      return result;
    } catch (err) {
      console.log("describeStackEventsでエラーが発生しました。");
      throw err;
    }
  }
};
