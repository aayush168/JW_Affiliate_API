SELECT cl.AgentUsername, cl.Created_at, cl.Money, o.Username AS OperatorUsername, a.PlayerAccountUsername, CASE cl.Status
        WHEN 1 THEN 'Success'
        WHEN 2 THEN 'Rejected'
        ELSE 'Unknown'
    END AS Status
FROM TransferLog AS cl
JOIN Agent AS c
ON cl.AgentUsername = c.Username
JOIN Operator AS o
ON cl.OperatorId = o.Id
JOIN AgentPaymentInfo AS a
ON a.AgentId = c.Id
${Username}
${AddTime}
${Amount}
${Status}
ORDER BY cl.Created_at DESC
