SELECT *
FROM NegativeCarryover 
WHERE Username = ?
AND CreatedAt >= ?
AND CreatedAt <= ?