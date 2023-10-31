SELECT a.Name, r.Username, r.MemberId
FROM (
SELECT SUBSTRING_INDEX(REVERSE(SUBSTRING_INDEX(REVERSE(REPLACE(AgentCode, 'C', '-')), '-', 2)), '-', 1) AS AgentId, Username, Id AS MemberId
FROM Member
WHERE Status != 2
AND AddTime <= ?
AND AgentId = ?
) AS r
JOIN AgentChannel AS a ON a.Id = r.AgentId
