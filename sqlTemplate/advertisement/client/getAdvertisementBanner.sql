SELECT 
ab.*, ac.Name as CategoryName, pf.Url as Url, pf.PreviewUrl 
FROM AdvertisementBanner AS ab
JOIN
AdvertisementCategory AS ac ON ab.AdvertisementCategoryId = ac.Id
JOIN
PictureFiles AS pf ON pf.ReferenceId = ab.Id
AND pf.Category = 'advertisement-banner'
WHERE ab.Status = 1
ORDER BY ab.Order
LIMIT ?, ?