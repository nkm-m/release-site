const AWS = require("aws-sdk");
AWS.config.update({ region: "ap-northeast-1" });
AWS.config.apiVersions = {
  ec2: "2016-11-15"
};
const EC2 = require("./ec2");
const ec2 = new EC2(AWS);

exports.handler = async event => {
  console.log(JSON.stringify(event, null, 2));
  const imageId = JSON.parse(event.body).imageId;
  try {
    //スナップショットのidを取得
    const snapshotId = await ec2.describeImages(imageId);

    //AMIの削除
    await ec2.deregisterImage(imageId);

    //スナップショットの削除
    await ec2.deleteSnapshot(snapshotId);

    console.log(snapshotId);
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,DELETE"
      },
      body: JSON.stringify("success")
    };
  } catch (err) {
    console.log(err);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,DELETE"
      },
      body: JSON.stringify(err)
    };
  }
};
