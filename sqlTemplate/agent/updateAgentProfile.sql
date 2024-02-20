UPDATE Agent
SET
  Username = ?,
  UnhashedPassword = ?,
  Password = ?,
  Salt1 = ?,
  Salt2 = ?,
  Mobile = ?,
  Whatsapp = ?,
  Skype = ?,
  Email = ?,
  PlayerSourceType = ?,
  OtherSourceLink = ?,
  Status = ?,
  Remark = ?,
  Telegram = ?
WHERE Id = ?
  