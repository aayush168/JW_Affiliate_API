SELECT COUNT(m.Username) AS TotalCount
FROM Member AS m
WHERE 1 = 1
AND m.AgentCode = ?
AND (1 = ? OR m.Username LIKE ?)
AND (1 = ? OR m.Status = ?)
AND (1 = ? OR m.AddTime >= ?)
AND (1 = ? OR m.AddTime <= ?)
