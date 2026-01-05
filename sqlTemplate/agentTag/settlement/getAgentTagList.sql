SELECT
    atm.AgentId,
    a.Username,
    GROUP_CONCAT(at.Name ORDER BY at.Name SEPARATOR ', ') AS Tags
FROM AgentTagMapping atm
JOIN AgentTag at
    ON at.Id = atm.AgentTagId
JOIN Agent a
    ON atm.AgentId = a.Id
WHERE at.Status = 1
GROUP BY atm.AgentId;
