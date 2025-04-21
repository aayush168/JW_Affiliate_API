SELECT *
FROM NegativeCarryover
${Username}
${StartDate}
${EndDate}
ORDER BY CreatedAt DESC
LIMIT ?, ?
