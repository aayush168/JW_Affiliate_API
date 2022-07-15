SELECT a.Name, r.Count
FROM
(
SELECT REVERSE(SUBSTRING_INDEX(REVERSE(SUBSTRING_INDEX(m.AgentCode, '-', 2)), '-', 1)) AS AgentId, COUNT(m.Id) AS Count
FROM Member AS m
JOIN SummaryMemberBetDaily AS smbd
ON m.Id = smbd.MemberId
WHERE smbd.AccountingDate >= ? AND smbd.AccountingDate <= ?
AND REVERSE(SUBSTRING_INDEX(REVERSE(SUBSTRING_INDEX(m.AgentCode, '-', 2)), '-', 1)) != ''
GROUP BY REVERSE(SUBSTRING_INDEX(REVERSE(SUBSTRING_INDEX(m.AgentCode, '-', 2)), '-', 1))
) AS r
JOIN Agent AS a ON a.Id = r.AgentId
