SELECT a.Name, a.Username, r.Count, a.AddTime
FROM
(
SELECT SUBSTRING_INDEX(REVERSE(SUBSTRING_INDEX(REVERSE(REPLACE(AgentCode, 'C', '-')), '-', 2)), '-', 1) AS AgentId, COUNT(Id) AS Count
FROM Member
WHERE Status != 2
AND AddTime <= ?
AND AgentId = ?
GROUP BY SUBSTRING_INDEX(REVERSE(SUBSTRING_INDEX(REVERSE(REPLACE(AgentCode, 'C', '-')), '-', 2)), '-', 1)
) AS r
JOIN AgentChannel AS a ON a.Id = r.AgentId
