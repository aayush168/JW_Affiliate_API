SELECT SUM(r.Promotion) AS Amount
FROM
(
SELECT IFNULL(SUM(smid.PromotionAmount) - SUM(smid.RefundPromotionAmount), 0) AS Promotion
FROM SummaryMemberInfoDaily AS smid
JOIN Member AS m ON m.Id = smid.MemberId
WHERE smid.AgentCode = ?
AND smid.AccountingDate >= ? AND smid.AccountingDate <= ?
AND m.Username LIKE ?
GROUP BY m.Username
) AS r
