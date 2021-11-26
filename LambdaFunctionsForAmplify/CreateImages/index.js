const AWS = require("aws-sdk");
AWS.config.update({ region: "ap-northeast-1" });
AWS.config.apiVersions = {
  ec2: "2016-11-15"
};
const EC2API = require("./EC2API");
const ec2 = new EC2API(AWS);

exports.handler = async event => {
  console.log(JSON.stringify(event, null, 2));

  try {
    //マスターインスタンスのidを取得
    const masterInstanceId = await ec2.describeInstances();

    //AMI作成
    const imageName = JSON.parse(event.body);
    const imageId = await ec2.createImage(masterInstanceId, imageName);
    const image = await describeImages(imageId);
    await ec2.createTags(
      imageId,
      image.BlockDeviceMappings[0].Ebs.SnapshotId,
      imageName
    );

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST"
      },
      body: JSON.stringify({
        imageName,
        imageId,
        creationTime: new Date(image.CreationDate).getTime(),
        disable: true
      })
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

//スナップショットのidを取得するメソッド
async function describeImages(imageId) {
  while (true) {
    await new Promise(resolve => setTimeout(resolve, 3000));
    try {
      const image = await ec2.describeImages(imageId);
      if ("SnapshotId" in image.BlockDeviceMappings[0].Ebs) {
        return image;
      }
    } catch (err) {
      console.log("getSnapshotidでエラーが発生しました。");
      throw err;
    }
  }
}
