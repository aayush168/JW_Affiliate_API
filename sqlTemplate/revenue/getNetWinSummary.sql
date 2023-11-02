SELECT IFNULL(SUM(smbd.NetWin) * -1, 0) AS Revenue
FROM SummaryMemberBetDaily AS smbd
JOIN Member AS m ON m.Id = smbd.MemberId
LEFT JOIN AgentChannel AS ac ON ac.Code = smbd.AgentCode
WHERE m.Status != 2
AND smbd.AgentCode = ?
AND smbd.AccountingDate < ?
AND m.Username LIKE ?
AND smbd.AgentCode IN ( SELECT Code FROM AgentChannel )
GROUP BY smbd.AgentCode