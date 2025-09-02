SELECT 
COUNT(ab.Id) AS Count
FROM AffiliateBonus AS ab
JOIN
PictureFiles AS pf ON pf.ReferenceId = ab.Id
AND pf.Category = 'bonus-banner'
WHERE ab.Status = 1
ORDER BY ab.Order