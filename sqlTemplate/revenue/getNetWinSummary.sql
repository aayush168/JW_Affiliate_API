SELECT DATE_FORMAT(smbd.AccountingDate, '%Y-%m') AS Date, IFNULL(SUM(smbd.NetWin) * -1, 0) AS Revenue
FROM SummaryMemberBetDaily AS smbd
JOIN Member AS m ON m.Id = smbd.MemberId
WHERE smbd.AgentCode LIKE ? AND smbd.AccountingDate < ? AND m.Username LIKE ?
GROUP BY DATE_FORMAT(smbd.AccountingDate, '%Y-%m')