 
SELECT op.*, r.Name AS Role
FROM Operator AS op
LEFT JOIN Role AS r
ON op.RoleId = r.Id
WHERE op.Username = ?