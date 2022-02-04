const path = require('path');
const aws = require('aws-sdk');
const moment = require('moment-timezone');

const logger = require(path.join(rootPath, 'logger', 'index.js'));
const log = logger.getLogger('aws');

const config = require(path.join(rootPath, 'config', 'index.js'));
const app = config.app;

const systemService = require(path.join(rootPath, 'system', 'index.js'))
const fileUtil = require(path.join(rootPath, 'utils', 'file.js'))
const credPath = path.join(rootPath, 'credentials', 'credential.json')

let service = {}
let s3;

function awsUpload(file) {
  file.originalname = file.fieldname + '_' + moment().tz('Asia/Taipei').format('YYYYMMDDHHmmss') + '_' + path.extname(file.originalname)
  return s3.upload({
    Bucket: app.awsConfig.bucket,
    Key: `${app.awsConfig.folder}/${file.originalname}`,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: "public-read",
    CacheControl: `public,max-age=${(24*60*60).toString()}`
  }).promise()
}

function awsDelete(bucket, fileKey) {
  return s3.deleteObject({
    Bucket: bucket,
    Key: fileKey
  }).promise();
}

async function setupAWSCredential() {
  try {
    const keyId = (await systemService.getParameter('aws.accessKeyId'))['Value']
    const accessKey = (await systemService.getParameter('aws.secretAccessKey'))['Value']
    const region = (await systemService.getParameter('aws.region'))['Value']
    const data = {
      "accessKeyId": keyId,
      "secretAccessKey": accessKey,
      "region": region
    }
    await fileUtil.writeJsonFile(credPath, data)
  } catch (err) {
    log.error(err)
    throw new Error(err)
  }
}

service.init = async () => {
  try {
    await setupAWSCredential()
    aws.config.loadFromPath(path.join(rootPath, 'credentials/credential.json'));
    aws.config.setPromisesDependency(null);
    s3 = new aws.S3();
    log.info('AWS configuration set successfully.')
  } catch (err) {
    log.error(err)
    throw new Error(err);
  }
}

service.save = async (file) => {
  try {
    return await awsUpload(file)
  } catch (err) {
    log.error(err)
    throw new Error(err);
  }
}

service.update = async (file, bucket, filekey) => {
  try {
    await service.delete(bucket, filekey)
    return await service.save(file, bucket, filekey)
  } catch (err) {
    log.error(err)
    throw err;
  }
}

service.delete = async (bucket, key) => {
  try {
    await awsDelete(bucket, key)
  } catch (err) {
    log.error(err)
    throw err;
  }
}

module.exports = service;