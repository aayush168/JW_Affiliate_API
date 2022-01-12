SELECT m.Username, IFNULL(SUM(smbd.BetAmount), 0) AS Turnover, IFNULL(SUM(smbd.NetWin), 0) AS NetWin
FROM SummaryMemberBetDaily AS smbd
JOIN Member AS m ON m.Id = smbd.MemberId
WHERE m.Status != 2 AND smbd.AgentCode LIKE ?
AND smbd.AccountingDate >= ? AND smbd.AccountingDate <= ?
AND (1 = ? OR m.Username LIKE ?)
GROUP BY m.Username
