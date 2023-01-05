SELECT a.Name, r.Username, r.MemberId
FROM (
SELECT REVERSE(SUBSTRING_INDEX(REVERSE(SUBSTRING_INDEX(AgentCode, '-', 2)), '-', 1)) AS AgentId, Username, Id AS MemberId
FROM Member
WHERE REVERSE(SUBSTRING_INDEX(REVERSE(SUBSTRING_INDEX(AgentCode, '-', 2)), '-', 1)) != ''
AND Status != 2
AND AddTime <= ?
AND AgentId = ?
) AS r
JOIN AgentChannel AS a ON a.Id = r.AgentId
