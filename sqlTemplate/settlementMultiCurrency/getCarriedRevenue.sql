SELECT a.Name, r.Revenue
FROM
(
SELECT REVERSE(SUBSTRING_INDEX(REVERSE(SUBSTRING_INDEX(AgentCode, '-', 2)), '-', 1)) AS AgentId, IFNULL(SUM(NetWin) * -1, 0) AS Revenue
FROM SummaryMemberBetDaily
WHERE AccountingDate < ?
AND REVERSE(SUBSTRING_INDEX(REVERSE(SUBSTRING_INDEX(AgentCode, '-', 2)), '-', 1)) != ''
GROUP BY REVERSE(SUBSTRING_INDEX(REVERSE(SUBSTRING_INDEX(AgentCode, '-', 2)), '-', 1))
) AS r
JOIN AgentChannel AS a ON a.Id = r.AgentId
WHERE a.AgentId = ?
