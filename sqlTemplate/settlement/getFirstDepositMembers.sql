SELECT a.Name, r.Count
FROM
(
SELECT REVERSE(SUBSTRING_INDEX(REVERSE(SUBSTRING_INDEX(m.AgentCode, '-', 2)), '-', 1)) AS AgentId, COUNT(m.Id) AS Count
FROM Member AS m
JOIN MemberAccount AS ma
ON m.Id = ma.MemberId
WHERE ma.FirstDepositTime >= ? AND ma.FirstDepositTime <= ?
AND REVERSE(SUBSTRING_INDEX(REVERSE(SUBSTRING_INDEX(m.AgentCode, '-', 2)), '-', 1)) != ''
GROUP BY REVERSE(SUBSTRING_INDEX(REVERSE(SUBSTRING_INDEX(m.AgentCode, '-', 2)), '-', 1))
) AS r
JOIN Agent AS a ON a.Id = r.AgentId
