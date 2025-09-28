SELECT Username, ReferralUsername, Created_at,
CASE 
    WHEN EXISTS (SELECT 1 FROM Agent AS a WHERE a.Username = m.ReferralUsername) 
    THEN 'true' 
    ELSE 'false' 
END AS IsValidReferral
FROM Agent AS m
WHERE ReferralUsername IS NOT NULL
${Username}
${StartDate}
${EndDate}