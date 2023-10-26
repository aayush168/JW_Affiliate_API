SELECT Username, Id AS MemberId
FROM Member
WHERE Username = ?
AND Status != 2
