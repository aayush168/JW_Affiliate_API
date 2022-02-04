SELECT 
COUNT(ab.Id) AS Count
FROM AdvertisementBanner AS ab
JOIN
AdvertisementCategory AS ac ON ab.AdvertisementCategoryId = ac.Id
JOIN
PictureFiles AS pf ON pf.ReferenceId = ab.Id
AND pf.Category = 'advertisement-banner'
WHERE ab.Status = 1
ORDER BY ab.Order DESC