SELECT Id as OperatorIdx, Username as OperatorID, Code, Name as OperatorName, Status as Active
FROM AgentChannel
WHERE Username = ?
