UPDATE Agent
SET
  Password = ?,
  UnhashedPassword = ?
WHERE Id = ?
  