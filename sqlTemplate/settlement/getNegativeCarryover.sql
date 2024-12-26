SELECT *
FROM NegativeCarryover
WHERE
  CreatedAt >= ? AND CreatedAt <= ?
