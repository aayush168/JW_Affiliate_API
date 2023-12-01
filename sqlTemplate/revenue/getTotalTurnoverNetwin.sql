SELECT IFNULL(SUM(smbd.BetAmount), 0) AS Turnover, IFNULL(SUM(smbd.NetWin), 0) AS Revenue
FROM SummaryMemberBetDaily AS smbd
JOIN Member AS m ON m.Id = smbd.MemberId
WHERE smbd.AgentCode LIKE ? 
AND smbd.AccountingDate >= ? AND smbd.AccountingDate <= ? AND
m.Username LIKE ?