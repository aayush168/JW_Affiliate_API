SELECT a.Name, r.Count
FROM
(
SELECT SUBSTRING_INDEX(REVERSE(SUBSTRING_INDEX(REVERSE(REPLACE(m.AgentCode, 'C', '-')), '-', 2)), '-', 1) AS AgentId, COUNT(m.Id) AS Count
FROM Member AS m
JOIN MemberAccount AS ma
ON m.Id = ma.MemberId
WHERE ma.FirstDepositTime >= ? AND ma.FirstDepositTime <= ?
GROUP BY SUBSTRING_INDEX(REVERSE(SUBSTRING_INDEX(REVERSE(REPLACE(m.AgentCode, 'C', '-')), '-', 2)), '-', 1)
) AS r
JOIN AgentChannel AS a ON a.Id = r.AgentId
WHERE a.AgentId = ?
