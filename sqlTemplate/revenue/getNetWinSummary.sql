SELECT IFNULL(SUM(smbd.NetWin) * -1, 0) AS Revenue
FROM SummaryMemberBetDaily AS smbd
JOIN Member AS m ON m.Id = smbd.MemberId
LEFT JOIN AgentChannel AS ac ON ac.Code = smbd.AgentCode
WHERE smbd.AgentCode = ?
AND smbd.AccountingDate < ?
AND m.Username LIKE ?
GROUP BY smbd.AgentCode