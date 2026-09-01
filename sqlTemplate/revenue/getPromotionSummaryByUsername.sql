SELECT DATE_FORMAT(smid.AccountingDate, '%Y-%m') AS Date,
       IFNULL(SUM(smid.PromotionAmount) - SUM(smid.RefundPromotionAmount), 0) AS Promotion
FROM SummaryMemberInfoDaily AS smid
JOIN Member AS m ON m.Id = smid.MemberId
WHERE smid.AgentCode LIKE ?
AND smid.AccountingDate < ?
AND m.Username LIKE ?
GROUP BY DATE_FORMAT(smid.AccountingDate, '%Y-%m')
ORDER BY Date
