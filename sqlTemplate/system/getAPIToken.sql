SELECT Token
FROM ApiToken
WHERE CreateTime <= NOW() AND ExpiredTime >= NOW()
ORDER BY CreateTime DESC
LIMIT 0, 1;