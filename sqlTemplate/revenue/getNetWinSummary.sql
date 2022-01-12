SELECT DATE_FORMAT(smbd.AccountingDate, '%Y-%m') AS Date, IFNULL(SUM(smbd.NetWin) * -1, 0) AS Revenue
FROM SummaryMemberBetDaily AS smbd
JOIN Member AS m ON m.Id = smbd.MemberId
WHERE m.Status != 2 AND smbd.AgentCode LIKE ? AND smbd.AccountingDate < ?
GROUP BY DATE_FORMAT(smbd.AccountingDate, '%Y-%m')