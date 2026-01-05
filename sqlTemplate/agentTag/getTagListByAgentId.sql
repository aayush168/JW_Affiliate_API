SELECT at.*, atm.AgentId
FROM AgentTagMapping atm
JOIN AgentTag at ON atm.AgentTagId = at.Id
WHERE atm.AgentId = ?
ORDER BY at.UpdatedAt DESC