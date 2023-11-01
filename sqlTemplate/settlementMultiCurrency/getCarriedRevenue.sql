SELECT a.Name, r.Revenue
FROM
(
SELECT SUBSTRING_INDEX(REVERSE(SUBSTRING_INDEX(REVERSE(REPLACE(AgentCode, 'C', '-')), '-', 2)), '-', 1) AS AgentId, IFNULL(SUM(NetWin) * -1, 0) AS Revenue
FROM SummaryMemberBetDaily
WHERE AccountingDate < ?
AND AgentCode IN ( SELECT Code FROM AgentChannel ) 
GROUP BY SUBSTRING_INDEX(REVERSE(SUBSTRING_INDEX(REVERSE(REPLACE(AgentCode, 'C', '-')), '-', 2)), '-', 1)
) AS r
JOIN AgentChannel AS a ON a.Id = r.AgentId
WHERE a.AgentId = ?
