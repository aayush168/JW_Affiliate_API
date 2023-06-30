SELECT COUNT(wl.Id) AS Count
FROM WithdrawLog AS wl
JOIN Withdraw AS w ON wl.WithdrawId = w.Id
JOIN Agent AS a ON w.AgentId = a.Id
WHERE a.Username LIKE ?