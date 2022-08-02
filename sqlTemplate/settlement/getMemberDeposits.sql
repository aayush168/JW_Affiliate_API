SELECT a.Name, r.Deposit, r.Promotion
FROM
(
SELECT smid.AgentCode, IFNULL(SUM(smid.Deposit + smid.HandDeposit + smid.OnlineDeposit), 0) AS Deposit, IFNULL(SUM(smid.PromotionAmount) - SUM(smid.RefundPromotionAmount), 0) AS Promotion
FROM SummaryMemberInfoDaily AS smid
JOIN Member AS m ON m.Id = smid.MemberId
WHERE smid.AccountingDate >= ? AND smid.AccountingDate <= ?
GROUP BY smid.AgentCode
) AS r
JOIN AgentChannel AS a ON a.Code = r.AgentCode

