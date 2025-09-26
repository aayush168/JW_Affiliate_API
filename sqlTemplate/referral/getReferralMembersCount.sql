SELECT COUNT(Id) AS Count
FROM Agent
WHERE ReferralUsername IS NOT NULL
${Username}
${StartDate}
${EndDate}