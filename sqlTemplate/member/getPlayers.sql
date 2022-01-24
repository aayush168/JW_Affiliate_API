SELECT m.Username, m.RealName, m.AddTime, m.AddIP, m.Status
FROM Member AS m
WHERE 1 = 1
AND m.Status != 2
AND m.AgentCode Like ?
AND (1 = ? OR m.Username LIKE ?)
AND (1 = ? OR m.Status = ?)
AND (1 = ? OR m.AddTime >= ?)
AND (1 = ? OR m.AddTime <= ?)
LIMIT $start,20
