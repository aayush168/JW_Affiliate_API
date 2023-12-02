SELECT IFNULL(SUM(smid.Deposit + smid.HandDeposit + smid.OnlineDeposit), 0) AS Deposit, IFNULL(SUM(smid.Withdraw + smid.OnlineWithdraw), 0) AS Withdraw, IFNULL(SUM(smid.PromotionAmount) - SUM(smid.RefundPromotionAmount), 0) AS Promotion
FROM SummaryMemberInfoDaily AS smid
JOIN Member AS m ON m.Id = smid.MemberId
WHERE smid.AgentCode LIKE ?
AND smid.AccountingDate >= ? AND smid.AccountingDate <= ?
AND (1 = ? OR m.Username LIKE ?)
