const AWS = require("aws-sdk");
AWS.config.update({ region: "ap-northeast-1" });
AWS.config.apiVersions = {
  cloudformation: "2010-05-15"
};
const cloudformation = new AWS.CloudFormation();

exports.handler = async event => {
  console.log(JSON.stringify(event, null, 2));

  try {
    const params = {
      //NextToken: 'STRING_VALUE',
      StackName: process.env.StackName
    };

    const result = await cloudformation.describeStackEvents(params).promise();
    const stackEvents = result.StackEvents;

    //リリース日のイベントのみ抽出する
    let now = new Date();
    now = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
    now.getSeconds;

    const state = [];
    const time = [];
    for (let i = 0; i < stackEvents.length; i++) {
      const timestamp = `${stackEvents[
        i
      ].Timestamp.getFullYear()}-${stackEvents[i].Timestamp.getMonth() +
        1}-${stackEvents[i].Timestamp.getDate()}`;
      if (now === timestamp) {
        //リソース名 : 更新状況
        state.push(
          `${stackEvents[i].LogicalResourceId} : ${stackEvents[i].ResourceStatus}`
        );
        time.push(stackEvents[i].Timestamp);
      }
    }

    if (state.length === 0) {
      return {
        statusCode: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "OPTIONS,GET"
        },
        body: JSON.stringify("Event does not exist")
      };
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,GET"
      },
      body: JSON.stringify({
        state,
        time,
        stackName: process.env.StackName
      })
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
