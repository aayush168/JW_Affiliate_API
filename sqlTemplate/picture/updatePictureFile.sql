UPDATE PictureFiles
SET
  Url = ?,
  `Key` = ?
WHERE ReferenceId = ? AND Category = ?
  