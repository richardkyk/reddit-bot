var AWS = require("aws-sdk");

AWS.config.update({
  region: "ap-southeast-2",
  endpoint: "https://dynamodb.ap-southeast-2.amazonaws.com",
});

var dynamo = new AWS.DynamoDB.DocumentClient();

var table = "activities";

module.exports.updateItem = async (
  userId,
  createdTimestamp,
  paramsName,
  paramsValue
) => {
  const params = {
    TableName: table,
    Key: {
      userId,
      createdTimestamp,
    },
    ConditionExpression: "attribute_exists(userId)",
    UpdateExpression: "set " + paramsName + " = :v",
    ExpressionAttributeValues: {
      ":v": paramsValue,
    },
    ReturnValues: "UPDATED_NEW",
  };

  try {
    const response = dynamo.update(params).promise();
    return response.Attributes;
  } catch (err) {
    console.log(err);
  }
};

module.exports.saveItem = async (item) => {
  const params = {
    TableName: table,
    Item: item,
  };

  try {
    const response = dynamo.put(params).promise();
    return response;
  } catch (err) {
    console.log(err);
  }
};

module.exports.getItems = async (userId) => {
  const params = {
    TableName: table,
    KeyConditionExpression: "userId = :id",
    ExpressionAttributeValues: {
      ":id": userId,
    },
  };

  try {
    return await getAllData(params);
  } catch (err) {
    console.log(err);
  }
};

const getAllData = async (params, allData = []) => {
  let partialData = allData;
  let data = await dynamo.query(params).promise();

  if (data["Items"].length > 0) {
    partialData = [...allData, ...data["Items"]];
  }

  if (data.LastEvaluatedKey) {
    params.ExclusiveStartKey = data.LastEvaluatedKey;
    return await getAllData(params, partialData);
  } else {
    return partialData;
  }
};
