SELECT m.Username, m.RealName, m.AddTime, m.AddIP, m.Status
FROM Member AS m
WHERE 1 = 1
  AND m.AgentCode LIKE ?
  ${Username}
  ${Status}
  ${StartDate}
  ${EndDate}
ORDER BY m.AddTime Desc
LIMIT ?,20