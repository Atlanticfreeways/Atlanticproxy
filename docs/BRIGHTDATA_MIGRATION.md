# Migrating to Bright Data

## Why Bright Data?

- Lower cost ($750 vs $1,500 for 50GB)
- Better reliability
- More features
- Residential proxies (195+ countries)
- Automatic IP rotation
- Sticky sessions (1min, 10min, 30min)
- City-level targeting
- High success rate (>99%)

## Migration Steps

1. **Get Bright Data credentials**
   Ensure you have your Username (Customer ID + Zone) and Password (API Key).

2. **Update .env files**
   Add the following to your root `.env` and `scripts/proxy-client/.env`:
   ```bash
   BRIGHTDATA_USERNAME=brd-customer-YOUR_USERNAME-zone-YOUR_ZONE
   BRIGHTDATA_PASSWORD=YOUR_PASSWORD
   PROVIDER_TYPE=brightdata
   ```

3. **Restart service**
   ```bash
   sudo systemctl restart atlantic-proxy
   ```
   Or for Docker:
   ```bash
   docker-compose restart proxy-client
   ```

4. **Test connection**
   Run the verification script:
   ```bash
   ./scripts/proxy-client/test_brightdata.sh
   ```

## Rollback

If issues occur, set `PROVIDER_TYPE=oxylabs` in your `.env` file to revert to the legacy provider (Oxylabs).
```bash
PROVIDER_TYPE=oxylabs
```
Then restart the service.
