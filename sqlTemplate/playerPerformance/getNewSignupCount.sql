SELECT COUNT(m.Username) AS TotalCount
FROM Member AS m
WHERE m.AgentCode = ?
AND m.AddTime >= ?
AND m.AddTime <= ?
