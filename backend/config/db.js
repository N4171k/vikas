const { Sequelize } = require('sequelize');
require('dotenv').config();

// Aiven CA Certificate for SSL
const AIVEN_CA_CERT = `-----BEGIN CERTIFICATE-----
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
-----END CERTIFICATE-----`;

// PostgreSQL connection using Aiven with CA certificate
// Using IP address (95.111.198.255) instead of hostname due to DNS issues in some environments
const sequelize = new Sequelize({
  dialect: 'postgres',
  host: '95.111.198.255',
  port: 27803,
  username: 'avnadmin',
  password: 'AVNS_dH70CC3PVYwR474Ti9O',
  database: 'defaultdb',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,  // Must be false when using IP (hostname won't match cert)
      ca: AIVEN_CA_CERT
    }
  },
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// Test database connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    return true;
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error.message);
    return false;
  }
};

// Sync all models with database
const syncDatabase = async (force = false) => {
  try {
    await sequelize.sync({ force, alter: !force });
    console.log('✅ Database synchronized successfully.');
    return true;
  } catch (error) {
    console.error('❌ Database sync error:', error.message);
    return false;
  }
};

module.exports = { sequelize, testConnection, syncDatabase };
