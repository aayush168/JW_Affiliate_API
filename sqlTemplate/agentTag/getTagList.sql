SELECT at.*, COUNT(atm.AgentId) AS TotalAgentCount
FROM AgentTag at
LEFT JOIN AgentTagMapping atm ON at.Id = atm.AgentTagId
WHERE 1 = 1
${Name}
${Status}
GROUP BY at.Id
ORDER BY at.UpdatedAt DESC
LIMIT ?,?