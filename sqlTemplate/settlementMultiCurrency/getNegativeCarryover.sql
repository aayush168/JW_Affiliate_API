SELECT *
FROM NegativeCarryover
WHERE
  CreateAt >= ? AND CreatedAt <= ?
