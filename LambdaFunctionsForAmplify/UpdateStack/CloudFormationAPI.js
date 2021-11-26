module.exports = class CloudFormationAPI {
  constructor(AWS) {
    this.cloudformation = new AWS.CloudFormation();
  }

  async listChangeSets() {
    const params = {
      StackName: process.env.StackName /* required */,
      //NextToken: 'STRING_VALUE',
    };
    try {
      const result = await this.cloudformation.listChangeSets(params).promise();
      return result;
    } catch (err) {
      console.log("listChangeSetsでエラーが発生しました。");
      throw err;
    }
  }

  //変更セットを実行するメソッド
  async executeChangeSet(ChangeSetName, StackName) {
    const params = {
      ChangeSetName /* required */,
      //ClientRequestToken: 'STRING_VALUE',
      StackName,
    };
    try {
      await this.cloudformation.executeChangeSet(params).promise();
    } catch (err) {
      console.log("executeChangeSetでエラーが発生しました。");
      throw err;
    }
  }

  async updateStack(imageId) {
    const params = {
      StackName: process.env.StackName /* required */,
      // Capabilities: [
      //   CAPABILITY_IAM | CAPABILITY_NAMED_IAM | CAPABILITY_AUTO_EXPAND,
      //   /* more items */
      // ],
      //ClientRequestToken: 'STRING_VALUE',
      // NotificationARNs: [
      //   process.env.SnsArn,
      //   /* more items */
      // ],
      Parameters: [
        {
          ParameterKey: "Ec2ImageId",
          ParameterValue: imageId,
          // ResolvedValue: 'STRING_VALUE',
          // UsePreviousValue: true || false,
        },
        /* more items */
      ],
      // ResourceTypes: [
      //   'STRING_VALUE',
      //   /* more items */
      // ],
      // RoleARN: 'STRING_VALUE',
      // RollbackConfiguration: {
      //   MonitoringTimeInMinutes: 'NUMBER_VALUE',
      //   RollbackTriggers: [
      //     {
      //       Arn: 'STRING_VALUE' /* required */,
      //       Type: 'STRING_VALUE' /* required */,
      //     },
      //     /* more items */
      //   ],
      // },
      // StackPolicyBody: 'STRING_VALUE',
      // StackPolicyDuringUpdateBody: 'STRING_VALUE',
      // StackPolicyDuringUpdateURL: 'STRING_VALUE',
      // StackPolicyURL: 'STRING_VALUE',
      // TemplateBody: 'STRING_VALUE',
      // TemplateURL: 'STRING_VALUE',
      UsePreviousTemplate: true,
    };

    try {
      await this.cloudformation.updateStack(params).promise();
    } catch (err) {
      console.log("updateStackでエラーが発生しました。");
      throw err;
    }
  }
};
