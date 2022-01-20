SELECT ao.Id as OperatorIdx, ao.Username as OperatorID, ao.Code, ao.Name as OperatorName, ao.Status as Active, 
FROM AgentChannel AS ao
WHERE ao.Username = ?
