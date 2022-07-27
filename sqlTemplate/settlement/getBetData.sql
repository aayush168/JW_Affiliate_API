SELECT a.Name, r.Turnover, r.Revenue, r.Count
FROM
(
SELECT REVERSE(SUBSTRING_INDEX(REVERSE(SUBSTRING_INDEX(smbd.AgentCode, '-', 2)), '-', 1)) AS AgentId, IFNULL(SUM(smbd.BetAmount), 0) AS Turnover, IFNULL(SUM(smbd.NetWin) * -1, 0) AS Revenue, COUNT(m.Id) AS Count
FROM SummaryMemberBetDaily AS smbd
JOIN Member AS m ON m.Id = smbd.MemberId
WHERE smbd.AccountingDate >= ? AND smbd.AccountingDate <= ?
AND REVERSE(SUBSTRING_INDEX(REVERSE(SUBSTRING_INDEX(smbd.AgentCode, '-', 2)), '-', 1)) != ''
GROUP BY REVERSE(SUBSTRING_INDEX(REVERSE(SUBSTRING_INDEX(smbd.AgentCode, '-', 2)), '-', 1))
) AS r
JOIN Agent AS a ON a.Id = r.AgentId
