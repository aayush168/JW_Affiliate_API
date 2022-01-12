SELECT IFNULL(SUM(smbd.BetAmount), 0) AS Turnover, IFNULL(SUM(smbd.NetWin), 0) AS Revenue
FROM SummaryMemberBetDaily AS smbd
JOIN Member AS m ON m.Id = smbd.MemberId
WHERE m.Status != 2 AND smbd.AgentCode LIKE ? 
AND DATE(smbd.AccountingDate) >= ? AND DATE(smbd.AccountingDate) <= ?