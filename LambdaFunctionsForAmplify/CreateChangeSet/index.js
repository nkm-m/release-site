const AWS = require("aws-sdk");
AWS.config.update({ region: "ap-northeast-1" });
AWS.config.apiVersions = {
  cloudformation: "2010-05-15"
};
const CloudFormationAPI = require("./CloudFormationAPI");
const cloudformation = new CloudFormationAPI(AWS);

exports.handler = async event => {
  console.log(JSON.stringify(event, null, 2));
  const imageId = JSON.parse(event.body);
  try {
    const changeSet = await cloudformation.createChangeSet(imageId);
    const result = await describeChangeSet(changeSet.Id);
    if (result === "FAILED") {
      return {
        statusCode: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "OPTIONS,POST"
        },
        body: JSON.stringify(result)
      };
    }

    if (result === "timeout") {
      return {
        statusCode: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "OPTIONS,POST"
        },
        body: JSON.stringify(result)
      };
    }

    for (let i = 0; i < result.Changes.length; i++) {
      if (result.Changes[i].ResourceChange.Action === "Remove") {
        return {
          statusCode: 200,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "OPTIONS,POST"
          },
          body: JSON.stringify(
            result.Changes[i].ResourceChange.LogicalResourceId
          )
        };
      }
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST"
      },
      body: JSON.stringify(result.Status)
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

async function describeChangeSet(changeSetId) {
  for (let i = 0; i < 8; i++) {
    await new Promise(resolve => setTimeout(resolve, 3000));
    const result = await cloudformation.describeChangeSet(changeSetId);

    if (result.Status === "CREATE_COMPLETE") {
      return result;
    } else if (result.Status === "FAILED") {
      return result.Status;
    }

    if (i === 7) {
      return "timeout";
    }
  }
}
