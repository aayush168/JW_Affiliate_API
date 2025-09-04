const path = require('path');
const express = require('express')
const router = express.Router();
const logger = require(path.join(rootPath, 'logger', 'index.js'));
const	log = logger.getLogger('advertisement');
const advertisementService = require(path.join(rootPath, 'service', 'advertisement', 'client.js'));
const s3Service = require(path.join(rootPath, 'service', 'awsUpload.js'));

router.post('/banner/getList', async function (req, res) {
  try {
    let size = req.body.size ? parseInt(req.body.size) : 20;
    let page = req.body.page ? size * (parseInt(req.body.page) - 1) : 0;
    const result = await advertisementService.getBannerList(size, page)
    res.json(result)
  } catch (err) {
    log.error(err)
    res.status(500).send(err);
  }
})

router.post('/banner/getPresignedUrl', async function (req, res) {
  try {
    const adId = req.body.adId
    const expiresIn = req.body.expiresIn || 3600 // Default 1 hour
    
    if (!adId) {
      return res.status(400).json({ code: 'params.adId.required', msg: 'Advertisement ID is required' })
    }

    // Get the S3 data for the advertisement
    const getAdS3Data = await advertisementService.getAdS3Data(adId)
    if (getAdS3Data.length === 0) {
      return res.status(404).json({ code: 'params.adId.notFound', msg: 'Advertisement image not found' })
    }

    const key = getAdS3Data[0].PreviewKey
    if (!key) {
      return res.status(404).json({ code: 'params.key.notFound', msg: 'S3 key not found for this advertisement' })
    }

    // Generate pre-signed URL using the S3 service
    const presignedUrl = await s3Service.getPresignedUrl(key, expiresIn)
    res.json({
      code: 'common.success',
      url: presignedUrl,
      adId: adId,
    })
  } catch (err) {
    log.error('Error generating pre-signed URL for advertisement:', err)
    res.status(500).json({ 
      code: 's3.error', 
      msg: 'Failed to generate pre-signed URL' 
    });
  }
})

module.exports = router; 