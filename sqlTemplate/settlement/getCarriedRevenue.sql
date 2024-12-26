SELECT
    SUM(
        CASE
            WHEN r.Username = @current_username THEN 
                IF((@carry_over + r.Revenue) >= 0, 0, @carry_over + r.Revenue)
            ELSE
                IF(r.Revenue >= 0, 0, r.Revenue)
        END
    ) AS Revenue,
    @current_username := r.Username AS Username
FROM (
    SELECT
        a.Username,
        SUBSTRING_INDEX(REVERSE(SUBSTRING_INDEX(REVERSE(REPLACE(smbd.AgentCode, 'C', '-')), '-', 2)), '-', 1) AS AgentId,
        DATE_FORMAT(smbd.AccountingDate, '%Y-%m') AS AccountingDate,
        IFNULL(SUM(smbd.NetWin) * -1, 0) AS Revenue
    FROM SummaryMemberBetDaily AS smbd FORCE INDEX (IDX_AccountingDate)
    JOIN AgentChannel AS a ON a.Id = SUBSTRING_INDEX(REVERSE(SUBSTRING_INDEX(REVERSE(REPLACE(smbd.AgentCode, 'C', '-')), '-', 2)), '-', 1)
    WHERE smbd.AccountingDate < ? AND smbd.AccountingDate > '2022-12-31 23:59:59'
    AND smbd.AgentCode IN (SELECT Code FROM AgentChannel)
    GROUP BY a.Username, SUBSTRING_INDEX(REVERSE(SUBSTRING_INDEX(REVERSE(REPLACE(smbd.AgentCode, 'C', '-')), '-', 2)), '-', 1), DATE_FORMAT(smbd.AccountingDate, '%Y-%m')
) AS r
JOIN AgentChannel AS a ON a.Id = r.AgentId
JOIN (SELECT @carry_over := 0, @current_username := NULL) AS init
WHERE a.AgentId = ?
GROUP BY r.Username