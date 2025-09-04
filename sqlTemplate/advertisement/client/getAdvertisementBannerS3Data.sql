SELECT 
pf.PreviewKey as PreviewKey
FROM PictureFiles AS pf
JOIN AdvertisementBanner AS ab ON pf.ReferenceId = ab.Id
AND pf.Category = 'advertisement-banner'
WHERE ab.Id = ?