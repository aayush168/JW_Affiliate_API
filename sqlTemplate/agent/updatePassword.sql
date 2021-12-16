UPDATE Agent
SET
  UnhashedPassword = ?,
  Password = ?,
  Salt1 = ?,
  Salt2 = ?
WHERE Id = ?
  