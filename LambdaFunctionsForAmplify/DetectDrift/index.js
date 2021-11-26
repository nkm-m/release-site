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
    const driftResult = await cloudformation.detectStackDrift();
    const driftStatus = await describeStackDriftDetectionStatus(
      driftResult.StackDriftDetectionId
    );
    if (driftStatus === "timeout") {
      return {
        statusCode: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "OPTIONS,POST"
        },
        body: JSON.stringify(driftStatus)
      };
    }

    if (driftStatus !== "IN_SYNC") {
      return {
        statusCode: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "OPTIONS,POST"
        },
        body: JSON.stringify("DRIFTED")
      };
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST"
      },
      body: JSON.stringify(driftStatus)
    };
  }
  catch (err) {
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

async function describeStackDriftDetectionStatus(StackDriftDetectionId) {
  for (let i = 0; i < 8; i++) {
    await new Promise(resolve => setTimeout(resolve, 3000));
    try {
      const result = await cloudformation.describeStackDriftDetectionStatus(
        StackDriftDetectionId
      );

      if (result.DetectionStatus === "DETECTION_COMPLETE") {
        return result.StackDriftStatus;
      }
      else if (result.DetectionStatus === "DETECTION_FAILED") {
        return result.DetectionStatus;
      }
      if (i === 7) {
        return "timeout";
      }
    }
    catch (err) {
      console.log(err);
      throw err;
    }
  }
}
