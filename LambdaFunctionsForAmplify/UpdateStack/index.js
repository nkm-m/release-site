const AWS = require("aws-sdk");
AWS.config.update({ region: "ap-northeast-1" });
AWS.config.apiVersions = {
  cloudformation: "2010-05-15"
};
const CloudFormationAPI = require("./CloudFormationAPI");
const cloudformation = new CloudFormationAPI(AWS);

exports.handler = async event => {
  console.log(JSON.stringify(event, null, 2));

  try {
    const changeSet = await cloudformation.listChangeSets();
    if (changeSet.Summaries.length !== 0) {
      await cloudformation.executeChangeSet(
        changeSet.Summaries[0].ChangeSetId,
        changeSet.Summaries[0].StackName
      );
    } else {
      const imageId = JSON.parse(event.body);
      await cloudformation.updateStack(imageId);
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST"
      },
      body: JSON.stringify(process.env.STACKNAME)
    };
  } catch (err) {
    console.log(err);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST"
      },
      body: JSON.stringify(err)
    };
  }
};
