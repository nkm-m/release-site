module.exports = class CloudFormation {
  constructor(AWS) {
    this.cloudformation = new AWS.CloudFormation();
  }

  async createChangeSet(imageId) {
    const params = {
      ChangeSetName: `ChangeSet-${new Date().getTime()}` /* required */,
      StackName: process.env.StackName /* required */,
      // Capabilities: [
      //   CAPABILITY_IAM | CAPABILITY_NAMED_IAM | CAPABILITY_AUTO_EXPAND,
      //   /* more items */
      // ],
      // ChangeSetType: CREATE | UPDATE | IMPORT,
      // ClientToken: 'STRING_VALUE',
      // Description: 'STRING_VALUE',
      // IncludeNestedStacks: true || false,
      // NotificationARNs: [
      //   'STRING_VALUE',
      //   /* more items */
      // ],
      Parameters: [
        {
          ParameterKey: 'Ec2ImageId',
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
      // ResourcesToImport: [
      //   {
      //     LogicalResourceId: 'STRING_VALUE' /* required */,
      //     ResourceIdentifier: {
      //       /* required */
      //       '<ResourceIdentifierPropertyKey>': 'STRING_VALUE',
      //       /* '<ResourceIdentifierPropertyKey>': ... */
      //     },
      //     ResourceType: 'STRING_VALUE' /* required */,
      //   },
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
      // Tags: [
      //   {
      //     Key: 'STRING_VALUE' /* required */,
      //     Value: 'STRING_VALUE' /* required */,
      //   },
      //   /* more items */
      // ],
      // TemplateBody: 'STRING_VALUE',
      // TemplateURL: 'STRING_VALUE',
      UsePreviousTemplate: true,
    };

    try {
      const result = await this.cloudformation
        .createChangeSet(params)
        .promise();
      return result;
    } catch (err) {
      console.log('createChangeSetでエラーが発生しました。');
      throw err;
    }
  }

  async describeChangeSet(ChangeSetName) {
    const params = {
      ChangeSetName /* required */,
      //NextToken: 'STRING_VALUE',
      StackName: process.env.StackName,
    };

    try {
      const result = await this.cloudformation
        .describeChangeSet(params)
        .promise();
      return result;
    } catch (err) {
      console.log('describeChangeSetでエラーが発生しました。');
      throw err;
    }
  }
};
