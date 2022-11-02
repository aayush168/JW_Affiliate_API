SELECT rr.Name, COALESCE(SUM(rr.Deposit), 0) AS Deposit, COALESCE(SUM(rr.Promotion), 0) AS Promotion
FROM (
SELECT (
	CASE
		WHEN aa.Name IS NULL THEN a.`Name`
		ELSE aa.Name
	END
) AS Name, aa.Name AS ParentName, r.Deposit, r.Promotion
FROM
(
SELECT smid.AgentCode, IFNULL(SUM(smid.Deposit + smid.HandDeposit + smid.OnlineDeposit), 0) AS Deposit, IFNULL(SUM(smid.PromotionAmount) - SUM(smid.RefundPromotionAmount), 0) AS Promotion
FROM SummaryMemberInfoDaily AS smid
JOIN Member AS m ON m.Id = smid.MemberId
WHERE smid.AccountingDate >= ? AND smid.AccountingDate <= ?
GROUP BY smid.AgentCode
) AS r
JOIN Agent AS a ON a.Code = r.AgentCode
LEFT JOIN Agent AS aa ON a.ParentId = aa.Id AND a.ParentId != 0
) AS rr
GROUP BY rr.Name