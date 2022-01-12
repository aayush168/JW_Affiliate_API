SELECT ao.OperatorIdx, ao.OperatorID, a.Code, ao.OperatorName, ao.OperatorPW, ao.Active, ao.FailTimes, ao.salt, ao.salt2
FROM AgentOperator AS ao
JOIN Agent AS a ON a.Name = ao.OperatorID
WHERE ao.OperatorID = ?
