const AWS = require("aws-sdk");
AWS.config.update({ region: "ap-northeast-1" });
AWS.config.apiVersions = {
  cloudformation: "2010-05-15"
};
const CloudFormation = require("./cloudformation");
const cloudformation = new CloudFormation(AWS);

exports.handler = async event => {
  console.log(JSON.stringify(event, null, 2));

  const changeSetId = event.queryStringParameters.changeSetId;
  try {
    const changeSet = await cloudformation.describeChangeSet(changeSetId);

    console.log(changeSet);
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST"
      },
      body: JSON.stringify(changeSet)
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
