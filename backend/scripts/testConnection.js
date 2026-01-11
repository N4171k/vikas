const pg = require('pg');

const config = {
    user: "avnadmin",
    password: "AVNS_dH70CC3PVYwR474Ti9O",
    host: "95.111.198.255",  // Direct IP instead of hostname
    port: 27803,
    database: "defaultdb",
    ssl: {
        rejectUnauthorized: false,  // Must be false when using IP (hostname won't match cert)
        ca: `-----BEGIN CERTIFICATE-----
MIIETTCCArWgAwIBAgIUCdgmys0w8Vqh4lgkJmEDOcqeulwwDQYJKoZIhvcNAQEM
BQAwQDE+MDwGA1UEAww1M2Y5MDlkNTQtOGQ3MC00MmM4LWFiMDUtOWY0NWY2OTk1
YTAwIEdFTiAxIFByb2plY3QgQ0EwHhcNMjUwMjAyMDYzMTUyWhcNMzUwMTMxMDYz
MTUyWjBAMT4wPAYDVQQDDDUzZjkwOWQ1NC04ZDcwLTQyYzgtYWIwNS05ZjQ1ZjY5
OTVhMDAgR0VOIDEgUHJvamVjdCBDQTCCAaIwDQYJKoZIhvcNAQEBBQADggGPADCC
AYoCggGBALMkOuMT7zYGO+L8pMjFnX5Ylfo5JBXy2AwmpB3Td2Ezix5KcpTno4Km
hiqedkdBzlsOVkThB3T+d3254N2bT3woDRZJ14R+SH9pE9pSYx1RKgvbY8C9cTEp
VsTSJYGa6M8t2H6Bp9brkrby8OjaiosFQe57vI8grro1oKBBbiZqLlT8LmipqMQn
WNXsrroBkmhZH4IfIPUGpdQeIso/1G839c1DopyhQLBgaZLdqFOEU5cSqZjFHhjj
+aNjkRpZc+oC/Wd4GNM4rR33AiKlMDNJ2PYxFj1nYokajELf9ZbE23aZAKKybSEy
E8QI8vjult2qRYchNG8J1GGuR/htNNEq1oiOWqSyXCZSqKMWD97rivBKuFADGvpB
XdCreWoTjnTZVDsKU1GluA44Zt+V/504B05u6cPZxNO2z+khVi67EYHcfZ5tPW+D
miVASkjK7iJYO7GWhK9Gq/wEBCQ8gX2wcLj0wfVuiVT+ldFYSGf6c/anCe6fWXBO
V17+pq/Q+wIDAQABoz8wPTAdBgNVHQ4EFgQUAUmMphKHngKhyW4ZPnTLai08Tf4w
DwYDVR0TBAgwBgEB/wIBADALBgNVHQ8EBAMCAQYwDQYJKoZIhvcNAQEMBQADggGB
AI/CZDSOOtPtahAQe8eCEZ6O1I406J4KYTsmr2x0ZR3z4cf5o9ePTZWZn36+Wde9
FMW1y332UMEy5VxL2JItOuFKCi7Hxiylv7wQbTALRuhuWBN9vINn7fsKuZe1kPX7
0Y1Kzv6+LjxtT1WCbnnMfOUFv/x3OSewvSXell/MZV0f0btoELlnybnSOwF6H1V4
oX2Wxfqa/y5o+DZgdiqRLeMqo9YxqAZ8IM4HaIgJ9uT/A4KyhnhMWbwxOuhJ4GR3
8UCiM5DTAtDrCCNVPDUysKZdtgy2hrWHT9nldxmTQWLjpWNDnZ7noatzm8rTwK+y
RCbeqnKMJmclAY/+vpbIs1oeRAbSQUPsTAbRPcx4QHtTZfrunNvnwbne7lGA/9SF
DpU73/8AP/P/ykQyywKrUzjmUK1p+0hDgKRDLmDPiArxt8UUQZ+54ftdbovRErXa
lFJFaD9gFTv24+kq95iHwu79vhDWeBnPJHjH1dt/Xi1C9XhKLtOUzlp/+ODc4xmh
Rg==
-----END CERTIFICATE-----`,
    },
};

console.log('🔌 Connecting to Aiven PostgreSQL via IP...');
const client = new pg.Client(config);
client.connect(function (err) {
    if (err) {
        console.error('❌ Connection error:', err.message);
        process.exit(1);
    }
    client.query("SELECT VERSION()", [], function (err, result) {
        if (err) {
            console.error('❌ Query error:', err.message);
            process.exit(1);
        }

        console.log('✅ Connection successful!');
        console.log(result.rows[0].version);
        client.end(function (err) {
            if (err) {
                console.error('Disconnect error:', err);
                process.exit(1);
            }
        });
    });
});
