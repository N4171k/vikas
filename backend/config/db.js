const { Sequelize } = require('sequelize');
const dns = require('dns');
const { promisify } = require('util');
require('dotenv').config();

// For development: Allow self-signed certificates
if (process.env.NODE_ENV === 'development') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const resolve4 = promisify(dns.resolve4);

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

// Initialize Sequelize synchronously
let sequelize = null;

// Initialize immediately - don't wait for DNS resolution
try {
  if (process.env.DATABASE_URL) {
    // Parse and clean the DATABASE_URL
    let dbUrl = process.env.DATABASE_URL;
    
    // Remove sslmode parameter to avoid conflicts with dialectOptions
    dbUrl = dbUrl.replace(/\?sslmode=require/i, '');
    
    // Configure SSL properly for self-signed certificates
    const sequelizeConfig = {
      dialect: 'postgres',
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000
      },
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false  // Accept self-signed certificates in dev
        }
      }
    };
    
    sequelize = new Sequelize(dbUrl, sequelizeConfig);
    console.log('✓ Sequelize initialized with DATABASE_URL');
  } else {
    // Fallback: use hardcoded Aiven connection
    sequelize = new Sequelize({
      dialect: 'postgres',
      host: '213.163.204.106',
      port: 27803,
      username: 'avnadmin',
      password: 'AVNS_dH70CC3PVYwR474Ti9O',
      database: 'defaultdb',
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false,
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
    console.log('✓ Sequelize initialized with hardcoded Aiven connection');
  }
} catch (error) {
  console.error('❌ Failed to initialize Sequelize:', error.message);
  process.exit(1);
}

// Perform DNS resolution and monitoring asynchronously (doesn't block startup)
async function initializeDatabase() {
  try {
    // Try to resolve hostname for monitoring (optional, doesn't block)
    if (process.env.DATABASE_URL) {
      try {
        const url = new URL(process.env.DATABASE_URL);
        const hostname = url.hostname;
        const addresses = await resolve4(hostname);
        console.log(`✓ DNS resolved ${hostname} to ${addresses[0]}`);
      } catch (dnsError) {
        console.log(`⚠ DNS resolution check failed: ${dnsError.message}`);
      }
    }
  } catch (error) {
    console.error('Background DNS monitoring error:', error.message);
  }
}

// Initialize database
initializeDatabase().catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
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
