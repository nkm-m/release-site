const AWS = require("aws-sdk");
AWS.config.update({ region: "ap-northeast-1" });
AWS.config.apiVersions = {
  ec2: "2016-11-15"
};
const ec2 = new AWS.EC2();

exports.handler = async event => {
  console.log(JSON.stringify(event, null, 2));
  const imageId = event.queryStringParameters.imageId;
  const params = {
    ImageIds: [imageId]
  };

  try {
    const result = await ec2.describeImages(params).promise();
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,GET"
      },
      body: JSON.stringify(result.Images[0].State)
    };
  } catch (err) {
    console.log(err);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,GET"
      },
      body: JSON.stringify(err)
    };
  }
};
