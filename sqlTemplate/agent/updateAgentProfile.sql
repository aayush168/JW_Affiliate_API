UPDATE Agent
SET
  UnhashedPassword = ?,
  Password = ?,
  Salt1 = ?,
  Salt2 = ?,
  Mobile = ?,
  Whatsapp = ?,
  Skype = ?,
  Email = ?,
  BusinessEmail = ?,
  PlayerSourceType = ?,
  OtherSourceLink = ?,
  Status = ?,
  Remark = ?,
  Telegram = ?,
  DOB = ?,
  ReferralUsername = ?
WHERE Id = ?
  