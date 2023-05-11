UPDATE Agent
SET
  `Password` = ?,
  UnhashedPassword = ?,
  Salt1 = ?,
  Salt2 = ?
WHERE Id = ?
  