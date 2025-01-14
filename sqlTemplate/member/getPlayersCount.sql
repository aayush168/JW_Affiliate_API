SELECT COUNT(m.Username) AS TotalCount
FROM Member AS m
WHERE 1 = 1
  AND m.AgentCode LIKE ?
  ${Username}
  ${Status}
  ${StartDate}
  ${EndDate}