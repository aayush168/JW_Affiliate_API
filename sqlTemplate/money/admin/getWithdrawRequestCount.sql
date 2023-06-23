SELECT Count(w.Id) AS Count
FROM Withdraw AS w
JOIN Agent AS a ON w.agentId = a.Id
LEFT JOIN Operator AS o ON w.OperatorId = o.Id
WHERE a.Username LIKE ?
${Status}
${CreatedAt}
ORDER BY a.Created_at DESC