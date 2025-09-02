SELECT 
ab.*, pf.PreviewUrl as BannerUrl 
FROM AffiliateBonus AS ab
JOIN
PictureFiles AS pf ON pf.ReferenceId = ab.Id
AND pf.Category = 'bonus-banner'
WHERE ab.Name LIKE "%%"
${Status}
ORDER BY ab.Created_at DESC
LIMIT ?, ?