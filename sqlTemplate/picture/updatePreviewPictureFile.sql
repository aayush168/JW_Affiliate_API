UPDATE PictureFiles
SET
  PreviewUrl = ?,
  PreviewKey = ?
WHERE ReferenceId = ? AND Category = ?
  