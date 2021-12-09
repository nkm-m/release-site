const AWS = require("aws-sdk");
AWS.config.update({ region: "ap-northeast-1" });
AWS.config.apiVersions = {
  ec2: "2016-11-15"
};
const EC2 = require("./ec2");
const ec2 = new EC2(AWS);

exports.handler = async event => {
  console.log(JSON.stringify(event, null, 2));

  try {
    //AMI一覧取得
    const result = await ec2.describeImages();
    let images = result.Images;

    //名前、id、作成時刻を抽出
    images = images.map(image => {
      return {
        imageName: image.Name,
        imageId: image.ImageId,
        creationTime: new Date(image.CreationDate).getTime(),
        disable: true
      };
    });

    //作成時刻順にソート
    images.sort(function(a, b) {
      if (a.creationTime > b.creationTime) {
        return 1;
      } else if (a.creationTime < b.creationTime) {
        return -1;
      }
    });

    //アカウント内に存在するEC2インスタンスのAMI IDを取得
    const instances = await ec2.describeInstances();
    const imagesOfInstances = instances.Reservations.map(reservation => {
      for (let i = 0; i < reservation.Instances.length; i++) {
        return reservation.Instances[i].ImageId;
      }
    });
    //稼働中のEC2インスタンスのAMI以外の非活性を解除
    for (let i = 0; i < images.length - 1; i++) {
      if (!imagesOfInstances.includes(images[i].imageId)) {
        images[i].disable = false;
      }
    }

    console.log(images);
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,GET"
      },
      body: JSON.stringify(images)
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
